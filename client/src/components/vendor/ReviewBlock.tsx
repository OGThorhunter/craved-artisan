import { Star, Star as StarFilled, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  productId?: string;
  productName?: string;
}

interface ReviewBlockProps {
  review: Review;
  onHelpfulClick?: (reviewId: string) => void;
}

export default function ReviewBlock({ review, onHelpfulClick }: ReviewBlockProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center">
          {renderStars(review.rating)}
        </div>
        <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
      </div>
      
      <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
      <p className="text-gray-700 text-sm mb-2 leading-relaxed">{review.comment}</p>
      
      {review.productName && (
        <p className="text-xs text-brand-green mb-3">
          Review for: {review.productName}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">- {review.userName}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onHelpfulClick?.(review.id)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          title="Mark as helpful"
        >
          <ThumbsUp className="w-3 h-3" />
          Helpful ({review.helpful})
        </motion.button>
      </div>
    </motion.div>
  );
} 