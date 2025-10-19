import React, { useState, useEffect } from 'react';
import { Calculator, Info, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface UnitConverterProps {
  materialId?: string;
  defaultFromUnit?: string;
  defaultToUnit?: string;
  onConvert?: (from: string, to: string, factor: number) => void;
  className?: string;
}

interface ConversionFactor {
  from: string;
  to: string;
  factor: number;
  isApproximate: boolean;
  note?: string;
}

interface QuickReference {
  category: string;
  conversions: Array<{
    from: string;
    to: string;
    factor: number;
    isApproximate: boolean;
  }>;
}

// Unit conversion factors and quick reference data
const CONVERSION_FACTORS: Record<string, Record<string, number>> = {
  // Volume to Volume
  'cups': { 'ml': 236.588, 'tbsp': 16, 'tsp': 48, 'fl-oz': 8, 'liters': 0.236588 },
  'tbsp': { 'ml': 14.7868, 'tsp': 3, 'cups': 0.0625, 'fl-oz': 0.5 },
  'tsp': { 'ml': 4.92892, 'tbsp': 0.333333, 'cups': 0.0208333, 'fl-oz': 0.166667 },
  'ml': { 'cups': 0.00422675, 'tbsp': 0.067628, 'tsp': 0.202884, 'fl-oz': 0.033814, 'liters': 0.001 },
  'fl-oz': { 'ml': 29.5735, 'cups': 0.125, 'tbsp': 2, 'tsp': 6 },
  'liters': { 'ml': 1000, 'cups': 4.22675, 'fl-oz': 33.814 },
  
  // Weight to Weight
  'lbs': { 'kg': 0.453592, 'oz': 16, 'g': 453.592 },
  'kg': { 'lbs': 2.20462, 'g': 1000, 'oz': 35.274 },
  'oz': { 'lbs': 0.0625, 'g': 28.3495, 'kg': 0.0283495 },
  'g': { 'kg': 0.001, 'lbs': 0.00220462, 'oz': 0.035274 },
  
  // Common baking conversions (approximate - density dependent)
  'cups-flour': { 'g': 125, 'oz': 4.4 },
  'cups-sugar': { 'g': 200, 'oz': 7.1 },
  'cups-butter': { 'g': 227, 'oz': 8 },
  'cups-milk': { 'g': 240, 'oz': 8.5 },
  'cups-water': { 'g': 240, 'oz': 8.5 },
  'cups-oil': { 'g': 220, 'oz': 7.8 },
  
  // Length (for packaging dimensions)
  'in': { 'cm': 2.54, 'mm': 25.4, 'ft': 0.0833333 },
  'cm': { 'in': 0.393701, 'mm': 10, 'm': 0.01 },
  'mm': { 'cm': 0.1, 'in': 0.0393701, 'm': 0.001 },
  'ft': { 'in': 12, 'cm': 30.48, 'm': 0.3048 },
  'm': { 'cm': 100, 'mm': 1000, 'ft': 3.28084 },
};

const QUICK_REFERENCE: QuickReference[] = [
  {
    category: 'Baking',
    conversions: [
      { from: 'cups-flour', to: 'g', factor: 125, isApproximate: true },
      { from: 'cups-sugar', to: 'g', factor: 200, isApproximate: true },
      { from: 'cups-butter', to: 'g', factor: 227, isApproximate: true },
      { from: 'tbsp-butter', to: 'g', factor: 14.2, isApproximate: true },
      { from: 'tsp-vanilla', to: 'ml', factor: 4.93, isApproximate: false },
    ],
  },
  {
    category: 'Liquids',
    conversions: [
      { from: 'cups-milk', to: 'ml', factor: 240, isApproximate: true },
      { from: 'cups-water', to: 'ml', factor: 240, isApproximate: false },
      { from: 'cups-oil', to: 'ml', factor: 220, isApproximate: true },
      { from: 'fl-oz', to: 'ml', factor: 29.57, isApproximate: false },
    ],
  },
  {
    category: 'Spices & Seasonings',
    conversions: [
      { from: 'tsp-salt', to: 'g', factor: 5.9, isApproximate: true },
      { from: 'tbsp-salt', to: 'g', factor: 17.7, isApproximate: true },
      { from: 'tsp-pepper', to: 'g', factor: 2.3, isApproximate: true },
      { from: 'tsp-garlic-powder', to: 'g', factor: 3.1, isApproximate: true },
    ],
  },
];

const ALL_UNITS = [
  // Volume
  'cups', 'tbsp', 'tsp', 'ml', 'fl-oz', 'liters',
  // Weight
  'lbs', 'kg', 'oz', 'g',
  // Baking specific
  'cups-flour', 'cups-sugar', 'cups-butter', 'cups-milk', 'cups-water', 'cups-oil',
  'tbsp-butter', 'tsp-vanilla', 'tsp-salt', 'tbsp-salt', 'tsp-pepper', 'tsp-garlic-powder',
  // Length
  'in', 'cm', 'mm', 'ft', 'm',
  // Other
  'each', 'pieces', 'slices', 'servings',
];

const UnitConverter: React.FC<UnitConverterProps> = ({
  materialId,
  defaultFromUnit = 'cups',
  defaultToUnit = 'ml',
  onConvert,
  className = '',
}) => {
  const [fromUnit, setFromUnit] = useState(defaultFromUnit);
  const [toUnit, setToUnit] = useState(defaultToUnit);
  const [fromValue, setFromValue] = useState<number>(1);
  const [conversionResult, setConversionResult] = useState<ConversionFactor | null>(null);
  const [showQuickReference, setShowQuickReference] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate conversion when units or value change
  useEffect(() => {
    if (fromUnit && toUnit && fromValue !== null) {
      calculateConversion();
    }
  }, [fromUnit, toUnit, fromValue]);

  const calculateConversion = () => {
    try {
      setError(null);

      // Direct conversion
      if (CONVERSION_FACTORS[fromUnit] && CONVERSION_FACTORS[fromUnit][toUnit]) {
        const factor = CONVERSION_FACTORS[fromUnit][toUnit];
        const result: ConversionFactor = {
          from: fromUnit,
          to: toUnit,
          factor,
          isApproximate: isApproximateConversion(fromUnit, toUnit),
          note: getConversionNote(fromUnit, toUnit),
        };
        setConversionResult(result);
        onConvert?.(fromUnit, toUnit, factor);
        return;
      }

      // Reverse conversion
      if (CONVERSION_FACTORS[toUnit] && CONVERSION_FACTORS[toUnit][fromUnit]) {
        const factor = 1 / CONVERSION_FACTORS[toUnit][fromUnit];
        const result: ConversionFactor = {
          from: fromUnit,
          to: toUnit,
          factor,
          isApproximate: isApproximateConversion(fromUnit, toUnit),
          note: getConversionNote(fromUnit, toUnit),
        };
        setConversionResult(result);
        onConvert?.(fromUnit, toUnit, factor);
        return;
      }

      // Multi-step conversion through common units
      const commonUnits = ['ml', 'g', 'cups'];
      for (const commonUnit of commonUnits) {
        if (CONVERSION_FACTORS[fromUnit]?.[commonUnit] && CONVERSION_FACTORS[commonUnit]?.[toUnit]) {
          const factor = CONVERSION_FACTORS[fromUnit][commonUnit] * CONVERSION_FACTORS[commonUnit][toUnit];
          const result: ConversionFactor = {
            from: fromUnit,
            to: toUnit,
            factor,
            isApproximate: true,
            note: `Multi-step conversion via ${commonUnit}`,
          };
          setConversionResult(result);
          onConvert?.(fromUnit, toUnit, factor);
          return;
        }
      }

      setError('Conversion not available between these units');
      setConversionResult(null);
    } catch (err) {
      setError('Error calculating conversion');
      setConversionResult(null);
    }
  };

  const isApproximateConversion = (from: string, to: string): boolean => {
    // Volume to weight conversions are approximate
    const volumeUnits = ['cups', 'tbsp', 'tsp', 'ml', 'fl-oz', 'liters'];
    const weightUnits = ['lbs', 'kg', 'oz', 'g'];
    const bakingUnits = ['cups-flour', 'cups-sugar', 'cups-butter', 'cups-milk', 'cups-water', 'cups-oil'];

    const fromIsVolume = volumeUnits.includes(from) || bakingUnits.some(unit => from.includes(unit));
    const toIsWeight = weightUnits.includes(to);
    const fromIsWeight = weightUnits.includes(from);
    const toIsVolume = volumeUnits.includes(to) || bakingUnits.some(unit => to.includes(unit));

    return (fromIsVolume && toIsWeight) || (fromIsWeight && toIsVolume);
  };

  const getConversionNote = (from: string, to: string): string | undefined => {
    if (isApproximateConversion(from, to)) {
      return 'Density may vary by material';
    }
    return undefined;
  };

  const getConvertedValue = (): number => {
    if (!conversionResult) return 0;
    return fromValue * conversionResult.factor;
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const applyQuickConversion = (conversion: QuickReference['conversions'][0]) => {
    setFromUnit(conversion.from);
    setToUnit(conversion.to);
    setFromValue(1);
    setShowQuickReference(false);
  };

  return (
    <Card className={`bg-[#F7F2EC] shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-[#5B6E02]" />
          <h3 className="text-lg font-semibold text-gray-900">Unit Converter</h3>
          <Button
            variant="ghost"
            onClick={() => setShowQuickReference(!showQuickReference)}
            className="ml-auto text-sm"
          >
            Quick Reference
          </Button>
        </div>

        {/* Quick Reference Panel */}
        {showQuickReference && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Common Conversions</h4>
            <div className="space-y-2">
              {QUICK_REFERENCE.map(category => (
                <div key={category.category}>
                  <div className="text-sm font-medium text-gray-700 mb-1">{category.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {category.conversions.map((conversion, index) => (
                      <button
                        key={index}
                        onClick={() => applyQuickConversion(conversion)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        {conversion.from} → {conversion.to}
                        {conversion.isApproximate && ' ~'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                  min="0"
                  step="0.01"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                >
                  {ALL_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                onClick={swapUnits}
                className="p-2"
                aria-label="Swap units"
              >
                ↔
              </Button>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
              >
                {ALL_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          {conversionResult && !error && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold text-gray-900">
                  {getConvertedValue().toFixed(conversionResult.factor < 1 ? 4 : 2)} {toUnit}
                </div>
                <div className="flex items-center gap-2">
                  {conversionResult.isApproximate ? (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Approximate</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Exact</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Factor: {conversionResult.factor.toFixed(6)}
                {conversionResult.note && (
                  <div className="mt-1 text-xs text-gray-500">
                    <Info className="w-3 h-3 inline mr-1" />
                    {conversionResult.note}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Material-specific note */}
          {materialId && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-700">
                <Info className="w-3 h-3 inline mr-1" />
                Material-specific density data would provide more accurate conversions
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UnitConverter;





























