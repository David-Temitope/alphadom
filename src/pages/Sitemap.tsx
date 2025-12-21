import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      const baseUrl = 'https://alphadom.online';
      
      // Static pages
      const staticUrls: SitemapUrl[] = [
        { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
        { loc: `${baseUrl}/products`, changefreq: 'hourly', priority: '0.9' },
        { loc: `${baseUrl}/pilots`, changefreq: 'daily', priority: '0.8' },
        { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.7' },
        { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: '0.7' },
        { loc: `${baseUrl}/user-types`, changefreq: 'monthly', priority: '0.6' },
        { loc: `${baseUrl}/terms`, changefreq: 'monthly', priority: '0.4' },
        { loc: `${baseUrl}/privacy`, changefreq: 'monthly', priority: '0.4' },
        { loc: `${baseUrl}/refund-policy`, changefreq: 'monthly', priority: '0.4' },
        { loc: `${baseUrl}/return-policy`, changefreq: 'monthly', priority: '0.4' },
        { loc: `${baseUrl}/delivery-policy`, changefreq: 'monthly', priority: '0.4' },
        { loc: `${baseUrl}/dispute-policy`, changefreq: 'monthly', priority: '0.4' },
      ];

      // Fetch products for dynamic URLs
      try {
        const { data: products } = await supabase
          .from('products')
          .select('id, updated_at')
          .eq('in_stock', true)
          .limit(1000);

        const productUrls: SitemapUrl[] = (products || []).map((product) => ({
          loc: `${baseUrl}/product/${product.id}`,
          lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : undefined,
          changefreq: 'daily',
          priority: '0.8',
        }));

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('products')
          .select('category')
          .limit(100);

        const uniqueCategories = [...new Set((categoriesData || []).map(p => p.category))];
        const categoryUrls: SitemapUrl[] = uniqueCategories.map((category) => ({
          loc: `${baseUrl}/category/${encodeURIComponent(category)}`,
          changefreq: 'daily',
          priority: '0.7',
        }));

        const allUrls = [...staticUrls, ...productUrls, ...categoryUrls];

        // Generate XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : ''}    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        setSitemapXml(xml);
      } catch (error) {
        console.error('Error generating sitemap:', error);
      }
    };

    generateSitemap();
  }, []);

  // Display the XML for debugging/viewing
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Dynamic Sitemap</h1>
      <p className="text-muted-foreground mb-4">
        This page generates a dynamic sitemap. For Google Search Console, use the static sitemap at{' '}
        <a href="/sitemap.xml" className="text-primary underline">
          /sitemap.xml
        </a>
      </p>
      <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
        {sitemapXml || 'Generating sitemap...'}
      </pre>
    </div>
  );
};

export default Sitemap;
