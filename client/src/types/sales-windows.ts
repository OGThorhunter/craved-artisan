// Types for Sales Windows - Aligned with Backend Prisma Models
export interface SalesWindow {
  id: string;
  vendorId: string;
  type: 'PARK_PICKUP' | 'DELIVERY' | 'CONSIGNMENT' | 'WHOLESALE' | 'MARKET' | 'PORCH_PICKUP' | 'KIOSK_PICKUP' | 'SERVICE_GREENFIELD' | 'MEETUP_PICKUP' | 'DROP_OFF_LOCATION' | 'CUSTOM';
  name: string;
  description?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'FULFILLED' | 'CANCELLED' | 'ARCHIVED';
  
  // Location
  location_name?: string;
  address_text?: string;
  
  // Timing - aligned with backend fields
  preorder_open_at?: string;
  preorder_close_at?: string;
  fulfill_start_at?: string;
  fulfill_end_at?: string;
  recurrence_rrule?: string;
  
  // Capacity
  capacity_total?: number;
  max_items_total?: number;
  auto_close_when_full?: boolean;
  
  // Additional fields for frontend compatibility
  channels?: SalesChannel[]; // For backward compatibility
  products?: WindowProduct[]; // For backward compatibility
  settings?: WindowSettings; // For backward compatibility
  
  // Backend relations
  metrics?: SalesWindowMetric;
  slots?: SalesWindowSlot[];
  
  // Scheduling properties
  isEvergreen?: boolean;
  marketId?: string;
  startDate?: string;   // ISO date string
  endDate?: string;     // ISO date string
  timezone?: string;    // e.g. 'America/New_York'
  
  createdAt: string;
  updatedAt: string;
}

export interface SalesChannel {
  type: 'PARK_PICKUP' | 'DELIVERY' | 'CONSIGNMENT' | 'WHOLESALE' | 'MARKET' | 'PORCH_PICKUP' | 'KIOSK_PICKUP' | 'SERVICE_GREENFIELD' | 'MEETUP_PICKUP' | 'DROP_OFF_LOCATION' | 'CUSTOM';
  config: ChannelConfig;
}

export interface ChannelConfig {
  // MEETUP_PICKUP
  timeSlots?: TimeSlot[];
  pickupNotes?: string;
  
  // DELIVERY
  serviceRadius?: number;
  baseFee?: number;
  perDistanceFee?: number;
  cutoffHours?: number;
  
  // DROP_OFF_LOCATION
  locationId?: string;
  pickupWindow?: string;
  dropoffNotes?: string;
  
  // MARKET
  boothInfo?: string;
  preorderCutoff?: string;
  
  // CUSTOM
  label?: string;
  details?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentCapacity: number;
}

export interface WindowProduct {
  productId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
  stock: number;
  isAvailable: boolean;
  targetMargin?: number;
  recipeId?: string;
  productType?: 'food' | 'service' | 'non-food';
  onWatchlist: boolean;
  lastAiSuggestion?: number;
  aiSuggestionNote?: string;
  createdAt: string;
  updatedAt: string;
  vendorProfileId: string;
  // Sales window specific overrides
  priceOverride?: number;
  perOrderLimit?: number;
  totalCap?: number;
  isVisible: boolean;
  currentStock: number;
}

export interface WindowSettings {
  allowPreorders: boolean;
  showInStorefront: boolean;
  autoCloseWhenSoldOut: boolean;
  capacity: number;
  tags: string[];
}

export interface MarketEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  description?: string;
}

export interface SalesWindowStats {
  totalWindows: number;
  openWindows: number;
  scheduledWindows: number;
  draftWindows: number;
  closedWindows: number;
  totalRevenue: number;
}

// Backend-aligned interfaces
export interface SalesWindowMetric {
  id: string;
  salesWindowId: string;
  orders_count: number;
  items_count: number;
  gross: number;
  refunds: number;
  net: number;
}

export interface SalesWindowSlot {
  id: string;
  salesWindowId: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  reserved_count: number;
}

export interface SalesWindowProduct {
  id: string;
  salesWindowId: string;
  productId: string;
  price_override?: number;
  qty_limit_per_customer?: number;
  active: boolean;
}

