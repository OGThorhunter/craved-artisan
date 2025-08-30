'use client';

import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Link } from 'wouter';
import {
  Star,
  Heart,
  ShoppingCart,
  MapPin,
  Clock,
  Truck,
  Package,
  Shield,
  Star as StarFilled,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageCircle,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  ThumbsUp,
  Tag,
  Leaf,
  Award,
  TrendingUp,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Clock as ClockIcon,
  Truck as TruckIcon,
  Package as PackageIcon,
  AlertTriangle,
  BarChart3,
  Wrench,
  Bell,
  Zap,
  Settings,
  Store,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  vendor: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    location: string;
    verified: boolean;
    avatar: string;
    followers: number;
    responseTime: string;
  };
  category: string;
  subcategory: string;
  images: string[];
  videos?: string[];
  tags: string[];
  badges: string[];
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  allergens: string[];
  dietary: string[];
  macros: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  weight: string;
  ingredients: string[];
  originStory: string;
  usageTips: string;
  storageTips: string;
  personalNotes: string;
  availability: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
    nextPickup: string;
    nextDelivery: string;
    locations: Array<{
      name: string;
      address: string;
      coordinates: { lat: number; lng: number };
      hours: string;
      nextSlot: string;
    }>;
    deliveryRadius: number;
    deliveryFee: number;
    deliveryETA: string;
    cutOffTime: string;
    leadTime: string;
  };
        metadata: {
        sku: 'SOUR-001',
        batchNumber: 'B2024-01-15',
        ingredientCost: 3.50,
        recipeId: 'RCP-001'
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      // Enhanced properties
      variants: [
        {
          id: 'v1',
          name: 'Small Loaf (1 lb)',
          price: 9.00,
          image: '/images/products/sourdough-small.jpg',
          inStock: true,
          weight: '1 lb'
        },
        {
          id: 'v2',
          name: 'Large Loaf (2 lb)',
          price: 16.00,
          image: '/images/products/sourdough-large.jpg',
          inStock: true,
          weight: '2 lb'
        }
      ],
      selectedVariant: 'v1',
      unit: 'loaf',
      estimatedTax: 0.72,
      fees: [
        {
          name: 'Delivery Fee',
          amount: 5.00,
          description: 'Standard delivery within 25 miles'
        }
      ],
      scheduleSlots: [
        {
          id: 'slot1',
          date: 'Friday, January 26',
          time: '3:00 PM - 5:00 PM',
          available: true,
          maxOrders: 50,
          currentOrders: 23
        },
        {
          id: 'slot2',
          date: 'Saturday, January 27',
          time: '9:00 AM - 11:00 AM',
          available: true,
          maxOrders: 50,
          currentOrders: 15
        }
      ],
      selectedSchedule: 'slot1',
      preorder: false,
      preorderWindow: {
        start: '2024-01-20',
        end: '2024-01-25',
        maxOrders: 100
      },
      madeToOrder: true,
      prepTime: '24 hours',
      shelfLife: '5-7 days',
      reheatInstructions: 'Warm in oven at 350°F for 5-10 minutes',
      serveInstructions: 'Best served at room temperature. Slice and enjoy!',
      cancellationPolicy: {
        window: '24 hours before pickup',
        rules: [
          'Full refund if cancelled 24+ hours before pickup',
          '50% refund if cancelled 12-24 hours before pickup',
          'No refund if cancelled less than 12 hours before pickup'
        ]
      },
      customOrderRules: [
        'Minimum 24 hours notice for custom orders',
        'Special dietary requests require 48 hours notice',
        'Bulk orders (10+ loaves) require 1 week notice'
      ],
      bundles: [
        {
          id: 'b1',
          name: 'Bread & Butter Bundle',
          products: ['sourdough', 'artisanal-butter'],
          price: 14.00,
          savings: 2.00,
          image: '/images/bundles/bread-butter.jpg'
        }
      ],
      subscriptions: [
        {
          id: 'sub1',
          name: 'Weekly Bread Share',
          frequency: 'Weekly',
          price: 32.00,
          savings: 4.00,
          description: 'Get fresh sourdough delivered weekly'
        }
      ],
      giftOptions: {
        giftWrap: true,
        giftNote: true,
        giftWrapPrice: 2.00
      },
      waitlist: false,
      notifyWhenAvailable: true,
      digitalGoods: [
        {
          id: 'dg1',
          name: 'Sourdough Masterclass',
          type: 'class',
          price: 25.00,
          description: 'Learn the art of sourdough baking'
        }
      ],
      serviceBookings: [
        {
          id: 'sb1',
          name: 'Baking Consultation',
          duration: '1 hour',
          price: 50.00,
          availableSlots: ['Monday 2PM', 'Wednesday 4PM', 'Friday 10AM']
        }
      ],
      sourcing: {
        organic: true,
        local: true,
        nonGMO: true,
        fairTrade: false,
        sustainable: true,
        farmToTable: true
      },
      frequentlyBoughtTogether: ['artisanal-butter', 'local-honey', 'olive-oil'],
      pairsWith: ['soup', 'cheese', 'wine'],
      fromThisVendor: ['cinnamon-rolls', 'croissants', 'baguettes'],
      questions: [
        {
          id: 'q1',
          question: 'How long does the sourdough stay fresh?',
          answer: 'Our sourdough stays fresh for 5-7 days when stored properly in a cool, dry place.',
          answeredBy: 'Rose Creek Bakery',
          date: '2024-01-18',
          helpful: 8
        },
        {
          id: 'q2',
          question: 'Can I freeze the bread?',
          answer: 'Yes! You can freeze our sourdough for up to 3 months. Thaw at room temperature.',
          answeredBy: 'Rose Creek Bakery',
          date: '2024-01-19',
          helpful: 12
        }
      ]
  // Enhanced properties for advanced PDP features
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
    inStock: boolean;
    weight?: string;
    description?: string;
  }>;
  selectedVariant?: string;
  unit?: string; // per loaf, per dozen, per lb
  estimatedTax?: number;
  fees?: Array<{
    name: string;
    amount: number;
    description: string;
  }>;
  scheduleSlots?: Array<{
    id: string;
    date: string;
    time: string;
    available: boolean;
    maxOrders: number;
    currentOrders: number;
  }>;
  selectedSchedule?: string;
  preorder?: boolean;
  preorderWindow?: {
    start: string;
    end: string;
    maxOrders: number;
  };
  madeToOrder?: boolean;
  prepTime?: string;
  shelfLife?: string;
  reheatInstructions?: string;
  serveInstructions?: string;
  cancellationPolicy?: {
    window: string;
    rules: string[];
  };
  customOrderRules?: string[];
  bundles?: Array<{
    id: string;
    name: string;
    products: string[];
    price: number;
    savings: number;
    image: string;
  }>;
  subscriptions?: Array<{
    id: string;
    name: string;
    frequency: string;
    price: number;
    savings: number;
    description: string;
  }>;
  giftOptions?: {
    giftWrap: boolean;
    giftNote: boolean;
    giftWrapPrice: number;
  };
  waitlist?: boolean;
  notifyWhenAvailable?: boolean;
  digitalGoods?: Array<{
    id: string;
    name: string;
    type: 'class' | 'download' | 'recipe';
    price: number;
    description: string;
  }>;
  serviceBookings?: Array<{
    id: string;
    name: string;
    duration: string;
    price: number;
    availableSlots: string[];
  }>;
  // Sourcing & Values
  sourcing?: {
    organic: boolean;
    local: boolean;
    nonGMO: boolean;
    fairTrade: boolean;
    sustainable: boolean;
    farmToTable: boolean;
  };
  // Cross-sells
  frequentlyBoughtTogether?: string[];
  pairsWith?: string[];
  fromThisVendor?: string[];
  // Q&A
  questions?: Array<{
    id: string;
    question: string;
    answer?: string;
    answeredBy?: string;
    date: string;
    helpful: number;
  }>;
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
  photos?: string[];
  isVerified: boolean;
  isVerifiedPurchase: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  vendor: {
    name: string;
    verified: boolean;
  };
  reason: string;
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:productId");
  const productId = params?.productId ?? "";
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedFulfillment, setSelectedFulfillment] = useState<'pickup' | 'delivery' | 'shipping'>('pickup');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'fulfillment' | 'reviews' | 'nutrition' | 'policies' | 'qa'>('description');
  const [wishlist, setWishlist] = useState(false);
  const [showBackInStockModal, setShowBackInStockModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGiftOptions, setShowGiftOptions] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  if (!productId) return <div>Missing product id.</div>;

  // Countdown timer effect
  useEffect(() => {
    if (product.availability?.cutOffTime) {
      const timer = setInterval(() => {
        // Calculate time until cut-off (simplified - in real app, parse actual cut-off time)
        const now = new Date();
        const cutOff = new Date();
        cutOff.setHours(18, 0, 0, 0); // 6 PM today
        
        if (now > cutOff) {
          cutOff.setDate(cutOff.getDate() + 1); // Next day
        }
        
        const diff = cutOff.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown({ hours, minutes, seconds });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [product.availability?.cutOffTime]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProduct: Product = {
      id: productId,
      title: 'Artisan Sourdough Bread',
      description: 'Traditional sourdough bread made with organic flour and natural starter. Perfect crust and tangy flavor.',
      longDescription: `Our signature sourdough bread is crafted using a 100-year-old starter that has been passed down through generations. Each loaf is hand-shaped and baked in our stone hearth oven, resulting in a crusty exterior and tender, tangy interior.

We use only the finest organic flour, filtered water, and sea salt. No preservatives, no shortcuts, just pure artisan craftsmanship. The natural fermentation process creates complex flavors and makes the bread easier to digest.

Perfect for sandwiches, toast, or simply enjoyed with butter and honey.`,
      price: 9.00,
      originalPrice: 12.00,
      vendor: {
        id: 'v1',
        name: 'Rose Creek Bakery',
        rating: 4.9,
        reviewCount: 127,
        location: 'Locust Grove, GA',
        verified: true,
        avatar: '/images/vendors/rosecreek-avatar.jpg',
        followers: 342,
        responseTime: 'Usually responds within 2 hours'
      },
      category: 'Bread',
      subcategory: 'Sourdough',
      images: [
        '/images/products/sourdough-1.jpg',
        '/images/products/sourdough-2.jpg',
        '/images/products/sourdough-3.jpg',
        '/images/products/sourdough-4.jpg'
      ],
      videos: ['/videos/sourdough-making.mp4'],
      tags: ['organic', 'sourdough', 'artisan', 'fresh', 'naturally leavened', 'gluten-friendly'],
      badges: ['Popular this week', 'Farmer grown', 'Low stock', 'Bestseller'],
      inStock: true,
      featured: true,
      rating: 4.9,
      reviewCount: 89,
      allergens: ['wheat', 'gluten'],
      dietary: ['vegan'],
      macros: {
        calories: 120,
        protein: 4,
        carbs: 25,
        fat: 1,
        fiber: 2
      },
      weight: '1 lb',
      ingredients: ['Organic wheat flour', 'Filtered water', 'Sea salt', 'Natural sourdough starter'],
      originStory: 'This recipe has been in our family for over 100 years, passed down from our great-grandmother who started baking in her farmhouse kitchen.',
      usageTips: 'Best enjoyed within 3-5 days. Can be frozen for up to 3 months. Reheat in a 350°F oven for 5-10 minutes to restore crustiness.',
      storageTips: 'Store in a paper bag at room temperature for 2-3 days, or wrap in foil and freeze for longer storage.',
      personalNotes: 'Each loaf is unique - the natural fermentation process means slight variations in flavor and texture, which is part of the charm of true artisan bread.',
      availability: {
        pickup: true,
        delivery: true,
        shipping: false,
        nextPickup: 'Friday 3-5PM',
        nextDelivery: 'Same day or next day',
        locations: [
          {
            name: 'Locust Grove Farmers Market',
            address: '123 Main St, Locust Grove, GA 30248',
            coordinates: { lat: 33.3467, lng: -84.1091 },
            hours: 'Wednesday-Saturday: 6AM-2PM',
            nextSlot: 'Friday 3-5PM'
          }
        ],
        deliveryRadius: 25,
        deliveryFee: 5.00,
        deliveryETA: 'Same day or next day',
        cutOffTime: 'Thursday 6PM',
        leadTime: 'Next day'
      },
      metadata: {
        sku: 'SOUR-001',
        batchNumber: 'B2024-001',
        ingredientCost: 3.50,
        recipeId: 'recipe-123'
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    };

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
        photos: ['/images/reviews/review-1-1.jpg'],
        isVerified: true,
        isVerifiedPurchase: true
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Michael R.',
        userAvatar: '/images/avatars/michael.jpg',
        rating: 4,
        title: 'Great quality, authentic taste',
        comment: 'Really impressed with the quality. The crust is perfect and the interior is just the right texture. Will definitely order again.',
        date: '2024-01-16',
        helpful: 8,
        isVerified: true,
        isVerifiedPurchase: true
      }
    ];

    const mockRecommendations: Recommendation[] = [
      {
        id: 'rec1',
        title: 'Whole Wheat Sourdough',
        price: 10.00,
        imageUrl: '/images/products/whole-wheat-sourdough.jpg',
        vendor: { name: 'Rose Creek Bakery', verified: true },
        reason: 'Frequently bought together'
      },
      {
        id: 'rec2',
        title: 'Artisan Baguette',
        price: 7.50,
        imageUrl: '/images/products/baguette.jpg',
        vendor: { name: 'Rose Creek Bakery', verified: true },
        reason: 'Similar to what you\'re viewing'
      }
    ];

    setProduct(mockProduct);
    setReviews(mockReviews);
    setRecommendations(mockRecommendations);
    setLoading(false);
  }, [productId]);

  if (loading) return <div>Loading…</div>;
  if (!product) return <div>Not found.</div>;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log(`Adding ${quantity} of ${product.title} to cart`);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  return (
    <div className="page-container bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/vendors/${product.vendor.id}`} className="hover:text-gray-700">
              {product.vendor.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/marketplace?category=${product.category}`} className="hover:text-gray-700">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={product.images[currentImageIndex]}
                alt={product.title}
                className={`w-full h-full object-cover cursor-pointer transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'hover:scale-105'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  title={isZoomed ? 'Zoom out' : 'Zoom in'}
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </button>
              </div>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                                     <button
                     onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                     className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                     title="Previous image"
                     aria-label="Previous image"
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </button>
                   <button
                     onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                     title="Next image"
                     aria-label="Next image"
                   >
                     <ChevronRight className="w-4 h-4" />
                   </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-brand-green' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Video Preview */}
            {product.videos && product.videos.length > 0 && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <video
                  src={product.videos[0]}
                  className="w-full h-full object-cover"
                  controls
                  poster={product.images[0]}
                />
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6">
            {/* Title and Vendor */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <Link 
                href={`/vendors/${product.vendor.id}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
              >
                <img src={product.vendor.avatar} alt={product.vendor.name} className="w-6 h-6 rounded-full" />
                <span>{product.vendor.name}</span>
                {product.vendor.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{product.vendor.location}</span>
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-gray-600">({product.reviewCount} reviews)</span>
            </div>

            {/* Enhanced Price Block */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-brand-maroon">
                  ${product.variants && product.variants.length > 0 
                    ? product.variants.find(v => v.id === selectedVariant)?.price || product.price
                    : product.price
                  }
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
                {product.originalPrice && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
                {product.unit && (
                  <span className="text-lg text-gray-600">per {product.unit}</span>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
                {product.estimatedTax && (
                  <div className="flex justify-between text-sm">
                    <span>Estimated Tax:</span>
                    <span>${product.estimatedTax.toFixed(2)}</span>
                  </div>
                )}
                {product.fees && product.fees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{fee.name}:</span>
                    <span>${fee.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total (price + tax):</span>
                  <span>
                    ${(product.price + (product.estimatedTax || 0) + (product.fees?.reduce((sum, fee) => sum + fee.amount, 0) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Size/Flavor:</label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedVariant === variant.id
                          ? 'border-brand-green bg-brand-green/10 text-brand-green'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={`Select ${variant.name} - $${variant.price.toFixed(2)}`}
                      aria-label={`Select ${variant.name} variant for $${variant.price.toFixed(2)}`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-gray-600">${variant.price.toFixed(2)}</div>
                      {variant.weight && (
                        <div className="text-xs text-gray-500">{variant.weight}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Selector */}
            {product.scheduleSlots && product.scheduleSlots.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Pickup Time:</label>
                <div className="space-y-2">
                  {product.scheduleSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSchedule(slot.id)}
                      disabled={!slot.available}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${
                        selectedSchedule === slot.id
                          ? 'border-brand-green bg-brand-green/10 text-brand-green'
                          : slot.available
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={slot.available ? `Select ${slot.date} at ${slot.time}` : 'Slot unavailable'}
                      aria-label={slot.available ? `Select pickup slot for ${slot.date} at ${slot.time}` : `Unavailable slot for ${slot.date} at ${slot.time}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{slot.date}</div>
                          <div className="text-sm text-gray-600">{slot.time}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {slot.currentOrders}/{slot.maxOrders} orders
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability & Lead Time */}
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Availability & Lead Time</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  {product.availability?.nextAvailable && (
                    <div className="flex justify-between">
                      <span className="text-blue-800">Next Available:</span>
                      <span className="font-medium">{product.availability.nextAvailable}</span>
                    </div>
                  )}
                  
                  {product.availability?.cutOffTime && (
                    <div className="flex justify-between">
                      <span className="text-blue-800">Order Cut-off:</span>
                      <span className="font-medium">{product.availability.cutOffTime}</span>
                    </div>
                  )}

                  {product.availability?.leadTime && (
                    <div className="flex justify-between">
                      <span className="text-blue-800">Lead Time:</span>
                      <span className="font-medium">{product.availability.leadTime}</span>
                    </div>
                  )}

                  {/* Countdown Timer */}
                  {product.availability?.cutOffTime && (
                    <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                      <div className="text-center text-blue-900 font-medium mb-2">
                        Order within {countdown.hours.toString().padStart(2, '0')}:{countdown.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="flex justify-center gap-2 text-xs text-blue-700">
                        <span>{countdown.hours}h</span>
                        <span>{countdown.minutes}m</span>
                        <span>{countdown.seconds}s</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="space-y-3">
              {/* Main CTA */}
              <button
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  product.inStock
                    ? 'bg-brand-green text-white hover:bg-brand-green/80'
                    : product.preorder
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!product.inStock && !product.preorder}
                title={
                  product.inStock
                    ? 'Add this product to your cart'
                    : product.preorder
                    ? 'Preorder this product'
                    : 'Product currently unavailable'
                }
                aria-label={
                  product.inStock
                    ? 'Add this product to your cart'
                    : product.preorder
                    ? 'Preorder this product'
                    : 'Product currently unavailable'
                }
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    Add to Cart
                  </>
                ) : product.preorder ? (
                  <>
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Preorder Now
                  </>
                ) : (
                  'Out of Stock'
                )}
              </button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                {product.madeToOrder && (
                  <button
                    className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    title="Request a custom order for this product"
                    aria-label="Request a custom order for this product"
                  >
                    <Wrench className="w-4 h-4 inline mr-2" />
                    Request Custom
                  </button>
                )}
                
                {product.waitlist && (
                  <button
                    onClick={() => setShowBackInStockModal(true)}
                    className="w-full py-3 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    title="Join waitlist to be notified when this product is available"
                    aria-label="Join waitlist to be notified when this product is available"
                  >
                    <Bell className="w-4 h-4 inline mr-2" />
                    Join Waitlist
                  </button>
                )}

                {product.notifyWhenAvailable && !product.inStock && !product.preorder && (
                  <button
                    onClick={() => setShowBackInStockModal(true)}
                    className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    title="Get notified when this product becomes available"
                    aria-label="Get notified when this product becomes available"
                  >
                    <Bell className="w-4 h-4 inline mr-2" />
                    Notify Me
                  </button>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.badges.map((badge, index) => (
                <span key={index} className="px-3 py-1 text-sm bg-brand-cream text-brand-maroon rounded-full font-medium">
                  {badge}
                </span>
              ))}
            </div>

            {/* Short Description */}
            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Enhanced Allergens & Nutrition */}
            <div className="space-y-4">
              {/* Allergens */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">Allergens & Dietary Info</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">Contains:</h5>
                    <div className="space-y-1">
                      {product.allergens.map((allergen, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {allergen}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-green-800 mb-2">Dietary:</h5>
                    <div className="space-y-1">
                      {product.dietary.map((diet, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {diet}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Nutrition Facts (per serving)</h4>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {product.macros.calories && (
                    <div className="text-center p-3 bg-white rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">{product.macros.calories}</div>
                      <div className="text-xs text-blue-700">Calories</div>
                    </div>
                  )}
                  {product.macros.protein && (
                    <div className="text-center p-3 bg-white rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">{product.macros.protein}g</div>
                      <div className="text-xs text-blue-700">Protein</div>
                    </div>
                  )}
                  {product.macros.carbs && (
                    <div className="text-center p-3 bg-white rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">{product.macros.carbs}g</div>
                      <div className="text-xs text-blue-700">Carbs</div>
                    </div>
                  )}
                  {product.macros.fat && (
                    <div className="text-center p-3 bg-white rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">{product.macros.fat}g</div>
                      <div className="text-xs text-blue-700">Fat</div>
                    </div>
                  )}
                  {product.macros.fiber && (
                    <div className="text-center p-3 bg-white rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">{product.macros.fiber}g</div>
                      <div className="text-xs text-blue-700">Fiber</div>
                    </div>
                  )}
                  {product.macros.sugar && (
                    <div className="text-center p-3 bg-white rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">{product.macros.sugar}g</div>
                      <div className="text-xs text-blue-700">Sugar</div>
                    </div>
                  )}
                  {product.macros.sodium && (
                    <div className="text-center p-3 bg-white rounded border border-blue-200">
                      <div className="text-2xl font-bold text-blue-900">{product.macros.sodium}mg</div>
                      <div className="text-xs text-blue-700">Sodium</div>
                    </div>
                  )}
                </div>
                
                {product.weight && (
                  <div className="mt-3 text-sm text-blue-700 text-center">
                    Serving size: {product.weight}
                  </div>
                )}
              </div>
            </div>

            {/* Fulfillment Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Fulfillment Options</h4>
              <div className="space-y-2">
                {product.availability.pickup && (
                  <button
                    onClick={() => setSelectedFulfillment('pickup')}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedFulfillment === 'pickup' ? 'border-brand-green bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PackageIcon className="w-5 h-5 text-brand-green" />
                      <div>
                        <p className="font-medium">Pickup</p>
                        <p className="text-sm text-gray-600">Next: {product.availability.nextPickup}</p>
                      </div>
                    </div>
                  </button>
                )}
                
                {product.availability.delivery && (
                  <button
                    onClick={() => setSelectedFulfillment('delivery')}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedFulfillment === 'delivery' ? 'border-brand-green bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TruckIcon className="w-5 h-5 text-brand-green" />
                      <div>
                        <p className="font-medium">Local Delivery</p>
                        <p className="text-sm text-gray-600">Next: {product.availability.nextDelivery}</p>
                      </div>
                    </div>
                  </button>
                )}
                
                {product.availability.shipping && (
                  <button
                    onClick={() => setSelectedFulfillment('shipping')}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedFulfillment === 'shipping' ? 'border-brand-green bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PackageIcon className="w-5 h-5 text-brand-green" />
                      <div>
                        <p className="font-medium">Shipping</p>
                        <p className="text-sm text-gray-600">3-5 business days</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                                     <button
                     onClick={() => handleQuantityChange(quantity - 1)}
                     className="p-2 hover:bg-gray-50 transition-colors"
                     disabled={quantity <= 1}
                     title="Decrease quantity"
                     aria-label="Decrease quantity"
                   >
                     <Minus className="w-4 h-4" />
                   </button>
                   <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                   <button
                     onClick={() => handleQuantityChange(quantity + 1)}
                     className="p-2 hover:bg-gray-50 transition-colors"
                     disabled={quantity >= 10}
                     title="Increase quantity"
                     aria-label="Increase quantity"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-brand-green text-white py-3 px-6 rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setWishlist(!wishlist)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={wishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${wishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Ask the artisan"
                >
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {!product.inStock && (
                <button
                  onClick={() => setShowBackInStockModal(true)}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Notify when back in stock
                </button>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Link key={index} href={`/marketplace?tag=${tag}`} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Fulfillment Module */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Fulfillment & Delivery</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pickup Locations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-brand-green" />
                <h4 className="font-medium text-gray-900">Pickup Locations</h4>
              </div>
              
              {product.availability.locations?.map((location, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-600">{location.address}</div>
                  <div className="text-sm text-gray-600">{location.hours}</div>
                  {location.nextSlot && (
                    <div className="text-sm text-blue-600 font-medium mt-1">
                      Next slot: {location.nextSlot}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <TruckIcon className="w-5 h-5 text-brand-green" />
                <h4 className="font-medium text-gray-900">Delivery Options</h4>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Delivery Radius</span>
                    <span className="text-sm text-gray-600">{product.availability.deliveryRadius} miles</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Delivery Fee</span>
                    <span className="text-sm text-gray-600">${product.availability.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">ETA</span>
                    <span className="text-sm text-gray-600">{product.availability.deliveryETA}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Add to Cart */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
          <div className="flex items-center gap-3">
                         <div className="flex items-center border border-gray-300 rounded-lg">
               <button
                 onClick={() => handleQuantityChange(quantity - 1)}
                 className="p-2 hover:bg-gray-50 transition-colors"
                 disabled={quantity <= 1}
                 title="Decrease quantity"
                 aria-label="Decrease quantity"
               >
                 <Minus className="w-4 h-4" />
               </button>
               <span className="px-3 py-2 border-x border-gray-300">{quantity}</span>
               <button
                 onClick={() => handleQuantityChange(quantity + 1)}
                 className="p-2 hover:bg-gray-50 transition-colors"
                 disabled={quantity >= 10}
                 title="Increase quantity"
                 aria-label="Increase quantity"
               >
                 <Plus className="w-4 h-4" />
               </button>
             </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 bg-brand-green text-white py-3 px-6 rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart - ${(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex">
              {['description', 'fulfillment', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About this product</h3>
                    <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Sourcing & Values */}
                  {product.sourcing && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Sourcing & Values</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.sourcing.organic && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                            🌱 Organic
                          </span>
                        )}
                        {product.sourcing.local && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200">
                            🏠 Local
                          </span>
                        )}
                        {product.sourcing.nonGMO && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200">
                            🧬 Non-GMO
                          </span>
                        )}
                        {product.sourcing.fairTrade && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full border border-orange-200">
                            🤝 Fair Trade
                          </span>
                        )}
                        {product.sourcing.sustainable && (
                          <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full border border-teal-200">
                            🌿 Sustainable
                          </span>
                        )}
                        {product.sourcing.farmToTable && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full border border-amber-200">
                            🚜 Farm to Table
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        We're committed to sourcing the highest quality ingredients while supporting sustainable practices and local farmers.
                      </p>
                    </div>
                  )}

                  {/* Made-to-Order Notes */}
                  {product.madeToOrder && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Made-to-Order Details</h3>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                        {product.prepTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-800">
                              <span className="font-medium">Prep Time:</span> {product.prepTime}
                            </span>
                          </div>
                        )}
                        
                        {product.shelfLife && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-800">
                              <span className="font-medium">Shelf Life:</span> {product.shelfLife}
                            </span>
                          </div>
                        )}
                        
                        {product.reheatInstructions && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-800">
                              <span className="font-medium">Reheat:</span> {product.reheatInstructions}
                            </span>
                          </div>
                        )}
                        
                        {product.serveInstructions && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-800">
                              <span className="font-medium">Serve:</span> {product.serveInstructions}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Policies */}
                  {(product.cancellationPolicy || product.customOrderRules) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Policies & Rules</h3>
                      <div className="space-y-4">
                        {product.cancellationPolicy && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                              <h4 className="font-medium text-orange-900">Cancellation Policy</h4>
                            </div>
                            <p className="text-sm text-orange-800 mb-2">
                              Cancellation window: <span className="font-medium">{product.cancellationPolicy.window}</span>
                            </p>
                            <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                              {product.cancellationPolicy.rules.map((rule, index) => (
                                <li key={index}>{rule}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {product.customOrderRules && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Settings className="w-4 h-4 text-blue-600" />
                              <h4 className="font-medium text-blue-900">Custom Order Rules</h4>
                            </div>
                            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                              {product.customOrderRules.map((rule, index) => (
                                <li key={index}>{rule}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cross-Sells */}
                  {(product.frequentlyBoughtTogether || product.pairsWith || product.fromThisVendor) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">You Might Also Like</h3>
                      <div className="space-y-4">
                        {product.frequentlyBoughtTogether && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Package className="w-4 h-4 text-green-600" />
                              <h4 className="font-medium text-green-900">Frequently Bought Together</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {product.frequentlyBoughtTogether.map((item, index) => (
                                <span key={index} className="px-3 py-1 bg-white text-green-700 text-sm rounded-full border border-green-200">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {product.pairsWith && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Heart className="w-4 h-4 text-purple-600" />
                              <h4 className="font-medium text-purple-900">Pairs With</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {product.pairsWith.map((item, index) => (
                                <span key={index} className="px-3 py-1 bg-white text-purple-700 text-sm rounded-full border border-purple-200">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {product.fromThisVendor && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Store className="w-4 h-4 text-blue-600" />
                              <h4 className="font-medium text-blue-900">From This Vendor</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {product.fromThisVendor.map((item, index) => (
                                <span key={index} className="px-3 py-1 bg-white text-blue-700 text-sm rounded-full border border-blue-200">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Q&A Section */}
                  {product.questions && product.questions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Questions & Answers</h3>
                      <div className="space-y-4">
                        {product.questions.map((qa) => (
                          <div key={qa.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <HelpCircle className="w-4 h-4 text-gray-600" />
                                <h4 className="font-medium text-gray-900">{qa.question}</h4>
                              </div>
                              {qa.answer && (
                                <div className="ml-6">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">Answer from {qa.answeredBy}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{qa.answer}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>{qa.date}</span>
                                    <button className="flex items-center gap-1 hover:text-gray-700">
                                      <ThumbsUp className="w-3 h-3" />
                                      Helpful ({qa.helpful})
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Origin Story</h3>
                    <p className="text-gray-700 leading-relaxed">{product.originStory}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Usage Tips</h3>
                      <p className="text-gray-700 leading-relaxed">{product.usageTips}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Storage Tips</h3>
                      <p className="text-gray-700 leading-relaxed">{product.storageTips}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Personal Notes</h3>
                    <p className="text-gray-700 leading-relaxed">{product.personalNotes}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'fulfillment' && (
                <motion.div
                  key="fulfillment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pickup Locations</h3>
                    <div className="space-y-4">
                      {product.availability.locations.map((location, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-brand-green mt-1" />
                            <div>
                              <h4 className="font-medium">{location.name}</h4>
                              <p className="text-gray-600">{location.address}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Delivery Areas</h3>
                    <p className="text-gray-700">We deliver to the following areas: Locust Grove, McDonough, Hampton, Stockbridge</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
                    <p className="text-gray-700">Currently, we do not offer shipping for this product. Please choose pickup or local delivery options.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        {renderStars(product.rating)}
                        <span className="ml-2 font-semibold">{product.rating}</span>
                      </div>
                      <span className="text-gray-600">({product.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start gap-3 mb-3">
                          {review.userAvatar && (
                            <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                              {review.isVerified && (
                                <CheckCircle className="w-4 h-4 text-blue-500" title="Verified Customer" />
                              )}
                              {review.isVerifiedPurchase && (
                                <Shield className="w-4 h-4 text-green-500" title="Verified Purchase" />
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
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.photos.map((photo, index) => (
                              <img key={index} src={photo} alt={`Review photo ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img src={rec.imageUrl} alt={rec.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{rec.vendor.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-maroon">${rec.price.toFixed(2)}</span>
                      <button className="text-sm text-brand-green hover:text-brand-green/80">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={product.images[currentImageIndex]}
                alt={product.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ask the Artisan</h3>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Have a question about {product.title}? Send a direct message to {product.vendor.name}.
                </p>
                <textarea
                  placeholder="Type your message here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  rows={4}
                />
                <button className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors">
                  Send Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back in Stock Modal */}
      <AnimatePresence>
        {showBackInStockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBackInStockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Back in Stock Notification</h3>
                <button
                  onClick={() => setShowBackInStockModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Get notified when {product.title} is back in stock.
                </p>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <button className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors">
                  Notify Me
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
