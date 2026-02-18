import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketResearch } from '@/hooks/useMarketResearch';
import { Search, TrendingUp, ExternalLink, RefreshCw, BarChart3 } from 'lucide-react';
import { sanitizeUrl } from '@/utils/security';

const CATEGORIES = [
  'Clothing & Fashion',
  'Electronics',
  'Home & Living',
  'Personal Care',
  'Shoes & Footwear',
  'Bags & Accessories',
  'Sports & Fitness',
  'Books & Stationery',
  'Baby & Kids',
  'Food & Groceries',
  'Health & Wellness',
  'Automotive',
  'Kitchen & Dining',
  'Garden & Outdoor',
];

export const MarketResearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const { results, isLoading, searchProducts, clearResults } = useMarketResearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchProducts(searchTerm, category);
  };

  // Calculate average price from results
  const averagePrice = results.length > 0
    ? results.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[₦,]/g, ''));
        return sum + (isNaN(price) ? 0 : price);
      }, 0) / results.length
    : 0;

  // Get price range
  const prices = results
    .map(item => parseFloat(item.price.replace(/[₦,]/g, '')))
    .filter(p => !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Market Research
          </CardTitle>
          <CardDescription>
            Search competitor prices across Nigerian e-commerce sites (Jumia, Konga, Jiji)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="search">Product Name</Label>
                <Input
                  id="search"
                  placeholder="e.g., iPhone 15, Nike sneakers, Samsung TV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search Prices
                  </>
                )}
              </Button>
              {results.length > 0 && (
                <Button type="button" variant="outline" onClick={clearResults}>
                  Clear Results
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-3" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && !isLoading && (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-semibold">Price Analysis</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Results Found</p>
                  <p className="text-xl font-bold text-foreground">{results.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lowest Price</p>
                  <p className="text-xl font-bold text-primary">₦{minPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Highest Price</p>
                  <p className="text-xl font-bold text-destructive">₦{maxPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Average Price</p>
                  <p className="text-xl font-bold text-foreground">₦{Math.round(averagePrice).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-background rounded-lg">
                <p className="text-sm">
                  <TrendingUp className="h-4 w-4 inline mr-1 text-primary" />
                  <strong>Pricing Tip:</strong> To be competitive, consider pricing between{' '}
                  <span className="font-semibold">₦{Math.round(minPrice * 0.95).toLocaleString()}</span> and{' '}
                  <span className="font-semibold">₦{Math.round(averagePrice).toLocaleString()}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm line-clamp-2 flex-1 pr-2">
                      {result.productName}
                    </h4>
                    <Badge variant="outline" className="shrink-0">
                      {result.source}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {result.price}
                  </p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {result.description}
                    </p>
                  )}
                  <a
                    href={sanitizeUrl(result.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View on {result.source}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {results.length === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Search for competitor prices</h3>
            <p className="text-sm text-muted-foreground">
              Enter a product name above to see what competitors are charging on Jumia, Konga, and Jiji.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
