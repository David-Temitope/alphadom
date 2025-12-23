
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Star, Loader2, Package, AlertTriangle } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { useToast } from '@/hooks/use-toast';

const AdminProducts = () => {
  const { products, loading, categories, createProduct, updateProduct, deleteProduct } = useAdminProducts();
  const { unreadCount } = useStockAlerts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [restockingProduct, setRestockingProduct] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    full_description: '',
    stock_count: '',
    initial_stock_count: '',
    sustainability_score: '',
    image: '',
    eco_features: [] as string[],
    discount_percentage: 0,
    original_price: 0,
    shipping_fee: '',
    shipping_type: 'one_time' as 'one_time' | 'per_product',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await createProduct({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        description: newProduct.description,
        full_description: newProduct.full_description,
        stock_count: parseInt(newProduct.stock_count) || 0,
        initial_stock_count: parseInt(newProduct.initial_stock_count) || parseInt(newProduct.stock_count) || 0,
        sustainability_score: parseInt(newProduct.sustainability_score) || 0,
        image: newProduct.image,
        eco_features: newProduct.eco_features,
        has_discount: newProduct.discount_percentage > 0,
        discount_percentage: newProduct.discount_percentage,
        original_price: newProduct.original_price,
        in_stock: true,
        rating: 0,
        reviews: 0,
        shipping_fee: parseFloat(newProduct.shipping_fee) || 0,
        shipping_type: newProduct.shipping_type,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      setIsAddDialogOpen(false);
      setNewProduct({
        name: '',
        price: '',
        category: '',
        description: '',
        full_description: '',
        stock_count: '',
        initial_stock_count: '',
        sustainability_score: '',
        image: '',
        eco_features: [],
        discount_percentage: 0,
        original_price: 0,
        shipping_fee: '',
        shipping_type: 'one_time',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct({
      ...product,
      price: product.price.toString(),
      stock_count: product.stock_count?.toString() || '',
      sustainability_score: product.sustainability_score?.toString() || '',
      eco_features: product.eco_features || [],
      discount_percentage: product.discount_percentage || 0,
      original_price: product.original_price || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct.name || !editingProduct.price || !editingProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await updateProduct(editingProduct.id, {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        category: editingProduct.category,
        description: editingProduct.description,
        full_description: editingProduct.full_description,
        stock_count: parseInt(editingProduct.stock_count) || 0,
        sustainability_score: parseInt(editingProduct.sustainability_score) || 0,
        image: editingProduct.image,
        eco_features: editingProduct.eco_features,
        has_discount: editingProduct.discount_percentage > 0,
        discount_percentage: editingProduct.discount_percentage,
        original_price: editingProduct.original_price,
        shipping_fee: parseFloat(editingProduct.shipping_fee) || 0,
        shipping_type: editingProduct.shipping_type || 'one_time',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setSubmitting(true);
      try {
        const { success, error } = await deleteProduct(productId);
        if (!success) {
          throw new Error(error || "Failed to delete product");
        }
        toast({
          title: "Success",
          description: "Product deleted successfully!",
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete product",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRestockProduct = (product: any) => {
    setRestockingProduct(product);
    setRestockQuantity('');
    setIsRestockDialogOpen(true);
  };

  const handleConfirmRestock = async () => {
    if (!restockingProduct || !restockQuantity) {
      toast({
        title: "Error",
        description: "Please enter a restock quantity",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newStockCount = restockingProduct.stock_count + parseInt(restockQuantity);
      const { error } = await updateProduct(restockingProduct.id, {
        stock_count: newStockCount,
        last_stock_update: new Date().toISOString(),
        in_stock: newStockCount > 0
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product restocked! Added ${restockQuantity} units.`,
      });

      setIsRestockDialogOpen(false);
      setRestockingProduct(null);
      setRestockQuantity('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restock product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold relative inline-flex items-center">
              Products
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Manage your product inventory and details
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product for your store
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={newProduct.category} 
                    onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="Home & Living">Home & Living</SelectItem>
                      <SelectItem value="Personal Care">Personal Care</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Tech Accessories">Tech Accessories</SelectItem>
                      <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                      <SelectItem value="Books & Media">Books & Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="stock">Stock Count</Label>
                   <Input 
                     id="stock" 
                     type="number" 
                     placeholder="0"
                     value={newProduct.stock_count}
                     onChange={(e) => setNewProduct({...newProduct, stock_count: e.target.value, initial_stock_count: e.target.value})}
                   />
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="sustainability">Sustainability Score (1-10)</Label>
                  <Input 
                    id="sustainability" 
                    type="number" 
                    min="1" 
                    max="10"
                    placeholder="8"
                    value={newProduct.sustainability_score}
                    onChange={(e) => setNewProduct({...newProduct, sustainability_score: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eco_features">Eco Features (comma separated)</Label>
                  <Input 
                    id="eco_features" 
                    placeholder="Biodegradable, BPA-Free"
                    onChange={(e) => setNewProduct({...newProduct, eco_features: e.target.value.split(',').map(f => f.trim())})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount %</Label>
                  <Input 
                    id="discount" 
                    type="number" 
                    min="0" 
                    max="100"
                    placeholder="0"
                    onChange={(e) => setNewProduct({...newProduct, discount_percentage: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (if discounted)</Label>
                  <Input 
                    id="original_price" 
                    type="number" 
                    placeholder="0.00"
                    onChange={(e) => setNewProduct({...newProduct, original_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_fee">Shipping Fee ($) *</Label>
                  <Input 
                    id="shipping_fee" 
                    type="number" 
                    step="0.01"
                    placeholder="5.00"
                    value={newProduct.shipping_fee}
                    onChange={(e) => setNewProduct({...newProduct, shipping_fee: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_type">Shipping Fee Type *</Label>
                  <Select 
                    value={newProduct.shipping_type} 
                    onValueChange={(value: 'one_time' | 'per_product') => 
                      setNewProduct({...newProduct, shipping_type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time Payment</SelectItem>
                      <SelectItem value="per_product">Per Product Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {newProduct.shipping_type === 'one_time' 
                      ? 'Customer pays once regardless of quantity' 
                      : 'Fee multiplies by quantity ordered'}
                  </p>
                </div>
                <div className="col-span-2 space-y-2">
                  <MultiImageUpload
                    onImagesChanged={(urls) => {
                      const imageValue = urls.length > 1 ? JSON.stringify(urls) : urls[0] || '';
                      setNewProduct({...newProduct, image: imageValue});
                    }}
                    maxImages={3}
                    maxTotalSizeMB={8}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Product description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea 
                    id="full_description" 
                    placeholder="Detailed product description"
                    value={newProduct.full_description}
                    onChange={(e) => setNewProduct({...newProduct, full_description: e.target.value})}
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct} disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input 
                  id="edit-name" 
                  placeholder="Enter product name"
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  placeholder="0.00"
                  value={editingProduct?.price || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={editingProduct?.category || ''} 
                  onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Home & Living">Home & Living</SelectItem>
                    <SelectItem value="Personal Care">Personal Care</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Tech Accessories">Tech Accessories</SelectItem>
                    <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                    <SelectItem value="Books & Media">Books & Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Count</Label>
                <Input 
                  id="edit-stock" 
                  type="number" 
                  placeholder="0"
                  value={editingProduct?.stock_count || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, stock_count: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sustainability">Sustainability Score (1-10)</Label>
                <Input 
                  id="edit-sustainability" 
                  type="number" 
                  min="1" 
                  max="10"
                  placeholder="8"
                  value={editingProduct?.sustainability_score || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, sustainability_score: e.target.value})}
                />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-eco-features">Eco Features (comma separated)</Label>
                  <Input 
                    id="edit-eco-features" 
                    placeholder="Biodegradable, BPA-Free"
                    value={editingProduct?.eco_features?.join(', ') || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, eco_features: e.target.value.split(',').map(f => f.trim())})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-discount">Discount %</Label>
                  <Input 
                    id="edit-discount" 
                    type="number" 
                    min="0" 
                    max="100"
                    placeholder="0"
                    value={editingProduct?.discount_percentage || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, discount_percentage: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-original-price">Original Price (if discounted)</Label>
                  <Input 
                    id="edit-original-price" 
                    type="number" 
                    placeholder="0.00"
                    value={editingProduct?.original_price || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, original_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-shipping-fee">Shipping Fee ($)</Label>
                  <Input 
                    id="edit-shipping-fee" 
                    type="number" 
                    step="0.01"
                    placeholder="5.00"
                    value={editingProduct?.shipping_fee || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, shipping_fee: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-shipping-type">Shipping Fee Type</Label>
                  <Select 
                    value={editingProduct?.shipping_type || 'one_time'} 
                    onValueChange={(value: 'one_time' | 'per_product') => 
                      setEditingProduct({...editingProduct, shipping_type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time Payment</SelectItem>
                      <SelectItem value="per_product">Per Product Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div className="col-span-2 space-y-2">
                <MultiImageUpload
                  onImagesChanged={(urls) => {
                    const imageValue = urls.length > 1 ? JSON.stringify(urls) : urls[0] || '';
                    setEditingProduct({...editingProduct, image: imageValue});
                  }}
                  currentImages={(() => {
                    if (!editingProduct?.image) return [];
                    try {
                      if (editingProduct.image.startsWith('[')) {
                        return JSON.parse(editingProduct.image);
                      }
                      return [editingProduct.image];
                    } catch {
                      return [editingProduct.image];
                    }
                  })()}
                  maxImages={3}
                  maxTotalSizeMB={8}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  placeholder="Product description"
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-full-description">Full Description</Label>
                <Textarea 
                  id="edit-full-description" 
                  placeholder="Detailed product description"
                  value={editingProduct?.full_description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, full_description: e.target.value})}
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProduct} disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Restock Product Dialog */}
        <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restock Product</DialogTitle>
              <DialogDescription>
                Add stock for {restockingProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Stock:</span>
                <Badge variant="outline">
                  {restockingProduct?.stock_count || 0} units
                </Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restock-quantity">Quantity to Add</Label>
                <Input
                  id="restock-quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmRestock} disabled={submitting}>
                  {submitting ? 'Restocking...' : 'Restock'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Product Inventory ({products.length} products)</CardTitle>
            <CardDescription>
              View and manage all your products
            </CardDescription>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sustainability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {product.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.stock_count && product.stock_count > 20 ? 'default' : product.stock_count && product.stock_count > 5 ? 'secondary' : 'destructive'}>
                          {product.stock_count || 0} units
                        </Badge>
                        {product.initial_stock_count && product.stock_count && 
                         product.stock_count < (product.initial_stock_count * 0.1) && 
                         product.stock_count > 0 && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        {product.stock_count === 0 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{Number(product.rating || 0).toFixed(1)}</span>
                        <span className="text-muted-foreground">({product.reviews || 0})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {product.sustainability_score || 0}/10
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.in_stock ? 'default' : 'secondary'}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestockProduct(product)}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
