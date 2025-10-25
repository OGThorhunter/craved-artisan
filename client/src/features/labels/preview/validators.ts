import type { LabelElement, Warning, DPI, CanvasSize } from './types';
import { getMinQRModule, getMinBarcodeModule } from './units';

/**
 * Detect text overflow in text elements
 */
export function detectOverflowForText(
  element: LabelElement,
  canvas: HTMLCanvasElement,
  canvasSize: CanvasSize
): Warning | null {
  if (element.type !== 'text') return null;

  const textElement = element as any; // Type assertion for text element
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Set up font for measurement
  const fontWeight = textElement.fontWeight === 'bold' ? 'bold' : 'normal';
  const fontSize = textElement.fontSizePt;
  ctx.font = `${fontWeight} ${fontSize}pt ${textElement.fontFamily}`;

  // Get text content
  const text = textElement.text || '';
  if (!text) return null;

  // Measure text
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2; // Approximate line height

  // Check if text fits in element bounds
  const elementWidth = textElement.w || canvasSize.wDots;
  const elementHeight = textElement.h || textHeight;

  if (textWidth > elementWidth || textHeight > elementHeight) {
    return {
      id: element.id,
      kind: 'overflow',
      severity: 'warn',
      message: `Text overflows element bounds (${Math.round(textWidth)}px width vs ${elementWidth}px available)`
    };
  }

  return null;
}

/**
 * Check contrast ratio between text and background
 */
export function checkContrast(
  element: LabelElement,
  backgroundColor: string = '#ffffff'
): Warning | null {
  if (element.type !== 'text') return null;

  const textElement = element as any;
  const textColor = textElement.color || '#000000';

  // Convert colors to RGB
  const bgRgb = hexToRgb(backgroundColor);
  const textRgb = hexToRgb(textColor);

  if (!bgRgb || !textRgb) return null;

  // Calculate relative luminance
  const bgLuminance = getRelativeLuminance(bgRgb);
  const textLuminance = getRelativeLuminance(textRgb);

  // Calculate contrast ratio
  const contrast = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                   (Math.min(bgLuminance, textLuminance) + 0.05);

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  const minContrast = (textElement.fontSizePt >= 18) ? 3 : 4.5;

  if (contrast < minContrast) {
    return {
      id: element.id,
      kind: 'contrast',
      severity: 'error',
      message: `Insufficient contrast ratio ${contrast.toFixed(1)}:1 (WCAG AA requires ${minContrast}:1)`
    };
  }

  return null;
}

/**
 * Validate QR code module density
 */
export function validateQRModule(
  element: LabelElement,
  dpi: DPI
): Warning | null {
  if (element.type !== 'qr') return null;

  const qrElement = element as any;
  const value = qrElement.value || '';
  if (!value) return null;

  // Estimate QR code size based on content length
  const contentLength = value.length;
  const estimatedModules = Math.ceil(Math.sqrt(contentLength * 8)) + 4; // Rough estimate

  const elementWidth = qrElement.w || 100;
  const elementHeight = qrElement.h || 100;
  const minDimension = Math.min(elementWidth, elementHeight);

  const moduleSize = minDimension / estimatedModules;
  const minModuleSize = getMinQRModule(dpi);

  if (moduleSize < minModuleSize) {
    return {
      id: element.id,
      kind: 'qrDensity',
      severity: 'error',
      message: `QR code too dense: ${moduleSize.toFixed(1)} dots/module (minimum ${minModuleSize} for ${dpi} DPI)`
    };
  }

  return null;
}

/**
 * Validate barcode module density
 */
export function validateBarcodeModule(
  element: LabelElement,
  dpi: DPI
): Warning | null {
  if (element.type !== 'barcode') return null;

  const barcodeElement = element as any;
  const value = barcodeElement.value || '';
  if (!value) return null;

  // Estimate barcode width based on content length
  const contentLength = value.length;
  const estimatedWidth = contentLength * 11 + 35; // Rough estimate for Code128

  const elementWidth = barcodeElement.w || 200;
  const moduleSize = elementWidth / estimatedWidth;
  const minModuleSize = getMinBarcodeModule(dpi);

  if (moduleSize < minModuleSize) {
    return {
      id: element.id,
      kind: 'barcodeDensity',
      severity: 'error',
      message: `Barcode too dense: ${moduleSize.toFixed(1)} dots/module (minimum ${minModuleSize} for ${dpi} DPI)`
    };
  }

  return null;
}

/**
 * Check if element breaches safe area
 */
export function validateSafeArea(
  element: LabelElement,
  canvasSize: CanvasSize
): Warning | null {
  const safeMargin = canvasSize.safeDots;
  if (safeMargin <= 0) return null;

  const elementX = element.x;
  const elementY = element.y;
  const elementWidth = element.w || 0;
  const elementHeight = element.h || 0;

  const rightEdge = elementX + elementWidth;
  const bottomEdge = elementY + elementHeight;

  const breaches: string[] = [];

  if (elementX < safeMargin) {
    breaches.push('left edge');
  }
  if (elementY < safeMargin) {
    breaches.push('top edge');
  }
  if (rightEdge > canvasSize.wDots - safeMargin) {
    breaches.push('right edge');
  }
  if (bottomEdge > canvasSize.hDots - safeMargin) {
    breaches.push('bottom edge');
  }

  if (breaches.length > 0) {
    return {
      id: element.id,
      kind: 'safeBreach',
      severity: 'warn',
      message: `Element breaches safe area: ${breaches.join(', ')}`
    };
  }

  return null;
}

/**
 * Validate binding key resolution
 */
export function validateBinding(
  element: LabelElement,
  sampleData: any
): Warning | null {
  if (!('bindingKey' in element) || !element.bindingKey) return null;

  const bindingKey = element.bindingKey as string;
  if (!bindingKey.startsWith('{{') || !bindingKey.endsWith('}}')) return null;

  // Try to resolve the binding
  const key = bindingKey.slice(2, -2).trim();
  const [pathPart] = key.split('|').map(s => s.trim());
  
  if (!pathPart) return null;

  let value: any = sampleData;
  const parts = pathPart.split('.');
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return {
        id: element.id,
        kind: 'bindingError',
        severity: 'error',
        message: `Binding key not found: ${pathPart}`
      };
    }
  }

  return null;
}

// Helper functions

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16)
  } : null;
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
