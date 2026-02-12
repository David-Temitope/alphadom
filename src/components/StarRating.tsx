import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating?: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (stars: number) => void;
  userRating?: number | null;
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRate,
  userRating,
  showValue = false,
  className,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = hoverRating ?? userRating ?? rating;

  const handleClick = (stars: number) => {
    if (interactive && onRate) {
      onRate(stars);
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= Math.floor(displayRating);
    const isHalf = !isFilled && starNumber <= displayRating + 0.5 && starNumber > displayRating;
    const isUserRated = userRating !== null && starNumber <= (userRating || 0);

    return (
      <button
        key={index}
        type="button"
        disabled={!interactive}
        aria-label={interactive ? `Rate ${starNumber} out of ${maxStars} stars` : undefined}
        aria-hidden={!interactive ? "true" : undefined}
        tabIndex={!interactive ? -1 : undefined}
        onClick={() => handleClick(starNumber)}
        onMouseEnter={() => interactive && setHoverRating(starNumber)}
        onMouseLeave={() => interactive && setHoverRating(null)}
        className={cn(
          'relative transition-transform',
          interactive && 'cursor-pointer hover:scale-110',
          !interactive && 'cursor-default'
        )}
      >
        {/* Background star (empty) */}
        <Star
          className={cn(
            sizeClasses[size],
            'text-muted-foreground/30'
          )}
          aria-hidden="true"
        />
        
        {/* Filled star overlay */}
        {(isFilled || isHalf) && (
          <Star
            className={cn(
              sizeClasses[size],
              'absolute inset-0',
              isUserRated ? 'fill-primary text-primary' : 'fill-primary text-primary',
              isHalf && 'clip-path-half'
            )}
            style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? "group" : "img"}
      aria-label={interactive ? "Rate this product" : `Rating: ${displayRating.toFixed(1)} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      {showValue && (
        <span
          className="ml-1.5 text-sm font-medium text-foreground"
          aria-hidden={!interactive ? "true" : undefined}
        >
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
