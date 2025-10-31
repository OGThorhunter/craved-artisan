'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Link } from 'wouter';
import {
  CheckCircle,
  Star,
  MapPin,
  Mail,
  Leaf,
  Store,
  Clock,
  ShieldCheck,
  Heart,
  ShoppingCart,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Star as StarFilled,
  MessageCircle,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Truck,
  Share2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../lib/formatters';
import { Badge } from '../../components/shared/Badge';
import { Card } from '../../components/shared/Card';

interface Vendor {
  id: string;
  businessName: string;
  tagline: string;
  description: string;
  location: string;
  avatarUrl?: string;
  coverImage: string;
  isVerified: boolean;
  isOnVacation: boolean;
  vacationMessage?: string;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  joinedDate: string;
  followers: number;
  nextPickup: string;
  pickupLocation: string;
  deliveryAreas: string[];
  contact?: {
    email: string;
    phone?: string;
    website?: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  values: string[];
  certifications: string[];
  businessHours: string;
  fulfillmentOptions?: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  images: string[];
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
  isLowStock: boolean;
  isNew: boolean;
  allergens: string[];
  dietary: string[];
  weight: string;
  createdAt: string;
}

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

export default function VendorStorefront() {
  const { id: vendorId } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);

  // Load vendor and products
  useEffect(() => {
    const loadData = async () => {
      if (!vendorId) return;

      try {
        // TODO: Replace with real API calls once backend is ready
        // const vendorData = await getVendorById(vendorId);
        // const productsData = await getVendorProducts(vendorId);
        
        // Mock data for now - replace with actual API calls
        const mockVendor: Vendor = {
          id: vendorId || 'v1',
          businessName: 'Rose Creek Bakery',
          tagline: 'Fresh-milled, naturally fermented sourdough.',
          description: `At Rose Creek Bakery, we believe in milling fresh flour from organic grain, fermenting slowly, and baking with purpose. Our goal is to nourish the body and connect with our neighbors through real food.

We started as a small family operation in 2018, grinding our own flour and using traditional sourdough techniques. Today, we're proud to serve our community with artisanal breads, pastries, and seasonal specialties that honor both tradition and innovation.

Every loaf is hand-shaped, every ingredient carefully sourced, and every customer treated like family.`,
          location: 'Locust Grove, GA',
          avatarUrl: '/images/vendors/rosecreek-avatar.jpg',
          coverImage: '/images/vendors/rosecreek-cover.jpg',
          isVerified: true,
          isOnVacation: false,
          rating: 4.9,
          totalProducts: 24,
          totalOrders: 127,
          joinedDate: '2018-03-15',
          followers: 342,
          nextPickup: 'Friday 3–5PM',
          pickupLocation: 'Locust Grove Farmers Market',
          deliveryAreas: ['Locust Grove', 'McDonough', 'Hampton', 'Stockbridge'],
          contact: {
            email: 'hello@rosecreekbakery.com',
            phone: '(770) 555-0123',
            website: 'https://rosecreekbakery.com'
          },
          social: {
            instagram: '@rosecreekbakery',
            facebook: 'Rose Creek Bakery',
            twitter: '@rosecreekbakery'
          },
          values: ['Sustainable Packaging', 'Family Owned', 'Cottage Food Certified', 'Organic Ingredients', 'Local Sourcing'],
          certifications: ['Cottage Food License', 'Organic Certification', 'Food Safety Certified'],
          businessHours: 'Wednesday-Saturday: 6AM-2PM',
          fulfillmentOptions: {
            pickup: true,
            delivery: true,
            shipping: false
          }
        };

        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Cinnamon Rolls',
            description: 'Hand-rolled cinnamon rolls with cream cheese frosting. Made fresh daily.',
            price: 12.00,
            originalPrice: 15.00,
            category: 'Pastries',
            tags: ['bestseller', 'sweet', 'breakfast'],
            images: ['/images/products/cinnamon-rolls.jpg'],
            inStock: true,
            featured: true,
            rating: 4.9,
            reviewCount: 89,
            isBestseller: true,
            isLowStock: false,
            isNew: false,
            allergens: ['wheat', 'gluten', 'milk', 'eggs'],
            dietary: ['vegetarian'],
            weight: '6 oz each',
            createdAt: '2024-01-15'
          },
          {
            id: '2',
            name: 'Original Sourdough',
            description: 'Traditional sourdough bread made with our 100-year-old starter.',
            price: 9.00,
            category: 'Bread',
            tags: ['naturally leavened', 'traditional', 'artisan'],
            images: ['/images/products/sourdough.jpg'],
            inStock: true,
            featured: true,
            rating: 4.8,
            reviewCount: 156,
            isBestseller: true,
            isLowStock: false,
            isNew: false,
            allergens: ['wheat', 'gluten'],
            dietary: ['vegan'],
            weight: '1 lb',
            createdAt: '2024-01-10'
          },
        ];

        const mockReviews: Review[] = [
          {
            id: '1',
            userId: 'u1',
            userName: 'Sarah M.',
            rating: 5,
            title: 'Best sourdough I\'ve ever had',
            comment: 'The sourdough bread is absolutely incredible. Perfect crust and tangy flavor. It\'s become a weekly must-buy for our family.',
            date: '2024-01-18',
            helpful: 12,
            productId: '2',
            productName: 'Original Sourdough'
          },
        ];

        setVendor(mockVendor);
        setProducts(mockProducts);
        setReviews(mockReviews);
        setLoading(false);
      } catch (error) {
        console.error('Error loading vendor:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [vendorId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (productId: string) => {
    console.log(`Adding product ${productId} to cart`);
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'rating':
        comparison = b.rating - a.rating;
        break;
      case 'newest':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'featured':
      default:
        comparison = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="responsive-heading text-gray-900 mb-2">Vendor not found</h2>
          <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist.</p>
          <Link href="/marketplace" className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green/80 transition-colors">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      <div className="relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestseller && (
            <Badge variant="default" className="bg-brand-maroon text-white">
              Bestseller
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="success">
              New
            </Badge>
          )}
          {product.isLowStock && (
            <Badge variant="warning">
              Low Stock
            </Badge>
          )}
        </div>

        {product.originalPrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}

        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-lg font-bold text-brand-maroon">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
          <Badge variant={product.inStock ? 'success' : 'error'}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product.id)}
            disabled={!product.inStock}
            className="flex-1 bg-brand-green text-white py-2 px-3 rounded text-sm font-medium hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </button>
          <Link
            href={`/product/${product.id}`}
            className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="page-container bg-gray-50">
      {/* Vacation Overlay */}
      {vendor.isOnVacation && (
        <div className="fixed inset-0 bg-brand-beige/90 z-50 flex items-center justify-center">
          <Card className="max-w-md">
            <h2 className="text-xl font-bold text-brand-maroon mb-4">On Vacation</h2>
            <p className="text-gray-700 mb-4">{vendor.vacationMessage || 'We\'re taking a break and will be back soon!'}</p>
            <Link href="/marketplace" className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green/80 transition-colors">
              Browse Other Vendors
            </Link>
          </Card>
        </div>
      )}

      {/* Vendor Header */}
      <div className="relative bg-white shadow-sm">
        <div className="relative h-48 bg-gradient-to-r from-brand-green to-brand-maroon">
          <img
            src={vendor.coverImage}
            alt={vendor.businessName}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between">
            <div className="flex items-end gap-4">
              <img
                src={vendor.avatarUrl || vendor.coverImage}
                alt={vendor.businessName}
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
                  {vendor.isVerified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
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
                    <span>({reviews.length})</span>
                  </div>
                  <span>•</span>
                  <span>{vendor.totalProducts} products</span>
                  <span>•</span>
                  <span>{vendor.followers} followers</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact
              </button>
              <button
                onClick={toggleFollow}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isFollowing 
                    ? 'bg-brand-maroon text-white border-brand-maroon' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Bio & Values */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{vendor.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Values & Certifications</h3>
              <div className="space-y-3">
                {vendor.values.map((value, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Leaf className="h-4 w-4 text-brand-green flex-shrink-0" />
                    <span>{value}</span>
                  </div>
                ))}
                {vendor.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-brand-green flex-shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Catalog */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-brand-green text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-brand-green text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="featured">Featured</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            {sortedProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 mb-4">
                  <Store className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more products.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fulfillment Info */}
      <div className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fulfillment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-brand-green" />
                <h3 className="font-semibold">Next Pickup</h3>
              </div>
              <p className="text-gray-700">{vendor.nextPickup}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-brand-green" />
                <h3 className="font-semibold">Pickup Location</h3>
              </div>
              <p className="text-gray-700">{vendor.pickupLocation}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-brand-green" />
                <h3 className="font-semibold">Delivery Areas</h3>
              </div>
              <p className="text-gray-700">{vendor.deliveryAreas.join(', ')}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-brand-cream rounded-lg">
            <h3 className="font-semibold mb-2">Business Hours</h3>
            <p className="text-gray-700">{vendor.businessHours}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(vendor.rating)}
                <span className="ml-2 font-semibold">{vendor.rating}</span>
              </div>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <Card key={review.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                {review.productName && (
                  <p className="text-xs text-brand-green">Review for: {review.productName}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">- {review.userName}</span>
                  <button className="text-xs text-gray-500 hover:text-gray-700">
                    Helpful ({review.helpful})
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && vendor.contact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contact {vendor.businessName}</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-green" />
                  <a href={`mailto:${vendor.contact.email}`} className="text-brand-green hover:underline">
                    {vendor.contact.email}
                  </a>
                </div>
                
                {vendor.contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-brand-green" />
                    <a href={`tel:${vendor.contact.phone}`} className="text-brand-green hover:underline">
                      {vendor.contact.phone}
                    </a>
                  </div>
                )}
                
                {vendor.contact.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-brand-green" />
                    <a href={vendor.contact.website} target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
                
                {vendor.social && (
                  <div className="flex gap-3 pt-4">
                    {vendor.social.instagram && (
                      <a href={`https://instagram.com/${vendor.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {vendor.social.facebook && (
                      <a href={`https://facebook.com/${vendor.social.facebook}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {vendor.social.twitter && (
                      <a href={`https://twitter.com/${vendor.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

