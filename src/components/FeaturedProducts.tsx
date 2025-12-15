import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { ProductCardMobile } from "./ProductCardMobile";
import { useProducts } from "@/hooks/useProducts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Flame, Crown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [vendorPlans, setVendorPlans] = useState<Record<string, string>>({});

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

  // Best Selling (First Class vendors, fallback to oldest)
  const bestSelling = filteredProducts.filter(p => p.vendor_id && vendorPlans[p.vendor_id] === 'first_class').slice(0, 8);
  const bestSellingFinal = bestSelling.length > 0 ? bestSelling : [...filteredProducts].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()).slice(0, 8);

  // Hot Sales (Economy vendors, fallback to newest)
  const hotSales = filteredProducts.filter(p => p.vendor_id && vendorPlans[p.vendor_id] === 'economy').slice(0, 8);
  const hotSalesFinal = hotSales.length > 0 ? hotSales : [...filteredProducts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 8);

  if (loading) {
    return <section className="py-12 px-4"><div className="container mx-auto"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-muted rounded animate-pulse" />)}</div></div></section>;
  }

  const ProductGrid = ({ items }: { items: typeof products }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {items.map(product => isMobile ? <ProductCardMobile key={product.id} product={product as any} /> : <ProductCard key={product.id} product={product as any} />)}
    </div>
  );

  return (
    <section className="py-8 md:py-16 px-4 bg-background">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Featured Products</h2>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px] md:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-500" /><h3 className="text-lg md:text-xl font-semibold">Best Selling Products</h3></div>
            <Link to="/products"><Button variant="ghost" size="sm">See All <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
          {bestSellingFinal.length > 0 ? <ProductGrid items={bestSellingFinal} /> : <p className="text-center text-muted-foreground py-8">No products</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" /><h3 className="text-lg md:text-xl font-semibold">Hot Sales</h3></div>
            <Link to="/products"><Button variant="ghost" size="sm">See All <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
          {hotSalesFinal.length > 0 ? <ProductGrid items={hotSalesFinal} /> : <p className="text-center text-muted-foreground py-8">No products</p>}
        </div>
      </div>
    </section>
  );
};