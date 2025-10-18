/**
 * TSPL (TSC Programming Language) Print Engine  
 * Generates TSPL commands for TSC thermal printers
 */

import { 
  BasePrintEngine, 
  PrintJob, 
  PrintOutput, 
  PrintElement,
  PrintDimensions,
  PrintEngineCapabilities
} from './basePrintEngine';

export class TSPLPrintEngine extends BasePrintEngine {
  private readonly defaultDPI = 203; // Standard TSC printer DPI
  
  constructor() {
    super('TSPL Print Engine', 'TSPL');
  }

  getEngineCapabilities(): PrintEngineCapabilities {
    return {
      supportsColor: false, // TSPL is monochrome
      supportsImages: true, // TSPL has better image support than basic ZPL
      supportsBarcodes: true,
      supportsRotation: true,
      supportsTransparency: false,
      maxDPI: 600,
      minDPI: 203,
      supportedFonts: ['0', '1', '2', '3', '4', '5', '6', '7'], // TSPL built-in fonts
      supportedBarcodeFormats: ['CODE128', 'CODE39', 'UPC', 'EAN13', 'EAN8', 'CODE93']
    };
  }

  getSupportedMediaSizes() {
    return [
      { name: '1" × 1"', widthInches: 1, heightInches: 1, description: 'Small square thermal label' },
      { name: '2" × 1"', widthInches: 2, heightInches: 1, description: 'Standard product label' },
      { name: '3" × 2"', widthInches: 3, heightInches: 2, description: 'Medium product label' },
      { name: '4" × 6"', widthInches: 4, heightInches: 6, description: 'Shipping label' },
      { name: '4" × 3"', widthInches: 4, heightInches: 3, description: 'Wide product label' },
      { name: '2.25" × 1.25"', widthInches: 2.25, heightInches: 1.25, description: 'Address label' }
    ];
  }

  async generatePrintOutput(job: PrintJob): Promise<PrintOutput> {
    try {
      const tsplCommands: string[] = [];

      // Set label size in dots
      const widthDots = Math.round(job.dimensions.widthPixels);
      const heightDots = Math.round(job.dimensions.heightPixels);
      
      tsplCommands.push(`SIZE ${widthDots} dot, ${heightDots} dot`);
      
      // Set gap (space between labels) - typically 2-4mm
      const gapDots = Math.round(0.08 * job.dimensions.dpi); // 2mm gap
      tsplCommands.push(`GAP ${gapDots} dot, 0 dot`);
      
      // Set print direction (normal)
      tsplCommands.push('DIRECTION 1');
      
      // Set density (0-15, higher = darker)
      tsplCommands.push('DENSITY 8');
      
      // Set print speed (1-14, lower = slower/higher quality)  
      tsplCommands.push('SPEED 4');
      
      // Clear image buffer
      tsplCommands.push('CLS');

      // Generate elements
      for (const element of job.elements) {
        const elementCommands = this.generateElementCommands(element, job.dimensions);
        tsplCommands.push(...elementCommands);
      }

      // Print command with quantity
      tsplCommands.push(`PRINT ${job.copies}, 1`);

      const tsplCode = tsplCommands.join('\n');
      const data = new TextEncoder().encode(tsplCode);

      return {
        format: 'TSPL',
        data,
        mimeType: 'application/x-tspl',
        filename: `label-${job.id}-${Date.now()}.tspl`,
        size: data.length
      };

    } catch (error) {
      throw new Error(`TSPL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new Error(`TSPL preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateElementCommands(element: PrintElement, dimensions: PrintDimensions): string[] {
    const commands: string[] = [];
    
    // Convert coordinates to dots (TSPL uses dots as unit)
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
      
      case 'image':
        commands.push(...this.generateImageCommands(element, x, y, width, height));
        break;
    }

    return commands;
  }

  private generateTextCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    if (!element.content) return [];

    const commands: string[] = [];
    
    // Get TSPL font parameters
    const fontSize = element.fontSize || 12;
    const fontInfo = this.getTSPLFont(element.fontFamily || '', fontSize);
    const rotation = this.normalizeRotation(element.rotation || 0);

    // Handle text alignment
    let textX = x;
    if (element.alignment === 'center') {
      // Estimate text width for centering
      const estimatedWidth = element.content.length * fontInfo.width * 0.8;
      textX = x + (width / 2) - (estimatedWidth / 2);
    } else if (element.alignment === 'right') {
      const estimatedWidth = element.content.length * fontInfo.width * 0.8;
      textX = x + width - estimatedWidth;
    }

    // TEXT command: TEXT x, y, "font", rotation, x_multiplication, y_multiplication, "content"
    commands.push(
      `TEXT ${Math.round(textX)}, ${y}, "${fontInfo.font}", ${rotation}, ${fontInfo.xMul}, ${fontInfo.yMul}, "${this.escapeTSPLText(element.content)}"`
    );

    return commands;
  }

  private generateBarcodeCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    if (!element.content) return [];

    const commands: string[] = [];
    const format = element.barcodeFormat || 'CODE128';
    const rotation = this.normalizeRotation(element.rotation || 0);
    const narrow = 2; // Narrow bar width in dots
    const wide = 6;   // Wide bar width in dots
    const showText = element.showText !== false ? 1 : 0;

    // Determine TSPL barcode type
    let barcodeType: string;
    switch (format) {
      case 'CODE128':
        barcodeType = '128';
        // BARCODE x, y, "128", height, human_readable, rotation, narrow, wide, "data"
        commands.push(`BARCODE ${x}, ${y}, "${barcodeType}", ${height}, ${showText}, ${rotation}, ${narrow}, ${wide}, "${element.content}"`);
        break;
      
      case 'CODE39':
        barcodeType = '39';
        // BARCODE x, y, "39", height, human_readable, rotation, narrow, wide, "data"
        commands.push(`BARCODE ${x}, ${y}, "${barcodeType}", ${height}, ${showText}, ${rotation}, ${narrow}, ${wide}, "${element.content}"`);
        break;
      
      case 'CODE93':
        barcodeType = '93';
        commands.push(`BARCODE ${x}, ${y}, "${barcodeType}", ${height}, ${showText}, ${rotation}, ${narrow}, ${wide}, "${element.content}"`);
        break;
      
      case 'UPC':
      case 'EAN13':
        barcodeType = 'EAN13';
        commands.push(`BARCODE ${x}, ${y}, "${barcodeType}", ${height}, ${showText}, ${rotation}, ${narrow}, ${wide}, "${element.content}"`);
        break;
      
      case 'EAN8':
        barcodeType = 'EAN8';
        commands.push(`BARCODE ${x}, ${y}, "${barcodeType}", ${height}, ${showText}, ${rotation}, ${narrow}, ${wide}, "${element.content}"`);
        break;
      
      default:
        // Default to Code 128
        barcodeType = '128';
        commands.push(`BARCODE ${x}, ${y}, "${barcodeType}", ${height}, ${showText}, ${rotation}, ${narrow}, ${wide}, "${element.content}"`);
    }

    return commands;
  }

  private generateQRCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    if (!element.content) return [];

    const commands: string[] = [];
    const rotation = this.normalizeRotation(element.rotation || 0);
    const size = Math.min(width, height);
    
    // Calculate cell size (TSPL QR codes are sized by cell size, not overall dimensions)
    const cellSize = Math.max(1, Math.round(size / 50)); // Approximate cell size
    
    // QRCODE x, y, ECC_level, cell_size, mode, rotation, "data"
    // ECC levels: L, M, Q, H (L=lowest, H=highest error correction)
    commands.push(`QRCODE ${x}, ${y}, L, ${cellSize}, A, ${rotation}, "${element.content}"`);

    return commands;
  }

  private generateRectangleCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    const commands: string[] = [];

    if (element.backgroundColor) {
      // Filled rectangle using BAR command
      // BAR x, y, width, height
      commands.push(`BAR ${x}, ${y}, ${width}, ${height}`);
    } else if (element.borderColor && element.borderWidth) {
      // Draw rectangle outline using BOX command
      const thickness = Math.max(1, Math.round(element.borderWidth));
      // BOX x1, y1, x2, y2, thickness
      commands.push(`BOX ${x}, ${y}, ${x + width}, ${y + height}, ${thickness}`);
    }

    return commands;
  }

  private generateLineCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    const commands: string[] = [];
    const thickness = Math.max(1, Math.round(element.borderWidth || 1));

    if (Math.abs(width) > Math.abs(height)) {
      // Horizontal line using BAR
      commands.push(`BAR ${x}, ${y}, ${Math.abs(width)}, ${thickness}`);
    } else {
      // Vertical line using BAR
      commands.push(`BAR ${x}, ${y}, ${thickness}, ${Math.abs(height)}`);
    }

    return commands;
  }

  private generateImageCommands(element: PrintElement, x: number, y: number, width: number, height: number): string[] {
    const commands: string[] = [];

    // TSPL supports bitmap images, but implementation would require
    // converting images to monochrome bitmap format
    // For now, we'll create a placeholder rectangle
    commands.push(`BOX ${x}, ${y}, ${x + width}, ${y + height}, 2`);
    
    // Add "IMG" text in the center
    const textX = x + width / 2;
    const textY = y + height / 2;
    commands.push(`TEXT ${Math.round(textX)}, ${Math.round(textY)}, "3", 0, 1, 1, "IMG"`);

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
          const fontSize = (element.fontSize || 12) * (dpi / 72);
          ctx.font = `${fontSize}px monospace`;
          ctx.fillStyle = '#000000';
          ctx.textAlign = (element.alignment as CanvasTextAlign) || 'left';
          ctx.fillText(element.content, x, y + fontSize * 0.8);
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
        // Simple barcode representation
        ctx.fillStyle = '#000000';
        const barWidth = width / 25;
        for (let i = 0; i < 25; i++) {
          if ((i + element.content!.charCodeAt(i % element.content!.length)) % 3 !== 0) {
            ctx.fillRect(x + i * barWidth, y, barWidth * 0.7, height * 0.8);
          }
        }
        if (element.showText !== false && element.content) {
          ctx.font = `${10 * (dpi / 72)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(element.content, x + width/2, y + height + 15);
        }
        break;
        
      case 'qr':
        // Simple QR code representation
        ctx.fillStyle = '#000000';
        const qrSize = Math.min(width, height);
        const cellSize = qrSize / 25; // 25x25 grid
        for (let row = 0; row < 25; row++) {
          for (let col = 0; col < 25; col++) {
            // Create a pseudo-random pattern based on content
            const seed = (row * 25 + col + (element.content!.charCodeAt((row + col) % element.content!.length)));
            if (seed % 3 === 0) {
              ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize * 0.9, cellSize * 0.9);
            }
          }
        }
        break;

      case 'image':
        // Simple image placeholder
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.font = `${12 * (dpi / 72)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText('IMG', x + width/2, y + height/2);
        break;
    }

    ctx.restore();
  }

  private getTSPLFont(fontFamily: string, fontSize: number): { font: string; width: number; height: number; xMul: number; yMul: number } {
    // TSPL built-in fonts (0-7) with approximate dimensions
    const fonts: Record<string, { font: string; baseWidth: number; baseHeight: number }> = {
      'helvetica': { font: '1', baseWidth: 8, baseHeight: 16 },
      'arial': { font: '1', baseWidth: 8, baseHeight: 16 },
      'times': { font: '2', baseWidth: 8, baseHeight: 16 },
      'courier': { font: '3', baseWidth: 12, baseHeight: 20 },
      'monospace': { font: '3', baseWidth: 12, baseHeight: 20 }
    };

    const fontInfo = fonts[fontFamily.toLowerCase()] || fonts['helvetica'];
    
    if (!fontInfo) {
      // Fallback to default values
      return {
        font: '1',
        width: 8,
        height: 12,
        xMul: 1,
        yMul: 1
      };
    }
    
    // Calculate multipliers based on desired font size
    const targetSize = fontSize * 2.83; // Convert points to dots at 203 DPI
    const xMul = Math.max(1, Math.round(targetSize / fontInfo.baseHeight));
    const yMul = xMul; // Keep proportional

    return {
      font: fontInfo.font,
      width: fontInfo.baseWidth * xMul,
      height: fontInfo.baseHeight * yMul,
      xMul,
      yMul
    };
  }

  private normalizeRotation(degrees: number): number {
    // TSPL supports 0, 90, 180, 270 degree rotations
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized <= 45 || normalized > 315) return 0;
    if (normalized > 45 && normalized <= 135) return 90;
    if (normalized > 135 && normalized <= 225) return 180;
    return 270;
  }

  private escapeTSPLText(text: string): string {
    // Escape special TSPL characters
    return text
      .replace(/\"/g, '\\"')   // Escape quotes
      .replace(/\n/g, '\\n')   // Handle newlines  
      .replace(/\r/g, '')      // Remove carriage returns
      .replace(/\\/g, '\\\\'); // Escape backslashes
  }
}
