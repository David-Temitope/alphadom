import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { ProductCardMobile } from "./ProductCardMobile";
import { useProducts } from "@/hooks/useProducts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Flame, Crown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [vendorPlans, setVendorPlans] = useState<Record<string, string>>({});
  const bestSellingRef = useRef<HTMLDivElement>(null);
  const hotSalesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVendorPlans = async () => {
      const { data } = await supabase.from('approved_vendors').select('id, subscription_plan');
      if (data) {
        const plans: Record<string, string> = {};
        data.forEach((v: any) => { plans[v.id] = v.subscription_plan || 'free'; });
        setVendorPlans(plans);
      }
    };
    fetchVendorPlans();
  }, []);

  const categories = ["all", ...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory === "all" ? products : products.filter(p => p.category === selectedCategory);

  // Best Selling (First Class vendors, fallback to oldest) - limit to 10
  const bestSelling = filteredProducts.filter(p => p.vendor_id && vendorPlans[p.vendor_id] === 'first_class').slice(0, 10);
  const bestSellingFinal = bestSelling.length > 0 ? bestSelling : [...filteredProducts].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()).slice(0, 10);

  // Hot Sales (Economy vendors, fallback to newest) - limit to 10
  const hotSales = filteredProducts.filter(p => p.vendor_id && vendorPlans[p.vendor_id] === 'economy').slice(0, 10);
  const hotSalesFinal = hotSales.length > 0 ? hotSales : [...filteredProducts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const ProductScrollRow = ({ 
    items, 
    scrollRef 
  }: { 
    items: typeof products; 
    scrollRef: React.RefObject<HTMLDivElement>;
  }) => (
    <div className="relative group">
      {/* Scroll buttons - desktop only */}
      {!isMobile && items.length > 4 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-lg -ml-4 rounded-full border-border/50"
            onClick={() => scrollLeft(scrollRef)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-lg -mr-4 rounded-full border-border/50"
            onClick={() => scrollRight(scrollRef)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        <div className="flex gap-4 pb-2 w-max pl-1">
          {items.map(product => (
            <div key={product.id} className={isMobile ? "w-40 flex-shrink-0" : "w-60 flex-shrink-0"}>
              {isMobile ? (
                <ProductCardMobile product={product as any} />
              ) : (
                <ProductCard product={product as any} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-16 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px] md:w-[180px] rounded-xl border-border/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Best Selling */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground">Best Selling Products</h3>
            </div>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {bestSellingFinal.length > 0 ? (
            <ProductScrollRow items={bestSellingFinal} scrollRef={bestSellingRef} />
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <p className="text-muted-foreground">No products available</p>
            </div>
          )}
        </div>

        {/* Hot Sales */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground">Hot Sales</h3>
            </div>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {hotSalesFinal.length > 0 ? (
            <ProductScrollRow items={hotSalesFinal} scrollRef={hotSalesRef} />
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <p className="text-muted-foreground">No products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
