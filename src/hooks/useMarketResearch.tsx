import { useState, useCallback } from 'react';
import { firecrawlApi, MarketResearchResult } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';

export interface UseMarketResearchReturn {
  results: MarketResearchResult[];
  isLoading: boolean;
  error: string | null;
  searchProducts: (productName: string, category?: string) => Promise<void>;
  clearResults: () => void;
}

export const useMarketResearch = (): UseMarketResearchReturn => {
  const [results, setResults] = useState<MarketResearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchProducts = useCallback(async (productName: string, category?: string) => {
    if (!productName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await firecrawlApi.searchMarketPrices(productName, category);

      if (response.success && response.data) {
        setResults(response.data);
        if (response.data.length === 0) {
          toast({
            title: "No results",
            description: "No competitor prices found. Try a different search term.",
          });
        } else {
          toast({
            title: "Success",
            description: `Found ${response.data.length} competitor listings`,
          });
        }
      } else {
        setError(response.error || 'Failed to search market prices');
        toast({
          title: "Error",
          description: response.error || 'Failed to search market prices',
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    searchProducts,
    clearResults,
  };
};
