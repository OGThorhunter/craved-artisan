export interface LabelField {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image' | 'line' | 'rectangle';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  alignment?: 'left' | 'center' | 'right';
  rotation?: number;
  dataSource?: string; // Field from order data
  format?: string; // Formatting pattern
}

export interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  width: number; // in mm
  height: number; // in mm
  fields: LabelField[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface LabelPrintJob {
  id: string;
  templateId: string;
  orderIds: string[];
  copies: number;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// Label data interface for order information
export interface LabelData {
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  products: Array<{
    name: string;
    quantity: number;
    specifications?: string;
  }>;
  priority: string;
  expectedDelivery: string;
  trackingNumber?: string;
  barcode?: string;
  qrCode?: string;
  customFields?: Record<string, any>;
}

export interface PrintSettings {
  printerName?: string;
  paperSize: 'A4' | 'Letter' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  copies: number;
  quality: 'draft' | 'normal' | 'high';
}

export interface LabelDesignerState {
  selectedField: string | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
}
