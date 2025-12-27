import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  product_type: string | null;
  gender: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  material: string | null;
  thickness: string | null;
  tags: string[] | null;
  stock_count: number | null;
  sustainability_score: number | null;
  eco_features: string[] | null;
  discount_percentage: number | null;
  original_price: number | null;
  description: string | null;
  full_description: string | null;
  shipping_fee: number | null;
  shipping_fee_2km_5km: number | null;
  shipping_fee_over_5km: number | null;
  shipping_type: string | null;
  in_stock: boolean | null;
}

interface VendorProductEditFormProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Navy', 'Beige', 'Gold', 'Silver'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32', '34', '36', '38', '40', '42', '44', '46'];

export const VendorProductEditForm: React.FC<VendorProductEditFormProps> = ({
  product,
  open,
  onClose,
  onProductUpdated,
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    stock_count: (product.stock_count || 0).toString(),
    description: product.description || '',
    full_description: product.full_description || '',
    colors: product.colors || [],
    sizes: product.sizes || [],
    discount_percentage: product.discount_percentage || 0,
    original_price: product.original_price || 0,
    shipping_fee: (product.shipping_fee || 0).toString(),
    shipping_fee_2km_5km: (product.shipping_fee_2km_5km || 0).toString(),
    shipping_fee_over_5km: (product.shipping_fee_over_5km || 0).toString(),
    shipping_type: (product.shipping_type || 'one_time') as 'one_time' | 'per_product',
  });

  useEffect(() => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock_count: (product.stock_count || 0).toString(),
      description: product.description || '',
      full_description: product.full_description || '',
      colors: product.colors || [],
      sizes: product.sizes || [],
      discount_percentage: product.discount_percentage || 0,
      original_price: product.original_price || 0,
      shipping_fee: (product.shipping_fee || 0).toString(),
      shipping_fee_2km_5km: (product.shipping_fee_2km_5km || 0).toString(),
      shipping_fee_over_5km: (product.shipping_fee_over_5km || 0).toString(),
      shipping_type: (product.shipping_type || 'one_time') as 'one_time' | 'per_product',
    });
  }, [product]);

  const toggleArrayItem = (array: string[], item: string, field: 'colors' | 'sizes') => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const stockCount = parseInt(formData.stock_count) || 0;
      
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          price: parseFloat(formData.price),
          stock_count: stockCount,
          in_stock: stockCount > 0,
          description: formData.description,
          full_description: formData.full_description,
          colors: formData.colors.length > 0 ? formData.colors : null,
          sizes: formData.sizes.length > 0 ? formData.sizes : null,
          discount_percentage: formData.discount_percentage,
          original_price: formData.original_price,
          has_discount: formData.discount_percentage > 0,
          shipping_fee: parseFloat(formData.shipping_fee) || 0,
          shipping_fee_2km_5km: parseFloat(formData.shipping_fee_2km_5km) || 0,
          shipping_fee_over_5km: parseFloat(formData.shipping_fee_over_5km) || 0,
          shipping_type: formData.shipping_type,
          last_stock_update: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      onProductUpdated();
      onClose();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product: {product.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₦) *</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock" className="flex items-center gap-2">
                Stock Count *
                <Badge variant="outline" className="text-xs">Restock</Badge>
              </Label>
              <Input 
                id="stock" 
                type="number" 
                value={formData.stock_count}
                onChange={(e) => setFormData({...formData, stock_count: e.target.value})}
                required
              />
              <p className="text-xs text-muted-foreground">
                Current stock: {product.stock_count || 0}. Update to restock.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_fee">On-Campus / Free Pickup (₦)</Label>
              <Input 
                id="shipping_fee" 
                type="number" 
                step="0.01"
                value={formData.shipping_fee}
                onChange={(e) => setFormData({...formData, shipping_fee: e.target.value})}
                placeholder="0 for free pickup"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_fee_2km_5km">2km - 5km from Campus (₦)</Label>
              <Input 
                id="shipping_fee_2km_5km" 
                type="number" 
                step="0.01"
                value={formData.shipping_fee_2km_5km}
                onChange={(e) => setFormData({...formData, shipping_fee_2km_5km: e.target.value})}
                placeholder="e.g. 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_fee_over_5km">Over 5km from Campus (₦)</Label>
              <Input 
                id="shipping_fee_over_5km" 
                type="number" 
                step="0.01"
                value={formData.shipping_fee_over_5km}
                onChange={(e) => setFormData({...formData, shipping_fee_over_5km: e.target.value})}
                placeholder="e.g. 1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_type">Shipping Fee Type</Label>
            <Select 
              value={formData.shipping_type} 
              onValueChange={(value: 'one_time' | 'per_product') => 
                setFormData({...formData, shipping_type: value})
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

          {/* Colors */}
          <div className="space-y-2">
            <Label>Colors</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <Badge 
                  key={color}
                  variant={formData.colors.includes(color) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem(formData.colors, color, 'colors')}
                >
                  {color}
                  {formData.colors.includes(color) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <Label>Sizes</Label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <Badge 
                  key={size}
                  variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem(formData.sizes, size, 'sizes')}
                >
                  {size}
                  {formData.sizes.includes(size) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount %</Label>
              <Input 
                id="discount" 
                type="number" 
                min="0" 
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({...formData, discount_percentage: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price (if discounted)</Label>
              <Input 
                id="original_price" 
                type="number" 
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({...formData, original_price: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_description">Full Description</Label>
            <Textarea 
              id="full_description" 
              value={formData.full_description}
              onChange={(e) => setFormData({...formData, full_description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
