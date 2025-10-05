import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Heart,
  Star,
  MapPin,
  Clock,
  Truck,
  Package,
  Users,
  Calendar,
  ChevronRight,
  Grid,
  List,
  Share2,
  CheckCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';

// Types
interface Vendor {
  id: string;
  storeName: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  shipsNational: boolean;
  ratingAvg: number;
  ratingCount: number;
  marketplaceTags: string[];
  createdAt: string;
  isFavorite: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  thumbUrl?: string;
  ratingAvg: number;
  ratingCount: number;
  isFavorite: boolean;
  pickup: boolean;
  delivery: boolean;
  ship: boolean;
  availableNow: boolean;
}

interface SalesWindow {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: string;
  location_name?: string;
  address_text?: string;
  preorder_open_at?: string;
  preorder_close_at?: string;
  fulfill_start_at?: string;
  fulfill_end_at?: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  createdAt: string;
  productName?: string;
}

const MarketplaceVendorPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const slug = location.split('/').pop();
  const [activeTab, setActiveTab] = useState<'products' | 'windows' | 'about' | 'reviews'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'>('relevance');

  // Fetch vendor data
  const { data: vendor, isLoading: isLoadingVendor } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: async () => {
      const response = await fetch(`/api/market/vendor/${slug}`);
      if (!response.ok) throw new Error('Vendor not found');
      return response.json();
    },
    enabled: !!slug,
  });

  // Fetch vendor products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['vendor-products', slug, sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/market/search?vendor=${slug}&sort=${sortBy}&pageSize=50`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    enabled: !!slug,
  });

  // Fetch vendor sales windows
  const { data: salesWindows, isLoading: isLoadingWindows } = useQuery({
    queryKey: ['vendor-windows', slug],
    queryFn: async () => {
      const response = await fetch(`/api/market/vendor/${slug}/windows`);
      if (!response.ok) throw new Error('Failed to fetch sales windows');
      return response.json();
    },
    enabled: !!slug,
  });

  // Fetch vendor reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['vendor-reviews', slug],
    queryFn: async () => {
      const response = await fetch(`/api/market/vendor/${slug}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
    enabled: !!slug,
  });

  const handleToggleFavorite = async () => {
    if (!vendor) return;
    
    try {
      const response = await fetch(`/api/user/favorites/vendor/${vendor.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        // TODO: Update vendor.isFavorite state
      }
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.storeName,
          text: `Check out ${vendor?.storeName} on Craved Artisan`,
          url: window.location.href,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };


  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoadingVendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist</p>
          <Button onClick={() => setLocation('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const vendorData: Vendor = vendor;
  const productsData: Product[] = products?.products || [];
  const windowsData: SalesWindow[] = salesWindows?.windows || [];
  const reviewsData: Review[] = reviews?.reviews || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/marketplace')}
                className="text-sm"
              >
                ← Back to Marketplace
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">{vendorData.storeName}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-sm"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                className="text-sm"
              >
                <Heart className={`w-4 h-4 mr-1 ${vendorData.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                {vendorData.isFavorite ? 'Unfollow' : 'Follow'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vendor Header */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {vendorData.coverUrl && (
              <img
                src={vendorData.coverUrl}
                alt={`${vendorData.storeName} cover`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20" />
          </div>

          {/* Vendor Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-start space-x-4 -mt-16">
              {/* Avatar */}
              <div className="relative">
                {vendorData.avatarUrl ? (
                  <img
                    src={vendorData.avatarUrl}
                    alt={vendorData.storeName}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Vendor Details */}
              <div className="flex-1 pt-16">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{vendorData.storeName}</h2>
                    {vendorData.city && vendorData.state && (
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vendorData.city}, {vendorData.state}
                      </div>
                    )}
                    
                    {/* Rating */}
                    {vendorData.ratingCount > 0 && (
                      <div className="flex items-center mt-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(vendorData.ratingAvg)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {vendorData.ratingAvg.toFixed(1)} ({vendorData.ratingCount} reviews)
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {vendorData.marketplaceTags && vendorData.marketplaceTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {vendorData.marketplaceTags.slice(0, 6).map((tag) => (
                          <Badge key={tag} variant="default" className="bg-blue-100 text-blue-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      onClick={handleToggleFavorite}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${vendorData.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                      {vendorData.isFavorite ? 'Following' : 'Follow'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setLocation(`/vendor/${vendorData.slug}`)}
                    >
                      Visit Store
                    </Button>
                  </div>
                </div>

                {/* Bio */}
                {vendorData.bio && (
                  <p className="text-gray-600 mt-4 leading-relaxed">{vendorData.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{productsData.length}</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{windowsData.length}</div>
                    <div className="text-sm text-gray-600">Sales Windows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{vendorData.ratingCount}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {vendorData.shipsNational ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-gray-600">Ships National</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'products', label: 'Products', count: productsData.length },
                { id: 'windows', label: 'Sales Windows', count: windowsData.length },
                { id: 'about', label: 'About' },
                { id: 'reviews', label: 'Reviews', count: reviewsData.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'products' | 'windows' | 'about' | 'reviews')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <Badge variant="default" className="ml-2 bg-gray-100 text-gray-600">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                {/* Products Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Products ({productsData.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating')}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Sort products by"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="newest">Newest</option>
                      <option value="popular">Popular</option>
                      <option value="rating">Rating</option>
                    </select>
                    <div className="flex border border-gray-300 rounded-md">
                      <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        onClick={() => setViewMode('grid')}
                        className="px-3 py-2 rounded-r-none"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        onClick={() => setViewMode('list')}
                        className="px-3 py-2 rounded-l-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {isLoadingProducts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64"></div>
                      </div>
                    ))}
                  </div>
                ) : productsData.length > 0 ? (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                    {productsData.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}
                              onClick={() => setLocation(`/marketplace/product/${product.slug}`)}>
                          <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'mb-3'}`}>
                            {product.thumbUrl ? (
                              <img
                                src={product.thumbUrl}
                                alt={product.name}
                                className={`${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-32'} object-cover rounded-lg`}
                              />
                            ) : (
                              <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-32'} bg-gray-200 rounded-lg flex items-center justify-center`}>
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Toggle favorite
                                toast.success('Added to favorites');
                              }}
                              title="Add to favorites"
                              aria-label="Add to favorites"
                            >
                              <Heart className={`w-4 h-4 ${product.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                          </div>

                          <div className={`space-y-2 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                            <h4 className="font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                            
                            {viewMode === 'list' && product.description && (
                              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                              {product.ratingCount > 0 && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                  {product.ratingAvg.toFixed(1)} ({product.ratingCount})
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {product.pickup && (
                                <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                                  Pickup
                                </Badge>
                              )}
                              {product.delivery && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  Delivery
                                </Badge>
                              )}
                              {product.ship && (
                                <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">
                                  Ships
                                </Badge>
                              )}
                              {product.availableNow && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  Available Now
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">This vendor hasn't added any products yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Sales Windows Tab */}
            {activeTab === 'windows' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Sales Windows ({windowsData.length})
                </h3>
                
                {isLoadingWindows ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-24"></div>
                      </div>
                    ))}
                  </div>
                ) : windowsData.length > 0 ? (
                  <div className="space-y-4">
                    {windowsData.map((window) => (
                      <Card key={window.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{window.name}</h4>
                            {window.description && (
                              <p className="text-sm text-gray-600 mt-1">{window.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-3">
                              {window.location_name && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {window.location_name}
                                </div>
                              )}
                              {window.fulfill_start_at && window.fulfill_end_at && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatTime(window.fulfill_start_at)} - {formatTime(window.fulfill_end_at)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="default" 
                              className={`${
                                window.status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {window.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              onClick={() => setLocation(`/sales-window/${window.id}`)}
                              className="text-sm"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sales windows</h3>
                    <p className="text-gray-600">This vendor hasn't created any sales windows yet</p>
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">About {vendorData.storeName}</h3>
                
                <div className="space-y-6">
                  {/* Bio */}
                  {vendorData.bio && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">About</h4>
                      <p className="text-gray-600 leading-relaxed">{vendorData.bio}</p>
                    </div>
                  )}

                  {/* Location */}
                  {vendorData.city && vendorData.state && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {vendorData.city}, {vendorData.state} {vendorData.country && `, ${vendorData.country}`}
                      </div>
                    </div>
                  )}

                  {/* Shipping */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping</h4>
                    <div className="flex items-center text-gray-600">
                      {vendorData.shipsNational ? (
                        <>
                          <Truck className="w-4 h-4 mr-2" />
                          Ships nationwide
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Local pickup and delivery only
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {vendorData.marketplaceTags && vendorData.marketplaceTags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {vendorData.marketplaceTags.map((tag) => (
                          <Badge key={tag} variant="default" className="bg-blue-100 text-blue-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member Since */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Member Since</h4>
                    <p className="text-gray-600">
                      {new Date(vendorData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Reviews ({reviewsData.length})
                </h3>
                
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-24"></div>
                      </div>
                    ))}
                  </div>
                ) : reviewsData.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{review.userName}</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                            {review.productName && (
                              <p className="text-sm text-gray-600 mb-2">
                                Review for: {review.productName}
                              </p>
                            )}
                            {review.comment && (
                              <p className="text-gray-700">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Be the first to review this vendor</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceVendorPage;
