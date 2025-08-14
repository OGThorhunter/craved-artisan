'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Heart, Star, Clock, MapPin, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  category: string;
  tags: string[];
  dietaryFlags: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFavorite: boolean;
  distance?: number;
  stockLevel: number;
  nextBatchDate?: string;
  frequentlyBoughtWith: string[];
  personalizationScore?: number;
}

interface DiscoverySection {
  id: string;
  title: string;
  description: string;
  type: 'personalized' | 'trending' | 'bestsellers' | 'new' | 'seasonal';
  products: Product[];
  icon: React.ReactNode;
  priority: number;
}

interface AIProductDiscoveryProps {
  userZip: string;
  userPreferences?: {
    dietaryFlags: string[];
    favoriteCategories: string[];
    favoriteVendors: string[];
    pastPurchases: string[];
    budget: number;
  };
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
}

export default function AIProductDiscovery({
  userZip,
  userPreferences,
  onProductClick,
  onAddToCart,
  onToggleFavorite
}: AIProductDiscoveryProps) {
  const [discoverySections, setDiscoverySections] = useState<DiscoverySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Mock product data - in real implementation, this would come from AI recommendations
  const mockProducts: Product[] = [
    {
      id: 'prod1',
      name: 'Artisan Sourdough Bread',
      description: 'Traditional sourdough bread made with organic flour and natural starter',
      price: 8.50,
      image: '/images/sourdough.jpg',
      vendorId: 'vendor1',
      vendorName: 'Rose Creek Bakery',
      vendorLogo: '/images/rosecreek-logo.jpg',
      category: 'Bread',
      tags: ['artisan', 'organic', 'traditional'],
      dietaryFlags: ['vegan', 'dairy-free'],
      rating: 4.8,
      reviewCount: 127,
      isVerified: true,
      isFavorite: false,
      distance: 2.3,
      stockLevel: 15,
      frequentlyBoughtWith: ['prod2', 'prod3'],
      personalizationScore: 0.95
    },
    {
      id: 'prod2',
      name: 'Chocolate Croissant',
      description: 'Buttery croissant filled with rich dark chocolate',
      price: 4.50,
      image: '/images/croissant.jpg',
      vendorId: 'vendor2',
      vendorName: 'Sweet Dreams Pastry',
      vendorLogo: '/images/sweetdreams-logo.jpg',
      category: 'Pastries',
      tags: ['chocolate', 'buttery', 'flaky'],
      dietaryFlags: ['vegetarian'],
      rating: 4.6,
      reviewCount: 89,
      isVerified: true,
      isFavorite: true,
      distance: 1.8,
      stockLevel: 8,
      frequentlyBoughtWith: ['prod1', 'prod4'],
      personalizationScore: 0.88
    },
    {
      id: 'prod3',
      name: 'Vegan Gluten-Free Brownies',
      description: 'Rich, fudgy brownies made with almond flour and dark chocolate',
      price: 6.00,
      image: '/images/brownies.jpg',
      vendorId: 'vendor3',
      vendorName: 'Healthy Bites',
      vendorLogo: '/images/healthybites-logo.jpg',
      category: 'Desserts',
      tags: ['vegan', 'gluten-free', 'healthy'],
      dietaryFlags: ['vegan', 'gluten-free'],
      rating: 4.7,
      reviewCount: 56,
      isVerified: true,
      isFavorite: false,
      distance: 3.1,
      stockLevel: 12,
      frequentlyBoughtWith: ['prod1', 'prod5'],
      personalizationScore: 0.92
    }
  ];

  useEffect(() => {
    const generateDiscoverySections = () => {
      const sections: DiscoverySection[] = [];

      // Personalized recommendations
      if (userPreferences?.pastPurchases?.length) {
        sections.push({
          id: 'personalized',
          title: 'Inspired by your past purchases',
          description: 'Based on what you\'ve loved before',
          type: 'personalized',
          products: mockProducts.filter(p => p.personalizationScore && p.personalizationScore > 0.9),
          icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
          priority: 1
        });
      }

      // Recommended this week
      sections.push({
        id: 'weekly-recommendations',
        title: 'Recommended this week in your area',
        description: 'Fresh picks curated for you',
        type: 'personalized',
        products: mockProducts.slice(0, 2),
        icon: <Brain className="w-5 h-5 text-purple-600" />,
        priority: 2
      });

      // Bestsellers in ZIP
      sections.push({
        id: 'bestsellers',
        title: 'Bestsellers in your ZIP',
        description: 'Most popular items near you',
        type: 'bestsellers',
        products: mockProducts.sort((a, b) => b.rating - a.rating).slice(0, 3),
        icon: <TrendingUp className="w-5 h-5 text-red-500" />,
        priority: 3
      });

      // Vendors like the ones you follow
      if (userPreferences?.favoriteVendors?.length) {
        sections.push({
          id: 'similar-vendors',
          title: 'Vendors like the ones you follow',
          description: 'Discover new favorites',
          type: 'personalized',
          products: mockProducts.filter(p => !userPreferences.favoriteVendors.includes(p.vendorId)),
          icon: <Heart className="w-5 h-5 text-pink-500" />,
          priority: 4
        });
      }

      // Seasonal recommendations
      const month = new Date().getMonth();
      if (month >= 11 || month <= 1) {
        sections.push({
          id: 'holiday-special',
          title: 'Holiday Specials',
          description: 'Perfect gifts and treats for the season',
          type: 'seasonal',
          products: mockProducts.slice(0, 2),
          icon: <Package className="w-5 h-5 text-green-600" />,
          priority: 5
        });
      }

      setDiscoverySections(sections.sort((a, b) => a.priority - b.priority));
      setIsLoading(false);
    };

    // Simulate AI processing delay
    setTimeout(generateDiscoverySections, 1000);
  }, [userPreferences]);

  const getStockStatus = (product: Product) => {
    if (product.stockLevel === 0) {
      return {
        status: 'out_of_stock',
        text: 'Out of Stock',
        color: 'text-red-600'
      };
    }
    if (product.stockLevel <= 3) {
      return {
        status: 'low_stock',
        text: `Only ${product.stockLevel} left`,
        color: 'text-orange-600'
      };
    }
    return {
      status: 'in_stock',
      text: 'In Stock',
      color: 'text-green-600'
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Discovery Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Discovery</h2>
          </div>
          <p className="text-gray-600">
            Personalized recommendations just for you in {userZip}
          </p>
        </div>

        {/* Discovery Sections */}
        <div className="space-y-8">
          {discoverySections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div className="flex items-center gap-3 mb-2">
                  {section.icon}
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  {section.type === 'personalized' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      AI Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>

              {/* Products Grid */}
              <div className="p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.products.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onProductClick(product)}
                    >
                      {/* Product Image */}
                      <div className="aspect-square relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(product.id);
                          }}
                          className={`absolute top-2 right-2 p-1 rounded-full ${
                            product.isFavorite
                              ? 'bg-red-500 text-white'
                              : 'bg-white/80 text-gray-400 hover:text-red-500'
                          }`}
                          aria-label={product.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-4 h-4 ${product.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        {product.personalizationScore && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                            {Math.round(product.personalizationScore * 100)}% match
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          </div>
                        </div>

                        {/* Vendor Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={product.vendorLogo}
                            alt={product.vendorName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-600">{product.vendorName}</span>
                          {product.isVerified && (
                            <span className="text-blue-500 text-xs">✓ Verified</span>
                          )}
                          {product.distance && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {product.distance} mi
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.dietaryFlags.slice(0, 2).map((flag) => (
                            <span key={flag} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {flag}
                            </span>
                          ))}
                          {product.tags.slice(0, 1).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Price and Rating */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{product.rating}</span>
                            <span>({product.reviewCount})</span>
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-3">
                          <div className={`text-sm font-medium ${getStockStatus(product).color}`}>
                            {getStockStatus(product).text}
                          </div>
                          {product.nextBatchDate && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Next batch: {product.nextBatchDate}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            disabled={product.stockLevel === 0}
                            className="flex-1 px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Recommendations */}
        {discoverySections.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-6">
              Start shopping to get personalized recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
