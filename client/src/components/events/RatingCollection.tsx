import React, { useState } from 'react';
import { Star, Users, MessageCircle, Send } from 'lucide-react';
import { StarRating } from '@/components/common/StarRating';

interface RatingCollectionProps {
  eventId: string;
  eventTitle: string;
  onRatingSubmit?: (rating: RatingSubmission) => void;
}

interface RatingSubmission {
  eventId: string;
  userId: string;
  userType: 'vendor' | 'customer';
  overallRating: number;
  categories: {
    organization: number;
    communication: number;
    facilities: number;
    value: number;
    wouldRecommend: number;
  };
  feedback: string;
  submittedAt: string;
}

export function RatingCollection({
  eventId,
  eventTitle,
  onRatingSubmit
}: RatingCollectionProps) {
  const [userType, setUserType] = useState<'vendor' | 'customer'>('vendor');
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    organization: 0,
    communication: 0,
    facilities: 0,
    value: 0,
    wouldRecommend: 0
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryRatingChange = (category: keyof typeof categoryRatings, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    const ratingSubmission: RatingSubmission = {
      eventId,
      userId: `user_${Date.now()}`, // In real app, this would be from auth context
      userType,
      overallRating,
      categories: categoryRatings,
      feedback,
      submittedAt: new Date().toISOString()
    };

    try {
      // TODO: Submit to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      onRatingSubmit?.(ratingSubmission);
      
      // Reset form
      setOverallRating(0);
      setCategoryRatings({
        organization: 0,
        communication: 0,
        facilities: 0,
        value: 0,
        wouldRecommend: 0
      });
      setFeedback('');
      
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('There was an error submitting your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingCategories = [
    { key: 'organization', label: 'Event Organization', description: 'How well was the event organized?' },
    { key: 'communication', label: 'Communication', description: 'How clear and timely was the communication?' },
    { key: 'facilities', label: 'Facilities & Setup', description: 'How were the facilities and setup?' },
    { key: 'value', label: 'Value for Money', description: 'Was the event good value for the price?' },
    { key: 'wouldRecommend', label: 'Would Recommend', description: 'Would you recommend this event to others?' }
  ] as const;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Rate Your Experience</h3>
        <p className="text-sm text-gray-600">Help us improve by rating your experience at "{eventTitle}"</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            I attended this event as:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="vendor"
                checked={userType === 'vendor'}
                onChange={(e) => setUserType(e.target.value as 'vendor' | 'customer')}
                className="text-brand-green focus:ring-brand-green"
              />
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Vendor</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="customer"
                checked={userType === 'customer'}
                onChange={(e) => setUserType(e.target.value as 'vendor' | 'customer')}
                className="text-brand-green focus:ring-brand-green"
              />
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Customer</span>
            </label>
          </div>
        </div>

        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <StarRating
            rating={overallRating}
            onRatingChange={setOverallRating}
            interactive={true}
            showLabel={true}
            size="lg"
          />
        </div>

        {/* Category Ratings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Rate specific aspects:</h4>
          <div className="space-y-4">
            {ratingCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{category.label}</span>
                    <span className="text-xs text-gray-500">({category.description})</span>
                  </div>
                </div>
                <StarRating
                  rating={categoryRatings[category.key]}
                  onRatingChange={(rating) => handleCategoryRatingChange(category.key, rating)}
                  interactive={true}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Feedback (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            placeholder="Share any additional thoughts about your experience..."
            aria-label="Additional feedback"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || overallRating === 0}
            className="flex items-center gap-2 px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Rating summary component for displaying collected ratings
export function RatingSummary({
  ratings,
  eventTitle
}: {
  ratings: Array<RatingSubmission>;
  eventTitle: string;
}) {
  const vendorRatings = ratings.filter(r => r.userType === 'vendor');
  const customerRatings = ratings.filter(r => r.userType === 'customer');
  
  const calculateAverage = (ratingsArray: RatingSubmission[]) => {
    if (ratingsArray.length === 0) return 0;
    return ratingsArray.reduce((sum, r) => sum + r.overallRating, 0) / ratingsArray.length;
  };

  const vendorAvg = calculateAverage(vendorRatings);
  const customerAvg = calculateAverage(customerRatings);
  const overallAvg = calculateAverage(ratings);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Ratings Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overall Rating */}
        <div className="text-center">
          <StarRating rating={overallAvg} size="lg" showLabel={true} />
          <p className="text-sm text-gray-600 mt-2">Overall Average</p>
          <p className="text-xs text-gray-500">{ratings.length} total ratings</p>
        </div>

        {/* Vendor Rating */}
        <div className="text-center">
          <StarRating rating={vendorAvg} size="lg" showLabel={true} />
          <p className="text-sm text-gray-600 mt-2">Vendor Rating</p>
          <p className="text-xs text-gray-500">{vendorRatings.length} vendor ratings</p>
        </div>

        {/* Customer Rating */}
        <div className="text-center">
          <StarRating rating={customerAvg} size="lg" showLabel={true} />
          <p className="text-sm text-gray-600 mt-2">Customer Rating</p>
          <p className="text-xs text-gray-500">{customerRatings.length} customer ratings</p>
        </div>
      </div>

      {/* Recent Feedback */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Feedback</h4>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {ratings.slice(-3).map((rating, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 capitalize">{rating.userType}</span>
                  <StarRating rating={rating.overallRating} size="sm" />
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(rating.submittedAt).toLocaleDateString()}
                </span>
              </div>
              {rating.feedback && (
                <p className="text-sm text-gray-700 italic">"{rating.feedback}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
