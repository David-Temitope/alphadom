import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  noindex?: boolean;
}

export const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  noindex = false,
}: SEOProps = {}) => {
  useEffect(() => {
    const baseUrl = 'https://alphadom.online';
    const siteName = 'Alphadom';
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Your Online Marketplace`;
    const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;
    const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/favicon.png`;

    // Update Title
    document.title = fullTitle;

    // Update Meta Tags
    const updateMetaTag = (name: string, content: string, attr: string = 'name') => {
      if (!content) return;
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    updateMetaTag('description', description || 'Alphadom is the #1 online marketplace for affordable fashion, electronics, books, and essentials.');
    updateMetaTag('keywords', keywords || 'Alphadom, marketplace, online shopping, deals, products');

    // Robots
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description || 'Affordable products. Trusted vendors. Nationwide delivery.', 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:image', fullImage, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', siteName, 'property');

    // Twitter
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description || 'Affordable products. Trusted vendors. Nationwide delivery.');
    updateMetaTag('twitter:image', fullImage);
    updateMetaTag('twitter:card', 'summary_large_image');

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', fullUrl);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', fullUrl);
      document.head.appendChild(canonical);
    }

  }, [title, description, image, url, type, keywords, noindex]);
};
