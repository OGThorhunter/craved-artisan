/**
 * Base Print Engine Interface
 * Defines the common interface for all print engines (PDF, ZPL, TSPL, Brother QL)
 */

export interface PrintDimensions {
  widthInches: number;
  heightInches: number;
  dpi: number;
  widthPoints: number;
  heightPoints: number;
  widthPixels: number;
  heightPixels: number;
}

export interface PrintElement {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image' | 'line' | 'rectangle';
  x: number; // inches
  y: number; // inches
  width: number; // inches
  height: number; // inches
  
  // Text properties
  content?: string;
  fontSize?: number; // points
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  
  // Visual properties
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number; // points
  rotation?: number; // degrees
  
  // Barcode/QR properties
  barcodeFormat?: 'CODE128' | 'CODE39' | 'CODE93' | 'UPC' | 'EAN13' | 'EAN8' | 'QR';
  showText?: boolean;
  
  // Image properties
  imageUrl?: string;
  imageData?: string; // base64
}

export interface PrintJob {
  id: string;
  templateId: string;
  elements: PrintElement[];
  dimensions: PrintDimensions;
  copies: number;
  metadata: {
    orderNumber?: string;
    productName?: string;
    customerName?: string;
    createdAt: string;
    vendorId: string;
  };
}

export interface PrintOutput {
  format: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  data: string | Uint8Array;
  mimeType: string;
  filename: string;
  size: number;
}

export interface PrintEngineCapabilities {
  supportsColor: boolean;
  supportsImages: boolean;
  supportsBarcodes: boolean;
  supportsRotation: boolean;
  supportsTransparency: boolean;
  maxDPI: number;
  minDPI: number;
  supportedFonts: string[];
  supportedBarcodeFormats: string[];
}

export interface ValidationResult {
  valid: boolean;
  warnings: Array<{
    elementId: string;
    message: string;
    severity: 'warning' | 'error';
  }>;
  errors: Array<{
    elementId: string;
    message: string;
    suggestion?: string;
  }>;
}

export abstract class BasePrintEngine {
  protected name: string;
  protected format: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  protected capabilities: PrintEngineCapabilities;

  constructor(name: string, format: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL') {
    this.name = name;
    this.format = format;
    this.capabilities = this.getEngineCapabilities();
  }

  /**
   * Convert inches to points (1 inch = 72 points)
   */
  protected inchesToPoints(inches: number): number {
    return inches * 72;
  }

  /**
   * Convert inches to pixels at given DPI
   */
  protected inchesToPixels(inches: number, dpi: number): number {
    return inches * dpi;
  }

  /**
   * Convert points to inches
   */
  protected pointsToInches(points: number): number {
    return points / 72;
  }

  /**
   * Convert pixels to inches at given DPI
   */
  protected pixelsToInches(pixels: number, dpi: number): number {
    return pixels / dpi;
  }

  /**
   * Calculate print dimensions for all units
   */
  protected calculateDimensions(widthInches: number, heightInches: number, dpi: number): PrintDimensions {
    return {
      widthInches,
      heightInches,
      dpi,
      widthPoints: this.inchesToPoints(widthInches),
      heightPoints: this.inchesToPoints(heightInches),
      widthPixels: this.inchesToPixels(widthInches, dpi),
      heightPixels: this.inchesToPixels(heightInches, dpi)
    };
  }

  /**
   * Validate elements against engine capabilities
   */
  public validateElements(elements: PrintElement[], dimensions: PrintDimensions): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      warnings: [],
      errors: []
    };

    elements.forEach(element => {
      // Check bounds
      if (element.x < 0 || element.y < 0) {
        result.errors.push({
          elementId: element.id,
          message: 'Element position cannot be negative',
          suggestion: 'Move element to positive coordinates'
        });
      }

      if (element.x + element.width > dimensions.widthInches) {
        result.errors.push({
          elementId: element.id,
          message: 'Element extends beyond label width',
          suggestion: `Maximum X position is ${dimensions.widthInches - element.width} inches`
        });
      }

      if (element.y + element.height > dimensions.heightInches) {
        result.errors.push({
          elementId: element.id,
          message: 'Element extends beyond label height',
          suggestion: `Maximum Y position is ${dimensions.heightInches - element.height} inches`
        });
      }

      // Check engine capabilities
      if (element.type === 'image' && !this.capabilities.supportsImages) {
        result.errors.push({
          elementId: element.id,
          message: `${this.format} engine does not support images`,
          suggestion: 'Convert to text or remove image element'
        });
      }

      if (element.color && element.color !== '#000000' && !this.capabilities.supportsColor) {
        result.warnings.push({
          elementId: element.id,
          message: 'Color will be converted to black and white',
          severity: 'warning'
        });
      }

      if (element.rotation && !this.capabilities.supportsRotation) {
        result.errors.push({
          elementId: element.id,
          message: `${this.format} engine does not support rotation`,
          suggestion: 'Remove rotation or use different engine'
        });
      }

      // Font size validation
      if (element.fontSize && element.fontSize < 6) {
        result.warnings.push({
          elementId: element.id,
          message: 'Font size may be too small to read clearly',
          severity: 'warning'
        });
      }

      if (element.fontSize && element.fontSize > 72) {
        result.warnings.push({
          elementId: element.id,
          message: 'Large font size may not fit properly',
          severity: 'warning'
        });
      }
    });

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Get engine-specific capabilities
   */
  abstract getEngineCapabilities(): PrintEngineCapabilities;

  /**
   * Generate print output from elements
   */
  abstract generatePrintOutput(job: PrintJob): Promise<PrintOutput>;

  /**
   * Get supported media sizes for this engine
   */
  abstract getSupportedMediaSizes(): Array<{
    name: string;
    widthInches: number;
    heightInches: number;
    description: string;
  }>;

  /**
   * Preview generation (returns image data for preview)
   */
  abstract generatePreview(job: PrintJob): Promise<{
    imageData: string; // base64 PNG
    width: number;
    height: number;
  }>;
}

/**
 * Utility functions for unit conversion
 */
export const PrintEngineUtils = {
  inchesToPoints: (inches: number) => inches * 72,
  inchesToPixels: (inches: number, dpi: number) => inches * dpi,
  pointsToInches: (points: number) => points / 72,
  pixelsToInches: (pixels: number, dpi: number) => pixels / dpi,
  mmToInches: (mm: number) => mm / 25.4,
  inchesToMm: (inches: number) => inches * 25.4,
  
  /**
   * Calculate optimal DPI for given dimensions and target quality
   */
  calculateOptimalDPI: (widthInches: number, heightInches: number, targetQuality: 'draft' | 'normal' | 'high') => {
    const baseDPI = {
      draft: 150,
      normal: 203,
      high: 300
    };
    
    // Adjust for very small labels
    const minDimension = Math.min(widthInches, heightInches);
    if (minDimension < 1) {
      return Math.max(baseDPI[targetQuality], 300);
    }
    
    return baseDPI[targetQuality];
  },

  /**
   * Validate label dimensions
   */
  validateDimensions: (widthInches: number, heightInches: number) => {
    const issues = [];
    
    if (widthInches <= 0 || heightInches <= 0) {
      issues.push('Dimensions must be positive');
    }
    
    if (widthInches > 12 || heightInches > 12) {
      issues.push('Dimensions exceed maximum size (12 inches)');
    }
    
    if (widthInches < 0.5 || heightInches < 0.5) {
      issues.push('Dimensions may be too small for practical use');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
};
