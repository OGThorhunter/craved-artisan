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
  Package as PackageIcon
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
    }>;
  };
  metadata: {
    sku: string;
    batchNumber?: string;
    ingredientCost?: number;
    recipeId?: string;
  };
  createdAt: string;
  updatedAt: string;
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
  const [activeTab, setActiveTab] = useState<'description' | 'fulfillment' | 'reviews'>('description');
  const [wishlist, setWishlist] = useState(false);
  const [showBackInStockModal, setShowBackInStockModal] = useState(false);

  if (!productId) return <div>Missing product id.</div>;

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
        avatar: '/images/vendors/rosecreek-avatar.jpg'
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
            coordinates: { lat: 33.3467, lng: -84.1091 }
          }
        ]
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

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-brand-maroon">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.originalPrice && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
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

            {/* Macros & Allergens */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Nutrition (per serving)</h4>
                {product.macros.calories && <p className="text-sm text-gray-600">Calories: {product.macros.calories}</p>}
                {product.macros.protein && <p className="text-sm text-gray-600">Protein: {product.macros.protein}g</p>}
                {product.macros.carbs && <p className="text-sm text-gray-600">Carbs: {product.macros.carbs}g</p>}
                {product.macros.fat && <p className="text-sm text-gray-600">Fat: {product.macros.fat}g</p>}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Allergens</h4>
                {product.allergens.map((allergen, index) => (
                  <p key={index} className="text-sm text-gray-600">{allergen}</p>
                ))}
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
