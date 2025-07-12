
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  size = 'md',
  className 
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <Button
      variant="outline"
      size={size === 'sm' ? 'sm' : 'icon'}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        inWishlist 
          ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-600 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800" 
          : "hover:bg-gray-50 dark:hover:bg-gray-800",
        className
      )}
    >
      <Heart 
        className={cn(
          "transition-all duration-200",
          size === 'sm' ? "h-3 w-3" : "h-4 w-4",
          inWishlist ? "fill-current" : ""
        )} 
      />
      {size === 'lg' && <span className="ml-2">{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>}
    </Button>
  );
};
