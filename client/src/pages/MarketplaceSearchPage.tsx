import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  List,
  Map,
  Heart,
  Star,
  Package,
  X,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

// Types
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
  vendor: {
    id: string;
    storeName: string;
    slug: string;
    avatarUrl?: string;
    city?: string;
    state?: string;
    ratingAvg: number;
    ratingCount: number;
  };
  pickup: boolean;
  delivery: boolean;
  ship: boolean;
  availableNow: boolean;
  distance?: number;
}

interface Facets {
  categories: Array<{ category: string; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  tags: Array<{ tag: string; count: number }>;
  fulfillment: Array<{ type: string; count: number }>;
  ratings: Array<{ rating: number; count: number }>;
  cities: Array<{ city: string; count: number }>;
  states: Array<{ state: string; count: number }>;
}

interface SearchMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tookMs: number;
  expandedRadius: boolean;
}

const MarketplaceSearchPage: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Parse search params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const [searchParams, setSearchParams] = useState({
    q: urlParams.get('q') || '',
    category: urlParams.get('category') || '',
    subcategory: urlParams.get('subcategory') || '',
    priceMin: urlParams.get('priceMin') || '',
    priceMax: urlParams.get('priceMax') || '',
    tags: urlParams.get('tags') || '',
    dietary: urlParams.get('dietary') || '',
    fulfillment: urlParams.get('fulfillment') || '',
    availability: urlParams.get('availability') || '',
    myVendors: urlParams.get('myVendors') === 'true',
    favorites: urlParams.get('favorites') === 'true',
    rating: urlParams.get('rating') === 'true',
    newest: urlParams.get('newest') === 'true',
    onSale: urlParams.get('onSale') === 'true',
    location: urlParams.get('location') || '',
    sort: urlParams.get('sort') || 'relevance',
    view: urlParams.get('view') || 'list',
    map: urlParams.get('map') === 'true',
    lat: urlParams.get('lat') || '',
    lng: urlParams.get('lng') || '',
    radius: urlParams.get('radius') || '25',
    page: urlParams.get('page') || '1',
    pageSize: urlParams.get('pageSize') || '20',
  });
  
  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Search parameters
  const query = searchParams.q;
  const page = parseInt(searchParams.page);
  const categories = searchParams.category.split(',').filter(Boolean);
  const priceMin = searchParams.priceMin;
  const priceMax = searchParams.priceMax;
  const tags = searchParams.tags.split(',').filter(Boolean);
  const fulfillment = searchParams.fulfillment.split(',').filter(Boolean);
  const vendorsOnly = searchParams.myVendors;
  const favoritesOnly = searchParams.favorites;
  const openNow = searchParams.availability === 'now';
  const sort = searchParams.sort;
  const national = false; // TODO: Add national to searchParams
  const myVendors = searchParams.myVendors;
  const lat = searchParams.lat;
  const lng = searchParams.lng;
  const radius = searchParams.radius;

  // Get user location
  useEffect(() => {
    if (navigator.geolocation && !lat && !lng) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [lat, lng]);

  // Build search parameters
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (page > 1) params.append('page', page.toString());
    if (categories.length > 0) params.append('categories', categories.join(','));
    if (priceMin) params.append('priceMin', priceMin);
    if (priceMax) params.append('priceMax', priceMax);
    if (tags.length > 0) params.append('tags', tags.join(','));
    if (fulfillment.length > 0) params.append('fulfillment', fulfillment.join(','));
    if (vendorsOnly) params.append('vendorsOnly', 'true');
    if (favoritesOnly) params.append('favoritesOnly', 'true');
    if (openNow) params.append('openNow', 'true');
    if (sort !== 'relevance') params.append('sort', sort);
    if (national) params.append('national', 'true');
    if (myVendors) params.append('myVendors', 'true');
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    if (radius !== '25') params.append('radius', radius);
    return params;
  };

  // Search query
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['marketplace-search', buildSearchParams().toString()],
    queryFn: async () => {
      const params = buildSearchParams();
      const response = await fetch(`/api/market/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  // Facets query
  const { data: facets } = useQuery({
    queryKey: ['marketplace-facets', buildSearchParams().toString()],
    queryFn: async () => {
      const params = buildSearchParams();
      const response = await fetch(`/api/market/facets?${params}`);
      if (!response.ok) throw new Error('Facets failed');
      return response.json();
    },
  });

  const products: Product[] = searchResults?.products || [];
  const searchMeta: SearchMeta = searchResults?.meta || { total: 0, page: 1, pageSize: 24, totalPages: 0, tookMs: 0, expandedRadius: false };
  const facetsData: Facets = facets || { categories: [], priceRanges: [], tags: [], fulfillment: [], ratings: [], cities: [], states: [] };

  // Update URL parameters
  const updateParams = (updates: Record<string, string | string[] | boolean | null>) => {
    const newParams = new URLSearchParams(window.location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        newParams.set(key, value.join(','));
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    newParams.delete('page'); // Reset to page 1 when filters change
    
    // Update URL and state
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    setLocation(newUrl);
    
    // Update local state
    setSearchParams(prev => ({
      ...prev,
      ...updates,
      page: '1'
    }));
  };

  const handleSearch = (newQuery: string) => {
    updateParams({ q: newQuery });
  };

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    const currentValues = searchParams[filterType as keyof typeof searchParams]?.toString().split(',') || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    updateParams({ [filterType]: newValues });
  };

  const handleSortChange = (newSort: string) => {
    updateParams({ sort: newSort });
  };

  const handleLocationToggle = () => {
    if (national) {
      updateParams({ national: null });
    } else {
      updateParams({ national: 'true' });
    }
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (searchParams.q) newParams.set('q', searchParams.q);
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    setLocation(newUrl);
    
    setSearchParams(prev => ({
      ...prev,
      category: '',
      subcategory: '',
      priceMin: '',
      priceMax: '',
      tags: '',
      dietary: '',
      fulfillment: '',
      availability: '',
      myVendors: false,
      favorites: false,
      rating: false,
      newest: false,
      onSale: false,
      location: '',
      sort: 'relevance',
      view: 'list',
      map: false,
      lat: '',
      lng: '',
      radius: '25',
      page: '1',
      pageSize: '20',
    }));
  };

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return miles < 1 ? `${Math.round(meters)}m` : `${miles.toFixed(1)}mi`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (categories.length > 0) count++;
    if (priceMin || priceMax) count++;
    if (tags.length > 0) count++;
    if (fulfillment.length > 0) count++;
    if (vendorsOnly) count++;
    if (favoritesOnly) count++;
    if (openNow) count++;
    if (myVendors) count++;
    return count;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Error</h2>
          <p className="text-gray-600 mb-4">Something went wrong while searching</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Search Results</h1>
              {searchMeta.total > 0 && (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {searchMeta.total.toLocaleString()} results
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="default" className="ml-1 bg-blue-500 text-white text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-64 flex-shrink-0"
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-sm text-gray-500"
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  {facetsData.categories.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                      <div className="space-y-2">
                        {facetsData.categories.map((category) => (
                          <label key={category.category} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={categories.includes(category.category)}
                              onChange={(e) => handleFilterChange('categories', category.category, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {category.category} ({category.count})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  {facetsData.priceRanges.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                      <div className="space-y-2">
                        {facetsData.priceRanges.map((range) => (
                          <label key={range.range} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={false} // TODO: Implement price range filtering
                              onChange={() => {}} // TODO: Implement price range filtering
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {range.range} ({range.count})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fulfillment */}
                  {facetsData.fulfillment.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Fulfillment</h4>
                      <div className="space-y-2">
                        {facetsData.fulfillment.map((fulfill) => (
                          <label key={fulfill.type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={fulfillment.includes(fulfill.type)}
                              onChange={(e) => handleFilterChange('fulfillment', fulfill.type, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">
                              {fulfill.type} ({fulfill.count})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {facetsData.tags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                      <div className="space-y-2">
                        {facetsData.tags.slice(0, 10).map((tag) => (
                          <label key={tag.tag} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={tags.includes(tag.tag)}
                              onChange={(e) => handleFilterChange('tags', tag.tag, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {tag.tag} ({tag.count})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Filters */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Special</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={openNow}
                          onChange={(e) => updateParams({ openNow: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Available Now</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={myVendors}
                          onChange={(e) => updateParams({ myVendors: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">My Vendors</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={favoritesOnly}
                          onChange={(e) => updateParams({ favoritesOnly: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Favorites Only</span>
                      </label>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={query}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 w-64"
                    />
                  </div>
                  
                  {/* Active Filters */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge key={category} variant="default" className="bg-blue-100 text-blue-800">
                        {category}
                        <button
                          onClick={() => handleFilterChange('categories', category, false)}
                          className="ml-1 hover:text-blue-600"
                          title="Remove category filter"
                          aria-label={`Remove ${category} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {fulfillment.map((fulfill) => (
                      <Badge key={fulfill} variant="default" className="bg-green-100 text-green-800">
                        {fulfill}
                        <button
                          onClick={() => handleFilterChange('fulfillment', fulfill, false)}
                          className="ml-1 hover:text-green-600"
                          title="Remove fulfillment filter"
                          aria-label={`Remove ${fulfill} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {openNow && (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        Available Now
                        <button
                          onClick={() => updateParams({ openNow: null })}
                          className="ml-1 hover:text-yellow-600"
                          title="Remove available now filter"
                          aria-label="Remove available now filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {myVendors && (
                      <Badge variant="default" className="bg-purple-100 text-purple-800">
                        My Vendors
                        <button
                          onClick={() => updateParams({ myVendors: null })}
                          className="ml-1 hover:text-purple-600"
                          title="Remove my vendors filter"
                          aria-label="Remove my vendors filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {favoritesOnly && (
                      <Badge variant="default" className="bg-red-100 text-red-800">
                        Favorites
                        <button
                          onClick={() => updateParams({ favoritesOnly: null })}
                          className="ml-1 hover:text-red-600"
                          title="Remove favorites filter"
                          aria-label="Remove favorites filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Location Toggle */}
                  <Button
                    variant={national ? "secondary" : "primary"}
                    onClick={handleLocationToggle}
                    className="text-sm"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    {national ? 'National' : 'Near Me'}
                  </Button>

                  {/* Sort */}
                    <select
                      value={sort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Sort by"
                    >
                    <option value="relevance">Relevance</option>
                    <option value="distance">Distance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="rating">Rating</option>
                  </select>

                  {/* View Mode */}
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
                      className="px-3 py-2 rounded-none border-l border-r border-gray-300"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                      onClick={() => setViewMode('map')}
                      className="px-3 py-2 rounded-l-none"
                    >
                      <Map className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search Meta */}
              {searchMeta.total > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      Showing {((page - 1) * searchMeta.pageSize) + 1} to {Math.min(page * searchMeta.pageSize, searchMeta.total)} of {searchMeta.total.toLocaleString()} results
                      {searchMeta.tookMs > 0 && (
                        <span className="ml-2">({searchMeta.tookMs}ms)</span>
                      )}
                    </div>
                    {searchMeta.expandedRadius && (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        Expanded search radius
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {products.map((product) => (
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
                        <p className="text-sm text-gray-600">{product.vendor.storeName}</p>
                        
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
                          {product.distance && (
                            <Badge variant="default" className="text-xs bg-gray-100 text-gray-800">
                              {formatDistance(product.distance)}
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
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {searchMeta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => updateParams({ page: (page - 1).toString() })}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, searchMeta.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'secondary' : 'ghost'}
                      onClick={() => updateParams({ page: pageNum.toString() })}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="ghost"
                  onClick={() => updateParams({ page: (page + 1).toString() })}
                  disabled={page === searchMeta.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSearchPage;
