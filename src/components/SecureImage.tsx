import React from 'react';
import { useSecureUrl } from '@/hooks/useSecureUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { sanitizeUrl } from '@/utils/security';

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  path: string | null | undefined;
  fallback?: React.ReactNode;
}

/**
 * A secure alternative to the standard <img> tag that handles
 * private Supabase storage objects via signed URLs.
 */
export const SecureImage: React.FC<SecureImageProps> = ({
  path,
  fallback,
  className,
  ...props
}) => {
  const { url, loading } = useSecureUrl(path);

  if (loading) {
    return <Skeleton className={cn("w-full h-full", className)} />;
  }

  if (!url) {
    return <>{fallback || null}</>;
  }

  return (
    <img
      src={sanitizeUrl(url)}
      className={className}
      {...props}
    />
  );
};
