
-- Enable realtime for products, orders, and users
-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  sustainability_score INTEGER DEFAULT 0,
  eco_features TEXT[],
  description TEXT,
  full_description TEXT,
  specifications JSONB,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products" ON public.products
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for order items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- Insert sample products data
INSERT INTO public.products (name, price, image, category, rating, reviews, sustainability_score, eco_features, description, full_description, specifications, in_stock, stock_count) VALUES
('Bamboo Fiber Water Bottle', 24.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', 'Home & Living', 4.8, 324, 9, ARRAY['Biodegradable', 'BPA-Free', 'Renewable Material'], 'Sustainable bamboo fiber water bottle with leak-proof design. Perfect for eco-conscious hydration.', 'Made from premium bamboo fiber composite, this water bottle represents the perfect blend of sustainability and functionality. The natural antibacterial properties of bamboo make it an ideal material for drinkware, while the leak-proof design ensures you can carry it anywhere with confidence.', '{"Material": "Bamboo Fiber Composite", "Capacity": "500ml", "Weight": "180g", "Dimensions": "7.5 x 22 cm", "Care": "Hand wash recommended"}', true, 45),
('Organic Cotton Tote Bag Set', 32.50, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', 'Fashion', 4.7, 198, 8, ARRAY['Organic Cotton', 'Reusable', 'Fair Trade'], 'Set of 3 durable organic cotton tote bags in different sizes. Replace plastic bags with style.', 'This premium set includes three versatile tote bags made from 100% organic cotton. Each bag is designed for different uses - from grocery shopping to daily commutes. The sturdy construction and reinforced handles ensure these bags will last for years.', '{"Material": "100% Organic Cotton", "Set Includes": "Large, Medium, Small bags", "Handle Length": "25cm", "Weight Capacity": "15kg", "Care": "Machine washable"}', true, 23),
('Solar-Powered LED Garden Lights', 45.99, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', 'Home & Living', 4.6, 156, 9, ARRAY['Solar Powered', 'LED Technology', 'Weather Resistant'], 'Beautiful solar-powered LED lights for your garden. Automatic on/off with dusk sensor.', 'Transform your outdoor space with these elegant solar-powered LED garden lights. Featuring advanced photovoltaic cells and energy-efficient LED technology, they automatically illuminate your garden at dusk and provide up to 8 hours of beautiful lighting.', '{"Power Source": "Solar Panel + Rechargeable Battery", "LED Count": "8 LEDs per unit", "Lighting Duration": "8-10 hours", "Weather Rating": "IP65 Waterproof", "Set Size": "4 units"}', true, 34),
('Natural Coconut Bowl Set', 28.75, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'Home & Living', 4.9, 412, 10, ARRAY['Upcycled', '100% Natural', 'Handcrafted'], 'Handcrafted coconut bowls made from upcycled coconut shells. Each bowl is unique and eco-friendly.', 'These beautiful bowls are crafted from discarded coconut shells, giving them a second life as functional art. Each bowl is unique with its own natural patterns and grain. Perfect for smoothie bowls, salads, or decorative purposes.', '{"Material": "Natural Coconut Shell", "Set Size": "2 bowls + 2 spoons", "Diameter": "12-14cm", "Finish": "Food-safe natural oil", "Care": "Hand wash only"}', true, 67),
('Eco-Friendly Yoga Mat', 65.00, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop', 'Personal Care', 4.8, 289, 8, ARRAY['Natural Rubber', 'Non-Toxic', 'Biodegradable'], 'Premium yoga mat made from natural tree rubber. Non-slip surface with excellent grip and cushioning.', 'Crafted from sustainably harvested natural tree rubber, this yoga mat provides exceptional grip and comfort for your practice. The closed-cell surface prevents moisture and bacteria absorption, while the natural rubber base offers superior stability.', '{"Material": "Natural Tree Rubber", "Thickness": "4mm", "Dimensions": "183 x 61 cm", "Weight": "1.8kg", "Texture": "Non-slip both sides"}', true, 19),
('Reusable Beeswax Food Wraps', 19.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', 'Food & Beverage', 4.7, 203, 9, ARRAY['Plastic-Free', 'Reusable', 'Natural Beeswax'], 'Set of 5 reusable beeswax wraps in various sizes. Natural alternative to plastic wrap.', 'Say goodbye to single-use plastic wrap with these beautiful, reusable beeswax wraps. Made from organic cotton infused with natural beeswax, tree resin, and jojoba oil, they create a natural antibacterial seal around your food.', '{"Material": "Organic Cotton + Beeswax", "Set Includes": "5 wraps (various sizes)", "Largest Size": "33 x 33 cm", "Lifespan": "12+ months with proper care", "Care": "Cold water rinse only"}', true, 78),
('Bamboo Toothbrush Family Pack', 16.50, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=400&fit=crop', 'Personal Care', 4.6, 167, 8, ARRAY['Biodegradable', 'Bamboo Handle', 'Plastic-Free Packaging'], 'Pack of 4 bamboo toothbrushes with soft bristles. Biodegradable alternative to plastic toothbrushes.', 'These sustainable bamboo toothbrushes feature ergonomically designed handles made from fast-growing bamboo. The soft, plant-based bristles are gentle on teeth and gums while effectively cleaning. Each toothbrush is individually wrapped in compostable packaging.', '{"Handle Material": "Sustainable Bamboo", "Bristles": "Soft Plant-Based Bristles", "Pack Size": "4 toothbrushes", "Handle Length": "19cm", "Packaging": "Compostable wrapper"}', true, 156),
('Organic Hemp T-Shirt', 35.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', 'Fashion', 4.8, 94, 7, ARRAY['Organic Hemp', 'Fair Trade', 'Carbon Neutral'], 'Comfortable organic hemp t-shirt. Naturally antibacterial and gets softer with each wash.', 'This premium t-shirt is made from 100% organic hemp, one of the most sustainable textiles available. Hemp naturally resists bacteria and UV rays, while becoming softer and more comfortable with each wash. The relaxed fit and breathable fabric make it perfect for everyday wear.', '{"Material": "100% Organic Hemp", "Weight": "200 GSM", "Fit": "Relaxed", "Sizes": "XS-XXL available", "Care": "Machine wash cold"}', true, 42);
