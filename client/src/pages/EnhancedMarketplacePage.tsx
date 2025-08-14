'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import SmartDiscoveryEngine from '../components/marketplace/SmartDiscoveryEngine';
import AISearchEngine from '../components/marketplace/AISearchEngine';
import MultiVendorCart from '../components/marketplace/MultiVendorCart';
import AIProductDiscovery from '../components/marketplace/AIProductDiscovery';

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
  personalizationScore?: number;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  fulfillmentType: 'pickup' | 'delivery' | 'event';
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryFee?: number;
  deliveryInstructions?: string;
  maxQuantity?: number;
  stockLevel: number;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  location: string;
  vendorIds: string[];
  description: string;
}

interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

interface AISuggestion {
  id: string;
  type: 'search' | 'category' | 'bundle' | 'trending' | 'personalized';
  title: string;
  description: string;
  query: string;
  icon: string;
  confidence: number;
  category?: string;
}

export default function EnhancedMarketplacePage() {
  const [location] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userZip, setUserZip] = useState('30248');
  const [discoveryMode, setDiscoveryMode] = useState('zip-first');
  const [maxDistance, setMaxDistance] = useState(25);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [currentSearch, setCurrentSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);

  // Mock data
  const events: EventData[] = [
    {
      id: 'event1',
      name: 'Downtown Farmers Market',
      date: '2024-08-17',
      location: 'Downtown McDonough',
      vendorIds: ['vendor1', 'vendor2'],
      description: 'Weekly farmers market with local artisans'
    },
    {
      id: 'event2',
      name: 'Artisan Food Festival',
      date: '2024-08-24',
      location: 'City Park',
      vendorIds: ['vendor1', 'vendor3'],
      description: 'Annual celebration of local food artisans'
    }
  ];

  const userPreferences = {
    dietaryFlags: ['vegan', 'gluten-free'],
    favoriteCategories: ['Bread', 'Pastries'],
    favoriteVendors: ['vendor1'],
    pastPurchases: ['prod1', 'prod2'],
    budget: 50
  };

  // Load marketplace data
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
            allergens: ['nuts'],
            ingredients: ['almond flour', 'dark chocolate', 'coconut oil', 'maple syrup'],
            macros: { calories: 180, protein: 4, carbs: 20, fat: 12 },
            stockLevel: 12,
            maxStock: 15,
            pickupLocations: ['Health Food Store'],
            deliveryZones: ['30248', '30249', '30250'],
            fulfillmentTypes: ['pickup', 'delivery'],
            prepInstructions: 'Ready to eat',
            storageInstructions: 'Store in refrigerator for up to 1 week',
            rating: 4.7,
            reviewCount: 56,
            isVerified: true,
            isFavorite: false,
            distance: 3.1,
            frequentlyBoughtWith: ['prod1', 'prod5'],
            personalizationScore: 0.92
          }
        ];

        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setIsLoading(false);
      }, 1000);
    };

    loadMarketplaceData();
  }, []);

  // Apply filters based on discovery mode and search
  useEffect(() => {
    let filtered = products;

    // Apply discovery mode filters
    if (discoveryMode === 'near-me') {
      filtered = filtered.filter(product => 
        product.distance && product.distance <= maxDistance
      );
    } else if (discoveryMode === 'event-aware' && selectedEvent) {
      const event = events.find(e => e.id === selectedEvent);
      if (event) {
        filtered = filtered.filter(product => 
          event.vendorIds.includes(product.vendorId)
        );
      }
    }

    // Apply search filter
    if (currentSearch) {
      const searchLower = currentSearch.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.vendorName.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredProducts(filtered);
  }, [products, discoveryMode, maxDistance, selectedEvent, currentSearch]);

  // Cart management functions
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCartItems(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        vendorLogo: product.vendorLogo,
        fulfillmentType: 'pickup',
        stockLevel: product.stockLevel,
        maxQuantity: product.maxStock
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartFulfillment = (vendorId: string, fulfillmentType: 'pickup' | 'delivery' | 'event') => {
    setCartItems(prev => prev.map(item =>
      item.vendorId === vendorId ? { ...item, fulfillmentType } : item
    ));
  };

  const updatePickupLocation = (vendorId: string, locationId: string) => {
    setCartItems(prev => prev.map(item =>
      item.vendorId === vendorId ? { ...item, pickupLocation: locationId } : item
    ));
  };

  const updatePickupDate = (vendorId: string, date: string) => {
    setCartItems(prev => prev.map(item =>
      item.vendorId === vendorId ? { ...item, pickupDate: date } : item
    ));
  };

  const updatePickupTime = (vendorId: string, time: string) => {
    setCartItems(prev => prev.map(item =>
      item.vendorId === vendorId ? { ...item, pickupTime: time } : item
    ));
  };

  const updateDeliveryInstructions = (vendorId: string, instructions: string) => {
    setCartItems(prev => prev.map(item =>
      item.vendorId === vendorId ? { ...item, deliveryInstructions: instructions } : item
    ));
  };

  // Search functions
  const handleSearch = (query: string) => {
    setCurrentSearch(query);
    const searchRecord: SearchHistory = {
      query,
      timestamp: new Date(),
      resultCount: filteredProducts.length
    };
    setSearchHistory(prev => [searchRecord, ...prev.slice(0, 9)]);
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    setCurrentSearch(suggestion.query);
    handleSearch(suggestion.query);
  };

  // Product interaction functions
  const handleProductClick = (product: Product) => {
    // Navigate to product detail page or show modal
    console.log('Product clicked:', product);
  };

  const toggleFavorite = (productId: string) => {
    setProducts(prev => prev.map(product =>
      product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
    ));
  };

  const proceedToCheckout = () => {
    // Navigate to checkout page
    console.log('Proceeding to checkout with items:', cartItems);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Smart Discovery Engine */}
      <SmartDiscoveryEngine
        userZip={userZip}
        onZipChange={setUserZip}
        onDiscoveryModeChange={setDiscoveryMode}
        onDistanceChange={setMaxDistance}
        onEventFilterChange={setSelectedEvent}
        events={events}
        maxDistance={maxDistance}
      />

      {/* AI Search Engine */}
      <AISearchEngine
        onSearch={handleSearch}
        onSuggestionClick={handleSuggestionClick}
        searchHistory={searchHistory}
        userPreferences={userPreferences}
      />

      {/* AI Product Discovery */}
      {showAIRecommendations && (
        <AIProductDiscovery
          userZip={userZip}
          userPreferences={userPreferences}
          onProductClick={handleProductClick}
          onAddToCart={addToCart}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Main Product Grid */}
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
                {currentSearch && (
                  <p className="text-gray-600">Searching for "{currentSearch}"</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAIRecommendations(!showAIRecommendations)}
                  className="text-sm text-brand-green hover:text-brand-green/80"
                >
                  {showAIRecommendations ? 'Hide' : 'Show'} AI Recommendations
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product)}
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
                        toggleFavorite(product.id);
                      }}
                      className={`absolute top-2 right-2 p-1 rounded-full ${
                        product.isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-400 hover:text-red-500'
                      }`}
                      aria-label={product.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg className="w-4 h-4" fill={product.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      </div>
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
                        <span className="text-blue-500 text-xs">✓ Verified</span>
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

                    {/* Price and Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{product.rating}</span>
                        <span>({product.reviewCount})</span>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      <div className={`text-sm font-medium ${
                        product.stockLevel === 0 ? 'text-red-600' :
                        product.stockLevel <= 3 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {product.stockLevel === 0 ? 'Out of Stock' :
                         product.stockLevel <= 3 ? `Only ${product.stockLevel} left` : 'In Stock'}
                      </div>
                      {product.nextBatchDate && (
                        <div className="text-xs text-gray-500">
                          Next batch: {product.nextBatchDate}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
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

            {/* No Results */}
            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setCurrentSearch('');
                    setDiscoveryMode('zip-first');
                    setSelectedEvent(null);
                  }}
                  className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Multi-Vendor Cart */}
      <MultiVendorCart
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onUpdateFulfillment={updateCartFulfillment}
        onUpdatePickupLocation={updatePickupLocation}
        onUpdatePickupDate={updatePickupDate}
        onUpdatePickupTime={updatePickupTime}
        onUpdateDeliveryInstructions={updateDeliveryInstructions}
        onProceedToCheckout={proceedToCheckout}
      />
    </div>
  );
}
