'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Link } from 'wouter';
import {
  Star,
  Heart,
  ShoppingCart,
  MapPin,
  Clock,
  Truck,
  Package,
  Star as StarFilled,
  ChevronLeft,
  ChevronRight,
  Share2,
  CheckCircle,
  Minus,
  Plus,
  X,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../lib/formatters';
import { Badge } from '../../components/shared/Badge';

interface Product {
  id: string;
  title: string;
  name: string;
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
    avatar?: string;
    followers?: number;
    responseTime?: string;
    totalProducts?: number;
  };
  category: string;
  subcategory: string;
  images: string[];
  tags: string[];
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isLowStock?: boolean;
  isNew?: boolean;
  allergens: string[];
  dietary: string[];
  weight: string;
  ingredients: string[];
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  storageInstructions: string;
  shelfLife: string;
  availability: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
    nextPickup: string;
    nextDelivery: string;
  };
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

export default function ProductDetail() {
  const { id: productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'description' | 'reviews' | 'nutrition' | 'vendor'>('description') as unknown as 'description' | 'reviews' | 'nutrition' | 'vendor';
  const [showImageModal, setShowImageModal] = useState(false);

  // Load product data
  useEffect(() => {
    const loadData = async () => {
      if (!productId) return;

      try {
        // TODO: Replace with real API calls once backend is ready
        // const productData = await getProductById(productId);
        
        // Mock data for now
        const mockProduct: Product = {
          id: productId,
          title: 'Artisan Sourdough Bread',
          name: 'Artisan Sourdough Bread',
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
            responseTime: 'Usually responds within 2 hours',
            totalProducts: 24
          },
          category: 'Bread',
          subcategory: 'Sourdough',
          images: [
            '/images/products/sourdough-1.jpg',
            '/images/products/sourdough-2.jpg',
            '/images/products/sourdough-3.jpg',
          ],
          tags: ['organic', 'sourdough', 'artisan', 'fresh'],
          inStock: true,
          featured: true,
          rating: 4.9,
          reviewCount: 89,
          isBestseller: true,
          isLowStock: false,
          isNew: false,
          allergens: ['wheat', 'gluten'],
          dietary: ['vegan'],
          weight: '1 lb',
          ingredients: ['Organic wheat flour', 'Filtered water', 'Sea salt', 'Sourdough starter'],
          nutritionInfo: {
            calories: 120,
            protein: 4,
            carbs: 25,
            fat: 1,
            fiber: 2
          },
          storageInstructions: 'Store in a cool, dry place. For best results, consume within 3-5 days.',
          shelfLife: '3-5 days at room temperature',
          availability: {
            pickup: true,
            delivery: true,
            shipping: false,
            nextPickup: 'Friday 3-5PM',
            nextDelivery: 'Same day or next day'
          },
          createdAt: '2024-01-15'
        };

        const mockReviews: Review[] = [
          {
            id: '1',
            userId: 'u1',
            userName: 'Sarah M.',
            rating: 5,
            title: 'Best sourdough I\'ve ever had',
            comment: 'The sourdough bread is absolutely incredible. Perfect crust and tangy flavor. It\'s become a weekly must-buy for our family.',
            date: '2024-01-18',
            helpful: 12
          },
          {
            id: '2',
            userId: 'u2',
            userName: 'Michael R.',
            rating: 5,
            title: 'Amazing quality and taste',
            comment: 'This sourdough is everything you want in artisan bread. The crust is perfectly crispy and the inside is soft and flavorful.',
            date: '2024-01-16',
            helpful: 8
          }
        ];

        setProduct(mockProduct);
        setReviews(mockReviews);
        setLoading(false);
      } catch (error) {
        console.error('Error loading product:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  const addToCart = () => {
    console.log(`Adding ${quantity} of product ${productId} to cart`);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/marketplace" className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green/80 transition-colors">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/marketplace" className="hover:text-brand-green">Marketplace</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link href={`/marketplace?category=${product.category}`} className="hover:text-brand-green">{product.category}</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900">{product.title || product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[currentImageIndex]}
                alt={product.title || product.name}
                className="w-full h-96 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                    title="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage} 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                    title="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {product.isBestseller && (
                  <Badge variant="default" className="bg-brand-maroon text-white">
                    Bestseller
                  </Badge>
                )}
                {product.isNew && (
                  <Badge variant="success">New</Badge>
                )}
                {product.isLowStock && (
                  <Badge variant="warning">Low Stock</Badge>
                )}
              </div>

              {product.originalPrice && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      index === currentImageIndex ? 'border-brand-green' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title || product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title || product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                  <span className="ml-2 text-sm text-gray-600">({product.reviewCount} reviews)</span>
                </div>
                <Link 
                  href={`/vendor/${product.vendor.id}`} 
                  className="text-sm text-brand-green hover:underline flex items-center gap-1"
                >
                  {product.vendor.name}
                  {product.vendor.verified && <CheckCircle className="w-4 h-4" />}
                </Link>
              </div>
              <p className="text-gray-700 mb-4">{product.description}</p>
            </div>

            {/* Price and Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-brand-maroon">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                )}
              </div>
              <Badge variant={product.inStock ? 'success' : 'error'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Purchase Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-lg border transition-colors ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className="w-full bg-brand-green text-white py-3 px-6 rounded-lg font-medium hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart - {formatCurrency(product.price * quantity)}
              </button>
            </div>

            {/* Vendor Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Link 
                  href={`/vendor/${product.vendor.id}`}
                  className="font-semibold text-gray-900 hover:text-brand-green"
                >
                  {product.vendor.name}
                </Link>
                <div className="flex items-center gap-1">
                  {renderStars(product.vendor.rating)}
                  <span className="text-sm text-gray-600">({product.vendor.reviewCount})</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {product.vendor.location}
                </div>
                {product.vendor.totalProducts && (
                  <>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {product.vendor.totalProducts} products
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fulfillment Options */}
            <div className="bg-brand-cream p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Fulfillment & Delivery</h3>
              <div className="space-y-2 text-sm">
                {product.availability.pickup && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-green" />
                    <span>Pickup: {product.availability.nextPickup}</span>
                  </div>
                )}
                {product.availability.delivery && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-green" />
                    <span>Delivery: {product.availability.nextDelivery}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${product.reviewCount})` },
                { id: 'nutrition', label: 'Nutrition' },
                { id: 'vendor', label: 'Vendor' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-brand-green text-brand-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              {selectedTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About This Product</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.longDescription}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {product.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-brand-green rounded-full"></div>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Product Details</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div><strong>Weight:</strong> {product.weight}</div>
                        <div><strong>Shelf Life:</strong> {product.shelfLife}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Storage Instructions</h4>
                    <p className="text-sm text-gray-700">{product.storageInstructions}</p>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'reviews' && (
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
                    <button className="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors">
                      Write a Review
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                        <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-gray-500">- {review.userName}</span>
                          <button className="text-xs text-gray-500 hover:text-gray-700">
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedTab === 'nutrition' && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Nutrition Facts</h3>
                    <div className="bg-white border rounded-lg p-6 max-w-md">
                      <div className="border-b border-gray-200 pb-2 mb-4">
                        <h4 className="font-semibold">Nutrition Facts</h4>
                        <p className="text-sm text-gray-600">Serving Size: 1 slice (30g)</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Calories</span>
                          <span>{product.nutritionInfo.calories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein</span>
                          <span>{product.nutritionInfo.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbohydrates</span>
                          <span>{product.nutritionInfo.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fat</span>
                          <span>{product.nutritionInfo.fat}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fiber</span>
                          <span>{product.nutritionInfo.fiber}g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Dietary Preferences</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.dietary.map(diet => (
                          <span key={diet} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Allergens</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.allergens.map(allergen => (
                          <span key={allergen} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'vendor' && (
                <motion.div
                  key="vendor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{product.vendor.name}</h3>
                          {product.vendor.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            {renderStars(product.vendor.rating)}
                            <span>({product.vendor.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Link
                        href={`/vendor/${product.vendor.id}`}
                        className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green/80 transition-colors"
                      >
                        View Store
                      </Link>
                      <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        Contact Vendor
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <img
                src={product.images[currentImageIndex]}
                alt={product.title || product.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} of {product.images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

