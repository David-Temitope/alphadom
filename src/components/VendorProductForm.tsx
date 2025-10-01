import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors } from '@/hooks/useVendors';

interface VendorProductFormProps {
  onProductAdded: () => void;
}

export const VendorProductForm: React.FC<VendorProductFormProps> = ({ onProductAdded }) => {
  const { user } = useAuth();
  const { currentVendor } = useVendors();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    stock_count: '',
    sustainability_score: '',
    eco_features: [] as string[],
    discount_percentage: 0,
    original_price: 0,
    image: '',
    description: '',
    full_description: '',
    shipping_fee: '',
    shipping_type: 'one_time' as 'one_time' | 'per_product',
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentVendor) return;

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
      const { error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          description: newProduct.description,
          full_description: newProduct.full_description,
          stock_count: parseInt(newProduct.stock_count) || 0,
          initial_stock_count: parseInt(newProduct.stock_count) || 0,
          sustainability_score: parseInt(newProduct.sustainability_score) || 0,
          image: newProduct.image,
          eco_features: newProduct.eco_features,
          has_discount: newProduct.discount_percentage > 0,
          discount_percentage: newProduct.discount_percentage,
          original_price: newProduct.original_price,
          vendor_id: currentVendor.id,
          vendor_user_id: user.id,
          in_stock: parseInt(newProduct.stock_count) > 0,
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

      setNewProduct({
        name: '',
        price: '',
        category: '',
        stock_count: '',
        sustainability_score: '',
        eco_features: [],
        discount_percentage: 0,
        original_price: 0,
        image: '',
        description: '',
        full_description: '',
        shipping_fee: '',
        shipping_type: 'one_time',
      });
      
      onProductAdded();
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

  return (
    <form onSubmit={handleAddProduct} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input 
            id="name" 
            placeholder="Enter product name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01"
            placeholder="0.00"
            value={newProduct.price}
            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="stock">Stock Count *</Label>
          <Input 
            id="stock" 
            type="number" 
            placeholder="0"
            value={newProduct.stock_count}
            onChange={(e) => setNewProduct({...newProduct, stock_count: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            step="0.01"
            placeholder="0.00"
            onChange={(e) => setNewProduct({...newProduct, original_price: parseFloat(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <ImageUpload 
          onImageUploaded={(url) => setNewProduct({...newProduct, image: url})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Product description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_description">Full Description</Label>
        <Textarea 
          id="full_description" 
          placeholder="Detailed product description"
          value={newProduct.full_description}
          onChange={(e) => setNewProduct({...newProduct, full_description: e.target.value})}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Adding...' : 'Add Product'}
      </Button>
    </form>
  );
};