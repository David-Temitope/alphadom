import { useProducts } from "@/hooks/useProducts";
import { JumiaProductCard } from "./JumiaProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

export const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    slidesToScroll: 1,
    align: 'start',
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
    }
  });
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products?.map(p => p.category) || []))];
  
  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? products?.slice(0, 12) || []
    : products?.filter(p => p.category === selectedCategory).slice(0, 12) || [];

  if (loading) {
    return (
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-foreground mb-2">
              Top Deals on Products
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg h-80 animate-pulse border border-border/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-foreground mb-2">
            Top Deals on Products
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Products' : category}
            </Button>
          ))}
        </div>

        {/* Carousel Section */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 border-border hover:bg-muted"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 border-border hover:bg-muted"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Carousel */}
          <div className="overflow-hidden mx-8" ref={emblaRef}>
            <div className="flex gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex-none w-48 md:w-56">
                  <JumiaProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};