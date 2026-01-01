import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store, AlertTriangle, CheckCircle, XCircle, Package, DollarSign, Search, Crown, Star, CreditCard, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VendorWithStats {
  id: string;
  user_id: string;
  store_name: string;
  product_category: string;
  is_active: boolean;
  is_suspended: boolean;
  total_revenue: number;
  total_orders: number;
  total_products: number;
  created_at: string;
  subscription_plan: string;
  subscription_end_date: string | null;
  paystack_subaccount_code: string | null;
  gift_plan: string | null;
  gift_plan_expires_at: string | null;
  gift_commission_rate: number | null;
  subscription_paused_at: string | null;
  subscription_days_remaining: number | null;
  recent_activities: any[];
  user_profile: {
    email: string;
    full_name: string;
  };
}

const AdminVendorMonitoring = () => {
  const [vendors, setVendors] = useState<VendorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorWithStats | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [subaccountCode, setSubaccountCode] = useState('');
  const [subaccountDialogOpen, setSubaccountDialogOpen] = useState(false);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [giftPlan, setGiftPlan] = useState('economy');
  const [giftDays, setGiftDays] = useState('30');
  const [giftCommission, setGiftCommission] = useState('');
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      // Get only active vendors (not closed) with their profiles
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('approved_vendors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (vendorsError) throw vendorsError;

      // Get recent activity logs for each vendor
      const vendorsWithActivity = await Promise.all(
        (vendorsData || []).map(async (vendor) => {
          const { data: activities } = await supabase
            .from('vendor_activity_logs')
            .select('*')
            .eq('vendor_id', vendor.id)
            .order('created_at', { ascending: false })
            .limit(5);

          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', vendor.user_id)
            .single();

          // Fetch actual products count
          const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', vendor.id);

          // Fetch actual orders and revenue
          const { data: ordersData } = await supabase
            .from('orders')
            .select('total_amount, status')
            .eq('vendor_id', vendor.id);

          const totalOrders = ordersData?.length || 0;
          const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

          return {
            ...vendor,
            total_products: productsCount || 0,
            total_orders: totalOrders,
            total_revenue: totalRevenue,
            recent_activities: activities || [],
            user_profile: profile || { email: '', full_name: '' }
          };
        })
      );

      setVendors(vendorsWithActivity);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVendorAction = async (vendorId: string, action: 'suspend' | 'activate' | 'close', notes?: string) => {
    setActionLoading(vendorId);
    try {
      // Find the vendor to get user_id
      const vendor = vendors.find(v => v.id === vendorId);
      
      if (action === 'close' && vendor) {
        // For closing shop: delete all products, remove vendor record, remove user_type, delete shop_application
        
        // 1. Delete all products from this vendor
        const { error: deleteProductsError } = await supabase
          .from('products')
          .delete()
          .eq('vendor_id', vendorId);
        
        if (deleteProductsError) throw deleteProductsError;

        // 2. Remove the user's vendor user_type
        await supabase
          .from('user_types')
          .delete()
          .eq('user_id', vendor.user_id)
          .eq('user_type', 'vendor');

        // 3. Log the action before deleting vendor
        await supabase
          .from('vendor_activity_logs')
          .insert({
            vendor_id: vendorId,
            activity_type: 'shop_closed',
            activity_details: { admin_notes: notes, action }
          });

        // 4. Get the application_id before deleting vendor
        const { data: vendorData } = await supabase
          .from('approved_vendors')
          .select('application_id')
          .eq('id', vendorId)
          .single();

        // 5. Delete the approved_vendors record entirely
        const { error: deleteVendorError } = await supabase
          .from('approved_vendors')
          .delete()
          .eq('id', vendorId);

        if (deleteVendorError) throw deleteVendorError;

        // 6. Delete the shop_application so user can reapply
        if (vendorData?.application_id) {
          await supabase
            .from('shop_applications')
            .delete()
            .eq('id', vendorData.application_id);
        }

      } else {
        // For suspend/activate: just update the is_active/is_suspended flag
        let updateData: any = {};
        
        if (action === 'suspend') {
          updateData.is_suspended = true;
          updateData.is_active = false;
        } else if (action === 'activate') {
          updateData.is_suspended = false;
          updateData.is_active = true;
        }

        const { error } = await supabase
          .from('approved_vendors')
          .update(updateData)
          .eq('id', vendorId);

        if (error) throw error;

        // Log the action
        await supabase
          .from('vendor_activity_logs')
          .insert({
            vendor_id: vendorId,
            activity_type: action === 'suspend' ? 'shop_suspended' : 'shop_activated',
            activity_details: { admin_notes: notes, action }
          });
      }

      await fetchVendors();
      setActionNotes('');
      setSelectedVendor(null);
      
      toast({
        title: "Success",
        description: `Vendor ${action}d successfully`,
      });
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      // Refresh vendors data
      await fetchVendors();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubaccount = async (vendorId: string) => {
    setActionLoading(vendorId);
    try {
      const { error } = await supabase
        .from('approved_vendors')
        .update({ paystack_subaccount_code: subaccountCode || null })
        .eq('id', vendorId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('vendor_activity_logs')
        .insert({
          vendor_id: vendorId,
          activity_type: 'subaccount_updated',
          activity_details: { subaccount_code: subaccountCode || 'removed' }
        });

      await fetchVendors();
      setSubaccountCode('');
      setSubaccountDialogOpen(false);
      setSelectedVendor(null);
      
      toast({
        title: "Success",
        description: subaccountCode ? "Paystack subaccount code updated" : "Paystack subaccount code removed",
      });
    } catch (error: any) {
      console.error('Error updating subaccount:', error);
      toast({
        title: "Error",
        description: "Failed to update subaccount code",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGiftSubscription = async (vendorId: string) => {
    setActionLoading(vendorId);
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) throw new Error('Vendor not found');

      // Calculate days remaining on current subscription
      let daysRemaining = 0;
      if (vendor.subscription_end_date) {
        const endDate = new Date(vendor.subscription_end_date);
        const now = new Date();
        daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      // Calculate gift expiry date
      const giftExpiresAt = new Date();
      giftExpiresAt.setDate(giftExpiresAt.getDate() + parseInt(giftDays));

      const updateData: any = {
        gift_plan: giftPlan,
        gift_plan_expires_at: giftExpiresAt.toISOString(),
        subscription_paused_at: new Date().toISOString(),
        subscription_days_remaining: daysRemaining,
      };

      // Only set gift commission if provided
      if (giftCommission && !isNaN(parseFloat(giftCommission))) {
        updateData.gift_commission_rate = parseFloat(giftCommission);
      }

      const { error } = await supabase
        .from('approved_vendors')
        .update(updateData)
        .eq('id', vendorId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('vendor_activity_logs')
        .insert({
          vendor_id: vendorId,
          activity_type: 'gift_subscription_granted',
          activity_details: {
            gift_plan: giftPlan,
            gift_days: parseInt(giftDays),
            gift_commission_rate: giftCommission ? parseFloat(giftCommission) : null,
            original_days_remaining: daysRemaining
          }
        });

      // Notify the vendor
      await supabase
        .from('user_notifications')
        .insert({
          user_id: vendor.user_id,
          title: 'Gift Subscription Received',
          message: `You have been gifted a ${giftPlan === 'first_class' ? 'First Class' : 'Economy'} subscription for ${giftDays} days! Enjoy the premium features.`,
          type: 'subscription',
          related_id: vendorId
        });

      await fetchVendors();
      setGiftDialogOpen(false);
      setSelectedVendor(null);
      setGiftPlan('economy');
      setGiftDays('30');
      setGiftCommission('');

      toast({
        title: "Success",
        description: `Gift subscription granted for ${giftDays} days`,
      });
    } catch (error: any) {
      console.error('Error granting gift subscription:', error);
      toast({
        title: "Error",
        description: "Failed to grant gift subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveGift = async (vendorId: string) => {
    setActionLoading(vendorId);
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) throw new Error('Vendor not found');

      // Restore original subscription with remaining days
      let newEndDate = null;
      if (vendor.subscription_days_remaining && vendor.subscription_days_remaining > 0) {
        newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + vendor.subscription_days_remaining);
      }

      const { error } = await supabase
        .from('approved_vendors')
        .update({
          gift_plan: null,
          gift_plan_expires_at: null,
          gift_commission_rate: null,
          subscription_paused_at: null,
          subscription_days_remaining: null,
          subscription_end_date: newEndDate ? newEndDate.toISOString() : vendor.subscription_end_date
        })
        .eq('id', vendorId);

      if (error) throw error;

      await fetchVendors();
      toast({
        title: "Success",
        description: "Gift subscription removed and original subscription restored",
      });
    } catch (error: any) {
      console.error('Error removing gift:', error);
      toast({
        title: "Error",
        description: "Failed to remove gift subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const filteredVendors = vendors.filter(vendor => 
    vendor.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.product_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.user_profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubscriptionBadge = (plan: string) => {
    switch (plan) {
      case 'first_class':
        return <Badge className="bg-yellow-500"><Crown className="h-3 w-3 mr-1" />First Class</Badge>;
      case 'economy':
        return <Badge className="bg-blue-500"><Star className="h-3 w-3 mr-1" />Economy</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor and manage vendor activities, products, and shop status.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors by name, category, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-6">
          {filteredVendors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No vendors found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredVendors.map((vendor) => (
              <Card key={vendor.id} className={!vendor.is_active || vendor.is_suspended ? 'border-red-200 bg-red-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        {vendor.store_name}
                        {(!vendor.is_active || vendor.is_suspended) && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </CardTitle>
                      <CardDescription>
                        {vendor.product_category} • {vendor.user_profile.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSubscriptionBadge(vendor.subscription_plan || 'free')}
                      <Badge variant={vendor.is_active && !vendor.is_suspended ? 'default' : 'destructive'}>
                        {vendor.is_suspended ? 'Suspended' : vendor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{vendor.total_products}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">₦{vendor.total_revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">{vendor.total_orders}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Joined</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {vendor.recent_activities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Recent Activity</p>
                      <div className="space-y-1">
                        {vendor.recent_activities.slice(0, 3).map((activity, index) => (
                          <div key={index} className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>{activity.activity_type.replace('_', ' ').toUpperCase()}</span>
                            <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {/* Gift Subscription Button */}
                    {vendor.gift_plan ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500">
                          <Gift className="h-3 w-3 mr-1" />
                          Gift: {vendor.gift_plan === 'first_class' ? 'First Class' : 'Economy'}
                          {vendor.gift_plan_expires_at && (
                            <span className="ml-1">
                              (expires {new Date(vendor.gift_plan_expires_at).toLocaleDateString()})
                            </span>
                          )}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveGift(vendor.id)}
                          disabled={actionLoading === vendor.id}
                        >
                          {actionLoading === vendor.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Remove Gift
                        </Button>
                      </div>
                    ) : (
                      <Dialog open={giftDialogOpen && selectedVendor?.id === vendor.id} onOpenChange={(open) => {
                        setGiftDialogOpen(open);
                        if (open) {
                          setSelectedVendor(vendor);
                        } else {
                          setSelectedVendor(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Gift className="h-4 w-4 mr-2" />
                            Gift Subscription
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gift Subscription to {vendor.store_name}</DialogTitle>
                            <DialogDescription>
                              Grant a temporary premium subscription. The vendor's current subscription will pause and resume after the gift expires.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="gift-plan">Subscription Plan</Label>
                              <Select value={giftPlan} onValueChange={setGiftPlan}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="economy">Economy (Blue Badge)</SelectItem>
                                  <SelectItem value="first_class">First Class (Gold Badge)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="gift-days">Number of Days</Label>
                              <Input
                                id="gift-days"
                                type="number"
                                value={giftDays}
                                onChange={(e) => setGiftDays(e.target.value)}
                                placeholder="30"
                                min="1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="gift-commission">Custom Commission Rate (Optional)</Label>
                              <Input
                                id="gift-commission"
                                type="number"
                                value={giftCommission}
                                onChange={(e) => setGiftCommission(e.target.value)}
                                placeholder="Leave empty for default rate"
                                min="0"
                                max="100"
                                step="0.5"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Default: Economy 9%, First Class 5%. Plus 2.5% service charge.
                              </p>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                onClick={() => handleGiftSubscription(vendor.id)}
                                disabled={actionLoading === vendor.id || !giftDays}
                              >
                                {actionLoading === vendor.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Grant Gift
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View Products
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{vendor.store_name} - Products</DialogTitle>
                          <DialogDescription>
                            Manage products for this vendor
                          </DialogDescription>
                        </DialogHeader>
                        <VendorProducts vendorId={vendor.id} onDeleteProduct={deleteProduct} />
                      </DialogContent>
                    </Dialog>

                    {/* Paystack Subaccount Management */}
                    <Dialog open={subaccountDialogOpen && selectedVendor?.id === vendor.id} onOpenChange={(open) => {
                      setSubaccountDialogOpen(open);
                      if (open) {
                        setSelectedVendor(vendor);
                        setSubaccountCode(vendor.paystack_subaccount_code || '');
                      } else {
                        setSelectedVendor(null);
                        setSubaccountCode('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant={vendor.paystack_subaccount_code ? "default" : "outline"} 
                          size="sm"
                          className={vendor.paystack_subaccount_code ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          {vendor.paystack_subaccount_code ? "Split Active" : "Setup Split"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Paystack Split Payment</DialogTitle>
                          <DialogDescription>
                            Configure the vendor's Paystack subaccount code for automatic split payments.
                            Commission is automatically calculated based on subscription plan:
                            <br />• Free: 15% commission (vendor gets 85%)
                            <br />• Economy: 9% commission (vendor gets 91%)
                            <br />• First Class: 5% commission (vendor gets 95%)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="subaccount-code">Paystack Subaccount Code</Label>
                            <Input
                              id="subaccount-code"
                              value={subaccountCode}
                              onChange={(e) => setSubaccountCode(e.target.value)}
                              placeholder="e.g., ACCT_xxxxxxxxxxxxx"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Current plan: <strong>{vendor.subscription_plan || 'free'}</strong>
                            </p>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={() => handleUpdateSubaccount(vendor.id)}
                              disabled={actionLoading === vendor.id}
                            >
                              {actionLoading === vendor.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              {subaccountCode ? "Save Subaccount" : "Remove Subaccount"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {vendor.is_active ? (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-2" />
                              Suspend Shop
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Suspend Vendor Shop</DialogTitle>
                              <DialogDescription>
                                Temporarily suspend this vendor's shop. They won't be able to sell products.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="suspend-notes">Reason for Suspension</Label>
                                <Textarea
                                  id="suspend-notes"
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                  placeholder="Provide reason for suspension..."
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleVendorAction(vendor.id, 'suspend', actionNotes)}
                                  disabled={actionLoading === vendor.id}
                                >
                                  {actionLoading === vendor.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Suspend Shop
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Close Shop
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Close Vendor Shop</DialogTitle>
                              <DialogDescription>
                                Permanently close this vendor's shop. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="close-notes">Reason for Closing</Label>
                                <Textarea
                                  id="close-notes"
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                  placeholder="Provide reason for closing..."
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleVendorAction(vendor.id, 'close', actionNotes)}
                                  disabled={actionLoading === vendor.id}
                                >
                                  {actionLoading === vendor.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Close Shop
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleVendorAction(vendor.id, 'activate')}
                        disabled={actionLoading === vendor.id}
                      >
                        {actionLoading === vendor.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate Shop
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Component to display vendor products
const VendorProducts = ({ vendorId, onDeleteProduct }: { vendorId: string; onDeleteProduct: (productId: string) => void }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', vendorId);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendorId]);

  if (loading) {
    return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <p className="text-center text-muted-foreground">No products found.</p>
      ) : (
        products.map((product) => {
          // Helper to extract first image from JSON array or single URL
          const getDisplayImage = (image: string | null | undefined): string => {
            if (!image) return '/placeholder.svg';
            try {
              const parsed = JSON.parse(image);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
              }
              return image;
            } catch {
              return image;
            }
          };

          return (
            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={getDisplayImage(product.image)} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">₦{product.price?.toLocaleString()}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteProduct(product.id)}
              >
                Delete
              </Button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminVendorMonitoring;