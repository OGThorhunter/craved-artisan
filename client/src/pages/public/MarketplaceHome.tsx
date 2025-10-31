import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Heart, Star, Clock, Package, Filter, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import Button from '../../components/ui/Button';
import { SearchBar } from '../../components/marketplace/SearchBar';
import { CategoryFilter } from '../../components/marketplace/CategoryFilter';
import { Badge } from '../../components/shared/Badge';
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
}

interface SalesWindow {
  id: string;
  name: string;
  type: string;
  address_text?: string;
  fulfill_start_at: string;
  fulfill_end_at: string;
  vendor_id: string;
  vendor_name: string;
  distance_meters: number;
}

interface MarketplaceSection {
  id: string;
  title: string;
  subtitle?: string;
  products: Product[];
  seeAllLink: string;
}

const MarketplaceHome: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
        }
      );
    }
  }, []);

  // Fetch marketplace sections
  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['marketplace-sections', userLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', '25');
      }

      const [nearbyProducts, trendingProducts, nationalProducts, myVendorsProducts] = await Promise.all([
        fetch(`/api/market/search?${params}&openNow=true&pageSize=8`).then(res => res.json()),
        fetch(`/api/market/search?${params}&sort=popular&pageSize=8`).then(res => res.json()),
        fetch(`/api/market/search?national=true&sort=popular&pageSize=8`).then(res => res.json()),
        fetch(`/api/market/search?myVendors=true&pageSize=8`).then(res => res.json()).catch(() => ({ products: [] })),
      ]);

      const sections: MarketplaceSection[] = [
        {
          id: 'nearby-now',
          title: 'Open near you now',
          subtitle: userLocation ? 'Pickup and delivery windows active today' : 'Enable location to see nearby options',
          products: nearbyProducts.products || [],
          seeAllLink: `/marketplace/search?openNow=true${userLocation ? `&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=25` : ''}`,
        },
        {
          id: 'trending',
          title: 'Trending in your area',
          subtitle: userLocation ? 'Popular items near you' : 'Popular items nationwide',
          products: trendingProducts.products || [],
          seeAllLink: `/marketplace/search?sort=popular${userLocation ? `&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=25` : ''}`,
        },
        {
          id: 'national',
          title: 'National bestsellers',
          subtitle: 'Top-rated items from across the country',
          products: nationalProducts.products || [],
          seeAllLink: '/marketplace/search?national=true&sort=popular',
        },
      ];

      // Add "My Vendors" section if user has favorites
      if (myVendorsProducts.products && myVendorsProducts.products.length > 0) {
        sections.unshift({
          id: 'my-vendors',
          title: 'From your vendors',
          subtitle: 'Items from vendors you follow',
          products: myVendorsProducts.products,
          seeAllLink: '/marketplace/search?myVendors=true',
        });
      }

      return sections;
    },
  });

  // Fetch nearby sales windows
  const { data: nearbyWindows } = useQuery({
    queryKey: ['nearby-windows', userLocation],
    queryFn: async () => {
      if (!userLocation) return { windows: [] };
      
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radius: '25',
      });

      const response = await fetch(`/api/market/nearby-windows?${params}`);
      return response.json();
    },
    enabled: !!userLocation,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams({ q: searchQuery });
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', '25');
      }
      setLocation(`/marketplace/search?${params}`);
    }
  };

  const handleQuickFilter = (filter: string) => {
    const params = new URLSearchParams();
    if (userLocation) {
      params.append('lat', userLocation.lat.toString());
      params.append('lng', userLocation.lng.toString());
      params.append('radius', '25');
    }
    
    switch (filter) {
      case 'pickup':
        params.append('fulfillment', 'pickup');
        params.append('openNow', 'true');
        break;
      case 'delivery':
        params.append('fulfillment', 'delivery');
        break;
      case 'shipping':
        params.append('fulfillment', 'ship');
        break;
      case 'food':
        params.append('categories', 'FOOD');
        break;
      case 'crafts':
        params.append('categories', 'CRAFT');
        break;
      case 'services':
        params.append('categories', 'SERVICE');
        break;
    }
    
    setLocation(`/marketplace/search?${params}`);
  };

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return miles < 1 ? `${Math.round(meters)}m` : `${miles.toFixed(1)}mi`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
              {userLocation && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <MapPin className="w-3 h-3 mr-1" />
                  Location enabled
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setLocation('/marketplace/search')}
                className="text-sm"
              >
                <Filter className="w-4 h-4 mr-1" />
                Advanced Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Find amazing local products
            </h2>
            <p className="text-lg text-gray-600">
              Discover artisans, farmers, and makers in your community
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
          />

          {/* Category Filters */}
          <CategoryFilter
            onFilterSelect={handleQuickFilter}
            showLocationError={locationPermission === 'denied'}
            onRetryLocation={() => window.location.reload()}
          />
        </div>

        {/* Nearby Sales Windows */}
        {nearbyWindows?.windows && nearbyWindows.windows.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Active Pickup & Delivery Windows
              </h3>
              <Button
                variant="ghost"
                onClick={() => setLocation('/marketplace/search?openNow=true')}
                className="text-sm"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyWindows.windows.slice(0, 6).map((window: SalesWindow) => (
                <Card key={window.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{window.name}</h4>
                      <p className="text-sm text-gray-600">{window.vendor_name}</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      {formatDistance(window.distance_meters)}
                    </Badge>
                  </div>
                  {window.address_text && (
                    <p className="text-sm text-gray-500 mb-2">{window.address_text}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(window.fulfill_start_at)} - {formatTime(window.fulfill_end_at)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Sections */}
        {isLoadingSections ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-gray-200 rounded-lg h-64"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {sections?.map((section) => (
              <div key={section.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-sm text-gray-600">{section.subtitle}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation(section.seeAllLink)}
                    className="text-sm"
                  >
                    See All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {section.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {section.products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div 
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white rounded-lg shadow"
                          onClick={() => setLocation(`/marketplace/product/${product.slug}`)}
                        >
                          <div className="relative mb-3">
                            {product.thumbUrl ? (
                              <img
                                src={product.thumbUrl}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.success('Added to favorites');
                              }}
                              title="Add to favorites"
                              aria-label="Add to favorites"
                            >
                              <Heart className={`w-4 h-4 ${product.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.vendor.storeName}</p>
                            
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
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No products found in this section</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceHome;

