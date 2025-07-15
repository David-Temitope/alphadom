import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";

export const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  
  const featuredProducts = products?.slice(0, 6) || [];

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Featured Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl h-96 animate-pulse backdrop-blur-sm border border-border/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};