import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: (
    | 'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'branding' | 'summary'
    | { type: 'json'; schema?: object; prompt?: string }
  )[];
  onlyMainContent?: boolean;
  waitFor?: number;
  location?: { country?: string; languages?: string[] };
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string; // Time filter: 'qdr:h' (hour), 'qdr:d' (day), 'qdr:w' (week), 'qdr:m' (month), 'qdr:y' (year)
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

export interface SearchResult {
  url: string;
  title: string;
  description?: string;
  markdown?: string;
  html?: string;
}

export interface MarketResearchResult {
  productName: string;
  price: string;
  currency: string;
  source: string;
  url: string;
  description?: string;
  image?: string;
}

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Search the web and optionally scrape results
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse<SearchResult[]>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Map a website to discover all URLs (fast sitemap)
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Market research for Nigerian e-commerce
  async searchMarketPrices(productName: string, category?: string): Promise<FirecrawlResponse<MarketResearchResult[]>> {
    // Build search query targeting Nigerian e-commerce sites
    const searchQuery = category 
      ? `${productName} ${category} price site:jumia.com.ng OR site:konga.com OR site:jiji.ng`
      : `${productName} price Nigeria site:jumia.com.ng OR site:konga.com OR site:jiji.ng`;
    
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { 
        query: searchQuery,
        options: {
          limit: 15,
          country: 'NG',
          lang: 'en',
          scrapeOptions: {
            formats: ['markdown']
          }
        }
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Parse and format results for market research
    const results: MarketResearchResult[] = [];
    if (data?.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        // Extract price from content using regex for Naira prices
        const priceMatch = item.markdown?.match(/₦[\d,]+(?:\.\d{2})?|NGN\s*[\d,]+(?:\.\d{2})?/i);
        if (priceMatch) {
          results.push({
            productName: item.title || productName,
            price: priceMatch[0].replace(/NGN\s*/i, '₦'),
            currency: 'NGN',
            source: new URL(item.url).hostname.replace('www.', ''),
            url: item.url,
            description: item.description || item.markdown?.slice(0, 200),
          });
        }
      }
    }

    return { success: true, data: results };
  },

  // Content research for blog posts
  async researchContent(topic: string): Promise<FirecrawlResponse<{ title: string; summary: string; url: string }[]>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { 
        query: `${topic} Nigeria`,
        options: {
          limit: 10,
          country: 'NG',
          lang: 'en',
          scrapeOptions: {
            formats: ['markdown']
          }
        }
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Format results for content research
    const results: { title: string; summary: string; url: string }[] = [];
    if (data?.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        results.push({
          title: item.title || 'Untitled',
          summary: item.markdown?.slice(0, 500) || item.description || '',
          url: item.url,
        });
      }
    }

    return { success: true, data: results };
  },

  // Get product description suggestions
  async getDescriptionSuggestions(productName: string, category: string): Promise<FirecrawlResponse<{ descriptions: string[]; tags: string[] }>> {
    const searchQuery = `best ${productName} ${category} product description Nigeria`;
    
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { 
        query: searchQuery,
        options: {
          limit: 5,
          country: 'NG',
          lang: 'en',
          scrapeOptions: {
            formats: ['markdown']
          }
        }
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Extract descriptions and tags from results
    const descriptions: string[] = [];
    const tagsSet = new Set<string>();

    if (data?.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.markdown) {
          // Extract first paragraph as potential description
          const firstParagraph = item.markdown.split('\n\n')[0]?.slice(0, 300);
          if (firstParagraph && firstParagraph.length > 50) {
            descriptions.push(firstParagraph);
          }

          // Extract potential tags (common e-commerce keywords)
          const tagMatches = item.markdown.match(/\b(premium|quality|original|authentic|brand new|affordable|durable|stylish|trending|bestseller|top-rated|discount|sale|free shipping|express delivery)\b/gi);
          if (tagMatches) {
            tagMatches.forEach(tag => tagsSet.add(tag.toLowerCase()));
          }
        }
      }
    }

    return { 
      success: true, 
      data: { 
        descriptions: descriptions.slice(0, 3), 
        tags: Array.from(tagsSet).slice(0, 15) 
      } 
    };
  },
};
