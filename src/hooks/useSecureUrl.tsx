import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Hook to handle secure/signed URLs from private Supabase storage buckets.
 * Automatically detects if a string is a full URL or a storage path.
 */
export const useSecureUrl = (pathOrUrl: string | null | undefined) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pathOrUrl) {
      setUrl(null);
      return;
    }

    // If it's already a full public URL, use it as is
    if (pathOrUrl.startsWith('http')) {
      setUrl(pathOrUrl);
      return;
    }

    const getSignedUrl = async () => {
      setLoading(true);
      try {
        // Standardize path: remove bucket prefix if present (e.g., "receipts-private:path/to/file")
        let bucket = 'receipts-private';
        let path = pathOrUrl;

        if (pathOrUrl.includes(':')) {
          const parts = pathOrUrl.split(':');
          bucket = parts[0];
          path = parts[1];
        }

        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600); // 1 hour expiry

        if (error) throw error;

        if (data?.signedUrl) {
          setUrl(data.signedUrl);
        }
      } catch (err) {
        // Use production-safe logger to prevent information disclosure
        logger.error('Error generating signed URL:', err);
        setUrl(null);
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [pathOrUrl]);

  return { url, loading };
};
