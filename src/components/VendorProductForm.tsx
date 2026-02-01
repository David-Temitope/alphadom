import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors } from '@/hooks/useVendors';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { DescriptionEnhancer } from '@/components/vendor/DescriptionEnhancer';

interface VendorProductFormProps {
  onProductAdded: () => void;
}

const PRODUCT_TYPES = {
  'Clothing & Fashion': ['Men\'s Shirt', 'Women\'s Dress', 'Men\'s Trousers', 'Women\'s Skirt', 'T-Shirt', 'Jacket', 'Jeans', 'Shorts', 'Underwear', 'Socks', 'Hoodie', 'Sweater', 'Blazer', 'Suit', 'Polo Shirt', 'Tank Top', 'Cardigan', 'Coat', 'Tracksuit', 'Swimwear'],
  'Electronics': ['Phone', 'Laptop', 'Tablet', 'Headphones', 'Charger', 'Power Bank', 'Speaker', 'Smart Watch', 'Camera', 'TV', 'Monitor', 'Keyboard', 'Mouse', 'USB Cable', 'Earbuds', 'Gaming Console', 'Drone', 'Router', 'Hard Drive', 'Flash Drive'],
  'Home & Living': ['Chair', 'Table', 'Bed', 'Sofa', 'Lamp', 'Curtain', 'Rug', 'Pillow', 'Blanket', 'Storage', 'Mirror', 'Clock', 'Vase', 'Picture Frame', 'Shelf', 'Mattress', 'Desk', 'Wardrobe', 'Dining Set', 'TV Stand'],
  'Personal Care': ['Soap', 'Shampoo', 'Lotion', 'Perfume', 'Makeup', 'Skincare', 'Hair Product', 'Deodorant', 'Toothpaste', 'Face Wash', 'Body Wash', 'Hair Dryer', 'Razor', 'Nail Polish', 'Lip Balm', 'Sunscreen', 'Body Oil', 'Hair Cream', 'Facial Mask'],
  'Shoes & Footwear': ['Sneakers', 'Sandals', 'Heels', 'Boots', 'Loafers', 'Slippers', 'Running Shoes', 'Formal Shoes', 'Canvas', 'Flip Flops', 'Wedges', 'Platforms', 'Oxford', 'Moccasins', 'Espadrilles'],
  'Bags & Accessories': ['Handbag', 'Backpack', 'Clutch', 'Wallet', 'Belt', 'Watch', 'Jewelry', 'Hat', 'Sunglasses', 'Scarf', 'Tie', 'Bracelet', 'Necklace', 'Earrings', 'Ring', 'Cufflinks', 'Hair Accessory', 'Keychain'],
  'Sports & Fitness': ['Gym Equipment', 'Sportswear', 'Running Shoes', 'Water Bottle', 'Yoga Mat', 'Weights', 'Resistance Band', 'Jump Rope', 'Fitness Tracker', 'Sports Bag', 'Football', 'Basketball', 'Tennis Racket', 'Swimming Goggles'],
  'Books & Stationery': ['Novel', 'Textbook', 'Notebook', 'Pen', 'Pencil', 'Highlighter', 'Sticky Notes', 'Planner', 'File Folder', 'Diary', 'Art Supplies', 'Calculator', 'Stapler', 'Scissors'],
  'Baby & Kids': ['Baby Clothes', 'Diapers', 'Baby Food', 'Toys', 'Stroller', 'Car Seat', 'Baby Bottle', 'Baby Monitor', 'Kids Shoes', 'School Bag', 'Kids Watch', 'Kids Accessories'],
  'Food & Groceries': ['Snacks', 'Beverages', 'Spices', 'Cooking Oil', 'Rice', 'Pasta', 'Canned Food', 'Cereal', 'Coffee', 'Tea', 'Honey', 'Nuts', 'Dried Fruits'],
  'Health & Wellness': ['Vitamins', 'Supplements', 'First Aid', 'Pain Relief', 'Thermometer', 'Blood Pressure Monitor', 'Face Mask', 'Hand Sanitizer', 'Essential Oil'],
  'Automotive': ['Car Accessories', 'Phone Holder', 'Car Charger', 'Seat Cover', 'Air Freshener', 'Car Wash', 'Dash Cam', 'GPS', 'Car Mat', 'Steering Wheel Cover'],
  'Kitchen & Dining': ['Cookware', 'Cutlery', 'Plates', 'Cups', 'Blender', 'Microwave', 'Toaster', 'Kettle', 'Food Container', 'Spice Rack', 'Apron', 'Oven Mitt'],
  'Garden & Outdoor': ['Plants', 'Pots', 'Garden Tools', 'Seeds', 'Fertilizer', 'Outdoor Furniture', 'Umbrella', 'Camping Gear', 'BBQ Grill', 'Lantern'],
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
  
  const FORM_STORAGE_KEY = `vendor_product_form_${user?.id || 'guest'}`;

  // Initialize state from localStorage or defaults
  const getInitialFormState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          localStorage.removeItem(FORM_STORAGE_KEY);
        }
      }
    }
    return {
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
      images: [] as string[],
      description: '',
      full_description: '',
      shipping_fee: '',
      shipping_fee_2km_5km: '',
      shipping_fee_over_5km: '',
      shipping_type: 'one_time' as 'one_time' | 'per_product',
    };
  };

  const [newProduct, setNewProduct] = useState(getInitialFormState);

  // Save to localStorage whenever form changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(newProduct));
    }
  }, [newProduct, user?.id, FORM_STORAGE_KEY]);

  // Clear form from localStorage after successful submission
  const clearFormStorage = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

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

    // Validate at least 1 image
    if (newProduct.images.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least 1 product image",
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
          image: newProduct.images.length > 1 ? JSON.stringify(newProduct.images) : (newProduct.images[0] || newProduct.image),
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
          shipping_fee_2km_5km: parseFloat(newProduct.shipping_fee_2km_5km) || 0,
          shipping_fee_over_5km: parseFloat(newProduct.shipping_fee_over_5km) || 0,
          shipping_type: newProduct.shipping_type,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      // Clear localStorage and reset form
      clearFormStorage();
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
        images: [],
        description: '',
        full_description: '',
        shipping_fee: '',
        shipping_fee_2km_5km: '',
        shipping_fee_over_5km: '',
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

      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <h4 className="font-semibold text-sm">Shipping & Delivery Fees (Zone-Based)</h4>
        <p className="text-xs text-muted-foreground">
          Set different shipping fees based on delivery zones. Buyers will see your business location to determine their zone.
        </p>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">
            💡 Pro tip: Include shipping in your price and list as "free shipping". This increases sales by 30% because customers hate extra fees at checkout!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_fee">Zone 1 - Local (Same City/State) (₦)</Label>
            <Input 
              id="shipping_fee" 
              type="number" 
              step="0.01"
              placeholder="500"
              value={newProduct.shipping_fee}
              onChange={(e) => setNewProduct({...newProduct, shipping_fee: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">Buyer is in same city as you</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_fee_2km_5km">Zone 2 - Regional (Neighboring States) (₦)</Label>
            <Input 
              id="shipping_fee_2km_5km" 
              type="number" 
              step="0.01"
              placeholder="1000"
              value={newProduct.shipping_fee_2km_5km}
              onChange={(e) => setNewProduct({...newProduct, shipping_fee_2km_5km: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">Buyer is in a nearby state</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_fee_over_5km">Zone 3 - National (Far-Away States) (₦)</Label>
            <Input 
              id="shipping_fee_over_5km" 
              type="number" 
              step="0.01"
              placeholder="2000"
              value={newProduct.shipping_fee_over_5km}
              onChange={(e) => setNewProduct({...newProduct, shipping_fee_over_5km: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">Buyer is far from your location</p>
          </div>
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

      {/* Eco Features */}
      <div className="space-y-2">
        <Label htmlFor="eco_features">Eco Features (comma-separated)</Label>
        <Input 
          id="eco_features" 
          placeholder="e.g.: Recyclable, Organic, Biodegradable"
          value={newProduct.eco_features.join(', ')}
          onBlur={(e) => setNewProduct({
            ...newProduct, 
            eco_features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
          })}
          onChange={(e) => {
            // Allow typing freely, only parse on blur
            const input = e.target;
            const cursorPosition = input.selectionStart;
            setNewProduct(prev => ({ ...prev, eco_features: [e.target.value] }));
            // Restore cursor position
            setTimeout(() => input.setSelectionRange(cursorPosition, cursorPosition), 0);
          }}
        />
        <p className="text-xs text-muted-foreground">Press Tab or click outside to save</p>
      </div>

      <MultiImageUpload 
        onImagesChanged={(urls) => setNewProduct({...newProduct, images: urls, image: urls[0] || ''})}
        currentImages={newProduct.images}
        maxImages={3}
        maxTotalSizeMB={8}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Short Description</Label>
          <DescriptionEnhancer 
            productName={newProduct.name}
            category={newProduct.category}
            onApplyDescription={(desc) => setNewProduct({...newProduct, description: desc})}
            onApplyTags={(tags) => setNewProduct({...newProduct, tags: [...newProduct.tags.split(',').map(t => t.trim()).filter(t => t), ...tags].join(', ')})}
          />
        </div>
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
