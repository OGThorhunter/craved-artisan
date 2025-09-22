import { ResolvedData } from './dataResolver';

export interface RenderResult {
  mime: string;
  buffer: Buffer;
  url?: string;
}

export interface RenderConfig {
  template: LabelTemplate;
  payload: ResolvedData;
  dpi: number;
  widthIn: number;
  heightIn: number;
}

export interface LabelTemplate {
  version: string;
  size: {
    widthIn: number;
    heightIn: number;
    orientation: 'portrait' | 'landscape';
    cornerRadiusIn?: number;
  };
  units: string;
  dpi: number;
  elements: LabelElement[];
  dataBindings?: Record<string, string>;
  rules?: Array<{
    when: {
      exists?: string;
      equals?: { path: string; value: any };
      containsTag?: string;
    };
    then: {
      showElements?: string[];
      hideElements?: string[];
      setValue?: Array<{ id: string; value: string }>;
    };
  }>;
}

export interface LabelElement {
  type: 'text' | 'barcode' | 'image' | 'box' | 'line';
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  // Text specific
  font?: string;
  fontSize?: number;
  weight?: 'normal' | 'bold';
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  value?: string | { bind: string };
  wrap?: boolean;
  uppercase?: boolean;
  // Barcode specific
  symbology?: 'code128' | 'ean13' | 'upc' | 'qr';
  // Image specific
  source?: 'logo' | { url: string };
  // Shape specific
  stroke?: number;
  fill?: boolean;
}

/**
 * Base renderer interface
 */
export abstract class LabelRenderer {
  abstract render(config: RenderConfig): Promise<RenderResult>;
  
  protected resolveValue(element: LabelElement, payload: ResolvedData): string {
    if (typeof element.value === 'string') {
      return element.value;
    }
    
    if (typeof element.value === 'object' && element.value.bind) {
      const value = this.getNestedValue(payload, element.value.bind);
      if (element.uppercase) {
        return value.toUpperCase();
      }
      return value;
    }
    
    return '';
  }
  
  private getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj) || '';
  }
}

/**
 * PDF Renderer using PDFKit
 */
export class PDFRenderer extends LabelRenderer {
  async render(config: RenderConfig): Promise<RenderResult> {
    const PDFDocument = await import('pdfkit');
    const doc = new PDFDocument.default({
      size: [config.widthIn * 72, config.heightIn * 72], // Convert inches to points
      margins: 0
    });
    
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          mime: 'application/pdf',
          buffer
        });
      });
      
      doc.on('error', reject);
      
      try {
        this.renderElements(doc, config);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private renderElements(doc: any, config: RenderConfig) {
    const { template, payload } = config;
    
    for (const element of template.elements) {
      switch (element.type) {
        case 'text':
          this.renderText(doc, element, payload);
          break;
        case 'barcode':
          this.renderBarcode(doc, element, payload);
          break;
        case 'image':
          this.renderImage(doc, element, payload);
          break;
        case 'box':
          this.renderBox(doc, element);
          break;
        case 'line':
          this.renderLine(doc, element);
          break;
      }
    }
  }
  
  private renderText(doc: any, element: LabelElement, payload: ResolvedData) {
    const text = this.resolveValue(element, payload);
    if (!text) return;
    
    const x = element.x * 72; // Convert inches to points
    const y = element.y * 72;
    const width = (element.w || 100) * 72;
    const height = (element.h || 20) * 72;
    
    doc.fontSize(element.fontSize || 12);
    doc.font(element.font || 'Helvetica');
    
    if (element.weight === 'bold') {
      doc.font('Helvetica-Bold');
    }
    
    // Set alignment
    let align: 'left' | 'center' | 'right' = 'left';
    if (element.align === 'center') align = 'center';
    if (element.align === 'right') align = 'right';
    
    doc.text(text, x, y, {
      width,
      height,
      align,
      ellipsis: true
    });
  }
  
  private renderBarcode(doc: any, element: LabelElement, payload: ResolvedData) {
    const value = this.resolveValue(element, payload);
    if (!value) return;
    
    const x = element.x * 72;
    const y = element.y * 72;
    const width = (element.w || 100) * 72;
    const height = (element.h || 40) * 72;
    
    // For now, render as text placeholder
    // In a real implementation, you'd use a barcode library
    doc.fontSize(8);
    doc.text(`[${element.symbology?.toUpperCase() || 'BARCODE'}]`, x, y + height / 2 - 4);
    doc.text(value, x, y + height / 2 + 4, { width, align: 'center' });
    
    // Draw a simple rectangle to represent the barcode
    doc.rect(x, y, width, height).stroke();
  }
  
  private renderImage(doc: any, element: LabelElement, payload: ResolvedData) {
    const x = element.x * 72;
    const y = element.y * 72;
    const width = element.w! * 72;
    const height = element.h! * 72;
    
    // For now, render as placeholder rectangle
    // In a real implementation, you'd load and render the actual image
    doc.rect(x, y, width, height).stroke();
    doc.fontSize(8);
    doc.text('[IMAGE]', x + width / 2 - 20, y + height / 2 - 4);
    
    if (element.source === 'logo') {
      doc.text('LOGO', x + width / 2 - 15, y + height / 2 + 4);
    }
  }
  
  private renderBox(doc: any, element: LabelElement) {
    const x = element.x * 72;
    const y = element.y * 72;
    const width = element.w! * 72;
    const height = element.h! * 72;
    
    if (element.fill) {
      doc.rect(x, y, width, height).fill();
    } else {
      doc.rect(x, y, width, height).stroke();
    }
  }
  
  private renderLine(doc: any, element: LabelElement) {
    const x1 = element.x * 72;
    const y1 = element.y * 72;
    const x2 = (element.w || 0) * 72;
    const y2 = (element.h || 0) * 72;
    
    doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
  }
}

/**
 * ZPL Renderer for Zebra printers
 */
export class ZPLRenderer extends LabelRenderer {
  async render(config: RenderConfig): Promise<RenderResult> {
    const { template, payload } = config;
    
    let zpl = '';
    
    // ZPL header
    zpl += '^XA\n'; // Start of format
    
    // Set label size (in dots)
    const widthDots = Math.round(template.size.widthIn * template.dpi);
    const heightDots = Math.round(template.size.heightIn * template.dpi);
    zpl += `^PW${widthDots}\n`; // Print width
    zpl += `^LL${heightDots}\n`; // Label length
    
    // Render elements
    for (const element of template.elements) {
      zpl += this.renderElement(element, payload, template.dpi);
    }
    
    // ZPL footer
    zpl += '^XZ\n'; // End of format
    
    return {
      mime: 'text/plain',
      buffer: Buffer.from(zpl, 'utf8')
    };
  }
  
  private renderElement(element: LabelElement, payload: ResolvedData, dpi: number): string {
    const x = Math.round(element.x * dpi);
    const y = Math.round(element.y * dpi);
    
    switch (element.type) {
      case 'text':
        return this.renderZPLText(element, payload, x, y, dpi);
      case 'barcode':
        return this.renderZPLBarcode(element, payload, x, y, dpi);
      case 'image':
        return this.renderZPLImage(element, payload, x, y, dpi);
      case 'box':
        return this.renderZPLBox(element, x, y, dpi);
      case 'line':
        return this.renderZPLLine(element, x, y, dpi);
      default:
        return '';
    }
  }
  
  private renderZPLText(element: LabelElement, payload: ResolvedData, x: number, y: number, dpi: number): string {
    const text = this.resolveValue(element, payload);
    if (!text) return '';
    
    const fontSize = Math.round((element.fontSize || 12) * dpi / 72);
    const width = Math.round((element.w || 100) * dpi);
    const height = Math.round((element.h || 20) * dpi);
    
    // ZPL text field
    let zpl = `^FO${x},${y}\n`; // Field origin
    zpl += `^A0N,${fontSize},${fontSize}\n`; // Font and size
    zpl += `^FB${width},1,0,L\n`; // Field block for text wrapping
    zpl += `^FD${text}\n`; // Field data
    zpl += `^FS\n`; // Field separator
    
    return zpl;
  }
  
  private renderZPLBarcode(element: LabelElement, payload: ResolvedData, x: number, y: number, dpi: number): string {
    const value = this.resolveValue(element, payload);
    if (!value) return '';
    
    const width = Math.round((element.w || 100) * dpi);
    const height = Math.round((element.h || 40) * dpi);
    
    let zpl = `^FO${x},${y}\n`; // Field origin
    
    // Choose symbology
    switch (element.symbology) {
      case 'qr':
        zpl += `^BQN,2,3\n`; // QR code
        break;
      case 'code128':
        zpl += `^BCN,${height},Y,N,N\n`; // Code 128
        break;
      case 'ean13':
        zpl += `^BEN,${height},Y,N\n`; // EAN-13
        break;
      case 'upc':
        zpl += `^BUN,${height},Y,N\n`; // UPC
        break;
      default:
        zpl += `^BCN,${height},Y,N,N\n`; // Default to Code 128
    }
    
    zpl += `^FD${value}\n`; // Field data
    zpl += `^FS\n`; // Field separator
    
    return zpl;
  }
  
  private renderZPLImage(element: LabelElement, payload: ResolvedData, x: number, y: number, dpi: number): string {
    const width = Math.round(element.w! * dpi);
    const height = Math.round(element.h! * dpi);
    
    // For now, render as text placeholder
    // In a real implementation, you'd convert the image to ZPL format
    let zpl = `^FO${x},${y}\n`; // Field origin
    zpl += `^A0N,20,20\n`; // Font
    zpl += `^FD[IMAGE]\n`; // Field data
    zpl += `^FS\n`; // Field separator
    
    // Draw rectangle around image area
    zpl += `^FO${x},${y}\n`; // Field origin
    zpl += `^GB${width},${height},2,B,0\n`; // Graphic box
    zpl += `^FS\n`; // Field separator
    
    return zpl;
  }
  
  private renderZPLBox(element: LabelElement, x: number, y: number, dpi: number): string {
    const width = Math.round(element.w! * dpi);
    const height = Math.round(element.h! * dpi);
    const thickness = Math.round((element.stroke || 1) * dpi);
    
    let zpl = `^FO${x},${y}\n`; // Field origin
    
    if (element.fill) {
      zpl += `^GB${width},${height},0,B,0\n`; // Filled box
    } else {
      zpl += `^GB${width},${height},${thickness},B,0\n`; // Outlined box
    }
    
    zpl += `^FS\n`; // Field separator
    
    return zpl;
  }
  
  private renderZPLLine(element: LabelElement, x: number, y: number, dpi: number): string {
    const x2 = Math.round((element.w || 0) * dpi);
    const y2 = Math.round((element.h || 0) * dpi);
    const thickness = Math.round((element.stroke || 1) * dpi);
    
    let zpl = `^FO${x},${y}\n`; // Field origin
    zpl += `^GB${x2 - x},${y2 - y},${thickness},L,0\n`; // Line
    zpl += `^FS\n`; // Field separator
    
    return zpl;
  }
}

/**
 * Brother QL Renderer (simplified)
 */
export class BrotherQLRenderer extends LabelRenderer {
  async render(config: RenderConfig): Promise<RenderResult> {
    // For MVP, Brother QL will fall back to PDF rendering
    // In a full implementation, this would generate Brother-specific commands
    const pdfRenderer = new PDFRenderer();
    return pdfRenderer.render(config);
  }
}

/**
 * Renderer registry
 */
export const renderers = {
  PDF: PDFRenderer,
  ZPL: ZPLRenderer,
  BROTHER_QL: BrotherQLRenderer
};

/**
 * Get renderer by engine type
 */
export function getRenderer(engine: string): new () => LabelRenderer {
  const RendererClass = renderers[engine as keyof typeof renderers];
  if (!RendererClass) {
    throw new Error(`Unsupported renderer engine: ${engine}`);
  }
  return RendererClass;
}
