import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  ShoppingCart,
  Filter,
  X,
  Star,
  Truck,
  Store
} from 'lucide-react';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
      ">
        ${icon}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

interface PickupLocation {
  id: string;
  name: string;
  type: 'vendor' | 'zip' | 'pickup';
  coordinates: [number, number];
  address: string;
  schedule: string;
  nextPickup?: string;
  vendorId?: string;
  vendorName?: string;
  rating?: number;
  isActive?: boolean;
  distance?: number;
}

interface PickupMapProps {
  className?: string;
  userZip?: string;
  onLocationSelect?: (location: PickupLocation) => void;
  onAddLocation?: (location: PickupLocation) => void;
  onOrderHere?: (location: PickupLocation) => void;
}

export const PickupMap: React.FC<PickupMapProps> = ({
  className = '',
  userZip = '30248',
  onLocationSelect,
  onAddLocation,
  onOrderHere
}) => {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [selectedLocation, setSelectedLocation] = useState<PickupLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockLocations: PickupLocation[] = [
      {
        id: '1',
        name: 'Locust Grove Farmers Market',
        type: 'vendor',
        coordinates: [33.3469, -84.1091], // Locust Grove, GA
        address: '123 Main St, Locust Grove, GA 30248',
        schedule: 'Friday 3-5 PM',
        nextPickup: '2024-01-26T15:00:00',
        vendorId: 'vendor1',
        vendorName: 'Rose Creek Bakery',
        rating: 4.8,
        isActive: true,
        distance: 2.3
      },
      {
        id: '2',
        name: 'McDonough Community Center',
        type: 'vendor',
        coordinates: [33.4473, -84.1469], // McDonough, GA
        address: '456 Community Dr, McDonough, GA 30253',
        schedule: 'Saturday 9-11 AM',
        nextPickup: '2024-01-27T09:00:00',
        vendorId: 'vendor2',
        vendorName: 'Sweet Dreams Bakery',
        rating: 4.6,
        isActive: true,
        distance: 5.1
      },
      {
        id: '3',
        name: 'Stockbridge Drop-off',
        type: 'pickup',
        coordinates: [33.5443, -84.2338], // Stockbridge, GA
        address: '789 Pickup Ave, Stockbridge, GA 30281',
        schedule: 'Daily 8 AM - 8 PM',
        nextPickup: '2024-01-25T08:00:00',
        isActive: true,
        distance: 8.7
      },
      {
        id: '4',
        name: 'Hampton Farmers Market',
        type: 'vendor',
        coordinates: [33.3871, -84.2829], // Hampton, GA
        address: '321 Market St, Hampton, GA 30228',
        schedule: 'Sunday 10 AM - 2 PM',
        nextPickup: '2024-01-28T10:00:00',
        vendorId: 'vendor3',
        vendorName: 'Hampton Harvest',
        rating: 4.9,
        isActive: false,
        distance: 12.4
      }
    ];
    setLocations(mockLocations);

    // Set user location (mock - in real app, get from geolocation or ZIP lookup)
    setUserLocation([33.3469, -84.1091]); // Locust Grove area
  }, []);

  // Filter locations based on selected filter
  const filteredLocations = useMemo(() => {
    if (selectedFilter === 'all') return locations;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return locations.filter(location => {
      if (!location.nextPickup) return false;
      const pickupDate = new Date(location.nextPickup);

      switch (selectedFilter) {
        case 'today':
          return pickupDate >= today && pickupDate < tomorrow;
        case 'tomorrow':
          return pickupDate >= tomorrow && pickupDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          return pickupDate >= today && pickupDate <= weekEnd;
        default:
          return true;
      }
    });
  }, [locations, selectedFilter]);

  // Get marker icon based on location type
  const getMarkerIcon = (location: PickupLocation) => {
    switch (location.type) {
      case 'vendor':
        return createCustomIcon('#10B981', '🏪');
      case 'pickup':
        return createCustomIcon('#3B82F6', '📦');
      case 'zip':
        return createCustomIcon('#F59E0B', '📍');
      default:
        return createCustomIcon('#6B7280', '📍');
    }
  };

  // Format date for display
  const formatPickupTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  // Handle location click
  const handleLocationClick = (location: PickupLocation) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  // Handle add location
  const handleAddLocation = (location: PickupLocation) => {
    onAddLocation?.(location);
  };

  // Handle order here
  const handleOrderHere = (location: PickupLocation) => {
    onOrderHere?.(location);
  };

  if (!userLocation) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pickup Locations
          </h2>
          <p className="text-sm text-brand-grey">Find pickup spots near you</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-grey">Filter:</span>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            aria-label="Filter pickup locations by time"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={userLocation}
          zoom={11}
          className="h-96 w-full rounded-lg"
          style={{ minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          <Marker position={userLocation} icon={createCustomIcon('#EF4444', '📍')}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Your Location</p>
                <p className="text-sm text-gray-600">ZIP: {userZip}</p>
              </div>
            </Popup>
          </Marker>

          {/* Location markers */}
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              position={location.coordinates}
              icon={getMarkerIcon(location)}
              eventHandlers={{
                click: () => handleLocationClick(location)
              }}
            >
              <Popup>
                <LocationPopup
                  location={location}
                  onAddLocation={handleAddLocation}
                  onOrderHere={handleOrderHere}
                  formatPickupTime={formatPickupTime}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Vendor Drop-off</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Pickup Location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location List */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onSelect={() => handleLocationClick(location)}
              onAddLocation={handleAddLocation}
              onOrderHere={handleOrderHere}
              formatPickupTime={formatPickupTime}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Location Popup Component
interface LocationPopupProps {
  location: PickupLocation;
  onAddLocation: (location: PickupLocation) => void;
  onOrderHere: (location: PickupLocation) => void;
  formatPickupTime: (dateString: string) => string;
}

const LocationPopup: React.FC<LocationPopupProps> = ({
  location,
  onAddLocation,
  onOrderHere,
  formatPickupTime
}) => {
  return (
    <div className="w-64 p-2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {location.type === 'vendor' ? (
            <Store className="w-5 h-5 text-green-600" />
          ) : (
            <Package className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm">{location.name}</h3>
          {location.vendorName && (
            <p className="text-xs text-brand-grey">{location.vendorName}</p>
          )}
          <p className="text-xs text-brand-grey mt-1">{location.address}</p>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-brand-grey">
            <Clock className="w-3 h-3" />
            <span>{location.schedule}</span>
          </div>
          
          {location.nextPickup && (
            <div className="flex items-center gap-2 mt-1 text-xs text-brand-grey">
              <Calendar className="w-3 h-3" />
              <span>Next: {formatPickupTime(location.nextPickup)}</span>
            </div>
          )}
          
          {location.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-brand-grey">{location.rating}</span>
            </div>
          )}
          
          {location.distance && (
            <p className="text-xs text-brand-grey mt-1">
              {location.distance} miles away
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onAddLocation(location)}
          className="flex-1 px-3 py-1 text-xs bg-brand-green text-white rounded hover:bg-brand-green/80 transition-colors"
        >
          Add Location
        </button>
        {location.type === 'vendor' && (
          <button
            onClick={() => onOrderHere(location)}
            className="flex-1 px-3 py-1 text-xs bg-brand-maroon text-white rounded hover:bg-brand-maroon/80 transition-colors"
          >
            Order Here
          </button>
        )}
      </div>
    </div>
  );
};

// Location Card Component
interface LocationCardProps {
  location: PickupLocation;
  onSelect: () => void;
  onAddLocation: (location: PickupLocation) => void;
  onOrderHere: (location: PickupLocation) => void;
  formatPickupTime: (dateString: string) => string;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onSelect,
  onAddLocation,
  onOrderHere,
  formatPickupTime
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3" onClick={onSelect}>
        <div className="flex-shrink-0">
          {location.type === 'vendor' ? (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Store className="w-4 h-4 text-green-600" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">{location.name}</h4>
          {location.vendorName && (
            <p className="text-xs text-brand-grey">{location.vendorName}</p>
          )}
          <p className="text-xs text-brand-grey mt-1">{location.address}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-brand-grey">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {location.schedule}
            </span>
            {location.distance && (
              <span>{location.distance} miles</span>
            )}
          </div>
          
          {location.nextPickup && (
            <div className="flex items-center gap-1 mt-1 text-xs text-brand-grey">
              <Calendar className="w-3 h-3" />
              <span>Next: {formatPickupTime(location.nextPickup)}</span>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {location.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-brand-grey">{location.rating}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddLocation(location);
          }}
          className="flex-1 px-3 py-1 text-xs bg-brand-green text-white rounded hover:bg-brand-green/80 transition-colors"
        >
          Add Location
        </button>
        {location.type === 'vendor' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOrderHere(location);
            }}
            className="flex-1 px-3 py-1 text-xs bg-brand-maroon text-white rounded hover:bg-brand-maroon/80 transition-colors"
          >
            Order Here
          </button>
        )}
      </div>
    </div>
  );
}; 