// Label System TypeScript Types
// Phase 1: Core types for advanced label printing

export interface PrinterProfile {
  id: string;
  name: string;
  driver: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL' | 'Custom';
  dpi: number;
  mediaSupported: MediaSize[];
  address?: string;
  isColor: boolean;
  isThermal: boolean;
  maxWidthIn: number;
  maxHeightIn: number;
  capabilities: PrinterCapabilities;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaSize {
  width: number; // inches
  height: number; // inches
  name: string;
  isContinuous: boolean; // true for continuous feed
  isSupported: boolean;
}

export interface PrinterCapabilities {
  supportsColor?: boolean;
  supportsDuplex?: boolean;
  supportsStapling?: boolean;
  maxCopies?: number;
  supportedMediaTypes?: string[];
  networkProtocols?: string[];
  customCommands?: string[];
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
  rules: LabelRules;
  dataBindings: DataBindings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  printerProfile?: PrinterProfile;
  fallbackProfile?: LabelProfile;
}

export interface LabelRules {
  conditions: RuleCondition[];
  actions: RuleAction[];
  fallbacks?: RuleFallback[];
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'show_field' | 'hide_field' | 'set_value' | 'format_text' | 'add_element';
  field?: string;
  value?: any;
  config?: Record<string, any>;
}

export interface RuleFallback {
  condition: RuleCondition;
  action: RuleAction;
}

export interface DataBindings {
  productName: DataBinding;
  productDescription?: DataBinding;
  price: DataBinding;
  sku: DataBinding;
  barcode: DataBinding;
  qrCode?: DataBinding;
  bestBy?: DataBinding;
  lotNumber?: DataBinding;
  allergens?: DataBinding;
  ingredients?: DataBinding;
  nutritionFacts?: DataBinding;
  customFields?: Record<string, DataBinding>;
}

export interface DataBinding {
  source: 'order' | 'product' | 'variant' | 'calculated' | 'static';
  field: string;
  format?: string;
  required: boolean;
  fallback?: string;
  transform?: string; // JavaScript expression for data transformation
}

export interface ProductVariantLabelProfile {
  id: string;
  productId: string;
  variantId: string;
  labelProfileId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  labelProfile?: LabelProfile;
}

export interface LabelBatchJob {
  id: string;
  createdBy: string;
  status: 'queued' | 'printing' | 'done' | 'error' | 'cancelled';
  warnings: string[];
  metadata: Record<string, any>;
  totalLabels: number;
  completedLabels: number;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  printerJobs?: LabelPrinterJob[];
}

export interface LabelPrinterJob {
  id: string;
  batchJobId: string;
  printerProfileId: string;
  labelProfileId: string;
  count: number;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  pages: number;
  meta: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  printerProfile?: PrinterProfile;
  labelProfile?: LabelProfile;
}

export interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  version: string;
  templateData: TemplateData;
  previewImage?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  variants?: LabelTemplateVariant[];
}

export interface LabelTemplateVariant {
  id: string;
  templateId: string;
  labelProfileId: string;
  variantName: string;
  templateData: TemplateData;
  previewImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  labelProfile?: LabelProfile;
}

export interface TemplateData {
  elements: TemplateElement[];
  background?: TemplateBackground;
  metadata: TemplateMetadata;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'barcode' | 'qrcode' | 'rectangle' | 'circle' | 'line';
  position: Position;
  size: Size;
  properties: ElementProperties;
  dataBinding?: string;
  rules?: ElementRules;
}

export interface Position {
  x: number; // inches from left
  y: number; // inches from top
  z: number; // z-index for layering
}

export interface Size {
  width: number; // inches
  height: number; // inches
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ElementProperties {
  // Text properties
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'light';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  backgroundColor?: string;
  lineHeight?: number;
  maxLines?: number;
  overflow?: 'clip' | 'ellipsis' | 'wrap';
  
  // Barcode properties
  barcodeType?: 'Code128' | 'Code39' | 'EAN13' | 'EAN8' | 'UPC' | 'QR';
  barcodeHeight?: number;
  barcodeWidth?: number;
  barcodeMargin?: number;
  showText?: boolean;
  
  // Image properties
  imageUrl?: string;
  imageData?: string; // base64
  imageFit?: 'contain' | 'cover' | 'fill' | 'scale-down';
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  
  // Shape properties
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  
  // Common properties
  opacity?: number;
  rotation?: number;
  visible?: boolean;
}

export interface ElementRules {
  showWhen?: RuleCondition[];
  hideWhen?: RuleCondition[];
  styleWhen?: Array<{
    condition: RuleCondition;
    style: Partial<ElementProperties>;
  }>;
}

export interface TemplateBackground {
  color?: string;
  image?: string;
  opacity?: number;
}

export interface TemplateMetadata {
  version: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  tags: string[];
  description: string;
}

// API Request/Response Types
export interface CreateLabelProfileRequest {
  name: string;
  description?: string;
  mediaWidthIn: number;
  mediaHeightIn: number;
  orientation?: 'portrait' | 'landscape' | 'auto';
  cornerRadius?: number;
  bleedIn?: number;
  safeMarginIn?: number;
  dpi?: number;
  engine?: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  templateId?: string;
  printerProfileId: string;
  batchGroupKey?: string;
  copiesPerUnit?: number;
  rotation?: number;
  colorHint?: 'monochrome' | 'color' | 'auto';
  fallbackProfileId?: string;
  rules?: LabelRules;
  dataBindings?: DataBindings;
}

export interface CreatePrinterProfileRequest {
  name: string;
  driver: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL' | 'Custom';
  dpi?: number;
  mediaSupported?: MediaSize[];
  address?: string;
  isColor?: boolean;
  isThermal?: boolean;
  maxWidthIn: number;
  maxHeightIn: number;
  capabilities?: PrinterCapabilities;
}

export interface CompileLabelsRequest {
  orderIds: string[];
  groupBy?: 'salesWindow' | 'pickupTime' | 'route' | 'printer';
  dryRun?: boolean;
  options?: {
    includeWarnings?: boolean;
    validateMedia?: boolean;
    checkTextFit?: boolean;
    validateBarcodes?: boolean;
  };
}

export interface CompileLabelsResponse {
  success: boolean;
  batchJobId?: string;
  summary: LabelCompilationSummary;
  warnings: string[];
  errors: string[];
  dryRun?: boolean;
}

export interface LabelCompilationSummary {
  totalLabels: number;
  totalOrders: number;
  printerJobs: PrinterJobSummary[];
  mediaUsage: MediaUsageSummary[];
  estimatedTime: number; // seconds
}

export interface PrinterJobSummary {
  printerProfileId: string;
  printerName: string;
  labelProfileId: string;
  labelProfileName: string;
  count: number;
  pages: number;
  estimatedTime: number;
  mediaType: string;
  warnings: string[];
}

export interface MediaUsageSummary {
  mediaType: string;
  width: number;
  height: number;
  count: number;
  totalArea: number; // square inches
}

// Utility Types
export interface LabelDimensions {
  width: number; // inches
  height: number; // inches
  dpi: number;
  widthDots: number;
  heightDots: number;
}

export interface SafeArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PrintJob {
  id: string;
  printerProfile: PrinterProfile;
  labelProfile: LabelProfile;
  data: LabelData[];
  options: PrintOptions;
}

export interface LabelData {
  orderId: string;
  lineItemId: string;
  productId: string;
  variantId?: string;
  data: Record<string, any>;
  copies: number;
}

export interface PrintOptions {
  copies: number;
  collate: boolean;
  duplex: boolean;
  color: boolean;
  quality: 'draft' | 'normal' | 'high';
  mediaType: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

// Template Editor Types
export interface TemplateEditorState {
  selectedElement?: string;
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  showSafeArea: boolean;
  showBleed: boolean;
  snapToGrid: boolean;
  selectedTool: 'select' | 'text' | 'image' | 'barcode' | 'qrcode' | 'rectangle' | 'circle' | 'line';
}

export interface TemplateEditorAction {
  type: 'SELECT_ELEMENT' | 'ADD_ELEMENT' | 'UPDATE_ELEMENT' | 'DELETE_ELEMENT' | 'DUPLICATE_ELEMENT' | 'MOVE_ELEMENT' | 'RESIZE_ELEMENT' | 'SET_ZOOM' | 'TOGGLE_GRID' | 'TOGGLE_SAFE_AREA' | 'TOGGLE_BLEED' | 'TOGGLE_SNAP';
  payload?: any;
}
