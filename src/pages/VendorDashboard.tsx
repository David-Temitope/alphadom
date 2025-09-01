import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useVendors } from '@/hooks/useVendors';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, TrendingUp, ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VendorDashboard = () => {
  const { currentVendor, isVendor } = useVendors();
  const { products, refreshProducts } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock_count: '',
    shipping_fee: '',
    shipping_type: 'one_time'
  });

  const vendorProducts = products.filter(p => p.vendor_user_id === user?.id);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentVendor) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: newProduct.image,
          stock_count: parseInt(newProduct.stock_count),
          initial_stock_count: parseInt(newProduct.stock_count),
          vendor_id: currentVendor.id,
          vendor_user_id: user.id,
          shipping_fee: parseFloat(newProduct.shipping_fee) || 0,
          shipping_type: newProduct.shipping_type,
          in_stock: parseInt(newProduct.stock_count) > 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock_count: '',
        shipping_fee: '',
        shipping_type: 'one_time'
      });
      setIsAddingProduct(false);
      refreshProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

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
                <CardDescription>Add a new product to your store</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="toys">Toys</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Count</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock_count}
                        onChange={(e) => setNewProduct({...newProduct, stock_count: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        type="url"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      />
                    </div>
                  </div>

                  {parseFloat(newProduct.price) >= 10 && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h3 className="font-medium">Shipping Settings (Products $10+)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shipping_fee">Shipping Fee ($)</Label>
                          <Input
                            id="shipping_fee"
                            type="number"
                            step="0.01"
                            value={newProduct.shipping_fee}
                            onChange={(e) => setNewProduct({...newProduct, shipping_fee: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="shipping_type">Shipping Type</Label>
                          <div className="flex items-center space-x-2 mt-2">
                            <Switch
                              checked={newProduct.shipping_type === 'per_product'}
                              onCheckedChange={(checked) => 
                                setNewProduct({...newProduct, shipping_type: checked ? 'per_product' : 'one_time'})
                              }
                            />
                            <Label>
                              {newProduct.shipping_type === 'per_product' ? 'Per Product' : 'One Time Payment'}
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {newProduct.shipping_type === 'per_product' 
                              ? 'Shipping fee multiplies by quantity' 
                              : 'Fixed shipping fee regardless of quantity'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;