import type { DPI, LabelUnits, CanvasSize } from './types';

/**
 * Convert inches to printer dots (device pixels)
 */
export function inToDots(inches: number, dpi: DPI): number {
  return Math.round(inches * dpi);
}

/**
 * Convert points to printer dots
 * 72 points = 1 inch
 */
export function ptToPx(pt: number, dpi: DPI): number {
  return Math.round((pt / 72) * dpi);
}

/**
 * Convert printer dots to CSS pixels for display
 */
export function dotsToCss(dots: number, zoom: number): number {
  return dots * zoom;
}

/**
 * Convert CSS pixels back to printer dots
 */
export function cssToDots(cssPixels: number, zoom: number): number {
  return cssPixels / zoom;
}

/**
 * Build canvas size information from label units
 */
export function buildCanvasSize(units: LabelUnits): CanvasSize {
  const wDots = inToDots(units.widthIn, units.dpi);
  const hDots = inToDots(units.heightIn, units.dpi);
  const bleedDots = units.bleedIn ? inToDots(units.bleedIn, units.dpi) : 0;
  const safeDots = units.safeIn ? inToDots(units.safeIn, units.dpi) : 0;

  return {
    wDots,
    hDots,
    bleedDots,
    safeDots
  };
}

/**
 * Get minimum module size for QR codes based on DPI
 */
export function getMinQRModule(dpi: DPI): number {
  switch (dpi) {
    case 203: return 3; // 3 dots minimum for 203 DPI
    case 300: return 4; // 4 dots minimum for 300 DPI
    case 600: return 8; // 8 dots minimum for 600 DPI
    default: return 4;
  }
}

/**
 * Get minimum module size for barcodes based on DPI
 */
export function getMinBarcodeModule(dpi: DPI): number {
  switch (dpi) {
    case 203: return 2; // 2 dots minimum for 203 DPI
    case 300: return 3; // 3 dots minimum for 300 DPI
    case 600: return 6; // 6 dots minimum for 600 DPI
    default: return 3;
  }
}

/**
 * Snap value to grid
 */
export function snapToGrid(value: number, gridSize: number = 8): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Check if value is within snap tolerance
 */
export function isWithinSnapTolerance(value1: number, value2: number, tolerance: number = 6): boolean {
  return Math.abs(value1 - value2) <= tolerance;
}

/**
 * Format dimensions for display
 */
export function formatDimensions(inches: number, dpi: DPI): string {
  const dots = inToDots(inches, dpi);
  return `${inches.toFixed(2)}" (${dots} dots)`;
}

/**
 * Calculate zoom level to fit content in viewport
 */
export function calculateFitZoom(
  contentWidth: number,
  contentHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 20
): number {
  const availableWidth = viewportWidth - padding * 2;
  const availableHeight = viewportHeight - padding * 2;
  
  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;
  
  return Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
}

/**
 * Clamp zoom value to valid range
 */
export function clampZoom(zoom: number): number {
  return Math.max(0.25, Math.min(4, zoom));
}
