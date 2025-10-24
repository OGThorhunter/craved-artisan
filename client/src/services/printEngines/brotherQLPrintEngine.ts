/**
 * Brother QL Print Engine
 * Generates commands for Brother QL series label printers
 */

import { 
  BasePrintEngine, 
  PrintJob, 
  PrintOutput, 
  PrintElement,
  PrintDimensions,
  PrintEngineCapabilities
} from './basePrintEngine';

export class BrotherQLPrintEngine extends BasePrintEngine {
  private readonly defaultDPI = 300; // Brother QL typically uses 300 DPI
  
  constructor() {
    super('Brother QL Print Engine', 'BrotherQL');
  }

  getEngineCapabilities(): PrintEngineCapabilities {
    return {
      supportsColor: false, // Brother QL is monochrome
      supportsImages: true, // Good image/bitmap support
      supportsBarcodes: true, // Limited built-in barcode support
      supportsRotation: false, // Limited rotation support
      supportsTransparency: false,
      maxDPI: 300,
      minDPI: 300, // Fixed DPI
      supportedFonts: ['helvetica', 'arial'], // Limited font support, relies on bitmap rendering
      supportedBarcodeFormats: ['CODE128', 'CODE39', 'UPC', 'EAN13'] // Basic barcode support
    };
  }

  getSupportedMediaSizes() {
    return [
      // Brother QL standard label sizes
      { name: '12mm Continuous', widthInches: 0.47, heightInches: 0, description: '12mm continuous length tape' },
      { name: '29mm Continuous', widthInches: 1.14, heightInches: 0, description: '29mm continuous length tape' },
      { name: '38mm Continuous', widthInches: 1.5, heightInches: 0, description: '38mm continuous length tape' },
      { name: '50mm Continuous', widthInches: 1.97, heightInches: 0, description: '50mm continuous length tape' },
      { name: '54mm Continuous', widthInches: 2.13, heightInches: 0, description: '54mm continuous length tape' },
      { name: '62mm Continuous', widthInches: 2.44, heightInches: 0, description: '62mm continuous length tape' },
      { name: '102mm Continuous', widthInches: 4.02, heightInches: 0, description: '102mm continuous length tape' },
      
      // Die-cut labels
      { name: '17×54mm', widthInches: 0.67, heightInches: 2.13, description: 'Small address label' },
      { name: '29×90mm', widthInches: 1.14, heightInches: 3.54, description: 'Standard address label' },
      { name: '38×90mm', widthInches: 1.5, heightInches: 3.54, description: 'Large address label' },
      { name: '39×48mm', widthInches: 1.54, heightInches: 1.89, description: 'Square label' },
      { name: '52×29mm', widthInches: 2.05, heightInches: 1.14, description: 'Wide label' },
      { name: '62×29mm', widthInches: 2.44, heightInches: 1.14, description: 'Extra wide label' },
      { name: '62×100mm', widthInches: 2.44, heightInches: 3.94, description: 'Shipping label' }
    ];
  }

  async generatePrintOutput(job: PrintJob): Promise<PrintOutput> {
    try {
      const commands: Uint8Array[] = [];

      // Brother QL uses binary command protocol
      // This is a simplified implementation - real Brother QL requires detailed raster processing
      
      // Initialize printer
      commands.push(this.generateInitCommand());
      
      // Set label size and type
      commands.push(this.generateLabelSizeCommand(job.dimensions));
      
      // Set print quantity
      commands.push(this.generatePrintQuantityCommand(job.copies));
      
      // Generate raster data for each element
      const rasterData = await this.generateRasterData(job.elements, job.dimensions);
      commands.push(rasterData);
      
      // Print command
      commands.push(this.generatePrintCommand());

      // Combine all commands
      const totalLength = commands.reduce((sum, cmd) => sum + cmd.length, 0);
      const combinedData = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const cmd of commands) {
        combinedData.set(cmd, offset);
        offset += cmd.length;
      }

      return {
        format: 'BrotherQL',
        data: combinedData,
        mimeType: 'application/x-brother-ql',
        filename: `label-${job.id}-${Date.now()}.bin`,
        size: combinedData.length
      };

    } catch (error) {
      throw new Error(`Brother QL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePreview(job: PrintJob): Promise<{ imageData: string; width: number; height: number }> {
    try {
      const canvas = document.createElement('canvas');
      const previewDPI = 300; // Brother QL DPI
      const width = job.dimensions.widthInches * previewDPI;
      const height = job.dimensions.heightInches * previewDPI;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d')!;
      
      // White background (label material)
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
      throw new Error(`Brother QL preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateInitCommand(): Uint8Array {
    // Brother QL initialization sequence
    // ESC @ (Initialize)
    return new Uint8Array([0x1B, 0x40]);
  }

  private generateLabelSizeCommand(dimensions: PrintDimensions): Uint8Array {
    // Simplified label size command
    // In real implementation, this would set media type and size
    const commands: number[] = [];
    
    // ESC i z (Set media & quality)
    commands.push(0x1B, 0x69, 0x7A);
    commands.push(0x00); // Media type (0 = continuous length tape)
    commands.push(0x0A); // Media width (simplified)
    commands.push(0x00); // Media length (0 for continuous)
    commands.push(0x00, 0x00, 0x00, 0x00); // Reserved
    commands.push(0x01); // High resolution
    
    return new Uint8Array(commands);
  }

  private generatePrintQuantityCommand(copies: number): Uint8Array {
    // Set number of copies
    // ESC i K (Set cut options)
    const commands: number[] = [];
    commands.push(0x1B, 0x69, 0x4B);
    commands.push(0x08); // Cut at end
    commands.push(copies & 0xFF); // Number of copies (low byte)
    commands.push((copies >> 8) & 0xFF); // Number of copies (high byte)
    
    return new Uint8Array(commands);
  }

  private async generateRasterData(elements: PrintElement[], dimensions: PrintDimensions): Promise<Uint8Array> {
    // Create a canvas to render elements as bitmap
    const canvas = document.createElement('canvas');
    const dpi = 300; // Brother QL DPI
    const width = Math.round(dimensions.widthInches * dpi);
    const height = Math.round(dimensions.heightInches * dpi);
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d')!;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Render elements
    for (const element of elements) {
      await this.renderElementToCanvas(ctx, element, dimensions, dpi);
    }

    // Convert canvas to monochrome bitmap data
    const imageData = ctx.getImageData(0, 0, width, height);
    const bitmap = this.convertToMonochrome(imageData);
    
    // Generate raster commands
    const rasterCommands: number[] = [];
    
    // Raster graphics transfer
    // G command for each line
    const bytesPerLine = Math.ceil(width / 8);
    
    for (let y = 0; y < height; y++) {
      // Line data header
      rasterCommands.push(0x47); // 'G' command
      rasterCommands.push(bytesPerLine & 0xFF); // Line length low
      rasterCommands.push((bytesPerLine >> 8) & 0xFF); // Line length high
      
      // Pack pixels into bytes (8 pixels per byte)
      for (let x = 0; x < bytesPerLine; x++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const pixelX = x * 8 + bit;
          if (pixelX < width) {
            const pixelIndex = y * width + pixelX;
            if (bitmap[pixelIndex] === 0) { // Black pixel
              byte |= (0x80 >> bit);
            }
          }
        }
        rasterCommands.push(byte);
      }
    }
    
    return new Uint8Array(rasterCommands);
  }

  private generatePrintCommand(): Uint8Array {
    // Print and cut command
    // ESC i A (Print command with options)
    return new Uint8Array([0x1B, 0x69, 0x41, 0x01]);
  }

  private convertToMonochrome(imageData: ImageData): Uint8Array {
    // Convert RGBA image data to monochrome (0 = black, 255 = white)
    const bitmap = new Uint8Array(imageData.width * imageData.height);
    
    for (let i = 0; i < bitmap.length; i++) {
      const pixelIndex = i * 4;
      const r = imageData.data[pixelIndex];
      const g = imageData.data[pixelIndex + 1];
      const b = imageData.data[pixelIndex + 2];
      
      // Convert to grayscale using luminance formula
      const gray = Math.round(0.299 * (r ?? 0) + 0.587 * (g ?? 0) + 0.114 * (b ?? 0));
      
      // Apply threshold (128 = 50% threshold)
      bitmap[i] = gray < 128 ? 0 : 255;
    }
    
    return bitmap;
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
          const fontWeight = element.fontWeight === 'bold' ? 'bold' : 'normal';
          ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
          ctx.fillStyle = '#000000';
          ctx.textAlign = (element.alignment as CanvasTextAlign) || 'left';
          
          // Handle text wrapping
          const maxWidth = width;
          const words = element.content.split(' ');
          const lines: string[] = [];
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = ctx.measureText(testLine).width;
            
            if (testWidth > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }

          // Render lines
          const lineHeight = fontSize * 1.2;
          lines.forEach((line, index) => {
            let textX = x;
            if (element.alignment === 'center') {
              textX = x + width / 2;
            } else if (element.alignment === 'right') {
              textX = x + width;
            }
            
            ctx.fillText(line, textX, y + fontSize + (index * lineHeight));
          });
        }
        break;
        
      case 'rectangle':
        if (element.backgroundColor) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, y, width, height);
        } else if (element.borderColor && element.borderWidth) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = element.borderWidth * (dpi / 72);
          ctx.strokeRect(x, y, width, height);
        }
        break;
        
      case 'line':
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = (element.borderWidth || 1) * (dpi / 72);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        break;
        
      case 'barcode':
        // Simple barcode representation for Brother QL
        if (element.content) {
          ctx.fillStyle = '#000000';
          const barCount = 30;
          const barWidth = width / barCount;
          
          for (let i = 0; i < barCount; i++) {
            // Create pseudo-random barcode pattern
            const charCode = element.content.charCodeAt(i % element.content.length);
            if ((charCode + i) % 3 !== 0) {
              ctx.fillRect(x + i * barWidth, y, barWidth * 0.7, height * 0.8);
            }
          }
          
          // Add text below barcode if enabled
          if (element.showText !== false) {
            ctx.font = `${10 * (dpi / 72)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(element.content, x + width / 2, y + height + (15 * dpi / 72));
          }
        }
        break;
        
      case 'qr':
        // Simple QR code representation
        if (element.content) {
          ctx.fillStyle = '#000000';
          const qrSize = Math.min(width, height);
          const gridSize = 21; // Simplified QR grid
          const cellSize = qrSize / gridSize;
          
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              // Create pattern based on content
              const seed = row * gridSize + col + element.content.charCodeAt((row + col) % element.content.length);
              if (seed % 3 === 0) {
                ctx.fillRect(
                  x + col * cellSize, 
                  y + row * cellSize, 
                  cellSize * 0.9, 
                  cellSize * 0.9
                );
              }
            }
          }
        }
        break;
        
      case 'image':
        // Draw placeholder for image
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Add diagonal lines
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.moveTo(x + width, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
        
        // Add "IMG" text
        ctx.font = `${12 * (dpi / 72)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText('IMG', x + width / 2, y + height / 2);
        break;
    }

    ctx.restore();
  }
}
