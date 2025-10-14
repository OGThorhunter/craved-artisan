/**
 * ZPL (Zebra Programming Language) Print Engine
 * Generates ZPL commands for Zebra thermal printers
 */

import { 
  BasePrintEngine, 
  PrintJob, 
  PrintOutput, 
  PrintElement,
  PrintDimensions,
  PrintEngineCapabilities
} from './basePrintEngine';

export class ZPLPrintEngine extends BasePrintEngine {
  private readonly defaultDPI = 203; // Standard Zebra printer DPI
  
  constructor() {
    super('ZPL Print Engine', 'ZPL');
  }

  getEngineCapabilities(): PrintEngineCapabilities {
    return {
      supportsColor: false, // ZPL is monochrome
      supportsImages: false, // Limited image support in basic ZPL
      supportsBarcodes: true,
      supportsRotation: true,
      supportsTransparency: false,
      maxDPI: 600,
      minDPI: 203,
      supportedFonts: ['0', 'A', 'B', 'D', 'E', 'F', 'G', 'H'], // ZPL built-in fonts
      supportedBarcodeFormats: ['CODE128', 'CODE39', 'UPC', 'EAN13', 'EAN8']
    };
  }

  getSupportedMediaSizes() {
    return [
      { name: '1" × 1"', widthInches: 1, heightInches: 1, description: 'Small square thermal label' },
      { name: '2" × 1"', widthInches: 2, heightInches: 1, description: 'Standard product label' },
      { name: '3" × 2"', widthInches: 3, heightInches: 2, description: 'Medium product label' },
      { name: '4" × 6"', widthInches: 4, heightInches: 6, description: 'Shipping label' },
      { name: '4" × 2"', widthInches: 4, heightInches: 2, description: 'Wide address label' },
      { name: '2.25" × 1.25"', widthInches: 2.25, heightInches: 1.25, description: 'Standard shipping label' }
    ];
  }

  async generatePrintOutput(job: PrintJob): Promise<PrintOutput> {
    try {
      const zplCommands: string[] = [];

      // Start format
      zplCommands.push('^XA');

      // Set label dimensions and print speed
      zplCommands.push('^PW' + Math.round(job.dimensions.widthPixels)); // Print width in dots
      zplCommands.push('^LL' + Math.round(job.dimensions.heightPixels)); // Label length in dots
      zplCommands.push('^PR4'); // Print speed (4 IPS - inches per second)

      // Generate elements
      for (const element of job.elements) {
        const elementCommands = this.generateElementCommands(element, job.dimensions);
        zplCommands.push(...elementCommands);
      }

      // Set print quantity
      zplCommands.push('^PQ' + job.copies);

      // End format
      zplCommands.push('^XZ');

      const zplCode = zplCommands.join('\n');
      const data = new TextEncoder().encode(zplCode);

      return {
        format: 'ZPL',
        data,
        mimeType: 'application/x-zpl',
        filename: `label-${job.id}-${Date.now()}.zpl`,
        size: data.length
      };

    } catch (error) {
      throw new Error(`ZPL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePreview(job: PrintJob): Promise<{ imageData: string; width: number; height: number }> {
    try {
      // Create a canvas to simulate thermal printer output
      const canvas = document.createElement('canvas');
      const previewDPI = 203; // Use actual printer DPI for accurate preview
      const width = job.dimensions.widthInches * previewDPI;
      const height = job.dimensions.heightInches * previewDPI;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d')!;
      
      // White background (thermal paper)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Black printing
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';

      // Render elements
      for (const element of job.elements) {
        await this.renderElementToCanvas(ctx, element, job.dimensions, previewDPI);
      }

      return {
        imageData: canvas.toDataURL('image/png'),
        width,
        height
      };

    } catch (error) {
      throw new Error(`ZPL preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateElementCommands(element: PrintElement, dimensions: PrintDimensions): string[] {
    const commands: string[] = [];
    
    // Convert coordinates to dots (ZPL uses dots as unit)
    const x = Math.round(element.x * dimensions.dpi);
    const y = Math.round(element.y * dimensions.dpi);
    const width = Math.round(element.width * dimensions.dpi);
    const height = Math.round(element.height * dimensions.dpi);

    switch (element.type) {
      case 'text':
        commands.push(...this.generateTextCommands(element, x, y, width, height));
        break;
      
      case 'barcode':
        commands.push(...this.generateBarcodeCommands(element, x, y, width, height));
        break;
      
      case 'qr':
        commands.push(...this.generateQRCommands(element, x, y, width, height));
        break;
      
      case 'rectangle':
        commands.push(...this.generateRectangleCommands(element, x, y, width, height));
        break;
      
      case 'line':
        commands.push(...this.generateLineCommands(element, x, y, width, height));
        break;
    }

    return commands;
  }

  private generateTextCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    if (!element.content) return [];

    const commands: string[] = [];
    
    // Position field
    commands.push(`^FO${x},${y}`);

    // Set font - ZPL has limited built-in fonts
    const fontSize = element.fontSize || 12;
    const zplFontSize = this.convertFontSize(fontSize);
    const fontId = this.getZPLFont(element.fontFamily || '');
    
    commands.push(`^A${fontId}N,${zplFontSize},${zplFontSize}`);

    // Handle rotation if specified
    if (element.rotation) {
      const rotation = this.normalizeRotation(element.rotation);
      if (rotation !== 0) {
        // Replace ^A with rotated version
        commands[commands.length - 1] = `^A${fontId}${this.getRotationCode(rotation)},${zplFontSize},${zplFontSize}`;
      }
    }

    // Text alignment (ZPL has limited alignment options)
    if (element.alignment === 'center') {
      // For center alignment, we need to calculate position manually
      const estimatedWidth = element.content.length * (zplFontSize * 0.6); // Rough estimation
      const centerX = x + (width / 2) - (estimatedWidth / 2);
      commands[0] = `^FO${Math.round(centerX)},${y}`;
    } else if (element.alignment === 'right') {
      const estimatedWidth = element.content.length * (zplFontSize * 0.6);
      const rightX = x + width - estimatedWidth;
      commands[0] = `^FO${Math.round(rightX)},${y}`;
    }

    // Field data
    commands.push(`^FD${this.escapeZPLText(element.content)}^FS`);

    return commands;
  }

  private generateBarcodeCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    if (!element.content) return [];

    const commands: string[] = [];
    
    commands.push(`^FO${x},${y}`);

    // Determine barcode type and generate appropriate command
    const format = element.barcodeFormat || 'CODE128';
    const showText = element.showText !== false;

    switch (format) {
      case 'CODE128':
        // ^BC = Code 128 barcode
        // Parameters: orientation, height, print interpretation line, print interpretation line above, UCC check digit
        commands.push(`^BCN,${height},${showText ? 'Y' : 'N'},N,N`);
        break;
      
      case 'CODE39':
        // ^B3 = Code 39 barcode
        commands.push(`^B3N,N,${height},${showText ? 'Y' : 'N'},N`);
        break;
      
      case 'UPC':
      case 'EAN13':
        // ^BE = EAN-13 barcode
        commands.push(`^BEN,${height},${showText ? 'Y' : 'N'},N`);
        break;
      
      case 'EAN8':
        // ^B8 = EAN-8 barcode
        commands.push(`^B8N,${height},${showText ? 'Y' : 'N'},N`);
        break;
      
      default:
        // Default to Code 128
        commands.push(`^BCN,${height},${showText ? 'Y' : 'N'},N,N`);
    }

    commands.push(`^FD${element.content}^FS`);

    return commands;
  }

  private generateQRCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    if (!element.content) return [];

    const commands: string[] = [];
    
    commands.push(`^FO${x},${y}`);

    // ^BQ = QR Code
    // Parameters: orientation, model, magnification factor, error correction, mask
    const size = Math.min(width, height);
    const magnification = Math.max(1, Math.round(size / 50)); // Adjust based on size
    
    commands.push(`^BQN,2,${magnification},Q,7`);
    commands.push(`^FD${element.content}^FS`);

    return commands;
  }

  private generateRectangleCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    const commands: string[] = [];

    commands.push(`^FO${x},${y}`);

    // ^GB = Graphic Box
    // Parameters: width, height, thickness, color (B=black, W=white), rounding
    const thickness = element.borderWidth ? Math.round(element.borderWidth) : 1;
    const color = 'B'; // ZPL only supports black/white
    
    if (element.backgroundColor) {
      // Fill rectangle
      commands.push(`^GB${width},${height},${thickness},B,0^FS`);
    } else if (element.borderColor) {
      // Border only
      commands.push(`^GB${width},${thickness},${thickness},B,0^FS`); // Top
      commands.push(`^FO${x},${y + height - thickness}^GB${width},${thickness},${thickness},B,0^FS`); // Bottom
      commands.push(`^FO${x},${y}^GB${thickness},${height},${thickness},B,0^FS`); // Left
      commands.push(`^FO${x + width - thickness},${y}^GB${thickness},${height},${thickness},B,0^FS`); // Right
    }

    return commands;
  }

  private generateLineCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    const commands: string[] = [];

    commands.push(`^FO${x},${y}`);

    const thickness = element.borderWidth ? Math.round(element.borderWidth) : 1;

    if (Math.abs(width) > Math.abs(height)) {
      // Horizontal line
      commands.push(`^GB${Math.abs(width)},${thickness},${thickness},B,0^FS`);
    } else {
      // Vertical line  
      commands.push(`^GB${thickness},${Math.abs(height)},${thickness},B,0^FS`);
    }

    return commands;
  }

  private async renderElementToCanvas(
    ctx: CanvasRenderingContext2D, 
    element: PrintElement, 
    dimensions: PrintDimensions,
    dpi: number
  ): Promise<void> {
    const x = element.x * dpi;
    const y = element.y * dpi;
    const width = element.width * dpi;
    const height = element.height * dpi;

    ctx.save();

    switch (element.type) {
      case 'text':
        if (element.content) {
          const fontSize = (element.fontSize || 12) * (dpi / 72); // Convert points to pixels
          ctx.font = `${fontSize}px monospace`; // Thermal printers typically use monospace
          ctx.fillStyle = '#000000';
          ctx.textAlign = (element.alignment as CanvasTextAlign) || 'left';
          ctx.fillText(element.content, x, y + fontSize * 0.8); // Adjust baseline
        }
        break;
        
      case 'rectangle':
        if (element.backgroundColor) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, y, width, height);
        } else if (element.borderColor) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = element.borderWidth || 1;
          ctx.strokeRect(x, y, width, height);
        }
        break;
        
      case 'line':
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = element.borderWidth || 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        break;
        
      case 'barcode':
        // Simple barcode representation for preview
        ctx.fillStyle = '#000000';
        const barWidth = width / 20; // Approximate barcode pattern
        for (let i = 0; i < 20; i++) {
          if (i % 2 === 0) {
            ctx.fillRect(x + i * barWidth, y, barWidth * 0.8, height * 0.8);
          }
        }
        if (element.showText !== false && element.content) {
          ctx.font = `${12 * (dpi / 72)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(element.content, x + width/2, y + height);
        }
        break;
        
      case 'qr':
        // Simple QR code representation
        ctx.fillStyle = '#000000';
        const qrSize = Math.min(width, height);
        const cellSize = qrSize / 21; // 21x21 grid approximation
        for (let row = 0; row < 21; row++) {
          for (let col = 0; col < 21; col++) {
            if ((row + col) % 3 === 0) { // Simple pattern
              ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize * 0.9, cellSize * 0.9);
            }
          }
        }
        break;
    }

    ctx.restore();
  }

  private convertFontSize(fontSize: number): number {
    // Convert points to ZPL dot size (approximate)
    return Math.round(fontSize * 2.83); // 1 point ≈ 2.83 dots at 203 DPI
  }

  private getZPLFont(fontFamily: string): string {
    // Map font families to ZPL font identifiers
    const fontMap: Record<string, string> = {
      'helvetica': 'A',
      'arial': 'A',
      'times': 'B', 
      'courier': 'D',
      'monospace': 'D'
    };
    return fontMap[fontFamily.toLowerCase()] || 'A'; // Default to font A
  }

  private normalizeRotation(degrees: number): number {
    // ZPL supports 0, 90, 180, 270 degree rotations
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized <= 45 || normalized > 315) return 0;
    if (normalized > 45 && normalized <= 135) return 90;
    if (normalized > 135 && normalized <= 225) return 180;
    return 270;
  }

  private getRotationCode(degrees: number): string {
    // ZPL rotation codes: N=0°, R=90°, I=180°, B=270°
    switch (degrees) {
      case 90: return 'R';
      case 180: return 'I';
      case 270: return 'B';
      default: return 'N';
    }
  }

  private escapeZPLText(text: string): string {
    // Escape special ZPL characters
    return text
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/\^/g, '\\^')   // Escape caret
      .replace(/~/g, '\\~')    // Escape tilde
      .replace(/\n/g, '\\n')   // Handle newlines
      .replace(/\r/g, '');     // Remove carriage returns
  }
}
