import { LabelProfile } from '@prisma/client';
import { LabelData } from './pdf-print-engine';
import { logger } from '../../logger';

export interface ZPLPrinterSettings {
  dpi: number; // 203 or 300 DPI typically
  printSpeed: number; // 1-14
  printDensity: number; // 0-30
  labelTop: number; // Label stop position
  labelLength: number; // Length for continuous media
}

export class ZPLPrintEngine {
  private static readonly DEFAULT_DPI = 203;
  
  /**
   * Generate ZPL commands for Zebra thermal printers
   */
  async generateZPL(
    labelProfile: LabelProfile,
    labelData: LabelData[],
    printerSettings?: Partial<ZPLPrinterSettings>
  ): Promise<string> {
    const settings = this.mergeSettings(printerSettings);
    
    try {
      logger.info('Starting ZPL generation', {
        labelCount: labelData.length,
        profileId: labelProfile.id,
        dpi: settings.dpi
      });

      let zplCommands = '';
      
      // Add printer configuration
      zplCommands += this.generatePrinterConfig(labelProfile, settings);
      
      // Generate each label
      for (const label of labelData) {
        zplCommands += this.generateSingleLabel(labelProfile, label, settings);
      }

      logger.info('ZPL generation completed', {
        commandLength: zplCommands.length,
        labelCount: labelData.length
      });

      return zplCommands;

    } catch (error) {
      logger.error('ZPL generation failed', { error: error.message });
      throw new Error(`ZPL generation failed: ${error.message}`);
    }
  }

  /**
   * Generate printer configuration commands
   */
  private generatePrinterConfig(
    labelProfile: LabelProfile,
    settings: ZPLPrinterSettings
  ): string {
    const widthDots = Math.round(labelProfile.width * settings.dpi);
    const heightDots = Math.round(labelProfile.height * settings.dpi);

    let config = '';
    
    // Set print density
    config += `^MD${settings.printDensity}\n`;
    
    // Set print speed
    config += `^PR${settings.printSpeed}\n`;
    
    // Set label length for continuous media
    if (labelProfile.mediaType === 'CONTINUOUS') {
      config += `^LL${heightDots}\n`;
    }
    
    // Set label top position
    config += `^LT${settings.labelTop}\n`;
    
    return config;
  }

  /**
   * Generate ZPL for a single label
   */
  private generateSingleLabel(
    labelProfile: LabelProfile,
    labelData: LabelData,
    settings: ZPLPrinterSettings
  ): string {
    const widthDots = Math.round(labelProfile.width * settings.dpi);
    const heightDots = Math.round(labelProfile.height * settings.dpi);

    let zpl = '';
    
    // Start label format
    zpl += '^XA\n';
    
    // Set label dimensions
    zpl += `^PW${widthDots}\n`;
    
    try {
      // Parse template data if available
      const template = labelProfile.templateData ? JSON.parse(labelProfile.templateData) : null;
      
      if (template && template.elements) {
        zpl += this.renderFromTemplate(template, labelData, settings);
      } else {
        zpl += this.renderSimpleLayout(labelData, widthDots, heightDots, settings);
      }

    } catch (error) {
      logger.error('ZPL label rendering failed', { 
        labelId: labelData.id, 
        error: error.message 
      });
      
      // Render error indicator
      zpl += this.renderErrorLabel(labelData.id, widthDots, heightDots);
    }
    
    // End label format
    zpl += '^XZ\n';
    
    return zpl;
  }

  /**
   * Render label from template definition
   */
  private renderFromTemplate(
    template: any,
    labelData: LabelData,
    settings: ZPLPrinterSettings
  ): string {
    let zpl = '';
    const elements = template.elements || [];

    for (const element of elements) {
      const x = Math.round(element.x * settings.dpi);
      const y = Math.round(element.y * settings.dpi);
      const width = Math.round(element.width * settings.dpi);
      const height = Math.round(element.height * settings.dpi);

      switch (element.type) {
        case 'text':
          zpl += this.renderTextElement(element, labelData, x, y, width, height);
          break;
        
        case 'barcode':
          zpl += this.renderBarcodeElement(element, labelData, x, y, width, height);
          break;
        
        case 'qrcode':
          zpl += this.renderQRCodeElement(element, labelData, x, y, width, height);
          break;
        
        case 'rectangle':
          zpl += this.renderRectangleElement(element, x, y, width, height);
          break;
        
        case 'line':
          zpl += this.renderLineElement(element, x, y, width, height);
          break;
      }
    }

    return zpl;
  }

  /**
   * Render simple layout for labels without templates
   */
  private renderSimpleLayout(
    labelData: LabelData,
    widthDots: number,
    heightDots: number,
    settings: ZPLPrinterSettings
  ): string {
    let zpl = '';
    const margin = Math.round(0.1 * settings.dpi); // 0.1" margin
    
    // Main text
    const textX = margin;
    const textY = margin;
    zpl += `^FO${textX},${textY}^A0N,30,30^FD${this.escapeZPLText(labelData.text)}^FS\n`;
    
    // Barcode if present
    if (labelData.barcode) {
      const barcodeX = margin;
      const barcodeY = Math.round(heightDots * 0.6);
      const barcodeWidth = widthDots - (2 * margin);
      const barcodeHeight = Math.round(heightDots * 0.3);
      
      zpl += `^FO${barcodeX},${barcodeY}^BY2,2,${barcodeHeight}^BCN,,Y,N^FD${labelData.barcode}^FS\n`;
    }
    
    return zpl;
  }

  /**
   * Render text element in ZPL
   */
  private renderTextElement(
    element: any,
    labelData: LabelData,
    x: number,
    y: number,
    width: number,
    height: number
  ): string {
    const fontSize = element.fontSize || 30;
    const fontWidth = element.fontWidth || fontSize;
    const fontType = this.mapFontType(element.fontFamily);
    const rotation = this.mapRotation(element.rotation || 0);
    
    // Resolve text content
    let textContent = element.text || '';
    textContent = this.resolveDataBinding(textContent, labelData);
    textContent = this.escapeZPLText(textContent);
    
    // Handle text alignment by adjusting position
    if (element.textAlign === 'center') {
      // ZPL doesn't have native center alignment, estimate positioning
      const estimatedTextWidth = textContent.length * (fontSize * 0.6);
      x = Math.max(0, x + (width - estimatedTextWidth) / 2);
    } else if (element.textAlign === 'right') {
      const estimatedTextWidth = textContent.length * (fontSize * 0.6);
      x = Math.max(0, x + width - estimatedTextWidth);
    }

    return `^FO${x},${y}^A${fontType}${rotation},${fontSize},${fontWidth}^FD${textContent}^FS\n`;
  }

  /**
   * Render barcode element in ZPL
   */
  private renderBarcodeElement(
    element: any,
    labelData: LabelData,
    x: number,
    y: number,
    width: number,
    height: number
  ): string {
    const barcodeType = element.barcodeType || 'CODE128';
    const barcodeData = this.resolveDataBinding(element.data || '{{barcode}}', labelData);
    
    if (!barcodeData) return '';
    
    const moduleWidth = element.moduleWidth || 2;
    const wideBarRatio = element.wideBarRatio || 2;
    
    let zplBarcode = '';
    
    switch (barcodeType) {
      case 'CODE128':
        zplBarcode = `^FO${x},${y}^BY${moduleWidth},${wideBarRatio},${height}^BCN,,Y,N^FD${barcodeData}^FS\n`;
        break;
      
      case 'CODE39':
        zplBarcode = `^FO${x},${y}^BY${moduleWidth},${wideBarRatio},${height}^B3N,,Y,N^FD${barcodeData}^FS\n`;
        break;
      
      case 'EAN13':
        zplBarcode = `^FO${x},${y}^BY${moduleWidth},${wideBarRatio},${height}^BEN,,Y,N^FD${barcodeData}^FS\n`;
        break;
      
      case 'UPCA':
        zplBarcode = `^FO${x},${y}^BY${moduleWidth},${wideBarRatio},${height}^BUN,,Y,N^FD${barcodeData}^FS\n`;
        break;
      
      default:
        // Default to Code128
        zplBarcode = `^FO${x},${y}^BY${moduleWidth},${wideBarRatio},${height}^BCN,,Y,N^FD${barcodeData}^FS\n`;
    }
    
    return zplBarcode;
  }

  /**
   * Render QR code element in ZPL
   */
  private renderQRCodeElement(
    element: any,
    labelData: LabelData,
    x: number,
    y: number,
    width: number,
    height: number
  ): string {
    const qrData = this.resolveDataBinding(element.data || '{{qrCode}}', labelData);
    
    if (!qrData) return '';
    
    const magnification = element.magnification || 5;
    const errorCorrection = element.errorCorrection || 'M'; // L, M, Q, H
    const maskValue = element.maskValue || 7;
    
    return `^FO${x},${y}^BQN,2,${magnification},${errorCorrection},${maskValue}^FD${qrData}^FS\n`;
  }

  /**
   * Render rectangle element in ZPL
   */
  private renderRectangleElement(
    element: any,
    x: number,
    y: number,
    width: number,
    height: number
  ): string {
    const borderWidth = element.strokeWidth || 1;
    const fillColor = element.fillColor || null;
    
    if (fillColor && fillColor !== 'transparent') {
      // Filled rectangle
      return `^FO${x},${y}^GB${width},${height},${height}^FS\n`;
    } else {
      // Border only
      let zpl = '';
      // Top border
      zpl += `^FO${x},${y}^GB${width},${borderWidth},${borderWidth}^FS\n`;
      // Bottom border  
      zpl += `^FO${x},${y + height - borderWidth}^GB${width},${borderWidth},${borderWidth}^FS\n`;
      // Left border
      zpl += `^FO${x},${y}^GB${borderWidth},${height},${borderWidth}^FS\n`;
      // Right border
      zpl += `^FO${x + width - borderWidth},${y}^GB${borderWidth},${height},${borderWidth}^FS\n`;
      return zpl;
    }
  }

  /**
   * Render line element in ZPL
   */
  private renderLineElement(
    element: any,
    x: number,
    y: number,
    width: number,
    height: number
  ): string {
    const thickness = element.strokeWidth || 1;
    
    // ZPL ^GB command: ^FO{x},{y}^GB{width},{height},{thickness}^FS
    return `^FO${x},${y}^GB${width},${height},${thickness}^FS\n`;
  }

  /**
   * Render error indicator
   */
  private renderErrorLabel(labelId: string, widthDots: number, heightDots: number): string {
    const centerX = Math.round(widthDots / 2) - 50;
    const centerY = Math.round(heightDots / 2) - 15;
    
    let zpl = '';
    zpl += `^FO${centerX},${centerY}^A0N,20,20^FDERROR^FS\n`;
    zpl += `^FO${centerX - 20},${centerY + 25}^A0N,12,12^FDID: ${labelId}^FS\n`;
    
    return zpl;
  }

  /**
   * Merge default settings with user settings
   */
  private mergeSettings(userSettings?: Partial<ZPLPrinterSettings>): ZPLPrinterSettings {
    return {
      dpi: userSettings?.dpi || ZPLPrintEngine.DEFAULT_DPI,
      printSpeed: userSettings?.printSpeed || 6,
      printDensity: userSettings?.printDensity || 8,
      labelTop: userSettings?.labelTop || 0,
      labelLength: userSettings?.labelLength || 0,
    };
  }

  /**
   * Map font family to ZPL font type
   */
  private mapFontType(fontFamily?: string): string {
    const fontMap: Record<string, string> = {
      'arial': '0',
      'helvetica': '0', 
      'times': 'T',
      'courier': 'F',
      'system': '0'
    };
    
    const font = fontFamily?.toLowerCase() || 'helvetica';
    return fontMap[font] || '0';
  }

  /**
   * Map rotation degrees to ZPL rotation code
   */
  private mapRotation(degrees: number): string {
    const rotationMap: Record<number, string> = {
      0: 'N',    // Normal
      90: 'R',   // Rotate 90°
      180: 'I',  // Inverted
      270: 'B'   // Bottom up
    };
    
    const normalizedDegrees = degrees % 360;
    const snapDegrees = Math.round(normalizedDegrees / 90) * 90;
    
    return rotationMap[snapDegrees] || 'N';
  }

  /**
   * Escape special characters for ZPL
   */
  private escapeZPLText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')   // Escape backslashes
      .replace(/\^/g, '\\^')    // Escape caret
      .replace(/~/g, '\\~')     // Escape tilde
      .replace(/"/g, '\\"')     // Escape quotes
      .substring(0, 100);       // Limit length for thermal printers
  }

  /**
   * Resolve data binding placeholders
   */
  private resolveDataBinding(template: string, labelData: LabelData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      switch (key) {
        case 'text': return labelData.text || '';
        case 'barcode': return labelData.barcode || '';
        case 'qrCode': return labelData.qrCode || '';
        case 'id': return labelData.id || '';
        default:
          return labelData.customFields?.[key]?.toString() || match;
      }
    });
  }

  /**
   * Validate ZPL compatibility
   */
  static validateZPLCompatibility(labelProfile: LabelProfile): {
    isCompatible: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check dimensions (typical Zebra printer limits)
    if (labelProfile.width > 8) {
      issues.push('Label width exceeds typical Zebra printer maximum (8 inches)');
    }
    
    if (labelProfile.height > 12) {
      issues.push('Label height exceeds typical Zebra printer maximum (12 inches)');
    }
    
    // Check template complexity
    if (labelProfile.templateData) {
      try {
        const template = JSON.parse(labelProfile.templateData);
        const elements = template.elements || [];
        
        if (elements.length > 20) {
          issues.push('Template has too many elements for optimal ZPL performance');
        }
        
        // Check for unsupported element types
        const unsupportedTypes = elements
          .map((e: any) => e.type)
          .filter((type: string) => !['text', 'barcode', 'qrcode', 'rectangle', 'line'].includes(type));
        
        if (unsupportedTypes.length > 0) {
          issues.push(`Unsupported element types: ${unsupportedTypes.join(', ')}`);
        }
        
      } catch (error) {
        issues.push('Invalid template JSON format');
      }
    }
    
    return {
      isCompatible: issues.length === 0,
      issues
    };
  }

  /**
   * Calculate memory usage for ZPL command
   */
  static calculateMemoryUsage(zplCommand: string): {
    commandSize: number;
    estimatedPrinterMemory: number;
  } {
    const commandSize = Buffer.byteLength(zplCommand, 'utf8');
    
    // Estimate printer memory usage (ZPL overhead + bitmap conversion)
    const estimatedPrinterMemory = commandSize * 2; // Rough estimate
    
    return {
      commandSize,
      estimatedPrinterMemory
    };
  }
}
