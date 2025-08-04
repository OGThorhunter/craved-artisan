'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart, 
  ShoppingCart, 
  Clock, 
  Users, 
  Tag,
  Grid,
  List,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  ChevronUp,
  Star as StarFilled
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  vendor: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    location: string;
    verified: boolean;
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
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories: string[];
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  location: string;
  dietary: string[];
  allergens: string[];
  pickupOptions: string[];
  deliveryOptions: string[];
  inStock: boolean;
  featured: boolean;
  verifiedVendors: boolean;
}

export const MarketplacePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100],
    rating: 0,
    location: '',
    dietary: [],
    allergens: [],
    pickupOptions: [],
    deliveryOptions: [],
    inStock: false,
    featured: false,
    verifiedVendors: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<{[key: string]: number}>({});

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Artisan Sourdough Bread',
        description: 'Traditional sourdough bread made with organic flour and natural starter. Perfect crust and tangy flavor.',
        price: 6.50,
        originalPrice: 8.00,
        vendor: {
          id: 'v1',
          name: 'Rustic Bakes',
          rating: 4.8,
          reviewCount: 127,
          location: 'Locust Grove, GA',
          verified: true
        },
        category: 'Baked Goods',
        subcategory: 'Bread',
        images: ['/images/sourdough.jpg'],
        tags: ['organic', 'sourdough', 'artisan', 'fresh'],
        inStock: true,
        featured: true,
        rating: 4.9,
        reviewCount: 89,
        pickupOptions: ['Same Day', 'Next Day'],
        deliveryOptions: ['Local Delivery'],
        allergens: ['wheat', 'gluten'],
        dietary: ['vegetarian'],
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        name: 'Local Raw Honey',
        description: 'Pure, raw honey from local beehives. Unfiltered and unpasteurized for maximum health benefits.',
        price: 12.00,
        vendor: {
          id: 'v2',
          name: 'Sweet Georgia Honey',
          rating: 4.9,
          reviewCount: 203,
          location: 'McDonough, GA',
          verified: true
        },
        category: 'Pantry',
        subcategory: 'Sweeteners',
        images: ['/images/honey.jpg'],
        tags: ['raw', 'local', 'unfiltered', 'natural'],
        inStock: true,
        featured: true,
        rating: 4.9,
        reviewCount: 156,
        pickupOptions: ['Same Day', 'Next Day'],
        deliveryOptions: ['Local Delivery', 'Shipping'],
        allergens: [],
        dietary: ['vegan', 'gluten-free'],
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18'
      },
      {
        id: '3',
        name: 'Fresh Goat Cheese',
        description: 'Handcrafted goat cheese made from local goat milk. Creamy texture with a mild, tangy flavor.',
        price: 8.50,
        vendor: {
          id: 'v3',
          name: 'Dairy Delights',
          rating: 4.7,
          reviewCount: 89,
          location: 'Stockbridge, GA',
          verified: true
        },
        category: 'Dairy',
        subcategory: 'Cheese',
        images: ['/images/goat-cheese.jpg'],
        tags: ['local', 'handcrafted', 'fresh', 'artisan'],
        inStock: true,
        featured: false,
        rating: 4.7,
        reviewCount: 67,
        pickupOptions: ['Same Day'],
        deliveryOptions: ['Local Delivery'],
        allergens: ['milk'],
        dietary: ['vegetarian'],
        createdAt: '2024-01-12',
        updatedAt: '2024-01-19'
      },
      {
        id: '4',
        name: 'Organic Heirloom Tomatoes',
        description: 'Fresh, organic heirloom tomatoes grown without pesticides. Sweet and juicy with rich flavor.',
        price: 4.50,
        vendor: {
          id: 'v4',
          name: 'Green Thumb Gardens',
          rating: 4.6,
          reviewCount: 156,
          location: 'Hampton, GA',
          verified: true
        },
        category: 'Produce',
        subcategory: 'Vegetables',
        images: ['/images/tomatoes.jpg'],
        tags: ['organic', 'heirloom', 'fresh', 'local'],
        inStock: true,
        featured: false,
        rating: 4.6,
        reviewCount: 134,
        pickupOptions: ['Same Day', 'Next Day'],
        deliveryOptions: ['Local Delivery'],
        allergens: [],
        dietary: ['vegan', 'gluten-free'],
        createdAt: '2024-01-14',
        updatedAt: '2024-01-21'
      },
      {
        id: '5',
        name: 'Handmade Soap Bars',
        description: 'Natural handmade soap bars with essential oils. Gentle on skin and eco-friendly packaging.',
        price: 5.00,
        vendor: {
          id: 'v5',
          name: 'Pure Essentials',
          rating: 4.8,
          reviewCount: 234,
          location: 'Griffin, GA',
          verified: true
        },
        category: 'Home & Body',
        subcategory: 'Soap',
        images: ['/images/soap.jpg'],
        tags: ['handmade', 'natural', 'essential oils', 'eco-friendly'],
        inStock: true,
        featured: true,
        rating: 4.8,
        reviewCount: 198,
        pickupOptions: ['Next Day'],
        deliveryOptions: ['Local Delivery', 'Shipping'],
        allergens: [],
        dietary: ['vegan'],
        createdAt: '2024-01-08',
        updatedAt: '2024-01-17'
      }
    ];

    const mockCategories: Category[] = [
      {
        id: 'baked-goods',
        name: 'Baked Goods',
        icon: '🥖',
        count: 45,
        subcategories: ['Bread', 'Pastries', 'Cookies', 'Cakes']
      },
      {
        id: 'produce',
        name: 'Produce',
        icon: '🥬',
        count: 67,
        subcategories: ['Vegetables', 'Fruits', 'Herbs', 'Mushrooms']
      },
      {
        id: 'dairy',
        name: 'Dairy & Eggs',
        icon: '🥛',
        count: 23,
        subcategories: ['Milk', 'Cheese', 'Yogurt', 'Eggs']
      },
      {
        id: 'pantry',
        name: 'Pantry',
        icon: '🍯',
        count: 34,
        subcategories: ['Sweeteners', 'Oils', 'Grains', 'Preserves']
      },
      {
        id: 'meat',
        name: 'Meat & Seafood',
        icon: '🥩',
        count: 28,
        subcategories: ['Beef', 'Pork', 'Chicken', 'Fish']
      },
      {
        id: 'home-body',
        name: 'Home & Body',
        icon: '🧼',
        count: 19,
        subcategories: ['Soap', 'Candles', 'Skincare', 'Cleaning']
      }
    ];

    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
    setCategories(mockCategories);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(product =>
        product.vendor.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Dietary filter
    if (filters.dietary.length > 0) {
      filtered = filtered.filter(product =>
        filters.dietary.some(diet => product.dietary.includes(diet))
      );
    }

    // Allergen filter
    if (filters.allergens.length > 0) {
      filtered = filtered.filter(product =>
        !filters.allergens.some(allergen => product.allergens.includes(allergen))
      );
    }

    // Pickup options filter
    if (filters.pickupOptions.length > 0) {
      filtered = filtered.filter(product =>
        filters.pickupOptions.some(option => product.pickupOptions.includes(option))
      );
    }

    // Delivery options filter
    if (filters.deliveryOptions.length > 0) {
      filtered = filtered.filter(product =>
        filters.deliveryOptions.some(option => product.deliveryOptions.includes(option))
      );
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(product => product.featured);
    }

    // Verified vendors filter
    if (filters.verifiedVendors) {
      filtered = filtered.filter(product => product.vendor.verified);
    }

    // Sort products
    filtered.sort((a, b) => {
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

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters, sortBy, sortOrder]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <StarFilled className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      <div className="relative">
        <img
          src={product.images[0] || '/images/placeholder.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.featured && (
          <div className="absolute top-2 left-2 bg-brand-maroon text-white px-2 py-1 rounded text-xs font-medium">
            Featured
          </div>
        )}
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

        <div className="flex items-center mb-3">
          <Link href={`/vendor/${product.vendor.id}`} className="text-sm text-brand-green hover:underline">
            {product.vendor.name}
          </Link>
          {product.vendor.verified && (
            <span className="ml-1 text-blue-500 text-xs">✓</span>
          )}
          <span className="text-xs text-gray-500 ml-2 flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {product.vendor.location}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-lg font-bold text-brand-maroon">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {tag}
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

  const ProductListItem = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4"
    >
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={product.images[0] || '/images/placeholder.jpg'}
            alt={product.name}
            className="w-32 h-32 object-cover rounded"
          />
          {product.featured && (
            <div className="absolute top-1 left-1 bg-brand-maroon text-white px-2 py-1 rounded text-xs font-medium">
              Featured
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                         <button
               onClick={() => toggleWishlist(product.id)}
               className="p-1 hover:bg-gray-100 rounded transition-colors"
               title={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
             >
              <Heart 
                className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
              />
            </button>
          </div>

          <p className="text-gray-600 mb-3">{product.description}</p>

          <div className="flex items-center mb-3">
            <div className="flex items-center mr-4">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
            </div>
            <Link href={`/vendor/${product.vendor.id}`} className="text-sm text-brand-green hover:underline">
              {product.vendor.name}
            </Link>
            {product.vendor.verified && (
              <span className="ml-1 text-blue-500 text-xs">✓</span>
            )}
            <span className="text-sm text-gray-500 ml-4 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {product.vendor.location}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-xl font-bold text-brand-maroon">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <span className={`text-sm px-2 py-1 rounded ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className="bg-brand-green text-white py-2 px-4 rounded font-medium hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </button>
              <Link
                href={`/product/${product.id}`}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded font-medium hover:bg-gray-200 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600 mt-1">Discover local artisans and their handcrafted products</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search products, vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setFilters(prev => ({
                  ...prev,
                  categories: prev.categories.includes(category.name)
                    ? prev.categories.filter(c => c !== category.name)
                    : [...prev.categories, category.name]
                }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filters.categories.includes(category.name)
                    ? 'bg-brand-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                <span className="text-sm opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                className="lg:w-80 bg-white rounded-lg shadow-md p-6 h-fit lg:sticky lg:top-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                     <button
                     onClick={() => setShowFilters(false)}
                     className="lg:hidden p-1 hover:bg-gray-100 rounded"
                     title="Close filters"
                   >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseFloat(e.target.value) || 0, prev.priceRange[1]]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseFloat(e.target.value) || 100]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          rating: prev.rating === rating ? 0 : rating
                        }))}
                        className={`p-2 rounded ${
                          filters.rating >= rating
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Dietary Preferences</h4>
                  {['vegan', 'vegetarian', 'gluten-free', 'dairy-free'].map(diet => (
                    <label key={diet} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={filters.dietary.includes(diet)}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dietary: e.target.checked
                            ? [...prev.dietary, diet]
                            : prev.dietary.filter(d => d !== diet)
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{diet}</span>
                    </label>
                  ))}
                </div>

                {/* Allergens */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Exclude Allergens</h4>
                  {['wheat', 'gluten', 'milk', 'eggs', 'nuts', 'soy'].map(allergen => (
                    <label key={allergen} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={filters.allergens.includes(allergen)}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          allergens: e.target.checked
                            ? [...prev.allergens, allergen]
                            : prev.allergens.filter(a => a !== allergen)
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{allergen}</span>
                    </label>
                  ))}
                </div>

                {/* Pickup Options */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Pickup Options</h4>
                  {['Same Day', 'Next Day', 'Weekend'].map(option => (
                    <label key={option} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={filters.pickupOptions.includes(option)}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          pickupOptions: e.target.checked
                            ? [...prev.pickupOptions, option]
                            : prev.pickupOptions.filter(o => o !== option)
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Other Filters */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        inStock: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        featured: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured Products</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verifiedVendors}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        verifiedVendors: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Verified Vendors Only</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    categories: [],
                    priceRange: [0, 100],
                    rating: 0,
                    location: '',
                    dietary: [],
                    allergens: [],
                    pickupOptions: [],
                    deliveryOptions: [],
                    inStock: false,
                    featured: false,
                    verifiedVendors: false
                  })}
                  className="w-full mt-6 bg-gray-100 text-gray-700 py-2 px-4 rounded font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
                {Object.values(filters).some(value => 
                  Array.isArray(value) ? value.length > 0 : value !== false && value !== 0 && value !== ''
                ) && (
                  <button
                    onClick={() => setFilters({
                      categories: [],
                      priceRange: [0, 100],
                      rating: 0,
                      location: '',
                      dietary: [],
                      allergens: [],
                      pickupOptions: [],
                      deliveryOptions: [],
                      inStock: false,
                      featured: false,
                      verifiedVendors: false
                    })}
                    className="text-sm text-brand-green hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
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
                     title="Sort products by"
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

            {/* Products Grid/List */}
            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {filteredProducts.map(product => (
                    viewMode === 'grid' ? (
                      <ProductCard key={product.id} product={product} />
                    ) : (
                      <ProductListItem key={product.id} product={product} />
                    )
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        categories: [],
                        priceRange: [0, 100],
                        rating: 0,
                        location: '',
                        dietary: [],
                        allergens: [],
                        pickupOptions: [],
                        deliveryOptions: [],
                        inStock: false,
                        featured: false,
                        verifiedVendors: false
                      });
                    }}
                    className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green/80 transition-colors"
                  >
                    Clear Search & Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage; 