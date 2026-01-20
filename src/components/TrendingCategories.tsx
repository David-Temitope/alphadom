import React, { useMemo } from 'react';
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
import { useProducts } from '@/hooks/useProducts';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  sports: Dumbbell,
  beauty: Sparkles,
  toys: Baby,
};

export const TrendingCategories = () => {
  const { products } = useProducts();

  // Get unique categories from actual products in database
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.slice(0, 6).map(cat => {
      const normalizedCat = cat.toLowerCase();
      const IconComponent = categoryIcons[normalizedCat] || Laptop;
      return {
        name: cat,
        icon: IconComponent,
        href: `/products?category=${encodeURIComponent(cat)}`
      };
    });
  }, [products]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Trending Categories
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
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
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 lg:gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="group flex flex-col items-center gap-3 p-4 lg:p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <category.icon className="w-6 h-6 lg:w-7 lg:h-7 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-foreground text-center">
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
