export type DPI = 203 | 300 | 600;

export interface LabelUnits {
  widthIn: number;
  heightIn: number;
  dpi: DPI;
  bleedIn?: number;
  safeIn?: number;
  rotation?: 0 | 90 | 180 | 270;
}

export interface LabelElementBase {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr' | 'barcode';
  x: number; // in dots
  y: number; // in dots
  w?: number; // in dots
  h?: number; // in dots
  rot?: number; // rotation in degrees
  locked?: boolean;
  snap?: boolean;
}

export interface TextElement extends LabelElementBase {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSizePt: number;
  fontWeight?: number | 'bold';
  lineClamp?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  bindingKey?: string;
  autoScale?: boolean;
  minFontPt?: number;
}

export interface ImageElement extends LabelElementBase {
  type: 'image';
  src?: string;
  bindingKey?: string;
  fit: 'contain' | 'cover' | 'stretch';
}

export interface ShapeElement extends LabelElementBase {
  type: 'shape';
  shape: 'rect' | 'roundRect' | 'line';
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  radius?: number;
}

export interface QRElement extends LabelElementBase {
  type: 'qr';
  value?: string;
  bindingKey?: string;
  ecc?: 'L' | 'M' | 'Q' | 'H';
  marginPx?: number;
  minModulePx?: number;
}

export interface BarcodeElement extends LabelElementBase {
  type: 'barcode';
  value?: string;
  bindingKey?: string;
  format: 'code128';
  marginPx?: number;
  minModulePx?: number;
}

export type LabelElement = TextElement | ImageElement | ShapeElement | QRElement | BarcodeElement;

export interface LabelTemplateVariant {
  id: string;
  name: string;
  units: LabelUnits;
  elements: LabelElement[];
}

export interface PreviewState {
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  showSafe: boolean;
  showBleed: boolean;
  selectedId?: string;
}

export interface Warning {
  id: string;
  kind: 'overflow' | 'contrast' | 'qrDensity' | 'barcodeDensity' | 'safeBreach' | 'bindingError';
  severity: 'warn' | 'error';
  message: string;
}

export interface PreflightReport {
  warnings: Warning[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
  };
}

export interface CanvasSize {
  wDots: number;
  hDots: number;
  bleedDots: number;
  safeDots: number;
}

export interface PreviewEngineConfig {
  variant: LabelTemplateVariant;
  sample: any;
  zoom: number;
  flags: {
    grid: boolean;
    rulers: boolean;
    safe: boolean;
    bleed: boolean;
  };
  onSelectionChange?: (id: string | undefined) => void;
  onElementUpdate?: (element: LabelElement) => void;
}

export interface SampleData {
  customer: {
    firstName: string;
    lastName: string;
  };
  order: {
    id: string;
    pickupTime: string;
  };
  product: {
    title: string;
    sku: string;
    allergens: string[];
  };
  vendor: {
    name: string;
  };
  nutritionUrl: string;
  qrPayload: string;
}






