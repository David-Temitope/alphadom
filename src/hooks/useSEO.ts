import { useEffect } from 'react';
import { sanitizeUrl } from '@/utils/security';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  noindex = false,
  jsonLd,
}: SEOProps = {}) => {
  useEffect(() => {
    const baseUrl = 'https://alphadom.online';
    const siteName = 'Alphadom';
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Buy & Sell Products Online in Nigeria`;
    const rawUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;
    const rawImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/favicon.png`;

    const fullUrl = sanitizeUrl(rawUrl);
    const fullImage = sanitizeUrl(rawImage);

    document.title = fullTitle;

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

    const defaultDescription = 'Alphadom is Nigeria\'s trusted online marketplace. Buy affordable fashion, electronics, phones, laptops, books & essentials from verified vendors with nationwide delivery.';
    const defaultKeywords = 'Alphadom, buy online Nigeria, online shopping Nigeria, cheap phones Nigeria, buy clothes online, electronics Nigeria, affordable fashion, trusted vendors, nationwide delivery, e-commerce Nigeria, online marketplace';

    updateMetaTag('description', description || defaultDescription);
    updateMetaTag('keywords', keywords || defaultKeywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description || defaultDescription, 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:image', fullImage, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    updateMetaTag('og:locale', 'en_NG', 'property');

    // Twitter
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description || defaultDescription);
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

    // JSON-LD Structured Data
    if (jsonLd) {
      const scriptId = 'alphadom-page-jsonld';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const existingScript = document.getElementById('alphadom-page-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, [title, description, image, url, type, keywords, noindex, jsonLd]);
};
