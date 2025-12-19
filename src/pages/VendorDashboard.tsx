import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVendors } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
  CreditCard,
  Wallet,
  LayoutGrid,
  User,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VendorProductForm } from "@/components/VendorProductForm";
import { VendorSubscription } from "@/components/VendorSubscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageUpload } from "@/components/admin/ImageUpload";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { currentVendor, isVendor, refreshVendors } = useVendors();
  const { products, refreshProducts } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const vendorProducts = products.filter((p) => p.vendor_user_id === user?.id);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Calculate earnings (revenue - commission)
  const commissionRate = currentVendor?.commission_rate || 15;
  const totalRevenue = currentVendor?.total_revenue || 0;
  const platformCommission = totalRevenue * (commissionRate / 100);
  const vendorEarnings = totalRevenue - platformCommission;

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      refreshProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleProfileImageUpload = async (imageUrl: string) => {
    if (!user) return;

    setUploadingImage(true);
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: imageUrl }).eq("id", user.id);

      if (error) throw error;

      setProfileImage(imageUrl);
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch current profile image on mount
  React.useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single();

      if (data?.avatar_url) {
        setProfileImage(data.avatar_url);
      }
    };
    fetchProfileImage();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to access your vendor dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVendor || !currentVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">You don't have vendor access. Please apply for a shop first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if vendor is suspended
  const isSuspended = currentVendor.is_suspended === true;
  const isInactive = !currentVendor.is_active;

  // Check product limit
  const productLimit = (currentVendor as any).product_limit || 20;
  const canAddProduct = productLimit === -1 || vendorProducts.length < productLimit;

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="container mx-auto max-w-7xl overflow-x-hidden">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            {currentVendor.store_name} - {currentVendor.product_category}
          </p>
        </div>

        {/* Suspension/Inactive Alert */}
        {(isSuspended || isInactive) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Shop Suspended</AlertTitle>
            <AlertDescription>
              Your accout have been suspended. This either because your susbscription plan has expired or you violated a
              rule. Please contact our support team for more information
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          {isMobile ? (
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview" className="p-2">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="products" className="p-2">
                <Package className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="add-product" disabled={isSuspended || isInactive || !canAddProduct} className="p-2">
                <Edit className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="orders" className="p-2">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="profile" className="p-2">
                <User className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="subscription" className="p-2">
                <CreditCard className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          ) : (
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="add-product" disabled={isSuspended || isInactive || !canAddProduct}>
                Add Product
              </TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Earnings Card */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Wallet className="h-5 w-5" />
                  Your Earnings
                </CardTitle>
                <CardDescription className="text-green-600">
                  After {commissionRate}% platform commission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
                  <div>
                    <p className="text-sm text-green-600">Total Revenue</p>
                    <p className="text-lg font-semibold text-green-700">₦{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Platform Commission ({commissionRate}%)</p>
                    <p className="text-lg font-semibold text-red-600">-₦{platformCommission.toLocaleString()}</p>
                  </div>
                  <div className="md:ml-auto">
                    <p className="text-sm text-green-600">Your Earnings</p>
                    <p className="text-3xl font-bold text-green-800">₦{vendorEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-4 gap-2 md:gap-6">
              <Card>
                <CardHeader className="p-2 md:p-6 flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
                  <CardTitle className="text-[10px] md:text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground hidden md:block" />
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                  <div className="text-sm md:text-2xl font-bold">₦{currentVendor.total_revenue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-2 md:p-6 flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
                  <CardTitle className="text-[10px] md:text-sm font-medium">Orders</CardTitle>
                  <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground hidden md:block" />
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                  <div className="text-sm md:text-2xl font-bold">{currentVendor.total_orders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-2 md:p-6 flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
                  <CardTitle className="text-[10px] md:text-sm font-medium">Products</CardTitle>
                  <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground hidden md:block" />
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                  <div className="text-sm md:text-2xl font-bold">
                    {vendorProducts.length}
                    {productLimit !== -1 && <span className="text-xs text-muted-foreground">/{productLimit}</span>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-2 md:p-6 flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
                  <CardTitle className="text-[10px] md:text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
                  <Badge
                    variant={isSuspended ? "destructive" : currentVendor.is_active ? "default" : "destructive"}
                    className="text-[10px] md:text-xs"
                  >
                    {isSuspended ? "Suspended" : currentVendor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Products</CardTitle>
                <CardDescription>
                  Manage your product listings ({vendorProducts.length}
                  {productLimit !== -1 ? `/${productLimit}` : ""} products)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vendorProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No products added yet. Add your first product to get started!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {vendorProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">₦{product.price}</span>
                              <Badge variant={product.in_stock ? "default" : "destructive"}>
                                Stock: {product.stock_count}
                              </Badge>
                            </div>
                            {parseFloat(product.shipping_fee?.toString() || "0") > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Shipping: ₦{product.shipping_fee} ({product.shipping_type?.replace("_", " ")})
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" disabled={isSuspended || isInactive}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={isSuspended || isInactive}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Add a new product to your store</CardDescription>
              </CardHeader>
              <CardContent>
                {isSuspended || isInactive ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cannot Add Products</AlertTitle>
                    <AlertDescription>
                      Your shop is currently suspended. Please renew your subscription or contact support.
                    </AlertDescription>
                  </Alert>
                ) : !canAddProduct ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Product Limit Reached</AlertTitle>
                    <AlertDescription>
                      You've reached your product limit ({productLimit} products). Upgrade your subscription to add more
                      products.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <VendorProductForm onProductAdded={refreshProducts} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Management
                </CardTitle>
                <CardDescription>View and manage orders for your products</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/vendor-orders")}>
                  <FileText className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Store Profile
                </CardTitle>
                <CardDescription>Manage your store profile and picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-primary/20">
                      {profileImage ? (
                        <img src={profileImage} alt={currentVendor.store_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-muted-foreground">
                          {currentVendor.store_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer">
                      <Camera className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{currentVendor.store_name}</h3>
                    <p className="text-muted-foreground">{currentVendor.product_category}</p>
                  </div>

                  <div className="w-full max-w-sm">
                    <Label className="mb-2 block">Update Profile Picture</Label>
                    <ImageUpload onImageUploaded={handleProfileImageUpload} />
                    {uploadingImage && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-muted-foreground">Store Name</Label>
                    <p className="font-medium">{currentVendor.store_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{currentVendor.product_category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Products</Label>
                    <p className="font-medium">{vendorProducts.length}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Orders</Label>
                    <p className="font-medium">{currentVendor.total_orders}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Member Since</Label>
                    <p className="font-medium">{new Date(currentVendor.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Subscription Plan</Label>
                    <Badge variant="default">
                      {currentVendor.subscription_plan?.replace("_", " ").toUpperCase() || "FREE"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <VendorSubscription onPlanChange={() => refreshVendors()} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
