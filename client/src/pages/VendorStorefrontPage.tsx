'use client';

import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
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
  Users,
  Heart,
  ShoppingCart,
  Filter,
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
  Calendar,
  Package,
  Truck,
  Award,
  TrendingUp,
  Eye,
  Share2,
  X,
  Tag,
  Camera,
  Video,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Vendor {
  id: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  city: string;
  state: string;
  avatar: string;
  coverImage: string;
  isVerified: boolean;
  isOnVacation: boolean;
  vacationMessage?: string;
  returnDate?: string;
  rating: number;
  reviewCount: number;
  totalProducts: number;
  followers: number;
  joinedDate: string;
  nextPickup: string;
  pickupLocation: string;
  pickupCoordinates?: { lat: number; lng: number };
  deliveryAreas: string[];
  deliveryCost: number;
  deliveryETA: string;
  contact: {
    email: string;
    phone?: string;
    website?: string;
    responseTime: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  values: string[];
  certifications: string[];
  businessHours: string;
  fulfillmentOptions: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
  };
  highlights: string[];
  gallery: string[];
  returnPolicy: string;
  secureCheckout: boolean;
  carbonNeutral: boolean;
  localToZip?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  image: string;
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
  availability: string[];
  pickupDays: string[];
  // Enhanced properties for advanced PLP features
  preorder?: boolean;
  madeToOrder?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  vegan?: boolean;
  containsNuts?: boolean;
  unit?: string; // per loaf, per dozen, per lb, per hour
  leadTime?: string; // "Same day", "Next day", "2 days", "1 week"
  nextAvailable?: string; // "Saturday pickup"
  orderBy?: string; // "Thursday 6pm"
  deliveryZips?: string[]; // ZIP codes where delivery is available
  pickupAvailable?: boolean;
  personalization?: string; // "For your ZIP this Friday", "Pairs with your last order"
  crossSell?: string; // "Popular sides", "Add a dip"
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  productId?: string;
  productName?: string;
  photos?: string[];
  isVerified: boolean;
}

export default function VendorStorefrontPage() {
  const [, params] = useRoute("/vendors/:vendorId");
  const vendorId = params?.vendorId ?? "";
  
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
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>([]);
  const [pickupDaysFilter, setPickupDaysFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [filters, setFilters] = useState({
    glutenFree: false,
    dairyFree: false,
    vegan: false,
    inStock: false,
    preorder: false,
    localOnly: false,
    minRating: 0,
    maxLeadTime: 'any' as 'any' | 'same-day' | 'next-day' | '2-days' | '1-week'
  });

  if (!vendorId) return <div>Missing vendor id.</div>;

  // Handle Quick Add modal from ProductCard
  useEffect(() => {
    const handleQuickAdd = (event: CustomEvent) => {
      setSelectedProduct(event.detail);
      setShowQuickAddModal(true);
    };

    window.addEventListener('openQuickAdd', handleQuickAdd as EventListener);
    return () => window.removeEventListener('openQuickAdd', handleQuickAdd as EventListener);
  }, []);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockVendor: Vendor = {
      id: vendorId,
      name: 'Rose Creek Bakery',
      tagline: 'Fresh-milled, naturally fermented sourdough.',
      description: `At Rose Creek Bakery, we believe in milling fresh flour from organic grain, fermenting slowly, and baking with purpose. Our goal is to nourish the body and connect with our neighbors through real food.

We started as a small family operation in 2018, grinding our own flour and using traditional sourdough techniques. Today, we're proud to serve our community with artisanal breads, pastries, and seasonal specialties that honor both tradition and innovation.

Every loaf is hand-shaped, every ingredient carefully sourced, and every customer treated like family.`,
      location: 'Locust Grove, GA',
      city: 'Locust Grove',
      state: 'GA',
      avatar: '/images/vendors/rosecreek-avatar.jpg',
      coverImage: '/images/vendors/rosecreek-cover.jpg',
      isVerified: true,
      isOnVacation: false,
      rating: 4.9,
      reviewCount: 127,
      totalProducts: 24,
      followers: 342,
      joinedDate: '2018-03-15',
      nextPickup: 'Friday 3–5PM',
      pickupLocation: 'Locust Grove Farmers Market',
      pickupCoordinates: { lat: 33.3467, lng: -84.1091 },
      deliveryAreas: ['Locust Grove', 'McDonough', 'Hampton', 'Stockbridge'],
      deliveryCost: 5.00,
      deliveryETA: 'Same day or next day',
      contact: {
        email: 'hello@rosecreekbakery.com',
        phone: '(770) 555-0123',
        website: 'https://rosecreekbakery.com',
        responseTime: 'Usually responds within 2 hours'
      },
      social: {
        instagram: '@rosecreekbakery',
        facebook: 'Rose Creek Bakery',
        twitter: '@rosecreekbakery',
        youtube: 'Rose Creek Bakery'
      },
      values: ['Sustainable Packaging', 'Family Owned', 'Cottage Food Certified', 'Organic Ingredients', 'Local Sourcing'],
      certifications: ['Cottage Food License', 'Organic Certification', 'Food Safety Certified'],
      businessHours: 'Wednesday-Saturday: 6AM-2PM',
      fulfillmentOptions: {
        pickup: true,
        delivery: true,
        shipping: false
      },
      highlights: ['Top Seller', 'Carbon Neutral Packaging', 'Local to 30248', 'Seasonal Specials Available'],
      gallery: [
        '/images/vendors/gallery-1.jpg',
        '/images/vendors/gallery-2.jpg',
        '/images/vendors/gallery-3.jpg',
        '/images/vendors/gallery-4.jpg'
      ],
      returnPolicy: 'Full refund within 24 hours if not satisfied',
      secureCheckout: true,
      carbonNeutral: true,
      localToZip: '30248'
    };

    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Cinnamon Rolls',
        description: 'Hand-rolled cinnamon rolls with cream cheese frosting. Made fresh daily.',
        price: 12.00,
        originalPrice: 15.00,
        category: 'Pastries',
        tags: ['bestseller', 'sweet', 'breakfast', 'organic', 'handmade'],
        image: '/images/products/cinnamon-rolls.jpg',
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
        createdAt: '2024-01-15',
        availability: ['Same Day', 'Next Day'],
        pickupDays: ['Wednesday', 'Friday', 'Saturday'],
        // Enhanced properties
        preorder: false,
        madeToOrder: false,
        glutenFree: false,
        dairyFree: false,
        vegan: false,
        containsNuts: false,
        unit: 'roll',
        leadTime: 'Same day',
        nextAvailable: 'Friday pickup',
        orderBy: 'Thursday 6pm',
        deliveryZips: ['30248', '30253', '30281', '30236'],
        pickupAvailable: true,
        personalization: 'For your ZIP this Friday',
        crossSell: 'Add a coffee or tea'
      },
      {
        id: '2',
        name: 'Original Sourdough',
        description: 'Traditional sourdough bread made with our 100-year-old starter.',
        price: 9.00,
        category: 'Bread',
        tags: ['naturally leavened', 'traditional', 'artisan', 'organic', 'local'],
        image: '/images/products/sourdough.jpg',
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
        createdAt: '2024-01-10',
        availability: ['Same Day', 'Next Day'],
        pickupDays: ['Wednesday', 'Friday', 'Saturday'],
        // Enhanced properties
        preorder: false,
        madeToOrder: true,
        glutenFree: false,
        dairyFree: true,
        vegan: true,
        containsNuts: false,
        unit: 'loaf',
        leadTime: 'Next day',
        nextAvailable: 'Saturday pickup',
        orderBy: 'Friday 6pm',
        deliveryZips: ['30248', '30253', '30281', '30236'],
        pickupAvailable: true,
        personalization: 'Pairs with your last order',
        crossSell: 'Try our artisanal butter'
      },
      {
        id: '3',
        name: 'Gluten-Free Chocolate Chip Cookies',
        description: 'Delicious gluten-free cookies made with almond flour and dark chocolate chips.',
        price: 8.50,
        category: 'Cookies',
        tags: ['gluten-free', 'sweet', 'dessert', 'organic', 'handmade'],
        image: '/images/products/gf-cookies.jpg',
        inStock: false,
        featured: true,
        rating: 4.7,
        reviewCount: 45,
        isBestseller: false,
        isLowStock: false,
        isNew: true,
        allergens: ['eggs', 'nuts'],
        dietary: ['gluten-free', 'vegetarian'],
        weight: '4 oz each',
        createdAt: '2024-01-20',
        availability: ['Preorder Only'],
        pickupDays: ['Friday', 'Saturday'],
        // Enhanced properties
        preorder: true,
        madeToOrder: true,
        glutenFree: true,
        dairyFree: false,
        vegan: false,
        containsNuts: true,
        unit: 'cookie',
        leadTime: '1 week',
        nextAvailable: 'Friday pickup',
        orderBy: 'Monday 6pm',
        deliveryZips: ['30248', '30253'],
        pickupAvailable: true,
        personalization: 'New gluten-free option for you',
        crossSell: 'Perfect with our dairy-free milk'
      },
      {
        id: '4',
        name: 'Vegan Croissants',
        description: 'Flaky, buttery croissants made without dairy or eggs.',
        price: 6.50,
        category: 'Pastries',
        tags: ['vegan', 'flaky', 'breakfast', 'organic', 'handmade'],
        image: '/images/products/vegan-croissants.jpg',
        inStock: true,
        featured: false,
        rating: 4.6,
        reviewCount: 32,
        isBestseller: false,
        isLowStock: true,
        isNew: false,
        allergens: ['wheat', 'gluten'],
        dietary: ['vegan', 'dairy-free'],
        weight: '3 oz each',
        createdAt: '2024-01-12',
        availability: ['Same Day'],
        pickupDays: ['Wednesday', 'Friday', 'Saturday'],
        // Enhanced properties
        preorder: false,
        madeToOrder: false,
        glutenFree: false,
        dairyFree: true,
        vegan: true,
        containsNuts: false,
        unit: 'croissant',
        leadTime: 'Same day',
        nextAvailable: 'Friday pickup',
        orderBy: 'Thursday 6pm',
        deliveryZips: ['30248', '30253', '30281'],
        pickupAvailable: true,
        personalization: 'Low stock alert for your area',
        crossSell: 'Add our house-made jam'
      }
    ];

    const mockReviews: Review[] = [
      {
        id: '1',
        userId: 'u1',
        userName: 'Sarah M.',
        userAvatar: '/images/avatars/sarah.jpg',
        rating: 5,
        title: 'Best sourdough I\'ve ever had',
        comment: 'The sourdough bread is absolutely incredible. Perfect crust and tangy flavor. It\'s become a weekly must-buy for our family.',
        date: '2024-01-18',
        helpful: 12,
        productId: '2',
        productName: 'Original Sourdough',
        photos: ['/images/reviews/review-1-1.jpg'],
        isVerified: true
      }
    ];

    setVendor(mockVendor);
    setProducts(mockProducts);
    setReviews(mockReviews);
    setLoading(false);
  }, [vendorId]);

  if (loading) return <div>Loading…</div>;
  if (!vendor) return <div>Not found.</div>;

  return (
    <div className="py-8 bg-white min-h-screen">
      <div className="container-responsive">
      {/* Vacation Overlay */}
      {vendor.isOnVacation && (
        <div className="fixed inset-0 bg-brand-beige/90 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <h2 className="responsive-heading text-brand-maroon mb-4">On Vacation</h2>
            <p className="text-gray-700 mb-4">{vendor.vacationMessage || 'We\'re taking a break and will be back soon!'}</p>
            {vendor.returnDate && (
              <p className="text-sm text-gray-600 mb-4">Returning: {vendor.returnDate}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className="flex-1 bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors"
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Follow for Updates
              </button>
              <Link href="/marketplace" className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                Browse Other Vendors
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Header */}
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
                  <h1 className="responsive-heading text-gray-900">{vendor.name}</h1>
                  {vendor.isVerified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-2">{vendor.tagline}</p>
                <div className="flex items-center gap-4 responsive-text text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {vendor.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{vendor.rating}</span>
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
              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-2 bg-brand-green text-white responsive-button rounded-lg hover:bg-brand-green/80 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact
              </button>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-2 responsive-button rounded-lg border transition-colors ${
                  isFollowing 
                    ? 'bg-brand-maroon text-white border-brand-maroon' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button 
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Share vendor"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Highlights */}
      {vendor.highlights.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto py-4 px-6">
            <div className="flex flex-wrap gap-2">
              {vendor.highlights.map((highlight, index) => (
                <span key={index} className="flex items-center gap-1 px-3 py-1 bg-brand-cream text-brand-maroon rounded-full text-sm font-medium">
                  <Award className="w-3 h-3" />
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor Story */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="responsive-subheading mb-4">Our Story</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{vendor.description}</p>
              
              {/* Values & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Values & Commitments</h3>
                  <div className="space-y-2">
                    {vendor.values.map((value, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Leaf className="h-4 w-4 text-brand-green flex-shrink-0" />
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                  <div className="space-y-2">
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

            {/* Product Catalog */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="responsive-heading text-gray-900">Our Products</h2>
                <div className="flex items-center gap-4">
                  {/* Filters Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

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
                </div>
              </div>

              {/* Enhanced Filters Panel - Sticky on Mobile */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 p-4 bg-gray-50 rounded-lg overflow-hidden sticky top-0 z-10 md:relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {/* ZIP Code Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="Enter ZIP"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                          aria-label="Enter your ZIP code for delivery availability"
                        />
                      </div>

                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                            aria-label="Minimum price"
                          />
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                            aria-label="Maximum price"
                          />
                        </div>
                      </div>

                      {/* Enhanced Sort */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                          aria-label="Sort products by"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="bestsellers">Best Sellers</option>
                          <option value="rating">Highest Rated</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="newest">Newest First</option>
                          <option value="available-soonest">Available Soonest</option>
                        </select>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                          aria-label="Filter by category"
                        >
                          <option value="all">All Categories</option>
                          <option value="Bread">Bread</option>
                          <option value="Pastries">Pastries</option>
                          <option value="Cakes">Cakes</option>
                          <option value="Cookies">Cookies</option>
                          <option value="Savory">Savory Items</option>
                        </select>
                      </div>

                      {/* Dietary & Allergen Filters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.glutenFree}
                              onChange={(e) => setFilters(prev => ({ ...prev, glutenFree: e.target.checked }))}
                              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                              aria-label="Gluten free only"
                            />
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">GF</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.dairyFree}
                              onChange={(e) => setFilters(prev => ({ ...prev, dairyFree: e.target.checked }))}
                              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                              aria-label="Dairy free only"
                            />
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">DF</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.vegan}
                              onChange={(e) => setFilters(prev => ({ ...prev, vegan: e.target.checked }))}
                              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                              aria-label="Vegan only"
                            />
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Vegan</span>
                          </label>
                        </div>
                      </div>

                      {/* Availability Filters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.inStock}
                              onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                              aria-label="In stock only"
                            />
                            In Stock
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.preorder}
                              onChange={(e) => setFilters(prev => ({ ...prev, preorder: e.target.checked }))}
                              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                              aria-label="Preorder available"
                            />
                            Preorder
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.localOnly}
                              onChange={(e) => setFilters(prev => ({ ...prev, localOnly: e.target.checked }))}
                              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                              aria-label="Local pickup only"
                            />
                            Local Pickup Only
                          </label>
                        </div>
                      </div>

                      {/* Rating Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                        <select
                          value={filters.minRating}
                          onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                          aria-label="Filter by minimum rating"
                        >
                          <option value={0}>Any Rating</option>
                          <option value={4}>4+ Stars</option>
                          <option value={4.5}>4.5+ Stars</option>
                          <option value={5}>5 Stars Only</option>
                        </select>
                      </div>

                      {/* Lead Time Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Lead Time</label>
                        <select
                          value={filters.maxLeadTime}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxLeadTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                          aria-label="Filter by maximum lead time"
                        >
                          <option value="any">Any Time</option>
                          <option value="same-day">Same Day</option>
                          <option value="next-day">Next Day</option>
                          <option value="2-days">2 Days</option>
                          <option value="1-week">1 Week</option>
                        </select>
                      </div>
                    </div>

                    {/* Active Filters Display */}
                    {Object.values(filters).some(v => v !== false && v !== 0 && v !== 'any') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                          <button
                            onClick={() => setFilters({
                              glutenFree: false,
                              dairyFree: false,
                              vegan: false,
                              inStock: false,
                              preorder: false,
                              localOnly: false,
                              minRating: 0,
                              maxLeadTime: 'any'
                            })}
                            className="text-sm text-brand-green hover:underline"
                            aria-label="Clear all filters"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {filters.glutenFree && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">GF Only</span>}
                          {filters.dairyFree && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">DF Only</span>}
                          {filters.vegan && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Vegan Only</span>}
                          {filters.inStock && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">In Stock</span>}
                          {filters.preorder && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Preorder</span>}
                          {filters.localOnly && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Local Only</span>}
                          {filters.minRating > 0 && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{filters.minRating}+ Stars</span>}
                          {filters.maxLeadTime !== 'any' && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Max {filters.maxLeadTime}</span>}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Grid */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Gallery */}
            {vendor.gallery.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="responsive-subheading mb-4">Gallery</h2>
                <div className="relative">
                  <div className="flex overflow-x-auto gap-4 pb-4">
                    {vendor.gallery.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-64 h-48 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setGalleryIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="responsive-heading text-gray-900">Customer Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-2 font-semibold">{vendor.rating}</span>
                  </div>
                  <span className="text-gray-600">({vendor.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Fulfillment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Fulfillment Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-brand-green" />
                  <div>
                    <p className="font-medium">Next Pickup</p>
                    <p className="text-sm text-gray-600">{vendor.nextPickup}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand-green" />
                  <div>
                    <p className="font-medium">Pickup Location</p>
                    <p className="text-sm text-gray-600">{vendor.pickupLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-brand-green" />
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-sm text-gray-600">${vendor.deliveryCost} • {vendor.deliveryETA}</p>
                    <p className="text-xs text-gray-500">{vendor.deliveryAreas.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Safety */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Trust & Safety</h3>
              <div className="space-y-3">
                {vendor.secureCheckout && (
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Secure Checkout</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{vendor.returnPolicy}</span>
                </div>
                {vendor.carbonNeutral && (
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span>Carbon Neutral Packaging</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {vendor.social.instagram && (
                  <a href={`https://instagram.com/${vendor.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {vendor.social.facebook && (
                  <a href={`https://facebook.com/${vendor.social.facebook}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {vendor.social.twitter && (
                  <a href={`https://twitter.com/${vendor.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {vendor.social.youtube && (
                  <a href={`https://youtube.com/${vendor.social.youtube}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                    <Video className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
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
                <h3 className="text-lg font-semibold">Contact {vendor.name}</h3>
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
                
                <div className="text-sm text-gray-600">
                  <p>{vendor.contact.responseTime}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAddModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Add to Cart</h3>
                <button
                  onClick={() => setShowQuickAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close quick add modal"
                  title="Close quick add modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Product Image & Info */}
                <div className="flex gap-4">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                    <p className="text-lg font-bold text-brand-maroon mt-1">
                      ${selectedProduct.price.toFixed(2)}
                      {selectedProduct.unit && <span className="text-sm text-gray-600 ml-1">per {selectedProduct.unit}</span>}
                    </p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {/* TODO: Decrease quantity */}}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={1}
                      onChange={() => {/* TODO: Handle quantity change */}}
                      className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                      aria-label="Product quantity"
                    />
                    <button
                      onClick={() => {/* TODO: Increase quantity */}}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      aria-label="Increase quantity"
                      title="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                  <textarea
                    placeholder="Any special requests or dietary notes..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
                    rows={3}
                    aria-label="Special instructions for this order"
                  />
                </div>

                {/* Pickup/Delivery Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="fulfillment"
                        value="pickup"
                        defaultChecked
                        className="text-brand-green focus:ring-brand-green"
                      />
                      <span>Local Pickup - {vendor?.nextPickup}</span>
                    </label>
                    {vendor?.fulfillmentOptions.delivery && (
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="fulfillment"
                          value="delivery"
                          className="text-brand-green focus:ring-brand-green"
                        />
                        <span>Delivery - ${vendor?.deliveryCost?.toFixed(2)}</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    // TODO: Add to cart logic
                    setShowQuickAddModal(false);
                  }}
                  className="w-full bg-brand-green text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-green/80 transition-colors"
                  aria-label="Add to cart"
                  title="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const [wishlist, setWishlist] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Enhanced Badges & States */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestseller && (
            <span className="bg-brand-maroon text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              New
            </span>
          )}
          {product.isLowStock && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Low Stock
            </span>
          )}
          {product.preorder && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Calendar className="w-3 h3" />
              Preorder
            </span>
          )}
          {product.madeToOrder && (
            <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Made-to-Order
            </span>
          )}
        </div>

        {/* Dietary & Allergen Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.glutenFree && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium border border-yellow-200">
              GF
            </span>
          )}
          {product.dairyFree && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium border border-blue-200">
              DF
            </span>
          )}
          {product.vegan && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium border border-green-200">
              Vegan
            </span>
          )}
          {product.containsNuts && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium border border-red-200">
              Contains Nuts
            </span>
          )}
        </div>

        {product.originalPrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}

                 <button
           onClick={() => setWishlist(!wishlist)}
           className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
           title={wishlist ? "Remove from wishlist" : "Add to wishlist"}
           aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
         >
          <Heart 
            className={`w-4 h-4 ${wishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
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

        {/* Enhanced Pricing & Availability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-lg font-bold text-brand-maroon">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
            )}
            {product.unit && (
              <span className="text-sm text-gray-600 ml-1">per {product.unit}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs px-2 py-1 rounded ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            {product.leadTime && (
              <span className="text-xs text-gray-600">
                <Clock className="w-3 h-3 inline mr-1" />
                {product.leadTime}
              </span>
            )}
          </div>
        </div>

        {/* Schedule Indicator */}
        {product.nextAvailable && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <Calendar className="w-3 h-3 inline mr-1" />
            Order by {product.orderBy} for {product.nextAvailable} pickup
          </div>
        )}

        {/* ZIP-Aware Availability */}
        {zipCode && product.deliveryZips && !product.deliveryZips.includes(zipCode) && (
          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
            <MapPin className="w-3 h-3 inline mr-1" />
            Not available for delivery to {zipCode}. 
            {product.pickupAvailable && ' Local pickup available.'}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map(tag => (
            <Link key={tag} href={`/marketplace?tag=${tag}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
              #{tag}
            </Link>
          ))}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('openQuickAdd', { detail: product }));
            }}
            disabled={!product.inStock && !product.preorder}
            className="flex-1 bg-brand-green text-white py-2 px-3 rounded text-sm font-medium hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label={`Quick add ${product.name} to cart`}
            title={`Quick add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {product.preorder ? 'Preorder' : 'Quick Add'}
          </button>
          <Link
            href={`/product/${product.id}`}
            className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
            aria-label={`View details for ${product.name}`}
            title={`View details for ${product.name}`}
          >
            View
          </Link>
        </div>

        {/* Personalization Hooks */}
        {product.personalization && (
          <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800">
            <Heart className="w-3 h-3 inline mr-1" />
            {product.personalization}
          </div>
        )}

        {/* Cross-sell Context */}
        {product.crossSell && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <Package className="w-3 h-3 inline mr-1" />
            {product.crossSell}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        {review.userAvatar && (
          <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
            {review.isVerified && (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center">
              {renderStars(review.rating)}
            </div>
            <span>{review.date}</span>
          </div>
        </div>
      </div>
      
      <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      <p className="text-gray-700 text-sm mb-3">{review.comment}</p>
      
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.photos.map((photo, index) => (
            <img key={index} src={photo} alt={`Review photo ${index + 1}`} className="w-16 h-16 object-cover rounded" />
          ))}
        </div>
      )}
      
      {review.productName && (
        <p className="text-xs text-brand-green mb-2">Review for: {review.productName}</p>
      )}
      
      <div className="flex items-center justify-between">
        <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" />
          Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
}
