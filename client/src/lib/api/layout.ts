import { z } from 'zod';

// Layout Types
export const LayoutTypeSchema = z.enum(['GRID', 'IMAGE_OVERLAY']);
export const StallTypeSchema = z.enum(['STALL', 'CORNER_STALL', 'FOOD_TRUCK', 'TABLE_SEAT', 'VIP_SEAT']);
export const StallStatusSchema = z.enum(['AVAILABLE', 'HELD', 'RESERVED', 'SOLD', 'CHECKED_IN', 'BLOCKED']);

// Layout Schema
export const EventLayoutSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  layoutType: LayoutTypeSchema,
  
  // Grid configuration
  gridRows: z.number().optional(),
  gridColumns: z.number().optional(),
  cellWidth: z.number().optional(),
  cellHeight: z.number().optional(),
  aisleWidth: z.number().optional(),
  totalWidth: z.number().optional(),
  totalHeight: z.number().optional(),
  
  // Image configuration
  backgroundImage: z.string().optional(),
  imageWidth: z.number().optional(),
  imageHeight: z.number().optional(),
  scaleFactor: z.number().optional(),
  
  // Settings
  units: z.enum(['feet', 'meters']),
  showNumbers: z.boolean(),
  showAisles: z.boolean(),
  showGrid: z.boolean(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
  
  zones: z.array(z.any()).optional(),
  stalls: z.array(z.any()).optional(),
});

// Zone Schema
export const ZoneSchema = z.object({
  id: z.string(),
  layoutId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string(),
  
  // Grid position
  startRow: z.number().optional(),
  endRow: z.number().optional(),
  startColumn: z.number().optional(),
  endColumn: z.number().optional(),
  
  // Pricing
  basePrice: z.number(),
  priceUnit: z.enum(['stall', 'sqft', 'per_day']),
  
  // Features
  features: z.array(z.string()),
  
  // Settings
  isActive: z.boolean(),
  autoNumbering: z.boolean(),
  numberingPrefix: z.string().optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Stall Schema
export const StallSchema = z.object({
  id: z.string(),
  layoutId: z.string(),
  zoneId: z.string().optional(),
  number: z.string(),
  customLabel: z.string().optional(),
  
  // Grid position
  row: z.number().optional(),
  column: z.number().optional(),
  
  // Image position
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  
  // Properties
  stallType: StallTypeSchema,
  size: z.string().optional(),
  
  // Pricing
  basePrice: z.number(),
  priceOverride: z.number().optional(),
  surcharges: z.array(z.number()),
  totalPrice: z.number(),
  
  // Features
  features: z.array(z.string()),
  
  // Status
  status: StallStatusSchema,
  isBlocked: z.boolean(),
  blockReason: z.string().optional(),
  
  // Assignment
  assignedTo: z.string().optional(),
  assignedAt: z.string().optional(),
  assignedBy: z.string().optional(),
  
  // Hold Information
  heldBy: z.string().optional(),
  heldUntil: z.string().optional(),
  holdReason: z.string().optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
  
  // Relations
  zone: z.any().optional(),
  assignment: z.any().optional(),
});

// Layout Template Schema
export const LayoutTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  layoutType: LayoutTypeSchema,
  gridRows: z.number().optional(),
  gridColumns: z.number().optional(),
  cellWidth: z.number().optional(),
  cellHeight: z.number().optional(),
  aisleWidth: z.number().optional(),
  defaultZones: z.string(), // JSON string
  usageCount: z.number(),
  createdAt: z.string(),
});

// TypeScript Types
export type EventLayout = z.infer<typeof EventLayoutSchema>;
export type Zone = z.infer<typeof ZoneSchema>;
export type Stall = z.infer<typeof StallSchema>;
export type LayoutTemplate = z.infer<typeof LayoutTemplateSchema>;
export type LayoutType = z.infer<typeof LayoutTypeSchema>;
export type StallType = z.infer<typeof StallTypeSchema>;
export type StallStatus = z.infer<typeof StallStatusSchema>;

// API Request Types
export interface CreateLayoutRequest {
  eventId: string;
  name: string;
  description?: string;
  layoutType?: 'GRID' | 'IMAGE_OVERLAY';
  
  // Grid configuration
  gridRows?: number;
  gridColumns?: number;
  cellWidth?: number;
  cellHeight?: number;
  aisleWidth?: number;
  totalWidth?: number;
  totalHeight?: number;
  
  // Image configuration
  backgroundImage?: string;
  imageWidth?: number;
  imageHeight?: number;
  scaleFactor?: number;
  
  // Settings
  units?: 'feet' | 'meters';
  showNumbers?: boolean;
  showAisles?: boolean;
  showGrid?: boolean;
}

export interface CreateZoneRequest {
  layoutId: string;
  name: string;
  description?: string;
  color?: string;
  
  // Grid position
  startRow?: number;
  endRow?: number;
  startColumn?: number;
  endColumn?: number;
  
  // Pricing
  basePrice?: number;
  priceUnit?: 'stall' | 'sqft' | 'per_day';
  
  // Features
  features?: string[];
  
  // Settings
  isActive?: boolean;
  autoNumbering?: boolean;
  numberingPrefix?: string;
}

export interface CreateStallRequest {
  layoutId: string;
  zoneId?: string;
  number: string;
  customLabel?: string;
  
  // Grid position
  row?: number;
  column?: number;
  
  // Image position
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  
  // Properties
  stallType?: StallType;
  size?: string;
  
  // Pricing
  basePrice?: number;
  priceOverride?: number;
  surcharges?: number[];
  
  // Features
  features?: string[];
  
  // Status
  isBlocked?: boolean;
  blockReason?: string;
}

export interface UpdateStallStatusRequest {
  status: StallStatus;
  heldBy?: string;
  heldUntil?: string;
  holdReason?: string;
  assignedTo?: string;
}

// Utility Types
export interface GridPosition {
  row: number;
  column: number;
}

export interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StallFeatures {
  power: boolean;
  water: boolean;
  vehicleAccess: boolean;
  ada: boolean;
  corner: boolean;
  endcap: boolean;
}

export interface ZoneStats {
  totalStalls: number;
  availableStalls: number;
  reservedStalls: number;
  soldStalls: number;
  blockedStalls: number;
  totalRevenue: number;
  averagePrice: number;
  occupancyRate: number;
}

export interface LayoutStats {
  totalStalls: number;
  totalZones: number;
  totalRevenue: number;
  occupancyRate: number;
  zones: ZoneStats[];
}

// Color constants for zones
export const ZONE_COLORS = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
] as const;

export const STALL_STATUS_COLORS = {
  AVAILABLE: '#10B981',
  HELD: '#F59E0B',
  RESERVED: '#3B82F6',
  SOLD: '#EF4444',
  CHECKED_IN: '#8B5CF6',
  BLOCKED: '#6B7280',
} as const;

export const STALL_TYPE_ICONS = {
  STALL: '🏪',
  CORNER_STALL: '🏪',
  FOOD_TRUCK: '🚚',
  TABLE_SEAT: '🪑',
  VIP_SEAT: '👑',
} as const;
