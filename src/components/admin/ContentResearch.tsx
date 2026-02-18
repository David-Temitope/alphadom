import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';
import { Search, ExternalLink, RefreshCw, BookOpen, Copy, Check } from 'lucide-react';

interface ResearchResult {
  title: string;
  summary: string;
  url: string;
}

export const ContentResearch: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic to research",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await firecrawlApi.researchContent(topic);
      if (response.success && response.data) {
        setResults(response.data);
        if (response.data.length === 0) {
          toast({
            title: "No results",
            description: "No content found for this topic. Try a different search term.",
          });
        } else {
          toast({
            title: "Success",
            description: `Found ${response.data.length} articles for inspiration`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: response.error || 'Failed to research content',
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

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Content Research
          </CardTitle>
          <CardDescription>
            Research topics and get content inspiration for your blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Research Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., fashion trends 2026, e-commerce tips Nigeria, sustainable shopping..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Research Topic
                  </>
                )}
              </Button>
              {results.length > 0 && (
                <Button type="button" variant="outline" onClick={() => setResults([])}>
                  Clear Results
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !isLoading && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            Found {results.length} articles for inspiration
          </h3>
          {results.map((result, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="font-semibold text-base line-clamp-2 flex-1">
                    {result.title}
                  </h4>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(result.summary, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Research content topics</h3>
            <p className="text-sm text-muted-foreground">
              Enter a topic above to find articles and content for inspiration. Use the summaries to spark ideas for your blog posts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
