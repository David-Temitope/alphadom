import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Laptop, 
  Shirt, 
  Home, 
  Dumbbell, 
  Sparkles, 
  Baby,
  ChevronRight
} from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Laptop, href: '/products?category=electronics' },
  { name: 'Fashion', icon: Shirt, href: '/products?category=fashion' },
  { name: 'Home', icon: Home, href: '/products?category=home' },
  { name: 'Sports', icon: Dumbbell, href: '/products?category=sports' },
  { name: 'Beauty', icon: Sparkles, href: '/products?category=beauty' },
  { name: 'Toys', icon: Baby, href: '/products?category=toys' },
];

export const TrendingCategories = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Trending Categories
            </h2>
            <p className="text-muted-foreground mt-1">
              Discover what's hot right now in our market
            </p>
          </div>
          <Link 
            to="/products" 
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="group flex flex-col items-center gap-3 p-4 lg:p-6 rounded-2xl bg-secondary hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
                <category.icon className="w-6 h-6 lg:w-7 lg:h-7 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 sm:hidden text-center">
          <Link 
            to="/products" 
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            View All Categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
