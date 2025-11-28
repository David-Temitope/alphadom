import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVendors } from '@/hooks/useVendors';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, TrendingUp, ShoppingCart, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VendorProductForm } from '@/components/VendorProductForm';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { currentVendor, isVendor } = useVendors();
  const { products, refreshProducts } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  // Remove unused state variables as we're using VendorProductForm component

  const vendorProducts = products.filter(p => p.vendor_user_id === user?.id);

  // Product addition is now handled by VendorProductForm component

  const handleDeleteProduct = async (productId: string) => {
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
      refreshProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">{currentVendor.store_name} - {currentVendor.product_category}</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${currentVendor.total_revenue}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentVendor.total_orders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vendorProducts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shop Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={currentVendor.is_active ? "default" : "destructive"}>
                    {currentVendor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Products</CardTitle>
                <CardDescription>Manage your product listings</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No products added yet. Add your first product to get started!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendorProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">${product.price}</span>
                              <Badge variant={product.in_stock ? "default" : "destructive"}>
                                Stock: {product.stock_count}
                              </Badge>
                            </div>
                            {parseFloat(product.shipping_fee?.toString() || '0') > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Shipping: ${product.shipping_fee} ({product.shipping_type?.replace('_', ' ')})
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
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
                <CardDescription>Add a new product to your store using the same format as admin</CardDescription>
              </CardHeader>
              <CardContent>
                <VendorProductForm onProductAdded={refreshProducts} />
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
                <Button onClick={() => navigate('/vendor-orders')}>
                  <FileText className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;