/**
 * Map configuration and utilities for pickup locations
 * Centralized configuration for Leaflet maps and location management
 */

export interface MapLocation {
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

export interface MapConfig {
  defaultCenter: [number, number];
  defaultZoom: number;
  maxZoom: number;
  minZoom: number;
  tileLayerUrl: string;
  tileLayerAttribution: string;
}

export interface MarkerConfig {
  size: number;
  colors: {
    user: string;
    vendor: string;
    pickup: string;
    zip: string;
  };
  icons: {
    user: string;
    vendor: string;
    pickup: string;
    zip: string;
  };
}

// Default map configuration
export const DEFAULT_MAP_CONFIG: MapConfig = {
  defaultCenter: [33.3469, -84.1091], // Locust Grove, GA
  defaultZoom: 11,
  maxZoom: 18,
  minZoom: 8,
  tileLayerUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileLayerAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Marker configuration
export const MARKER_CONFIG: MarkerConfig = {
  size: 32,
  colors: {
    user: '#EF4444',
    vendor: '#10B981',
    pickup: '#3B82F6',
    zip: '#F59E0B'
  },
  icons: {
    user: '📍',
    vendor: '🏪',
    pickup: '📦',
    zip: '📍'
  }
};

// Location type definitions
export const LOCATION_TYPES = {
  vendor: {
    name: 'Vendor Drop-off',
    description: 'Local vendors who drop off products',
    color: MARKER_CONFIG.colors.vendor,
    icon: MARKER_CONFIG.icons.vendor
  },
  pickup: {
    name: 'Pickup Location',
    description: 'Designated pickup spots',
    color: MARKER_CONFIG.colors.pickup,
    icon: MARKER_CONFIG.icons.pickup
  },
  zip: {
    name: 'ZIP Location',
    description: 'Saved ZIP code locations',
    color: MARKER_CONFIG.colors.zip,
    icon: MARKER_CONFIG.icons.zip
  }
} as const;

// Filter options for pickup locations
export const FILTER_OPTIONS = {
  all: { label: 'All', value: 'all' },
  today: { label: 'Today', value: 'today' },
  tomorrow: { label: 'Tomorrow', value: 'tomorrow' },
  week: { label: 'This Week', value: 'week' }
} as const;

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get next available date for a specific day of week
 */
export function getNextAvailableDate(dayOfWeek: number): Date {
  const today = new Date();
  const targetDay = dayOfWeek;
  const currentDay = today.getDay();
  
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) daysToAdd += 7;
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  return nextDate;
}

/**
 * Format pickup time for display
 */
export function formatPickupTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days`;
  return date.toLocaleDateString();
}

/**
 * Filter locations based on time criteria
 */
export function filterLocationsByTime(
  locations: MapLocation[],
  filter: keyof typeof FILTER_OPTIONS
): MapLocation[] {
  if (filter === 'all') return locations;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return locations.filter(location => {
    if (!location.nextPickup) return false;
    const pickupDate = new Date(location.nextPickup);

    switch (filter) {
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
}

/**
 * Sort locations by distance from a given point
 */
export function sortLocationsByDistance(
  locations: MapLocation[],
  userLat: number,
  userLon: number
): MapLocation[] {
  return [...locations].sort((a, b) => {
    const distanceA = calculateDistance(userLat, userLon, a.coordinates[0], a.coordinates[1]);
    const distanceB = calculateDistance(userLat, userLon, b.coordinates[0], b.coordinates[1]);
    return distanceA - distanceB;
  });
}

/**
 * Get location type info
 */
export function getLocationTypeInfo(type: keyof typeof LOCATION_TYPES) {
  return LOCATION_TYPES[type];
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Get map bounds for a set of locations
 */
export function getMapBounds(locations: MapLocation[]): [[number, number], [number, number]] | null {
  if (locations.length === 0) return null;

  let minLat = locations[0]?.coordinates[0] ?? 0;
  let maxLat = locations[0]?.coordinates[0] ?? 0;
  let minLon = locations[0]?.coordinates[1] ?? 0;
  let maxLon = locations[0]?.coordinates[1] ?? 0;

  locations.forEach(location => {
    const [lat, lon] = location.coordinates;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  });

  return [[minLat, minLon], [maxLat, maxLon]];
}

/**
 * Generate unique location ID
 */
export function generateLocationId(): string {
  return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse address components
 */
export function parseAddress(address: string): {
  street: string;
  city: string;
  state: string;
  zip: string;
} {
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length >= 4) {
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      zip: parts[3] || ''
    };
  }
  
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    state: parts[2] || '',
    zip: parts[3] || ''
  };
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  const parsed = parseAddress(address);
  return `${parsed.street}, ${parsed.city}, ${parsed.state} ${parsed.zip}`;
} 