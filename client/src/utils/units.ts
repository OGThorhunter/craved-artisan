// Unit conversion utilities for the bulking calculator

export interface ConversionResult {
  qty: number;
  note?: string;
}

export interface UnitConversion {
  toCanonical: (qty: number, densityGPerMl?: number) => number;
  fromCanonical: (qty: number, densityGPerMl?: number) => number;
}

// Mass units (canonical: grams)
const massUnits: Record<string, UnitConversion> = {
  g: {
    toCanonical: (qty: number) => qty,
    fromCanonical: (qty: number) => qty
  },
  kg: {
    toCanonical: (qty: number) => qty * 1000,
    fromCanonical: (qty: number) => qty / 1000
  },
  oz: {
    toCanonical: (qty: number) => qty * 28.3495,
    fromCanonical: (qty: number) => qty / 28.3495
  },
  lb: {
    toCanonical: (qty: number) => qty * 453.592,
    fromCanonical: (qty: number) => qty / 453.592
  }
};

// Volume units (canonical: milliliters)
const volumeUnits: Record<string, UnitConversion> = {
  ml: {
    toCanonical: (qty: number) => qty,
    fromCanonical: (qty: number) => qty
  },
  L: {
    toCanonical: (qty: number) => qty * 1000,
    fromCanonical: (qty: number) => qty / 1000
  },
  tsp: {
    toCanonical: (qty: number) => qty * 4.92892,
    fromCanonical: (qty: number) => qty / 4.92892
  },
  Tbsp: {
    toCanonical: (qty: number) => qty * 14.7868,
    fromCanonical: (qty: number) => qty / 14.7868
  },
  cup: {
    toCanonical: (qty: number) => qty * 236.588,
    fromCanonical: (qty: number) => qty / 236.588
  }
};

// Piece units (1:1 conversion)
const pieceUnits: Record<string, UnitConversion> = {
  piece: {
    toCanonical: (qty: number) => qty,
    fromCanonical: (qty: number) => qty
  }
};

export const allUnits = [
  ...Object.keys(massUnits),
  ...Object.keys(volumeUnits),
  ...Object.keys(pieceUnits)
];

export const massUnitOptions = Object.keys(massUnits);
export const volumeUnitOptions = Object.keys(volumeUnits);
export const pieceUnitOptions = Object.keys(pieceUnits);

export function isMassUnit(unit: string): boolean {
  return unit in massUnits;
}

export function isVolumeUnit(unit: string): boolean {
  return unit in volumeUnits;
}

export function isPieceUnit(unit: string): boolean {
  return unit in pieceUnits;
}

export function toCanonical(
  qty: number,
  unit: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _densityGPerMl?: number
): ConversionResult {
  // Handle piece units (no conversion needed)
  if (isPieceUnit(unit)) {
    return { qty: pieceUnits[unit].toCanonical(qty) };
  }

  // Handle mass units
  if (isMassUnit(unit)) {
    return { qty: massUnits[unit].toCanonical(qty) };
  }

  // Handle volume units
  if (isVolumeUnit(unit)) {
    return { qty: volumeUnits[unit].toCanonical(qty) };
  }

  return { qty, note: 'unknown unit' };
}

export function fromCanonical(
  qty: number,
  targetUnit: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _densityGPerMl?: number
): ConversionResult {
  // Handle piece units (no conversion needed)
  if (isPieceUnit(targetUnit)) {
    return { qty: pieceUnits[targetUnit].fromCanonical(qty) };
  }

  // Handle mass units
  if (isMassUnit(targetUnit)) {
    return { qty: massUnits[targetUnit].fromCanonical(qty) };
  }

  // Handle volume units
  if (isVolumeUnit(targetUnit)) {
    return { qty: volumeUnits[targetUnit].fromCanonical(qty) };
  }

  return { qty, note: 'unknown unit' };
}

export function convertBetweenUnits(
  qty: number,
  fromUnit: string,
  toUnit: string,
  densityGPerMl?: number
): ConversionResult {
  // Same unit, no conversion needed
  if (fromUnit === toUnit) {
    return { qty };
  }

  // Both are piece units
  if (isPieceUnit(fromUnit) && isPieceUnit(toUnit)) {
    return { qty };
  }

  // Both are mass units
  if (isMassUnit(fromUnit) && isMassUnit(toUnit)) {
    const canonical = toCanonical(qty, fromUnit);
    return fromCanonical(canonical.qty, toUnit);
  }

  // Both are volume units
  if (isVolumeUnit(fromUnit) && isVolumeUnit(toUnit)) {
    const canonical = toCanonical(qty, fromUnit);
    return fromCanonical(canonical.qty, toUnit);
  }

  // Cross-type conversion (mass ↔ volume)
  if (densityGPerMl && densityGPerMl > 0) {
    let canonicalQty: number;

    if (isMassUnit(fromUnit)) {
      // Mass to volume: mass / density = volume
      canonicalQty = toCanonical(qty, fromUnit).qty / densityGPerMl;
      return fromCanonical(canonicalQty, toUnit);
    } else if (isVolumeUnit(fromUnit)) {
      // Volume to mass: volume * density = mass
      canonicalQty = toCanonical(qty, fromUnit).qty * densityGPerMl;
      return fromCanonical(canonicalQty, toUnit);
    }
  }

  // Cannot convert without density
  return { qty, note: 'needsDensity' };
}

export function getUnitCategory(unit: string): 'mass' | 'volume' | 'piece' {
  if (isMassUnit(unit)) return 'mass';
  if (isVolumeUnit(unit)) return 'volume';
  if (isPieceUnit(unit)) return 'piece';
  return 'piece'; // fallback
}

export function getRelatedUnits(unit: string): string[] {
  const category = getUnitCategory(unit);
  switch (category) {
    case 'mass':
      return massUnitOptions;
    case 'volume':
      return volumeUnitOptions;
    case 'piece':
      return pieceUnitOptions;
    default:
      return [];
  }
}
