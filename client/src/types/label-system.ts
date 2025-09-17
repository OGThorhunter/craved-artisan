/**
 * Canonical label system types. Only named exports. No default export.
 * Import with: import type { CreateLabelProfileRequest } from '@/types/label-system';
 */
export type LabelEngine = 'pdf' | 'zpl' | 'tspl' | 'brother_ql'

export interface LabelMedia {
  widthIn: number
  heightIn: number
  orientation?: 0 | 90 | 180 | 270
  cornerRadius?: number
  bleedIn?: number
  safeMarginIn?: number
}

export interface LabelRules {
  // JSON-logic style or simple flags
  includeCustomerOnPickup?: boolean
  boldAllergens?: boolean
  requireNutritionForWholesale?: boolean
  shelfLifeDays?: number
}

export interface CreateLabelProfileRequest {
  name: string
  media: LabelMedia
  engine: LabelEngine
  dpi: 203 | 300 | 600
  templateId: string
  printerProfileId?: string
  batchGroupKey?: 'salesWindow' | 'pickupTime' | 'route'
  copiesPerUnit?: number
  rotation?: 0 | 90 | 180 | 270
  colorHint?: string
  fallbackProfileId?: string
  rules?: LabelRules
  dataBindings?: Record<string, unknown>
}

export interface UpdateLabelProfileRequest extends Partial<CreateLabelProfileRequest> {
  id: string
}

export interface LabelProfileDTO extends CreateLabelProfileRequest {
  id: string
  createdAt: string
  updatedAt: string
}

// Legacy compatibility types (for existing code)
export interface CreatePrinterProfileRequest {
  name: string;
  driver: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL' | 'Custom';
  dpi?: number;
  mediaSupported?: any[];
  address?: string;
  isColor?: boolean;
  isThermal?: boolean;
  maxWidthIn: number;
  maxHeightIn: number;
  capabilities?: any;
}

export interface LabelProfile {
  id: string;
  name: string;
  description?: string;
  mediaWidthIn: number;
  mediaHeightIn: number;
  orientation: 'portrait' | 'landscape' | 'auto';
  cornerRadius: number;
  bleedIn: number;
  safeMarginIn: number;
  dpi: number;
  engine: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  templateId?: string;
  printerProfileId: string;
  batchGroupKey?: string;
  copiesPerUnit: number;
  rotation: number;
  colorHint: 'monochrome' | 'color' | 'auto';
  fallbackProfileId?: string;
  rules: any;
  dataBindings: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrinterProfile {
  id: string;
  name: string;
  driver: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL' | 'Custom';
  dpi: number;
  mediaSupported: any[];
  address?: string;
  isColor: boolean;
  isThermal: boolean;
  maxWidthIn: number;
  maxHeightIn: number;
  capabilities: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}