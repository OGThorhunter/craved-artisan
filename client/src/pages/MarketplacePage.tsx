'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search, MapPin, Filter, Heart, Star, ShoppingCart, Clock, Calendar,
  Users, Tag, Award, Shield, Truck, Package, MessageCircle, Share2,
  ChevronDown, ChevronUp, X, Plus, Minus, Eye, EyeOff, Settings,
  Bell, Gift, TrendingUp, Sparkles, Brain, Zap, Target, ArrowRight,
  ArrowLeft, HelpCircle, Phone, Mail, Camera, QrCode, Receipt, Download, Print,
  Send, Trash, Copy, Lock, DollarSign, Percent, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  category: string;
  tags: string[];
  dietaryFlags: string[];
  allergens: string[];
  ingredients: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  stockLevel: number;
  maxStock: number;
  nextBatchDate?: string;
  pickupLocations: string[];
  deliveryZones: string[];
  fulfillmentTypes: ('pickup' | 'delivery' | 'event')[];
  prepInstructions: string;
  storageInstructions: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFavorite: boolean;
  distance?: number;
  frequentlyBoughtWith: string[];
}

interface Vendor {
  id: string;
  name: string;
  logo: string;
  description: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFavorite: boolean;
  categories: string[];
  tags: string[];
  operatingArea: string[];
  pickupLocations: Array<{
    id: string;
    name: string;
    address: string;
    hours: string;
  }>;
  deliveryZones: string[];
  vacationMode: boolean;
  vacationEndDate?: string;
  featured: boolean;
  distance?: number;
}

interface FilterState {
  search: string;
  category: string;
  dietaryFlags: string[];
  allergens: string[];
  priceRange: [number, number];
  distance: number;
  fulfillmentType: 'all' | 'pickup' | 'delivery' | 'event';
  rating: number;
  verifiedOnly: boolean;
  inStockOnly: boolean;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'newest';
}

interface AISuggestion {
  id: string;
  type: 'search' | 'category' | 'bundle' | 'trending';
  title: string;
  description: string;
  query: string;
  icon: string;
}

export default function MarketplacePage() {
  const [location] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    dietaryFlags: [],
    allergens: [],
    priceRange: [0, 100],
    distance: 25,
    fulfillmentType: 'all',
    rating: 0,
    verifiedOnly: false,
    inStockOnly: false,
    sortBy: 'relevance'
  });
  const [userZip, setUserZip] = useState('30248');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [collections, setCollections] = useState<Array<{
    id: string;
    name: string;
    description: string;
    products: Product[];
    seasonal: boolean;
    endDate?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadMarketplaceData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
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
            allergens: ['wheat', 'gluten'],
            ingredients: ['organic flour', 'water', 'salt', 'sourdough starter'],
            macros: { calories: 120, protein: 4, carbs: 25, fat: 1 },
            stockLevel: 15,
            maxStock: 20,
            pickupLocations: ['Downtown Market'],
            deliveryZones: ['30248', '30249'],
            fulfillmentTypes: ['pickup', 'delivery'],
            prepInstructions: 'Best served at room temperature',
            storageInstructions: 'Store in a cool, dry place for up to 5 days',
            rating: 4.8,
            reviewCount: 127,
            isVerified: true,
            isFavorite: false,
            distance: 2.3,
            frequentlyBoughtWith: ['prod2', 'prod3']
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
            allergens: ['wheat', 'gluten', 'dairy', 'eggs'],
            ingredients: ['flour', 'butter', 'chocolate', 'eggs', 'milk'],
            macros: { calories: 280, protein: 6, carbs: 32, fat: 16 },
            stockLevel: 8,
            maxStock: 12,
            pickupLocations: ['Sweet Dreams Store'],
            deliveryZones: ['30248'],
            fulfillmentTypes: ['pickup', 'delivery'],
            prepInstructions: 'Warm in oven for 5 minutes for best taste',
            storageInstructions: 'Store in airtight container for up to 3 days',
            rating: 4.6,
            reviewCount: 89,
            isVerified: true,
            isFavorite: true,
            distance: 1.8,
            frequentlyBoughtWith: ['prod1', 'prod4']
          }
        ];

        const mockVendors: Vendor[] = [
          {
            id: 'vendor1',
            name: 'Rose Creek Bakery',
            logo: '/images/rosecreek-logo.jpg',
            description: 'Artisan bread and pastries made with traditional methods',
            rating: 4.8,
            reviewCount: 127,
            isVerified: true,
            isFavorite: false,
            categories: ['Bread', 'Pastries'],
            tags: ['artisan', 'organic', 'traditional'],
            operatingArea: ['30248', '30249', '30250'],
            pickupLocations: [
              {
                id: 'pickup1',
                name: 'Downtown Market',
                address: '123 Main St, McDonough, GA 30248',
                hours: 'Mon-Sat 8AM-6PM'
              }
            ],
            deliveryZones: ['30248', '30249'],
            vacationMode: false,
            featured: true,
            distance: 2.3
          },
          {
            id: 'vendor2',
            name: 'Sweet Dreams Pastry',
            logo: '/images/sweetdreams-logo.jpg',
            description: 'Handcrafted pastries and desserts',
            rating: 4.6,
            reviewCount: 89,
            isVerified: true,
            isFavorite: true,
            categories: ['Pastries', 'Desserts'],
            tags: ['handcrafted', 'gourmet'],
            operatingArea: ['30248', '30249'],
            pickupLocations: [
              {
                id: 'pickup2',
                name: 'Sweet Dreams Store',
                address: '456 Oak Ave, McDonough, GA 30248',
                hours: 'Tue-Sun 7AM-7PM'
              }
            ],
            deliveryZones: ['30248'],
            vacationMode: false,
            featured: false,
            distance: 1.8
          }
        ];

        const mockCollections = [
          {
            id: 'editors-picks',
            name: "Editor's Picks",
            description: 'Hand-selected favorites from our team',
            products: mockProducts.slice(0, 2),
            seasonal: false
          },
          {
            id: 'back-to-school',
            name: 'Back to School Lunch Kits',
            description: 'Perfect packed lunches for busy families',
            products: mockProducts.slice(0, 1),
            seasonal: true,
            endDate: '2024-09-15'
          }
        ];

        const mockSuggestions: AISuggestion[] = [
          {
            id: 'holiday-gifts',
            type: 'search',
            title: 'Holiday Gifts Under $30',
            description: 'Perfect artisan gifts for the food lover',
            query: 'holiday gifts under 30',
            icon: '🎁'
          },
          {
            id: 'snack-packs',
            type: 'category',
            title: 'Snack Packs for Kids',
            description: 'Healthy, portable snacks for busy families',
            query: 'snack packs kids',
            icon: '🍎'
          }
        ];

        setProducts(mockProducts);
        setVendors(mockVendors);
        setCollections(mockCollections);
        setAiSuggestions(mockSuggestions);
        setIsLoading(false);
      }, 1000);
    };

    loadMarketplaceData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.vendorName.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Dietary flags filter
    if (filters.dietaryFlags.length > 0) {
      filtered = filtered.filter(product =>
        filters.dietaryFlags.some(flag => product.dietaryFlags.includes(flag))
      );
    }

    // Allergens filter (exclude)
    if (filters.allergens.length > 0) {
      filtered = filtered.filter(product =>
        !filters.allergens.some(allergen => product.allergens.includes(allergen))
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Distance filter
    if (filters.distance < 25) {
      filtered = filtered.filter(product => 
        product.distance && product.distance <= filters.distance
      );
    }

    // Fulfillment type filter
    if (filters.fulfillmentType !== 'all') {
      filtered = filtered.filter(product =>
        product.fulfillmentTypes.includes(filters.fulfillmentType as any)
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    // Verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(product => product.isVerified);
    }

    // In stock only filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.stockLevel > 0);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'newest':
          return 0; // Would use creation date in real implementation
        default:
          return 0; // Relevance would use AI scoring
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.current) {
      setFilters(prev => ({ ...prev, search: searchRef.current?.value || '' }));
    }
  };

  const handleAISuggestion = (suggestion: AISuggestion) => {
    setFilters(prev => ({ ...prev, search: suggestion.query }));
    if (searchRef.current) {
      searchRef.current.value = suggestion.query;
    }
  };

  const toggleFavorite = (productId: string) => {
    setProducts(prev => prev.map(product =>
      product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
    ));
  };

  const addToCart = (product: Product) => {
    // This would integrate with the cart system
    console.log('Adding to cart:', product);
  };

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

  const getSmartPlaceholder = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Looking for fresh morning bread?';
    if (hour < 17) return 'Need lunch or afternoon treats?';
    return 'Evening artisan delights?';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600">
                Discover artisan vendors in {userZip}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <div className="w-4 h-4 space-y-1">
                    <div className="bg-current rounded-sm h-0.5" />
                    <div className="bg-current rounded-sm h-0.5" />
                    <div className="bg-current rounded-sm h-0.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchRef}
              type="text"
              placeholder={getSmartPlaceholder()}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-green text-white px-4 py-1.5 rounded-md hover:bg-brand-green/90"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Smart Suggestions</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {aiSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleAISuggestion(suggestion)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-colors whitespace-nowrap"
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 text-sm">{suggestion.title}</div>
                    <div className="text-xs text-gray-600">{suggestion.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="Bread">Bread</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                {/* Dietary Flags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                  <div className="space-y-2">
                    {['vegan', 'vegetarian', 'gluten-free', 'dairy-free'].map((flag) => (
                      <label key={flag} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.dietaryFlags.includes(flag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                dietaryFlags: [...prev.dietaryFlags, flag]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                dietaryFlags: prev.dietaryFlags.filter(f => f !== flag)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                        />
                        <span className="text-sm text-gray-700 capitalize">{flag.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseFloat(e.target.value) || 0, prev.priceRange[1]]
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseFloat(e.target.value) || 100]
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="distance">Nearest First</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                      className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-sm text-gray-700">Verified vendors only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                      className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-sm text-gray-700">In stock only</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Curated Collections</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <div key={collection.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h3 className="font-medium text-gray-900">{collection.name}</h3>
                    {collection.seasonal && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                        Seasonal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                  <div className="flex gap-2">
                    {collection.products.slice(0, 3).map((product) => (
                      <img
                        key={product.id}
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredProducts.length} products found
                </h2>
                {filters.search && (
                  <p className="text-gray-600">Searching for "{filters.search}"</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Showing results near {userZip}</span>
                <button
                  onClick={() => {/* Would open location picker */}}
                  className="text-brand-green hover:text-brand-green/80"
                >
                  Change location
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className={viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className={`p-1 rounded-full ${
                          product.isFavorite ? 'text-red-500' : 'text-gray-400'
                        } hover:text-red-500`}
                      >
                        <Heart className={`w-5 h-5 ${product.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Vendor Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={product.vendorLogo}
                        alt={product.vendorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">{product.vendorName}</span>
                      {product.isVerified && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                      {product.distance && (
                        <span className="text-xs text-gray-500">{product.distance} mi</span>
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

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStockStatus(product).color}`}>
                          {getStockStatus(product).text}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{product.rating}</span>
                          <span>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => addToCart(product)}
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

            {/* No Results */}
            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => setFilters({
                    search: '',
                    category: '',
                    dietaryFlags: [],
                    allergens: [],
                    priceRange: [0, 100],
                    distance: 25,
                    fulfillmentType: 'all',
                    rating: 0,
                    verifiedOnly: false,
                    inStockOnly: false,
                    sortBy: 'relevance'
                  })}
                  className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Product Image */}
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full rounded-lg"
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
                    <p className="text-gray-600">{selectedProduct.ingredients.join(', ')}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Nutrition (per serving)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Calories: {selectedProduct.macros.calories}</div>
                      <div>Protein: {selectedProduct.macros.protein}g</div>
                      <div>Carbs: {selectedProduct.macros.carbs}g</div>
                      <div>Fat: {selectedProduct.macros.fat}g</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Allergens</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.allergens.map((allergen) => (
                        <span key={allergen} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      disabled={selectedProduct.stockLevel === 0}
                      className="flex-1 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart - ${selectedProduct.price.toFixed(2)}
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`p-2 rounded-lg border ${
                        selectedProduct.isFavorite ? 'text-red-500 border-red-200' : 'text-gray-400 border-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${selectedProduct.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
