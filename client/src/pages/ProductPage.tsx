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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewBlock } from '../components/vendor';

interface Product {
  id: string;
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
    description: string;
    joinedDate: string;
    totalProducts: number;
  };
  category: string;
  subcategory: string;
  images: string[];
  tags: string[];
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  pickupOptions: string[];
  deliveryOptions: string[];
  allergens: string[];
  dietary: string[];
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
  weight: string;
  dimensions: string;
  createdAt: string;
  updatedAt: string;
  isBestseller: boolean;
  isLowStock: boolean;
  isNew: boolean;
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

export default function ProductPage() {
  const params = useParams();
  const productId = (params as { id?: string })?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'description' | 'reviews' | 'nutrition' | 'vendor'>('description');
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Generate different products based on productId
    const getProductData = (id: string): Product => {
      const products: { [key: string]: Product } = {
        'sourdough-bread': {
          id: 'sourdough-bread',
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
            description: 'Artisanal bakery specializing in naturally leavened breads and pastries.',
            joinedDate: '2018-03-15',
            totalProducts: 24
          },
          category: 'Bread',
          subcategory: 'Sourdough',
          images: [
            '/images/products/sourdough-1.jpg',
            '/images/products/sourdough-2.jpg',
            '/images/products/sourdough-3.jpg',
            '/images/products/sourdough-4.jpg'
          ],
          tags: ['organic', 'sourdough', 'artisan', 'fresh', 'naturally leavened'],
          inStock: true,
          featured: true,
          rating: 4.9,
          reviewCount: 89,
          pickupOptions: ['Same Day', 'Next Day'],
          deliveryOptions: ['Local Delivery'],
          allergens: ['wheat', 'gluten'],
          dietary: ['vegan'],
          ingredients: ['Organic wheat flour', 'Filtered water', 'Sea salt', 'Sourdough starter'],
          nutritionInfo: {
            calories: 120,
            protein: 4,
            carbs: 25,
            fat: 1,
            fiber: 2
          },
          storageInstructions: 'Store in a cool, dry place. For best results, consume within 3-5 days. Can be frozen for up to 3 months.',
          shelfLife: '3-5 days at room temperature, 3 months frozen',
          weight: '1 lb',
          dimensions: '8" x 4" x 3"',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          isBestseller: true,
          isLowStock: false,
          isNew: false
        },
        'chocolate-croissant': {
          id: 'chocolate-croissant',
          name: 'Chocolate Croissant',
          description: 'Buttery, flaky croissant filled with rich dark chocolate. Perfect for breakfast or dessert.',
          longDescription: `Our chocolate croissants are made with premium European butter and filled with the finest Belgian dark chocolate. Each croissant is hand-rolled and proofed to perfection, creating the signature flaky layers that make these pastries so irresistible.

The chocolate filling is made from 70% dark chocolate, providing a perfect balance of sweetness and richness. These croissants are baked fresh daily and are best enjoyed warm.`,
          price: 4.50,
          originalPrice: 6.00,
          vendor: {
            id: 'v2',
            name: 'Parisian Patisserie',
            rating: 4.8,
            reviewCount: 95,
            location: 'Atlanta, GA',
            verified: true,
            description: 'Authentic French pastries and baked goods made with traditional techniques.',
            joinedDate: '2019-06-10',
            totalProducts: 18
          },
          category: 'Pastries',
          subcategory: 'Croissants',
          images: [
            '/images/products/chocolate-croissant-1.jpg',
            '/images/products/chocolate-croissant-2.jpg'
          ],
          tags: ['chocolate', 'croissant', 'buttery', 'flaky', 'french'],
          inStock: true,
          featured: false,
          rating: 4.8,
          reviewCount: 67,
          pickupOptions: ['Same Day'],
          deliveryOptions: ['Local Delivery'],
          allergens: ['wheat', 'gluten', 'dairy', 'eggs'],
          dietary: [],
          ingredients: ['Flour', 'Butter', 'Dark chocolate', 'Yeast', 'Sugar', 'Salt'],
          nutritionInfo: {
            calories: 320,
            protein: 6,
            carbs: 28,
            fat: 22,
            fiber: 2
          },
          storageInstructions: 'Best consumed fresh. Can be stored at room temperature for 1 day or frozen for up to 2 weeks.',
          shelfLife: '1 day at room temperature, 2 weeks frozen',
          weight: '3.5 oz',
          dimensions: '6" x 3" x 1.5"',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10',
          isBestseller: false,
          isLowStock: false,
          isNew: false
        },
        'whole-wheat-bread': {
          id: 'whole-wheat-bread',
          name: 'Whole Wheat Bread',
          description: 'Nutritious whole wheat bread with a hearty texture and nutty flavor.',
          longDescription: `Our whole wheat bread is made with 100% whole grain flour, providing maximum nutrition and fiber. This hearty bread has a dense, chewy texture and a nutty flavor that pairs perfectly with both sweet and savory toppings.

Made with organic whole wheat flour, this bread is packed with fiber, protein, and essential nutrients. It's perfect for sandwiches, toast, or simply enjoyed with butter.`,
          price: 7.50,
          vendor: {
            id: 'v1',
            name: 'Rose Creek Bakery',
            rating: 4.9,
            reviewCount: 127,
            location: 'Locust Grove, GA',
            verified: true,
            description: 'Artisanal bakery specializing in naturally leavened breads and pastries.',
            joinedDate: '2018-03-15',
            totalProducts: 24
          },
          category: 'Bread',
          subcategory: 'Whole Wheat',
          images: [
            '/images/products/whole-wheat-bread-1.jpg',
            '/images/products/whole-wheat-bread-2.jpg'
          ],
          tags: ['whole grain', 'healthy', 'nutritious', 'fiber-rich'],
          inStock: true,
          featured: false,
          rating: 4.7,
          reviewCount: 45,
          pickupOptions: ['Same Day', 'Next Day'],
          deliveryOptions: ['Local Delivery'],
          allergens: ['wheat', 'gluten'],
          dietary: ['vegan'],
          ingredients: ['Organic whole wheat flour', 'Water', 'Sea salt', 'Yeast'],
          nutritionInfo: {
            calories: 100,
            protein: 5,
            carbs: 20,
            fat: 1,
            fiber: 4
          },
          storageInstructions: 'Store in a cool, dry place. Consume within 5-7 days. Can be frozen for up to 3 months.',
          shelfLife: '5-7 days at room temperature, 3 months frozen',
          weight: '1.5 lb',
          dimensions: '9" x 5" x 4"',
          createdAt: '2024-01-08',
          updatedAt: '2024-01-08',
          isBestseller: false,
          isLowStock: false,
          isNew: false
        }
      };
      
      return products[id] || products['sourdough-bread'];
    };

    const mockProduct = getProductData(productId || 'sourdough-bread');

    const mockReviews: Review[] = [
      {
        id: '1',
        userId: 'u1',
        userName: 'Sarah M.',
        rating: 5,
        title: 'Best sourdough I\'ve ever had',
        comment: 'The sourdough bread is absolutely incredible. Perfect crust and tangy flavor. It\'s become a weekly must-buy for our family. The texture is perfect and it stays fresh for days.',
        date: '2024-01-18',
        helpful: 12,
        productId: '1',
        productName: 'Artisan Sourdough Bread'
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Michael R.',
        rating: 5,
        title: 'Amazing quality and taste',
        comment: 'This sourdough is everything you want in artisan bread. The crust is perfectly crispy and the inside is soft and flavorful. Highly recommend!',
        date: '2024-01-16',
        helpful: 8,
        productId: '1',
        productName: 'Artisan Sourdough Bread'
      },
      {
        id: '3',
        userId: 'u3',
        userName: 'Jennifer L.',
        rating: 4,
        title: 'Great quality, friendly service',
        comment: 'Love the sourdough bread. The quality is excellent and the staff is always so friendly. The bread has a nice tangy flavor and perfect texture.',
        date: '2024-01-14',
        helpful: 5,
        productId: '1',
        productName: 'Artisan Sourdough Bread'
      }
    ];

    const mockRelatedProducts: Product[] = [
      {
        id: '2',
        name: 'Whole Wheat Sourdough',
        description: 'Nutritious whole wheat sourdough with a hearty texture.',
        longDescription: '',
        price: 10.00,
        vendor: mockProduct.vendor,
        category: 'Bread',
        subcategory: 'Whole Wheat',
        images: ['/images/products/whole-wheat-sourdough.jpg'],
        tags: ['whole grain', 'healthy'],
        inStock: true,
        featured: false,
        rating: 4.7,
        reviewCount: 67,
        pickupOptions: ['Same Day'],
        deliveryOptions: ['Local Delivery'],
        allergens: ['wheat', 'gluten'],
        dietary: ['vegan'],
        ingredients: [],
        nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        storageInstructions: '',
        shelfLife: '',
        weight: '1 lb',
        dimensions: '',
        createdAt: '2024-01-12',
        updatedAt: '2024-01-12',
        isBestseller: false,
        isLowStock: false,
        isNew: false
      }
    ];

    setProduct(mockProduct);
    setReviews(mockReviews);
    setRelatedProducts(mockRelatedProducts);
    setLoading(false);
  }, [productId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  const addToCart = () => {
    // TODO: Implement add to cart functionality
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

  const handleHelpfulClick = (reviewId: string) => {
    // TODO: Implement helpful voting
    console.log(`Marking review ${reviewId} as helpful`);
  };

  if (loading) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="responsive-heading text-gray-900 mb-2">Product not found</h2>
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
        <div className="container-responsive py-4">
          <div className="flex items-center gap-2 responsive-text text-gray-600">
            <Link href="/marketplace" className="hover:text-brand-green">Marketplace</Link>
            <span>/</span>
            <Link href={`/marketplace?category=${product.category}`} className="hover:text-brand-green">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
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
                  <span className="bg-brand-maroon text-white px-2 py-1 rounded text-xs font-medium">
                    Bestseller
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    New
                  </span>
                )}
                {product.isLowStock && (
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Low Stock
                  </span>
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
                      alt={`${product.name} ${index + 1}`}
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
              <h1 className="responsive-heading text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                  <span className="ml-2 responsive-text text-gray-600">({product.reviewCount} reviews)</span>
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
                <span className="responsive-heading text-brand-maroon">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full responsive-text font-medium ${
                product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
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
                    title="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="responsive-button responsive-subheading">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                    title="Increase quantity"
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
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className="w-full bg-brand-green text-white py-3 px-6 rounded-lg font-medium hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart - ${(product.price * quantity).toFixed(2)}
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
                  <span className="responsive-text text-gray-600">({product.vendor.reviewCount})</span>
                </div>
              </div>
              <div className="flex items-center gap-4 responsive-text text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {product.vendor.location}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {product.vendor.totalProducts} products
                </div>
              </div>
            </div>

            {/* Pickup & Delivery */}
            <div className="bg-brand-cream p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Pickup & Delivery</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-green" />
                  <span>Pickup: {product.pickupOptions.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-green" />
                  <span>Delivery: {product.deliveryOptions.join(', ')}</span>
                </div>
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
                  onClick={() => setSelectedTab(tab.id as 'description' | 'reviews' | 'nutrition' | 'vendor')}
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
                        <div><strong>Dimensions:</strong> {product.dimensions}</div>
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
                    <button className="bg-brand-green text-white responsive-button rounded-lg hover:bg-brand-green/80 transition-colors">
                      Write a Review
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reviews.map(review => (
                      <ReviewBlock 
                        key={review.id} 
                        review={review} 
                        onHelpfulClick={handleHelpfulClick}
                      />
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
                        <p className="responsive-text text-gray-600">Serving Size: 1 slice (30g)</p>
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
                          <h3 className="responsive-subheading">{product.vendor.name}</h3>
                          {product.vendor.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                        </div>
                        <p className="text-gray-600 mb-3">{product.vendor.description}</p>
                        <div className="flex items-center gap-4 responsive-text text-gray-500">
                          <div className="flex items-center gap-1">
                            {renderStars(product.vendor.rating)}
                            <span>({product.vendor.reviewCount})</span>
                          </div>
                          <span>â€¢</span>
                          <span>{product.vendor.totalProducts} products</span>
                          <span>â€¢</span>
                          <span>Member since {new Date(product.vendor.joinedDate).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Link
                        href={`/vendor/${product.vendor.id}`}
                        className="bg-brand-green text-white responsive-button rounded-lg hover:bg-brand-green/80 transition-colors"
                      >
                        View Store
                      </Link>
                      <button className="bg-gray-100 text-gray-700 responsive-button rounded-lg hover:bg-gray-200 transition-colors">
                        Contact Vendor
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="responsive-heading text-gray-900 mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{relatedProduct.name}</h4>
                    <p className="responsive-text text-gray-600 mb-3">{relatedProduct.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-brand-maroon">${relatedProduct.price.toFixed(2)}</span>
                      <Link
                        href={`/product/${relatedProduct.id}`}
                        className="bg-brand-green text-white px-3 py-1 rounded text-sm hover:bg-brand-green/80 transition-colors"
                      >
                        View
                      </Link>
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
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                    title="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                    title="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white responsive-button rounded-full text-sm">
                {currentImageIndex + 1} of {product.images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
