import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

async function generate() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Skipping dynamic sitemap generation.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://alphadom.online';

  const staticPages = [
    { path: '', freq: 'daily', priority: '1.0' },
    { path: '/products', freq: 'daily', priority: '0.9' },
    { path: '/pilots', freq: 'weekly', priority: '0.8' },
    { path: '/blog', freq: 'daily', priority: '0.8' },
    { path: '/become-a-vendor', freq: 'monthly', priority: '0.7' },
    { path: '/about', freq: 'monthly', priority: '0.5' },
    { path: '/contact', freq: 'monthly', priority: '0.5' },
    { path: '/terms', freq: 'monthly', priority: '0.3' },
    { path: '/privacy', freq: 'monthly', priority: '0.3' },
    { path: '/refund-policy', freq: 'monthly', priority: '0.3' },
    { path: '/return-policy', freq: 'monthly', priority: '0.3' },
    { path: '/delivery-policy', freq: 'monthly', priority: '0.3' },
    { path: '/dispute-policy', freq: 'monthly', priority: '0.3' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  try {
    // Fetch Products
    const { data: products } = await supabase.from('products').select('id, updated_at').limit(1000);
    if (products) {
      for (const p of products) {
        const lastmod = p.updated_at ? `\n    <lastmod>${new Date(p.updated_at).toISOString().split('T')[0]}</lastmod>` : '';
        xml += `
  <url>
    <loc>${baseUrl}/products/${p.id}</loc>${lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Fetch Vendors
    const { data: vendors } = await supabase.from('approved_vendors').select('user_id').eq('is_active', true).limit(1000);
    if (vendors) {
      for (const v of vendors) {
        xml += `
  <url>
    <loc>${baseUrl}/vendor/${v.user_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    // Fetch Blog Posts
    const { data: posts } = await supabase.from('blog_posts').select('id, published_at').eq('published', true).limit(1000);
    if (posts) {
      for (const p of posts) {
        const lastmod = p.published_at ? `\n    <lastmod>${new Date(p.published_at).toISOString().split('T')[0]}</lastmod>` : '';
        xml += `
  <url>
    <loc>${baseUrl}/blog/${p.id}</loc>${lastmod}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }
  } catch (error) {
    console.error('Error fetching dynamic data for sitemap:', error);
  }

  xml += '\n</urlset>';

  fs.writeFileSync('public/sitemap.xml', xml);
  console.log('Sitemap generated with dynamic content in public/sitemap.xml');
}

generate();
