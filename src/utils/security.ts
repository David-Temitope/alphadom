/**
 * Sanitizes a URL to prevent XSS attacks.
 * Blocks dangerous protocols like javascript:, vbscript:, and file:.
 * Allows safe protocols like http:, https:, and data:image/ for base64 images.
 * Also allows about:blank.
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  const trimmedUrl = url.trim();

  // Block dangerous protocols
  // We block javascript:, vbscript:, file:, and about: (except about:blank)
  // We also block data: URLs that are not images
  const dangerousProtocols = /^(javascript:|vbscript:|data:(?!image\/)|file:|about:(?!blank))/i;

  if (dangerousProtocols.test(trimmedUrl)) {
    // Return a safe fallback
    return 'about:blank';
  }

  return trimmedUrl;
};
