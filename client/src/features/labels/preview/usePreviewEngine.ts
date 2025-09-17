import { useCallback, useMemo, useRef, useState } from 'react';
import type { 
  LabelElement, 
  PreviewEngineConfig, 
  Warning, 
  PreflightReport,
  CanvasSize 
} from './types';
import { buildCanvasSize, getMinQRModule, getMinBarcodeModule } from './units';
import { resolveBinding } from './sampleData';
import { 
  detectOverflowForText, 
  checkContrast, 
  validateQRModule, 
  validateBarcodeModule, 
  validateSafeArea,
  validateBinding 
} from './validators';

export function usePreviewEngine(config: PreviewEngineConfig) {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate canvas size
  const canvasSize = useMemo(() => 
    buildCanvasSize(config.variant.units), 
    [config.variant.units]
  );

  // Resolve all bindings in elements
  const resolvedElements = useMemo(() => {
    return config.variant.elements.map(element => {
      if ('bindingKey' in element && element.bindingKey) {
        const resolvedValue = resolveBinding(element.bindingKey, config.sample);
        
        if (element.type === 'text') {
          return { ...element, text: resolvedValue };
        } else if (element.type === 'image') {
          return { ...element, src: resolvedValue };
        } else if (element.type === 'qr') {
          return { ...element, value: resolvedValue };
        } else if (element.type === 'barcode') {
          return { ...element, value: resolvedValue };
        }
      }
      return element;
    });
  }, [config.variant.elements, config.sample]);

  // Generate QR code as image data
  const generateQRCode = useCallback(async (
    value: string, 
    width: number, 
    height: number,
    ecc: string = 'M'
  ): Promise<string | null> => {
    try {
      // Dynamic import to avoid SSR issues
      const QRCode = (await import('qrcode')).default;
      
      const canvas = qrCanvasRef.current || document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      await QRCode.toCanvas(canvas, value, {
        width: width,
        margin: 2,
        errorCorrectionLevel: ecc as any,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return canvas.toDataURL();
    } catch (error) {
      console.error('QR code generation failed:', error);
      return null;
    }
  }, []);

  // Generate barcode as image data
  const generateBarcode = useCallback(async (
    value: string,
    width: number,
    height: number,
    format: string = 'CODE128'
  ): Promise<string | null> => {
    try {
      // Dynamic import to avoid SSR issues
      const JsBarcode = (await import('jsbarcode')).default;
      
      const canvas = barcodeCanvasRef.current || document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      JsBarcode(canvas, value, {
        format: format,
        width: 2,
        height: height - 20,
        margin: 10,
        displayValue: true,
        fontSize: 12,
        textAlign: 'center',
        textPosition: 'bottom'
      });
      
      return canvas.toDataURL();
    } catch (error) {
      console.error('Barcode generation failed:', error);
      return null;
    }
  }, []);

  // Validate all elements and generate warnings
  const validateElements = useCallback(async () => {
    const newWarnings: Warning[] = [];
    const canvas = canvasRef.current;
    
    if (!canvas) return;

    for (const element of resolvedElements) {
      // Overflow detection for text
      const overflowWarning = detectOverflowForText(element, canvas, canvasSize);
      if (overflowWarning) newWarnings.push(overflowWarning);

      // Contrast check for text
      const contrastWarning = checkContrast(element);
      if (contrastWarning) newWarnings.push(contrastWarning);

      // QR code density check
      const qrWarning = validateQRModule(element, config.variant.units.dpi);
      if (qrWarning) newWarnings.push(qrWarning);

      // Barcode density check
      const barcodeWarning = validateBarcodeModule(element, config.variant.units.dpi);
      if (barcodeWarning) newWarnings.push(barcodeWarning);

      // Safe area breach check
      const safeWarning = validateSafeArea(element, canvasSize);
      if (safeWarning) newWarnings.push(safeWarning);

      // Binding validation
      const bindingWarning = validateBinding(element, config.sample);
      if (bindingWarning) newWarnings.push(bindingWarning);
    }

    setWarnings(newWarnings);
  }, [resolvedElements, canvasSize, config.variant.units.dpi, config.sample]);

  // Generate preflight report
  const generatePreflightReport = useCallback((): PreflightReport => {
    const errors = warnings.filter(w => w.severity === 'error').length;
    const warnings_count = warnings.filter(w => w.severity === 'warn').length;

    return {
      warnings,
      summary: {
        total: warnings.length,
        errors,
        warnings: warnings_count
      }
    };
  }, [warnings]);

  // Export to PNG
  const exportToPNG = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    try {
      // Create a new canvas with exact printer dimensions
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasSize.wDots;
      exportCanvas.height = canvasSize.hDots;
      
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return null;

      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize.wDots, canvasSize.hDots);

      // Render all elements at full resolution
      for (const element of resolvedElements) {
        await renderElementToCanvas(ctx, element, canvasSize);
      }

      return new Promise((resolve) => {
        exportCanvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('PNG export failed:', error);
      return null;
    }
  }, [resolvedElements, canvasSize]);

  // Render individual element to canvas
  const renderElementToCanvas = useCallback(async (
    ctx: CanvasRenderingContext2D,
    element: LabelElement,
    canvasSize: CanvasSize
  ) => {
    ctx.save();
    ctx.translate(element.x, element.y);
    
    if (element.rot) {
      ctx.rotate((element.rot * Math.PI) / 180);
    }

    switch (element.type) {
      case 'text': {
        const textElement = element as any;
        ctx.font = `${textElement.fontWeight || 'normal'} ${textElement.fontSizePt}pt ${textElement.fontFamily}`;
        ctx.fillStyle = textElement.color || '#000000';
        ctx.textAlign = textElement.align || 'left';
        
        // Simple text rendering (could be enhanced with line wrapping)
        ctx.fillText(textElement.text, 0, textElement.fontSizePt);
        break;
      }
      
      case 'image': {
        const imageElement = element as any;
        if (imageElement.src) {
          const img = new Image();
          img.src = imageElement.src;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          
          const width = element.w || img.width;
          const height = element.h || img.height;
          
          if (imageElement.fit === 'contain') {
            const scale = Math.min(width / img.width, height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
          } else if (imageElement.fit === 'cover') {
            const scale = Math.max(width / img.width, height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const offsetX = (scaledWidth - width) / 2;
            const offsetY = (scaledHeight - height) / 2;
            ctx.drawImage(img, -offsetX, -offsetY, scaledWidth, scaledHeight);
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }
        }
        break;
      }
      
      case 'shape': {
        const shapeElement = element as any;
        const width = element.w || 100;
        const height = element.h || 100;
        
        if (shapeElement.fill) {
          ctx.fillStyle = shapeElement.fill;
        }
        if (shapeElement.stroke) {
          ctx.strokeStyle = shapeElement.stroke;
          ctx.lineWidth = shapeElement.strokeWidth || 1;
        }
        
        if (shapeElement.shape === 'rect') {
          if (shapeElement.fill) ctx.fillRect(0, 0, width, height);
          if (shapeElement.stroke) ctx.strokeRect(0, 0, width, height);
        } else if (shapeElement.shape === 'roundRect') {
          const radius = shapeElement.radius || 4;
          ctx.beginPath();
          ctx.roundRect(0, 0, width, height, radius);
          if (shapeElement.fill) ctx.fill();
          if (shapeElement.stroke) ctx.stroke();
        } else if (shapeElement.shape === 'line') {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(width, height);
          ctx.stroke();
        }
        break;
      }
      
      case 'qr': {
        const qrElement = element as any;
        const width = element.w || 100;
        const height = element.h || 100;
        
        if (qrElement.value) {
          const qrDataUrl = await generateQRCode(
            qrElement.value,
            width,
            height,
            qrElement.ecc
          );
          
          if (qrDataUrl) {
            const img = new Image();
            img.src = qrDataUrl;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            ctx.drawImage(img, 0, 0, width, height);
          }
        }
        break;
      }
      
      case 'barcode': {
        const barcodeElement = element as any;
        const width = element.w || 200;
        const height = element.h || 50;
        
        if (barcodeElement.value) {
          const barcodeDataUrl = await generateBarcode(
            barcodeElement.value,
            width,
            height,
            barcodeElement.format
          );
          
          if (barcodeDataUrl) {
            const img = new Image();
            img.src = barcodeDataUrl;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            ctx.drawImage(img, 0, 0, width, height);
          }
        }
        break;
      }
    }
    
    ctx.restore();
  }, [generateQRCode, generateBarcode]);

  return {
    canvasSize,
    resolvedElements,
    warnings,
    validateElements,
    generatePreflightReport,
    exportToPNG,
    canvasRef,
    qrCanvasRef,
    barcodeCanvasRef
  };
}
