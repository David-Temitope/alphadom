import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, RefreshCw, Copy, Check, Wand2 } from 'lucide-react';

interface DescriptionEnhancerProps {
  productName: string;
  category: string;
  onApplyDescription?: (description: string) => void;
  onApplyTags?: (tags: string[]) => void;
}

export const DescriptionEnhancer: React.FC<DescriptionEnhancerProps> = ({
  productName,
  category,
  onApplyDescription,
  onApplyTags,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!productName.trim() || !category.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a product name and select a category first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDescriptions([]);
    setSuggestedTags([]);

    try {
      const response = await firecrawlApi.getDescriptionSuggestions(productName, category);
      
      if (response.success && response.data) {
        setDescriptions(response.data.descriptions);
        setSuggestedTags(response.data.tags);
        
        if (response.data.descriptions.length === 0 && response.data.tags.length === 0) {
          toast({
            title: "No suggestions",
            description: "Could not find suggestions for this product. Try a more specific product name.",
          });
        } else {
          toast({
            title: "Success",
            description: "Found description and tag suggestions!",
          });
        }
      } else {
        toast({
          title: "Error",
          description: response.error || 'Failed to get suggestions',
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyDescription = async (desc: string, index: number) => {
    try {
      await navigator.clipboard.writeText(desc);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Description copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const applyDescription = (desc: string) => {
    if (onApplyDescription) {
      onApplyDescription(desc);
      toast({
        title: "Applied!",
        description: "Description added to your product",
      });
    }
  };

  const applyAllTags = () => {
    if (onApplyTags && suggestedTags.length > 0) {
      onApplyTags(suggestedTags);
      toast({
        title: "Applied!",
        description: `Added ${suggestedTags.length} tags to your product`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={!productName || !category}
        >
          <Wand2 className="h-4 w-4" />
          Enhance with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Description Enhancer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Searching for:</p>
            <p className="font-medium">{productName}</p>
            <p className="text-sm text-muted-foreground">Category: {category}</p>
          </div>

          <Button 
            onClick={handleEnhance} 
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing competitors...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get AI Suggestions
              </>
            )}
          </Button>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-6 w-20" />
                ))}
              </div>
            </div>
          )}

          {/* Descriptions */}
          {descriptions.length > 0 && !isLoading && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Suggested Descriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {descriptions.map((desc, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-muted/50 rounded-lg border"
                  >
                    <p className="text-sm mb-3">{desc}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => copyDescription(desc, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        Copy
                      </Button>
                      {onApplyDescription && (
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => applyDescription(desc)}
                        >
                          <Sparkles className="h-3 w-3" />
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Suggested Tags */}
          {suggestedTags.length > 0 && !isLoading && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Suggested Tags
                  </CardTitle>
                  {onApplyTags && (
                    <Button size="sm" onClick={applyAllTags} className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Apply All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && descriptions.length === 0 && suggestedTags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Get AI Suggestions" to analyze competitor listings and get description ideas.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
