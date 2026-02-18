
import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductLikes } from '@/hooks/useProductLikes';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  productId, 
  size = 'md',
  className 
}) => {
  const { isLiked, toggleLike } = useProductLikes();
  const liked = isLiked(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(productId);
  };

  return (
    <Button
      variant="outline"
      size={size === 'sm' ? 'sm' : 'icon'}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        liked 
          ? "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800" 
          : "hover:bg-gray-50 dark:hover:bg-gray-800",
        className
      )}
    >
      <ThumbsUp 
        className={cn(
          "transition-all duration-200",
          size === 'sm' ? "h-3 w-3" : "h-4 w-4",
          liked ? "fill-current" : ""
        )} 
      />
      {size === 'lg' && <span className="ml-2">{liked ? 'Liked' : 'Like'}</span>}
    </Button>
  );
};
