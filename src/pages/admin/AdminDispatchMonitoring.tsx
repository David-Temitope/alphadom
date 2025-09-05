import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Truck, AlertTriangle, CheckCircle, XCircle, Package, DollarSign, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DispatcherWithStats {
  id: string;
  user_id: string;
  dispatch_name: string;
  vehicle_type: string;
  phone_number: string;
  is_available: boolean;
  is_active: boolean;
  total_deliveries: number;
  success_rate: number;
  rating: number;
  total_earnings: number;
  created_at: string;
  recent_activities: any[];
  user_profile: {
    email: string;
    full_name: string;
  };
}

const AdminDispatchMonitoring = () => {
  const [dispatchers, setDispatchers] = useState<DispatcherWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const { toast } = useToast();

  const fetchDispatchers = async () => {
    try {
      // Get all dispatchers with their profiles
      const { data: dispatchersData, error: dispatchersError } = await supabase
        .from('approved_dispatchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (dispatchersError) throw dispatchersError;

      // Get recent activity logs for each dispatcher
      const dispatchersWithActivity = await Promise.all(
        (dispatchersData || []).map(async (dispatcher) => {
          const { data: activities } = await supabase
            .from('dispatch_activity_logs')
            .select('*')
            .eq('dispatcher_id', dispatcher.id)
            .order('created_at', { ascending: false })
            .limit(5);

          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', dispatcher.user_id)
            .single();

          return {
            ...dispatcher,
            recent_activities: activities || [],
            user_profile: profile || { email: '', full_name: '' }
          };
        })
      );

      setDispatchers(dispatchersWithActivity);
    } catch (error) {
      console.error('Error fetching dispatchers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dispatcher data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDispatcherAction = async (dispatcherId: string, action: 'suspend' | 'activate' | 'remove', notes?: string) => {
    setActionLoading(dispatcherId);
    try {
      let updateData: any = {};
      
      if (action === 'suspend' || action === 'remove') {
        updateData.is_active = false;
      } else if (action === 'activate') {
        updateData.is_active = true;
      }

      const { error } = await supabase
        .from('approved_dispatchers')
        .update(updateData)
        .eq('id', dispatcherId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('dispatch_activity_logs')
        .insert({
          dispatcher_id: dispatcherId,
          activity_type: action === 'remove' ? 'account_removed' : action === 'suspend' ? 'account_suspended' : 'account_activated',
          activity_details: { admin_notes: notes, action }
        });

      await fetchDispatchers();
      setActionNotes('');
      
      toast({
        title: "Success",
        description: `Dispatcher ${action}d successfully`,
      });
    } catch (error: any) {
      console.error('Error updating dispatcher:', error);
      toast({
        title: "Error",
        description: "Failed to update dispatcher status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDispatchers();
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dispatch Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor and manage dispatcher activities, deliveries, and account status.
          </p>
        </div>

        <div className="grid gap-6">
          {dispatchers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No dispatchers found.</p>
              </CardContent>
            </Card>
          ) : (
            dispatchers.map((dispatcher) => (
              <Card key={dispatcher.id} className={!dispatcher.is_active ? 'border-red-200 bg-red-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {dispatcher.dispatch_name}
                        {!dispatcher.is_active && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </CardTitle>
                      <CardDescription>
                        {dispatcher.vehicle_type} • {dispatcher.user_profile.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={dispatcher.is_available ? 'default' : 'secondary'}>
                        {dispatcher.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Badge variant={dispatcher.is_active ? 'default' : 'destructive'}>
                        {dispatcher.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{dispatcher.total_deliveries}</p>
                        <p className="text-xs text-muted-foreground">Deliveries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">${dispatcher.total_earnings}</p>
                        <p className="text-xs text-muted-foreground">Earnings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">{dispatcher.success_rate}%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">{dispatcher.rating}/5</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Joined</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(dispatcher.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {dispatcher.recent_activities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Recent Activity</p>
                      <div className="space-y-1">
                        {dispatcher.recent_activities.slice(0, 3).map((activity, index) => (
                          <div key={index} className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>{activity.activity_type.replace('_', ' ').toUpperCase()}</span>
                            <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {dispatcher.is_active ? (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-2" />
                              Suspend Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Suspend Dispatcher Account</DialogTitle>
                              <DialogDescription>
                                Temporarily suspend this dispatcher's account. They won't be able to accept deliveries.
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
                                  onClick={() => handleDispatcherAction(dispatcher.id, 'suspend', actionNotes)}
                                  disabled={actionLoading === dispatcher.id}
                                >
                                  {actionLoading === dispatcher.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Suspend Account
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Remove Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Dispatcher Account</DialogTitle>
                              <DialogDescription>
                                Permanently remove this dispatcher's account. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="remove-notes">Reason for Removal</Label>
                                <Textarea
                                  id="remove-notes"
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                  placeholder="Provide reason for removal..."
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDispatcherAction(dispatcher.id, 'remove', actionNotes)}
                                  disabled={actionLoading === dispatcher.id}
                                >
                                  {actionLoading === dispatcher.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Remove Account
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
                        onClick={() => handleDispatcherAction(dispatcher.id, 'activate')}
                        disabled={actionLoading === dispatcher.id}
                      >
                        {actionLoading === dispatcher.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate Account
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

export default AdminDispatchMonitoring;