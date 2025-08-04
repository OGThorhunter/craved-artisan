import { useState } from 'react';
import { Link } from 'wouter';
import {
  CheckCircle,
  MapPin,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Star as StarFilled
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Vendor {
  id: string;
  name: string;
  tagline: string;
  location: string;
  avatar: string;
  coverImage: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  totalProducts: number;
  followers: number;
}

interface VendorHeaderProps {
  vendor: Vendor;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onContactClick: () => void;
}

export default function VendorHeader({ 
  vendor, 
  isFollowing, 
  onFollowToggle, 
  onContactClick 
}: VendorHeaderProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  return (
    <div className="relative bg-white shadow-sm">
      <div className="relative h-48 bg-gradient-to-r from-brand-green to-brand-maroon">
        <img
          src={vendor.coverImage}
          alt={vendor.name}
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="relative -mt-16 px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between">
          <div className="flex items-end gap-4">
            <img
              src={vendor.avatar}
              alt={vendor.name}
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                {vendor.isVerified && (
                  <CheckCircle className="h-6 w-6 text-blue-500" title="Verified Vendor" />
                )}
              </div>
              <p className="text-lg text-gray-600 mb-2">{vendor.tagline}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vendor.location}
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(vendor.rating)}
                  <span>({vendor.reviewCount})</span>
                </div>
                <span>•</span>
                <span>{vendor.totalProducts} products</span>
                <span>•</span>
                <span>{vendor.followers} followers</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContactClick}
              className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFollowToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isFollowing 
                  ? 'bg-brand-maroon text-white border-brand-maroon' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Following' : 'Follow'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Share vendor"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 