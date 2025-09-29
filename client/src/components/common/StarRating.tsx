import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showLabel = false,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-yellow-500';
    if (rating >= 3.5) return 'text-yellow-400';
    if (rating >= 2.5) return 'text-yellow-300';
    if (rating >= 1.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const displayRating = hoverRating || rating;
  const isFilled = (starIndex: number) => starIndex < displayRating;
  const isHalf = (starIndex: number) => {
    const decimal = displayRating - starIndex;
    return decimal > 0 && decimal < 1;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starIndex = index + 1;
          const filled = isFilled(starIndex);
          const half = isHalf(starIndex);
          
          return (
            <button
              key={index}
              type="button"
              className={`${sizeClasses[size]} ${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              }`}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              disabled={!interactive}
              aria-label={`Rate ${starIndex} out of ${maxRating} stars`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  filled || half
                    ? `${getRatingColor(displayRating)} fill-current`
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      
      {showLabel && (
        <span className={`text-sm font-medium ml-2 ${getRatingColor(displayRating)}`}>
          {rating.toFixed(1)} {interactive ? `(${getRatingText(rating)})` : `(${getRatingText(displayRating)})`}
        </span>
      )}
    </div>
  );
}

// Compact version for lists and tables
export function CompactStarRating({
  rating,
  maxRating = 5,
  showNumber = false
}: {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index < Math.floor(rating);
          const isHalf = index === Math.floor(rating) && rating % 1 !== 0;
          
          return (
            <Star
              key={index}
              className={`w-3 h-3 ${
                isFilled || isHalf
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Rating breakdown component for analytics
export function RatingBreakdown({
  ratings,
  title = "Rating Breakdown"
}: {
  ratings: Array<{ rating: number; count: number; label: string }>;
  title?: string;
}) {
  const totalRatings = ratings.reduce((sum, r) => sum + r.count, 0);
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      {ratings.map((item) => {
        const percentage = totalRatings > 0 ? (item.count / totalRatings) * 100 : 0;
        
        return (
          <div key={item.rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-600 w-8">{item.rating}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
            <span className="text-xs text-gray-500 w-8">({percentage.toFixed(0)}%)</span>
          </div>
        );
      })}
    </div>
  );
}
