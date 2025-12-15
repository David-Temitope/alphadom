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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface VendorProductFormProps {
  onProductAdded: () => void;
}

const PRODUCT_TYPES = {
  'Clothing & Fashion': ['Men\'s Shirt', 'Women\'s Dress', 'Men\'s Trousers', 'Women\'s Skirt', 'T-Shirt', 'Jacket', 'Jeans', 'Shorts', 'Underwear', 'Socks'],
  'Electronics': ['Phone', 'Laptop', 'Tablet', 'Headphones', 'Charger', 'Power Bank', 'Speaker', 'Smart Watch', 'Camera', 'TV'],
  'Home & Living': ['Chair', 'Table', 'Bed', 'Sofa', 'Lamp', 'Curtain', 'Rug', 'Pillow', 'Blanket', 'Storage'],
  'Personal Care': ['Soap', 'Shampoo', 'Lotion', 'Perfume', 'Makeup', 'Skincare', 'Hair Product', 'Deodorant'],
  'Fashion': ['Shoes', 'Bag', 'Belt', 'Watch', 'Jewelry', 'Hat', 'Sunglasses', 'Scarf'],
  'Sports & Fitness': ['Gym Equipment', 'Sportswear', 'Sneakers', 'Water Bottle', 'Yoga Mat', 'Weights'],
};

const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Navy', 'Beige', 'Gold', 'Silver'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32', '34', '36', '38', '40', '42', '44', '46'];
const MATERIALS = ['Cotton', 'Polyester', 'Leather', 'Silk', 'Wool', 'Denim', 'Linen', 'Nylon', 'Plastic', 'Metal', 'Wood', 'Glass'];
const THICKNESS = ['Light', 'Medium', 'Thick', 'Heavy'];

export const VendorProductForm: React.FC<VendorProductFormProps> = ({ onProductAdded }) => {
  const { user } = useAuth();
  const { currentVendor } = useVendors();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    product_type: '',
    gender: '',
    colors: [] as string[],
    sizes: [] as string[],
    material: '',
    thickness: '',
    tags: '',
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

  const productTypes = newProduct.category ? PRODUCT_TYPES[newProduct.category as keyof typeof PRODUCT_TYPES] || [] : [];

  const toggleArrayItem = (array: string[], item: string, field: 'colors' | 'sizes') => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    setNewProduct({ ...newProduct, [field]: newArray });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentVendor) return;

    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.product_type || !newProduct.tags) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including Category, Type, and Tags",
        variant: "destructive",
      });
      return;
    }

    // Validate tags (max 50 words)
    const tagWords = newProduct.tags.split(',').map(t => t.trim()).filter(t => t);
    if (tagWords.length > 50) {
      toast({
        title: "Error",
        description: "Tags must be 50 words or less",
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
          product_type: newProduct.product_type,
          gender: newProduct.gender || null,
          colors: newProduct.colors.length > 0 ? newProduct.colors : null,
          sizes: newProduct.sizes.length > 0 ? newProduct.sizes : null,
          material: newProduct.material || null,
          thickness: newProduct.thickness || null,
          tags: tagWords,
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
        product_type: '',
        gender: '',
        colors: [],
        sizes: [],
        material: '',
        thickness: '',
        tags: '',
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="price">Price (₦) *</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={newProduct.category} 
            onValueChange={(value) => setNewProduct({...newProduct, category: value, product_type: ''})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PRODUCT_TYPES).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_type">Product Type *</Label>
          <Select 
            value={newProduct.product_type} 
            onValueChange={(value) => setNewProduct({...newProduct, product_type: value})}
            disabled={!newProduct.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender (Optional)</Label>
          <Select 
            value={newProduct.gender} 
            onValueChange={(value) => setNewProduct({...newProduct, gender: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="unisex">Unisex</SelectItem>
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

      {/* Colors */}
      <div className="space-y-2">
        <Label>Colors (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <Badge 
              key={color}
              variant={newProduct.colors.includes(color) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleArrayItem(newProduct.colors, color, 'colors')}
            >
              {color}
              {newProduct.colors.includes(color) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <Label>Sizes (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <Badge 
              key={size}
              variant={newProduct.sizes.includes(size) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleArrayItem(newProduct.sizes, size, 'sizes')}
            >
              {size}
              {newProduct.sizes.includes(size) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="material">Material (Optional)</Label>
          <Select 
            value={newProduct.material} 
            onValueChange={(value) => setNewProduct({...newProduct, material: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {MATERIALS.map(mat => (
                <SelectItem key={mat} value={mat}>{mat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="thickness">Thickness (Optional)</Label>
          <Select 
            value={newProduct.thickness} 
            onValueChange={(value) => setNewProduct({...newProduct, thickness: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select thickness" />
            </SelectTrigger>
            <SelectContent>
              {THICKNESS.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags * (comma-separated, max 50 words)</Label>
        <Textarea 
          id="tags" 
          placeholder="Enter tags for SEO, e.g.: fashion, men's shirt, black, formal, office wear"
          value={newProduct.tags}
          onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})}
          rows={2}
          required
        />
        <p className="text-xs text-muted-foreground">
          {newProduct.tags.split(',').filter(t => t.trim()).length}/50 tags used
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shipping_fee">Shipping Fee (₦) *</Label>
          <Input 
            id="shipping_fee" 
            type="number" 
            step="0.01"
            placeholder="500"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label>Product Image</Label>
        <ImageUpload 
          onImageUploaded={(url) => setNewProduct({...newProduct, image: url})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea 
          id="description" 
          placeholder="Brief product description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_description">Full Description</Label>
        <Textarea 
          id="full_description" 
          placeholder="Detailed product description"
          value={newProduct.full_description}
          onChange={(e) => setNewProduct({...newProduct, full_description: e.target.value})}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Adding...' : 'Add Product'}
      </Button>
    </form>
  );
};
