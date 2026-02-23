/**
 * Sanitizes a URL to prevent XSS attacks.
 * Blocks dangerous protocols like javascript:, vbscript:, and file:.
 * Allows safe protocols like http:, https:, and data:image/ for base64 images.
 * Also allows about:blank.
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  // Remove control characters and whitespace
  const sanitizedUrl = url.replace(/[^\x20-\x7E]/g, '').trim();

  // Allow relative URLs
  if (sanitizedUrl.startsWith('/') || sanitizedUrl.startsWith('./') || sanitizedUrl.startsWith('../')) {
    return sanitizedUrl;
  }

  // Block dangerous protocols
  // We allow http:, https:, mailto:, tel:, and data:image/
  // We block javascript:, vbscript:, file:, etc.
  const dangerousProtocols = /^(javascript:|vbscript:|data:(?!image\/)|file:|about:(?!blank))/i;

  if (dangerousProtocols.test(sanitizedUrl)) {
    // Return a safe fallback
    return 'about:blank';
  }

  return sanitizedUrl;
};
