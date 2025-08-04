
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  sustainabilityScore: number;
  ecoFeatures: string[];
  description: string;
  fullDescription: string;
  specifications: Record<string, string>;
  inStock: boolean;
  stockCount: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Bamboo Fiber Water Bottle",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    category: "Home & Living",
    rating: 4.8,
    reviews: 324,
    sustainabilityScore: 9,
    ecoFeatures: ["Biodegradable", "BPA-Free", "Renewable Material"],
    description: "Sustainable bamboo fiber water bottle with leak-proof design. Perfect for eco-conscious hydration.",
    fullDescription: "Made from premium bamboo fiber composite, this water bottle represents the perfect blend of sustainability and functionality. The natural antibacterial properties of bamboo make it an ideal material for drinkware, while the leak-proof design ensures you can carry it anywhere with confidence.",
    specifications: {
      "Material": "Bamboo Fiber Composite",
      "Capacity": "500ml",
      "Weight": "180g",
      "Dimensions": "7.5 x 22 cm",
      "Care": "Hand wash recommended"
    },
    inStock: true,
    stockCount: 45
  },
  {
    id: "2",
    name: "Organic Cotton Tote Bag Set",
    price: 32.50,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.7,
    reviews: 198,
    sustainabilityScore: 8,
    ecoFeatures: ["Organic Cotton", "Reusable", "Fair Trade"],
    description: "Set of 3 durable organic cotton tote bags in different sizes. Replace plastic bags with style.",
    fullDescription: "This premium set includes three versatile tote bags made from 100% organic cotton. Each bag is designed for different uses - from grocery shopping to daily commutes. The sturdy construction and reinforced handles ensure these bags will last for years.",
    specifications: {
      "Material": "100% Organic Cotton",
      "Set Includes": "Large, Medium, Small bags",
      "Handle Length": "25cm",
      "Weight Capacity": "15kg",
      "Care": "Machine washable"
    },
    inStock: true,
    stockCount: 23
  },
  {
    id: "3",
    name: "Solar-Powered LED Garden Lights",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
    category: "Home & Living",
    rating: 4.6,
    reviews: 156,
    sustainabilityScore: 9,
    ecoFeatures: ["Solar Powered", "LED Technology", "Weather Resistant"],
    description: "Beautiful solar-powered LED lights for your garden. Automatic on/off with dusk sensor.",
    fullDescription: "Transform your outdoor space with these elegant solar-powered LED garden lights. Featuring advanced photovoltaic cells and energy-efficient LED technology, they automatically illuminate your garden at dusk and provide up to 8 hours of beautiful lighting.",
    specifications: {
      "Power Source": "Solar Panel + Rechargeable Battery",
      "LED Count": "8 LEDs per unit",
      "Lighting Duration": "8-10 hours",
      "Weather Rating": "IP65 Waterproof",
      "Set Size": "4 units"
    },
    inStock: true,
    stockCount: 34
  },
  {
    id: "4",
    name: "Natural Coconut Bowl Set",
    price: 28.75,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    category: "Home & Living",
    rating: 4.9,
    reviews: 412,
    sustainabilityScore: 10,
    ecoFeatures: ["Upcycled", "100% Natural", "Handcrafted"],
    description: "Handcrafted coconut bowls made from upcycled coconut shells. Each bowl is unique and eco-friendly.",
    fullDescription: "These beautiful bowls are crafted from discarded coconut shells, giving them a second life as functional art. Each bowl is unique with its own natural patterns and grain. Perfect for smoothie bowls, salads, or decorative purposes.",
    specifications: {
      "Material": "Natural Coconut Shell",
      "Set Size": "2 bowls + 2 spoons",
      "Diameter": "12-14cm",
      "Finish": "Food-safe natural oil",
      "Care": "Hand wash only"
    },
    inStock: true,
    stockCount: 67
  },
  {
    id: "5",
    name: "Eco-Friendly Yoga Mat",
    price: 65.00,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
    category: "Personal Care",
    rating: 4.8,
    reviews: 289,
    sustainabilityScore: 8,
    ecoFeatures: ["Natural Rubber", "Non-Toxic", "Biodegradable"],
    description: "Premium yoga mat made from natural tree rubber. Non-slip surface with excellent grip and cushioning.",
    fullDescription: "Crafted from sustainably harvested natural tree rubber, this yoga mat provides exceptional grip and comfort for your practice. The closed-cell surface prevents moisture and bacteria absorption, while the natural rubber base offers superior stability.",
    specifications: {
      "Material": "Natural Tree Rubber",
      "Thickness": "4mm",
      "Dimensions": "183 x 61 cm",
      "Weight": "1.8kg",
      "Texture": "Non-slip both sides"
    },
    inStock: true,
    stockCount: 19
  },
  {
    id: "6",
    name: "Reusable Beeswax Food Wraps",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    category: "Food & Beverage",
    rating: 4.7,
    reviews: 203,
    sustainabilityScore: 9,
    ecoFeatures: ["Plastic-Free", "Reusable", "Natural Beeswax"],
    description: "Set of 5 reusable beeswax wraps in various sizes. Natural alternative to plastic wrap.",
    fullDescription: "Say goodbye to single-use plastic wrap with these beautiful, reusable beeswax wraps. Made from organic cotton infused with natural beeswax, tree resin, and jojoba oil, they create a natural antibacterial seal around your food.",
    specifications: {
      "Material": "Organic Cotton + Beeswax",
      "Set Includes": "5 wraps (various sizes)",
      "Largest Size": "33 x 33 cm",
      "Lifespan": "12+ months with proper care",
      "Care": "Cold water rinse only"
    },
    inStock: true,
    stockCount: 78
  },
  {
    id: "7",
    name: "Bamboo Toothbrush Family Pack",
    price: 16.50,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=400&fit=crop",
    category: "Personal Care",
    rating: 4.6,
    reviews: 167,
    sustainabilityScore: 8,
    ecoFeatures: ["Biodegradable", "Bamboo Handle", "Plastic-Free Packaging"],
    description: "Pack of 4 bamboo toothbrushes with soft bristles. Biodegradable alternative to plastic toothbrushes.",
    fullDescription: "These sustainable bamboo toothbrushes feature ergonomically designed handles made from fast-growing bamboo. The soft, plant-based bristles are gentle on teeth and gums while effectively cleaning. Each toothbrush is individually wrapped in compostable packaging.",
    specifications: {
      "Handle Material": "Sustainable Bamboo",
      "Bristles": "Soft Plant-Based Bristles",
      "Pack Size": "4 toothbrushes",
      "Handle Length": "19cm",
      "Packaging": "Compostable wrapper"
    },
    inStock: true,
    stockCount: 156
  },
  {
    id: "8",
    name: "Organic Hemp T-Shirt",
    price: 35.00,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.8,
    reviews: 94,
    sustainabilityScore: 7,
    ecoFeatures: ["Organic Hemp", "Fair Trade", "Carbon Neutral"],
    description: "Comfortable organic hemp t-shirt. Naturally antibacterial and gets softer with each wash.",
    fullDescription: "This premium t-shirt is made from 100% organic hemp, one of the most sustainable textiles available. Hemp naturally resists bacteria and UV rays, while becoming softer and more comfortable with each wash. The relaxed fit and breathable fabric make it perfect for everyday wear.",
    specifications: {
      "Material": "100% Organic Hemp",
      "Weight": "200 GSM",
      "Fit": "Relaxed",
      "Sizes": "XS-XXL available",
      "Care": "Machine wash cold"
    },
    inStock: true,
    stockCount: 42
  }
];

export const categories = [
  { name: "Home & Living", icon: "🏠", count: products.filter(p => p.category === "Home & Living").length },
  { name: "Personal Care", icon: "🧴", count: products.filter(p => p.category === "Personal Care").length },
  { name: "Food & Beverage", icon: "🍃", count: products.filter(p => p.category === "Food & Beverage").length },
  { name: "Fashion", icon: "👕", count: products.filter(p => p.category === "Fashion").length },
  { name: "Electronics", icon: "💻", count: products.filter(p => p.category === "Electronics").length },
  { name: "Tech Accessories", icon: "🔌", count: products.filter(p => p.category === "Tech Accessories").length },
  { name: "Sports & Fitness", icon: "⚽", count: products.filter(p => p.category === "Sports & Fitness").length },
  { name: "Books & Media", icon: "📚", count: products.filter(p => p.category === "Books & Media").length },
];
