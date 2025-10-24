/**
 * PDF Print Engine
 * High-quality PDF generation with precise inch-to-point conversion
 */

import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { 
  BasePrintEngine, 
  PrintJob, 
  PrintOutput, 
  PrintElement,
  PrintDimensions,
  PrintEngineCapabilities
} from './basePrintEngine';

export class PDFPrintEngine extends BasePrintEngine {
  private fonts: Map<string, any> = new Map();

  constructor() {
    super('PDF Print Engine', 'PDF');
  }

  getEngineCapabilities(): PrintEngineCapabilities {
    return {
      supportsColor: true,
      supportsImages: true,
      supportsBarcodes: true,
      supportsRotation: true,
      supportsTransparency: true,
      maxDPI: 600,
      minDPI: 72,
      supportedFonts: ['helvetica', 'times', 'courier', 'arial', 'calibri'],
      supportedBarcodeFormats: ['CODE128', 'CODE39', 'UPC', 'EAN13', 'QR']
    };
  }

  getSupportedMediaSizes() {
    return [
      { name: '1" × 1" Square', widthInches: 1, heightInches: 1, description: 'Small square label' },
      { name: '2" × 1" Standard', widthInches: 2, heightInches: 1, description: 'Standard product label' },
      { name: '3" × 2" Medium', widthInches: 3, heightInches: 2, description: 'Medium product label' },
      { name: '4" × 6" Shipping', widthInches: 4, heightInches: 6, description: 'Standard shipping label' },
      { name: '4" × 1" Address', widthInches: 4, heightInches: 1, description: 'Address label' },
      { name: '2" × 2" Square', widthInches: 2, heightInches: 2, description: 'Large square label' },
      { name: '8.5" × 11" Full Page', widthInches: 8.5, heightInches: 11, description: 'Full page (Letter)' },
      { name: 'A4', widthInches: 8.27, heightInches: 11.69, description: 'A4 paper size' }
    ];
  }

  async generatePrintOutput(job: PrintJob): Promise<PrintOutput> {
    try {
      const pdf = new jsPDF({
        orientation: job.dimensions.widthInches > job.dimensions.heightInches ? 'landscape' : 'portrait',
        unit: 'in',
        format: [job.dimensions.widthInches, job.dimensions.heightInches],
        precision: 16
      });

      // Set high-quality rendering
      pdf.setCreationDate(new Date());
      pdf.setProperties({
        title: `Label - ${job.metadata.orderNumber || job.id}`,
        subject: 'Craved Artisan Label',
        author: 'Craved Artisan Platform',
        creator: 'Label Generator v2.0'
      });

      // Generate each copy
      for (let copy = 0; copy < job.copies; copy++) {
        if (copy > 0) {
          pdf.addPage([job.dimensions.widthInches, job.dimensions.heightInches]);
        }

        await this.renderElements(pdf, job.elements, job.dimensions);
      }

      const pdfData = pdf.output('arraybuffer');
      const uint8Array = new Uint8Array(pdfData);

      return {
        format: 'PDF',
        data: uint8Array,
        mimeType: 'application/pdf',
        filename: `label-${job.id}-${Date.now()}.pdf`,
        size: uint8Array.length
      };

    } catch (error) {
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePreview(job: PrintJob): Promise<{ imageData: string; width: number; height: number }> {
    try {
      // Create a temporary PDF for preview
      const pdf = new jsPDF({
        orientation: job.dimensions.widthInches > job.dimensions.heightInches ? 'landscape' : 'portrait',
        unit: 'in',
        format: [job.dimensions.widthInches, job.dimensions.heightInches],
        precision: 16
      });

      await this.renderElements(pdf, job.elements, job.dimensions);

      // Convert to canvas for preview
      const canvas = document.createElement('canvas');
      const previewDPI = 150; // Good quality for preview
      const width = job.dimensions.widthInches * previewDPI;
      const height = job.dimensions.heightInches * previewDPI;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Render elements directly to canvas for preview
      await this.renderElementsToCanvas(ctx, job.elements, job.dimensions, previewDPI);

      return {
        imageData: canvas.toDataURL('image/png'),
        width,
        height
      };

    } catch (error) {
      throw new Error(`Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async renderElements(pdf: jsPDF, elements: PrintElement[], dimensions: PrintDimensions): Promise<void> {
    // Sort elements by z-index (render background elements first)
    const sortedElements = [...elements].sort((a, b) => {
      const aZIndex = this.getElementZIndex(a.type);
      const bZIndex = this.getElementZIndex(b.type);
      return aZIndex - bZIndex;
    });

    for (const element of sortedElements) {
      await this.renderElement(pdf, element, dimensions);
    }
  }

  private async renderElement(pdf: jsPDF, element: PrintElement, dimensions: PrintDimensions): Promise<void> {
    switch (element.type) {
      case 'text':
        await this.renderText(pdf, element);
        break;
      case 'barcode':
        await this.renderBarcode(pdf, element);
        break;
      case 'qr':
        await this.renderQRCode(pdf, element);
        break;
      case 'image':
        await this.renderImage(pdf, element);
        break;
      case 'rectangle':
        await this.renderRectangle(pdf, element);
        break;
      case 'line':
        await this.renderLine(pdf, element);
        break;
      default:
        console.warn(`Unsupported element type: ${element.type}`);
    }
  }

  private async renderText(pdf: jsPDF, element: PrintElement): Promise<void> {
    if (!element.content) return;

    // Set font properties
    const fontSize = element.fontSize || 12;
    const fontFamily = this.normalizeFontFamily(element.fontFamily || 'helvetica');
    const fontWeight = element.fontWeight === 'bold' ? 'bold' : 'normal';
    
    pdf.setFont(fontFamily, fontWeight);
    pdf.setFontSize(fontSize);

    // Set text color
    const color = this.parseColor(element.color || '#000000');
    pdf.setTextColor(color.r, color.g, color.b);

    // Handle background color
    if (element.backgroundColor) {
      const bgColor = this.parseColor(element.backgroundColor);
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
      pdf.rect(element.x, element.y, element.width, element.height, 'F');
    }

    // Calculate text position based on alignment
    let textX = element.x;
    const textY = element.y + (element.height / 2) + (fontSize / 144); // Center vertically and adjust for font baseline

    if (element.alignment === 'center') {
      textX = element.x + (element.width / 2);
    } else if (element.alignment === 'right') {
      textX = element.x + element.width;
    }

    // Handle text wrapping if needed
    const textWidth = pdf.getTextWidth(element.content);
    const maxWidth = element.width;

    if (textWidth > maxWidth) {
      // Split text and wrap
      const lines = pdf.splitTextToSize(element.content, maxWidth);
      const lineHeight = fontSize / 72; // Convert points to inches
      
      lines.forEach((line: string, index: number) => {
        const lineY = textY + (index * lineHeight);
        pdf.text(line, textX, lineY, {
          align: element.alignment || 'left'
        });
      });
    } else {
      pdf.text(element.content, textX, textY, {
        align: element.alignment || 'left'
      });
    }
  }

  private async renderBarcode(pdf: jsPDF, element: PrintElement): Promise<void> {
    if (!element.content) return;

    try {
      // Create canvas for barcode generation
      const canvas = document.createElement('canvas');
      const barcodeFormat = element.barcodeFormat || 'CODE128';
      
      JsBarcode(canvas, element.content, {
        format: barcodeFormat,
        width: 2,
        height: 60,
        displayValue: element.showText !== false,
        fontSize: 12,
        margin: 0,
        background: 'transparent'
      });

      // Add barcode image to PDF
      const barcodeData = canvas.toDataURL('image/png');
      pdf.addImage(
        barcodeData, 
        'PNG', 
        element.x, 
        element.y, 
        element.width, 
        element.height,
        undefined,
        'FAST'
      );

    } catch (error) {
      console.error('Barcode generation failed:', error);
      // Fallback to text
      await this.renderText(pdf, {
        ...element,
        type: 'text',
        content: element.content,
        fontSize: 10
      });
    }
  }

  private async renderQRCode(pdf: jsPDF, element: PrintElement): Promise<void> {
    if (!element.content) return;

    try {
      const qrDataUrl = await QRCode.toDataURL(element.content, {
        width: Math.round(element.width * 72), // Convert to pixels for generation
        margin: 1,
        color: {
          dark: element.color || '#000000',
          light: element.backgroundColor || '#ffffff'
        }
      });

      pdf.addImage(
        qrDataUrl,
        'PNG',
        element.x,
        element.y,
        element.width,
        element.height,
        undefined,
        'FAST'
      );

    } catch (error) {
      console.error('QR code generation failed:', error);
      // Fallback to text
      await this.renderText(pdf, {
        ...element,
        type: 'text',
        content: element.content,
        fontSize: 8
      });
    }
  }

  private async renderImage(pdf: jsPDF, element: PrintElement): Promise<void> {
    if (!element.imageUrl && !element.imageData) return;

    try {
      const imageData = element.imageData || element.imageUrl!;
      
      pdf.addImage(
        imageData,
        'PNG', // Specify format
        element.x,
        element.y,
        element.width,
        element.height,
        undefined,
        'FAST'
      );

    } catch (error) {
      console.error('Image rendering failed:', error);
      // Draw placeholder rectangle
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(element.x, element.y, element.width, element.height);
      
      // Add "Image" text
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text('Image', element.x + element.width/2, element.y + element.height/2, { align: 'center' });
    }
  }

  private async renderRectangle(pdf: jsPDF, element: PrintElement): Promise<void> {
    // Set fill color
    if (element.backgroundColor) {
      const fillColor = this.parseColor(element.backgroundColor);
      pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
    }

    // Set border color and width
    if (element.borderColor && element.borderWidth) {
      const borderColor = this.parseColor(element.borderColor);
      pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
      pdf.setLineWidth(element.borderWidth / 72); // Convert points to inches
    }

    // Draw rectangle
    const style = element.backgroundColor && element.borderColor ? 'FD' : 
                  element.backgroundColor ? 'F' : 
                  element.borderColor ? 'D' : 'D';
    
    pdf.rect(element.x, element.y, element.width, element.height, style);
  }

  private async renderLine(pdf: jsPDF, element: PrintElement): Promise<void> {
    if (element.borderColor && element.borderWidth) {
      const color = this.parseColor(element.borderColor);
      pdf.setDrawColor(color.r, color.g, color.b);
      pdf.setLineWidth(element.borderWidth / 72); // Convert points to inches
    }

    pdf.line(element.x, element.y, element.x + element.width, element.y + element.height);
  }

  private async renderElementsToCanvas(
    ctx: CanvasRenderingContext2D, 
    elements: PrintElement[], 
    dimensions: PrintDimensions,
    dpi: number
  ): Promise<void> {
    // Simple canvas rendering for preview
    const scale = dpi / 72; // Convert from inches to pixels

    elements.forEach(element => {
      const x = element.x * dpi;
      const y = element.y * dpi;
      const width = element.width * dpi;
      const height = element.height * dpi;

      ctx.save();

      switch (element.type) {
        case 'text':
          if (element.content) {
            ctx.font = `${(element.fontSize || 12) * scale}px ${element.fontFamily || 'Arial'}`;
            ctx.fillStyle = element.color || '#000000';
            ctx.textAlign = (element.alignment as CanvasTextAlign) || 'left';
            ctx.fillText(element.content, x, y + height/2);
          }
          break;
        
        case 'rectangle':
          if (element.backgroundColor) {
            ctx.fillStyle = element.backgroundColor;
            ctx.fillRect(x, y, width, height);
          }
          if (element.borderColor && element.borderWidth) {
            ctx.strokeStyle = element.borderColor;
            ctx.lineWidth = element.borderWidth * scale;
            ctx.strokeRect(x, y, width, height);
          }
          break;
      }

      ctx.restore();
    });
  }

  private getElementZIndex(type: string): number {
    // Define rendering order (lower numbers render first/behind)
    const zIndexMap: Record<string, number> = {
      'rectangle': 1,
      'line': 2,
      'image': 3,
      'barcode': 4,
      'qr': 4,
      'text': 5
    };
    return zIndexMap[type] || 3;
  }

  private normalizeFontFamily(fontFamily: string): string {
    const fontMap: Record<string, string> = {
      'arial': 'helvetica',
      'calibri': 'helvetica',
      'sans-serif': 'helvetica',
      'serif': 'times',
      'monospace': 'courier'
    };
    return fontMap[fontFamily.toLowerCase()] || fontFamily.toLowerCase();
  }

  private parseColor(colorString: string): { r: number; g: number; b: number } {
    // Remove # if present
    const hex = colorString.replace('#', '');
    
    // Handle 3-digit hex
    const fullHex = hex.length === 3 ? 
      hex.split('').map(char => char + char).join('') : 
      hex;

    const r = parseInt(fullHex.substr(0, 2), 16);
    const g = parseInt(fullHex.substr(2, 2), 16);  
    const b = parseInt(fullHex.substr(4, 2), 16);

    return { r, g, b };
  }
}
