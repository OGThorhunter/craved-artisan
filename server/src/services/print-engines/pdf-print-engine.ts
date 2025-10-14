import PDFDocument from 'pdfkit';
import { LabelProfile } from '@prisma/client';
import { logger } from '../../logger';

export interface LabelData {
  id: string;
  text: string;
  barcode?: string;
  qrCode?: string;
  image?: Buffer;
  customFields?: Record<string, any>;
}

export interface PrintJobRequest {
  labelProfile: LabelProfile;
  labelData: LabelData[];
  printerSettings?: {
    dpi?: number;
    copies?: number;
  };
}

export class PDFPrintEngine {
  private static readonly DEFAULT_DPI = 300;
  private static readonly POINTS_PER_INCH = 72;

  /**
   * Generate PDF for label printing with precise measurements
   */
  async generatePDF(request: PrintJobRequest): Promise<Buffer> {
    const { labelProfile, labelData, printerSettings } = request;
    const dpi = printerSettings?.dpi || PDFPrintEngine.DEFAULT_DPI;

    try {
      logger.info('Starting PDF generation', {
        labelCount: labelData.length,
        profileId: labelProfile.id,
        dimensions: `${labelProfile.width}" × ${labelProfile.height}"`
      });

      // Convert inches to points for PDF
      const widthPoints = labelProfile.width * PDFPrintEngine.POINTS_PER_INCH;
      const heightPoints = labelProfile.height * PDFPrintEngine.POINTS_PER_INCH;

      const doc = new PDFDocument({
        size: [widthPoints, heightPoints],
        margin: 0,
        layout: labelProfile.orientation === 'LANDSCAPE' ? 'landscape' : 'portrait'
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));

      // Generate labels with precise positioning
      for (let i = 0; i < labelData.length; i++) {
        if (i > 0) doc.addPage();
        await this.renderLabel(doc, labelData[i], labelProfile, dpi);
      }

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          logger.info('PDF generation completed', {
            sizeBytes: pdfBuffer.length,
            labelCount: labelData.length
          });
          resolve(pdfBuffer);
        });
        doc.on('error', reject);
      });

    } catch (error) {
      logger.error('PDF generation failed', { error: error.message });
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Render a single label on the PDF document
   */
  private async renderLabel(
    doc: PDFKit.PDFDocument, 
    labelData: LabelData, 
    profile: LabelProfile,
    dpi: number
  ): Promise<void> {
    const { width, height } = profile;
    const marginPoints = 0.1 * PDFPrintEngine.POINTS_PER_INCH; // 0.1" margin

    try {
      // Parse template data if available
      const template = profile.templateData ? JSON.parse(profile.templateData) : null;
      
      if (template && template.elements) {
        // Render based on template definition
        await this.renderFromTemplate(doc, labelData, template, width, height, marginPoints);
      } else {
        // Fallback simple layout
        await this.renderSimpleLayout(doc, labelData, width, height, marginPoints);
      }

    } catch (error) {
      logger.error('Label rendering failed', { 
        labelId: labelData.id, 
        error: error.message 
      });
      
      // Render error indicator
      this.renderErrorLabel(doc, labelData.id, width, height);
    }
  }

  /**
   * Render label based on template definition
   */
  private async renderFromTemplate(
    doc: PDFKit.PDFDocument,
    labelData: LabelData,
    template: any,
    width: number,
    height: number,
    margin: number
  ): Promise<void> {
    const elements = template.elements || [];

    for (const element of elements) {
      const x = element.x * PDFPrintEngine.POINTS_PER_INCH;
      const y = element.y * PDFPrintEngine.POINTS_PER_INCH;
      const elementWidth = element.width * PDFPrintEngine.POINTS_PER_INCH;
      const elementHeight = element.height * PDFPrintEngine.POINTS_PER_INCH;

      switch (element.type) {
        case 'text':
          await this.renderTextElement(doc, element, labelData, x, y, elementWidth, elementHeight);
          break;
        
        case 'barcode':
          await this.renderBarcodeElement(doc, element, labelData, x, y, elementWidth, elementHeight);
          break;
        
        case 'qrcode':
          await this.renderQRCodeElement(doc, element, labelData, x, y, elementWidth, elementHeight);
          break;
        
        case 'image':
          await this.renderImageElement(doc, element, labelData, x, y, elementWidth, elementHeight);
          break;
        
        case 'rectangle':
          this.renderRectangleElement(doc, element, x, y, elementWidth, elementHeight);
          break;
      }
    }
  }

  /**
   * Render simple fallback layout
   */
  private async renderSimpleLayout(
    doc: PDFKit.PDFDocument,
    labelData: LabelData,
    width: number,
    height: number,
    margin: number
  ): Promise<void> {
    const centerX = (width * PDFPrintEngine.POINTS_PER_INCH) / 2;
    const centerY = (height * PDFPrintEngine.POINTS_PER_INCH) / 2;

    // Main text centered
    doc.fontSize(12)
       .text(labelData.text, margin, margin, {
         width: width * PDFPrintEngine.POINTS_PER_INCH - (2 * margin),
         align: 'center'
       });

    // Barcode if present
    if (labelData.barcode) {
      const barcodeY = centerY + 20;
      doc.fontSize(8)
         .text(`*${labelData.barcode}*`, margin, barcodeY, {
           width: width * PDFPrintEngine.POINTS_PER_INCH - (2 * margin),
           align: 'center'
         });
    }
  }

  /**
   * Render text element with formatting
   */
  private async renderTextElement(
    doc: PDFKit.PDFDocument,
    element: any,
    labelData: LabelData,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    const fontSize = element.fontSize || 12;
    const fontFamily = element.fontFamily || 'Helvetica';
    const textAlign = element.textAlign || 'left';
    const color = element.color || '#000000';

    // Resolve text content with data binding
    let textContent = element.text || '';
    textContent = this.resolveDataBinding(textContent, labelData);

    doc.font(fontFamily)
       .fontSize(fontSize)
       .fillColor(color)
       .text(textContent, x, y, {
         width,
         height,
         align: textAlign,
         ellipsis: true
       });
  }

  /**
   * Render barcode element
   */
  private async renderBarcodeElement(
    doc: PDFKit.PDFDocument,
    element: any,
    labelData: LabelData,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    const barcodeData = this.resolveDataBinding(element.data || '{{barcode}}', labelData);
    
    if (barcodeData) {
      // Simple barcode representation (in production, use a barcode library)
      doc.fontSize(8)
         .text(`*${barcodeData}*`, x, y + height - 20, {
           width,
           align: 'center'
         });

      // Draw barcode lines simulation
      const lineCount = 20;
      const lineWidth = width / lineCount;
      for (let i = 0; i < lineCount; i++) {
        const lineX = x + (i * lineWidth);
        const lineHeight = (i % 2 === 0) ? height - 25 : height - 35;
        doc.rect(lineX, y, 2, lineHeight).fill('#000000');
      }
    }
  }

  /**
   * Render QR code element
   */
  private async renderQRCodeElement(
    doc: PDFKit.PDFDocument,
    element: any,
    labelData: LabelData,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    const qrData = this.resolveDataBinding(element.data || '{{qrCode}}', labelData);
    
    if (qrData) {
      // QR code placeholder (in production, use QR code library)
      const size = Math.min(width, height);
      doc.rect(x, y, size, size)
         .stroke('#000000');
      
      doc.fontSize(6)
         .text('QR', x + size/2 - 6, y + size/2 - 4);
    }
  }

  /**
   * Render image element
   */
  private async renderImageElement(
    doc: PDFKit.PDFDocument,
    element: any,
    labelData: LabelData,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    if (labelData.image) {
      try {
        doc.image(labelData.image, x, y, { width, height });
      } catch (error) {
        // Image failed, render placeholder
        doc.rect(x, y, width, height)
           .stroke('#cccccc');
        doc.fontSize(8)
           .text('Image', x + width/2 - 15, y + height/2 - 4);
      }
    }
  }

  /**
   * Render rectangle element
   */
  private renderRectangleElement(
    doc: PDFKit.PDFDocument,
    element: any,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const fillColor = element.fillColor || null;
    const strokeColor = element.strokeColor || '#000000';
    const strokeWidth = element.strokeWidth || 1;

    doc.lineWidth(strokeWidth);
    
    if (fillColor) {
      doc.rect(x, y, width, height)
         .fillAndStroke(fillColor, strokeColor);
    } else {
      doc.rect(x, y, width, height)
         .stroke(strokeColor);
    }
  }

  /**
   * Render error indicator when label generation fails
   */
  private renderErrorLabel(
    doc: PDFKit.PDFDocument,
    labelId: string,
    width: number,
    height: number
  ): void {
    const centerX = (width * PDFPrintEngine.POINTS_PER_INCH) / 2;
    const centerY = (height * PDFPrintEngine.POINTS_PER_INCH) / 2;

    doc.fontSize(10)
       .fillColor('#ff0000')
       .text('ERROR', centerX - 20, centerY - 15);
    
    doc.fontSize(6)
       .fillColor('#666666')
       .text(`ID: ${labelId}`, centerX - 30, centerY + 5);
  }

  /**
   * Resolve data binding in text (e.g., {{text}} -> actual value)
   */
  private resolveDataBinding(template: string, labelData: LabelData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      switch (key) {
        case 'text': return labelData.text || '';
        case 'barcode': return labelData.barcode || '';
        case 'qrCode': return labelData.qrCode || '';
        case 'id': return labelData.id || '';
        default:
          // Check custom fields
          return labelData.customFields?.[key]?.toString() || match;
      }
    });
  }

  /**
   * Validate label dimensions for PDF output
   */
  static validateDimensions(width: number, height: number): boolean {
    // Minimum 0.5" x 0.5", maximum 12" x 18"
    return width >= 0.5 && width <= 12 && height >= 0.5 && height <= 18;
  }

  /**
   * Calculate optimal DPI for label size
   */
  static calculateOptimalDPI(width: number, height: number): number {
    const area = width * height;
    if (area <= 2) return 300; // Small labels need higher DPI
    if (area <= 8) return 203; // Medium labels 
    return 150; // Large labels can use lower DPI
  }
}
