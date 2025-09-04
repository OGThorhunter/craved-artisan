// Types for Sales Windows
export interface SalesWindow {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
  isEvergreen: boolean;
  startDate?: string;
  endDate?: string;
  timezone: string;
  channels: SalesChannel[];
  products: WindowProduct[];
  settings: WindowSettings;
  marketId?: string;
  marketEvent?: MarketEvent;
  createdAt: string;
  updatedAt: string;
}

export interface SalesChannel {
  type: 'MEETUP_PICKUP' | 'DELIVERY' | 'DROP_OFF_LOCATION' | 'MARKET' | 'CUSTOM';
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

