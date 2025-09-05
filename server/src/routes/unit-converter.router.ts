import { Router } from 'express';
import { logger } from '../logger';

export const unitConverterRouter = Router();

// Comprehensive unit conversion system
interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
  symbol: string;
  factor: number; // Conversion factor to base unit
  category: string;
  description?: string;
  isCommon?: boolean; // Mark commonly used units
}

interface ConversionResult {
  from: {
    value: number;
    unit: string;
    unitName: string;
  };
  to: {
    value: number;
    unit: string;
    unitName: string;
  };
  factor: number;
  precision: number;
  formula?: string;
}

interface ConversionHistory {
  id: string;
  fromValue: number;
  fromUnit: string;
  toValue: number;
  toUnit: string;
  category: string;
  timestamp: string;
  userId?: string;
}

// Comprehensive unit definitions
const unitCategories: UnitCategory[] = [
  {
    id: 'weight',
    name: 'Weight/Mass',
    baseUnit: 'gram',
    units: [
      // Metric
      { id: 'milligram', name: 'Milligram', symbol: 'mg', factor: 0.001, category: 'weight', isCommon: false },
      { id: 'gram', name: 'Gram', symbol: 'g', factor: 1, category: 'weight', isCommon: true },
      { id: 'kilogram', name: 'Kilogram', symbol: 'kg', factor: 1000, category: 'weight', isCommon: true },
      { id: 'tonne', name: 'Metric Tonne', symbol: 't', factor: 1000000, category: 'weight', isCommon: false },
      
      // Imperial/US
      { id: 'ounce', name: 'Ounce', symbol: 'oz', factor: 28.3495, category: 'weight', isCommon: true },
      { id: 'pound', name: 'Pound', symbol: 'lb', factor: 453.592, category: 'weight', isCommon: true },
      { id: 'stone', name: 'Stone', symbol: 'st', factor: 6350.29, category: 'weight', isCommon: false },
      { id: 'ton_us', name: 'US Ton', symbol: 'ton', factor: 907185, category: 'weight', isCommon: false },
      { id: 'ton_uk', name: 'UK Ton', symbol: 'ton', factor: 1016047, category: 'weight', isCommon: false },
      
      // Specialized
      { id: 'grain', name: 'Grain', symbol: 'gr', factor: 0.0647989, category: 'weight', isCommon: false },
      { id: 'dram', name: 'Dram', symbol: 'dr', factor: 1.77185, category: 'weight', isCommon: false },
      { id: 'troy_ounce', name: 'Troy Ounce', symbol: 'ozt', factor: 31.1035, category: 'weight', isCommon: false },
      { id: 'troy_pound', name: 'Troy Pound', symbol: 'lbt', factor: 373.242, category: 'weight', isCommon: false },
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    baseUnit: 'liter',
    units: [
      // Metric
      { id: 'milliliter', name: 'Milliliter', symbol: 'ml', factor: 0.001, category: 'volume', isCommon: true },
      { id: 'liter', name: 'Liter', symbol: 'l', factor: 1, category: 'volume', isCommon: true },
      { id: 'cubic_meter', name: 'Cubic Meter', symbol: 'm³', factor: 1000, category: 'volume', isCommon: false },
      
      // Imperial/US
      { id: 'teaspoon', name: 'Teaspoon', symbol: 'tsp', factor: 0.00492892, category: 'volume', isCommon: true },
      { id: 'tablespoon', name: 'Tablespoon', symbol: 'tbsp', factor: 0.0147868, category: 'volume', isCommon: true },
      { id: 'fluid_ounce', name: 'Fluid Ounce', symbol: 'fl oz', factor: 0.0295735, category: 'volume', isCommon: true },
      { id: 'cup', name: 'Cup', symbol: 'cup', factor: 0.236588, category: 'volume', isCommon: true },
      { id: 'pint', name: 'Pint', symbol: 'pt', factor: 0.473176, category: 'volume', isCommon: true },
      { id: 'quart', name: 'Quart', symbol: 'qt', factor: 0.946353, category: 'volume', isCommon: true },
      { id: 'gallon', name: 'Gallon', symbol: 'gal', factor: 3.78541, category: 'volume', isCommon: true },
      
      // Specialized
      { id: 'barrel', name: 'Barrel', symbol: 'bbl', factor: 158.987, category: 'volume', isCommon: false },
      { id: 'bushel', name: 'Bushel', symbol: 'bu', factor: 35.2391, category: 'volume', isCommon: false },
      { id: 'peck', name: 'Peck', symbol: 'pk', factor: 8.80977, category: 'volume', isCommon: false },
      { id: 'gill', name: 'Gill', symbol: 'gi', factor: 0.118294, category: 'volume', isCommon: false },
    ]
  },
  {
    id: 'length',
    name: 'Length/Distance',
    baseUnit: 'meter',
    units: [
      // Metric
      { id: 'millimeter', name: 'Millimeter', symbol: 'mm', factor: 0.001, category: 'length', isCommon: true },
      { id: 'centimeter', name: 'Centimeter', symbol: 'cm', factor: 0.01, category: 'length', isCommon: true },
      { id: 'meter', name: 'Meter', symbol: 'm', factor: 1, category: 'length', isCommon: true },
      { id: 'kilometer', name: 'Kilometer', symbol: 'km', factor: 1000, category: 'length', isCommon: true },
      
      // Imperial/US
      { id: 'inch', name: 'Inch', symbol: 'in', factor: 0.0254, category: 'length', isCommon: true },
      { id: 'foot', name: 'Foot', symbol: 'ft', factor: 0.3048, category: 'length', isCommon: true },
      { id: 'yard', name: 'Yard', symbol: 'yd', factor: 0.9144, category: 'length', isCommon: true },
      { id: 'mile', name: 'Mile', symbol: 'mi', factor: 1609.34, category: 'length', isCommon: true },
      
      // Specialized
      { id: 'fathom', name: 'Fathom', symbol: 'ftm', factor: 1.8288, category: 'length', isCommon: false },
      { id: 'nautical_mile', name: 'Nautical Mile', symbol: 'nmi', factor: 1852, category: 'length', isCommon: false },
      { id: 'light_year', name: 'Light Year', symbol: 'ly', factor: 9.461e15, category: 'length', isCommon: false },
    ]
  },
  {
    id: 'area',
    name: 'Area',
    baseUnit: 'square_meter',
    units: [
      // Metric
      { id: 'square_millimeter', name: 'Square Millimeter', symbol: 'mm²', factor: 0.000001, category: 'area', isCommon: false },
      { id: 'square_centimeter', name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001, category: 'area', isCommon: false },
      { id: 'square_meter', name: 'Square Meter', symbol: 'm²', factor: 1, category: 'area', isCommon: true },
      { id: 'hectare', name: 'Hectare', symbol: 'ha', factor: 10000, category: 'area', isCommon: true },
      { id: 'square_kilometer', name: 'Square Kilometer', symbol: 'km²', factor: 1000000, category: 'area', isCommon: false },
      
      // Imperial/US
      { id: 'square_inch', name: 'Square Inch', symbol: 'in²', factor: 0.00064516, category: 'area', isCommon: false },
      { id: 'square_foot', name: 'Square Foot', symbol: 'ft²', factor: 0.092903, category: 'area', isCommon: true },
      { id: 'square_yard', name: 'Square Yard', symbol: 'yd²', factor: 0.836127, category: 'area', isCommon: true },
      { id: 'acre', name: 'Acre', symbol: 'ac', factor: 4046.86, category: 'area', isCommon: true },
      { id: 'square_mile', name: 'Square Mile', symbol: 'mi²', factor: 2589988, category: 'area', isCommon: false },
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'celsius',
    units: [
      { id: 'celsius', name: 'Celsius', symbol: '°C', factor: 1, category: 'temperature', isCommon: true },
      { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', factor: 1, category: 'temperature', isCommon: true },
      { id: 'kelvin', name: 'Kelvin', symbol: 'K', factor: 1, category: 'temperature', isCommon: false },
      { id: 'rankine', name: 'Rankine', symbol: '°R', factor: 1, category: 'temperature', isCommon: false },
    ]
  },
  {
    id: 'pressure',
    name: 'Pressure',
    baseUnit: 'pascal',
    units: [
      { id: 'pascal', name: 'Pascal', symbol: 'Pa', factor: 1, category: 'pressure', isCommon: false },
      { id: 'kilopascal', name: 'Kilopascal', symbol: 'kPa', factor: 1000, category: 'pressure', isCommon: true },
      { id: 'bar', name: 'Bar', symbol: 'bar', factor: 100000, category: 'pressure', isCommon: true },
      { id: 'psi', name: 'Pounds per Square Inch', symbol: 'psi', factor: 6894.76, category: 'pressure', isCommon: true },
      { id: 'atmosphere', name: 'Atmosphere', symbol: 'atm', factor: 101325, category: 'pressure', isCommon: false },
      { id: 'torr', name: 'Torr', symbol: 'Torr', factor: 133.322, category: 'pressure', isCommon: false },
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    baseUnit: 'joule',
    units: [
      { id: 'joule', name: 'Joule', symbol: 'J', factor: 1, category: 'energy', isCommon: false },
      { id: 'kilojoule', name: 'Kilojoule', symbol: 'kJ', factor: 1000, category: 'energy', isCommon: true },
      { id: 'calorie', name: 'Calorie', symbol: 'cal', factor: 4.184, category: 'energy', isCommon: true },
      { id: 'kilocalorie', name: 'Kilocalorie', symbol: 'kcal', factor: 4184, category: 'energy', isCommon: true },
      { id: 'btu', name: 'British Thermal Unit', symbol: 'BTU', factor: 1055.06, category: 'energy', isCommon: true },
      { id: 'watt_hour', name: 'Watt Hour', symbol: 'Wh', factor: 3600, category: 'energy', isCommon: true },
      { id: 'kilowatt_hour', name: 'Kilowatt Hour', symbol: 'kWh', factor: 3600000, category: 'energy', isCommon: true },
    ]
  },
  {
    id: 'custom',
    name: 'Custom Units',
    baseUnit: 'piece',
    units: [
      { id: 'piece', name: 'Piece', symbol: 'pc', factor: 1, category: 'custom', isCommon: true },
      { id: 'dozen', name: 'Dozen', symbol: 'dz', factor: 12, category: 'custom', isCommon: true },
      { id: 'gross', name: 'Gross', symbol: 'gr', factor: 144, category: 'custom', isCommon: false },
      { id: 'score', name: 'Score', symbol: 'score', factor: 20, category: 'custom', isCommon: false },
      { id: 'ream', name: 'Ream', symbol: 'ream', factor: 500, category: 'custom', isCommon: false },
      { id: 'baker_dozen', name: "Baker's Dozen", symbol: 'baker dz', factor: 13, category: 'custom', isCommon: false },
    ]
  }
];

// In-memory storage for conversion history
let conversionHistory: ConversionHistory[] = [];

// Temperature conversion functions (special case)
const convertTemperature = (value: number, fromUnit: string, toUnit: string): number => {
  // Convert to Celsius first
  let celsius: number;
  switch (fromUnit) {
    case 'celsius':
      celsius = value;
      break;
    case 'fahrenheit':
      celsius = (value - 32) * 5/9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    case 'rankine':
      celsius = (value - 491.67) * 5/9;
      break;
    default:
      throw new Error(`Unsupported temperature unit: ${fromUnit}`);
  }

  // Convert from Celsius to target unit
  switch (toUnit) {
    case 'celsius':
      return celsius;
    case 'fahrenheit':
      return celsius * 9/5 + 32;
    case 'kelvin':
      return celsius + 273.15;
    case 'rankine':
      return celsius * 9/5 + 491.67;
    default:
      throw new Error(`Unsupported temperature unit: ${toUnit}`);
  }
};

// GET /api/unit-converter/categories - Get all unit categories
unitConverterRouter.get('/unit-converter/categories', (req, res) => {
  try {
    res.json({
      categories: unitCategories.map(category => ({
        id: category.id,
        name: category.name,
        baseUnit: category.baseUnit,
        unitCount: category.units.length
      }))
    });
  } catch (error) {
    logger.error('Error fetching unit categories:', error);
    res.status(500).json({ error: 'Failed to fetch unit categories' });
  }
});

// GET /api/unit-converter/categories/:categoryId - Get units for a specific category
unitConverterRouter.get('/unit-converter/categories/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = unitCategories.find(c => c.id === categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ category });
  } catch (error) {
    logger.error('Error fetching category units:', error);
    res.status(500).json({ error: 'Failed to fetch category units' });
  }
});

// GET /api/unit-converter/units - Get all units with optional filtering
unitConverterRouter.get('/unit-converter/units', (req, res) => {
  try {
    const { category, common } = req.query;
    
    let allUnits = unitCategories.flatMap(cat => cat.units);
    
    if (category) {
      allUnits = allUnits.filter(unit => unit.category === category);
    }
    
    if (common === 'true') {
      allUnits = allUnits.filter(unit => unit.isCommon);
    }
    
    res.json({ units: allUnits });
  } catch (error) {
    logger.error('Error fetching units:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// POST /api/unit-converter/convert - Convert between units
unitConverterRouter.post('/unit-converter/convert', (req, res) => {
  try {
    const { value, fromUnit, toUnit, precision = 6 } = req.body;
    
    if (typeof value !== 'number' || !fromUnit || !toUnit) {
      return res.status(400).json({ error: 'Value, fromUnit, and toUnit are required' });
    }
    
    // Find the units
    const fromUnitData = unitCategories
      .flatMap(cat => cat.units)
      .find(unit => unit.id === fromUnit);
    
    const toUnitData = unitCategories
      .flatMap(cat => cat.units)
      .find(unit => unit.id === toUnit);
    
    if (!fromUnitData || !toUnitData) {
      return res.status(400).json({ error: 'Invalid unit specified' });
    }
    
    if (fromUnitData.category !== toUnitData.category) {
      return res.status(400).json({ error: 'Cannot convert between different unit categories' });
    }
    
    let convertedValue: number;
    let formula: string | undefined;
    
    // Handle temperature conversion (special case)
    if (fromUnitData.category === 'temperature') {
      convertedValue = convertTemperature(value, fromUnit, toUnit);
      formula = `Temperature conversion: ${fromUnit} → ${toUnit}`;
    } else {
      // Standard conversion through base unit
      const baseValue = value * fromUnitData.factor;
      convertedValue = baseValue / toUnitData.factor;
      formula = `${value} ${fromUnit} × ${fromUnitData.factor} ÷ ${toUnitData.factor} = ${convertedValue} ${toUnit}`;
    }
    
    // Round to specified precision
    const roundedValue = Math.round(convertedValue * Math.pow(10, precision)) / Math.pow(10, precision);
    
    const result: ConversionResult = {
      from: {
        value,
        unit: fromUnit,
        unitName: fromUnitData.name
      },
      to: {
        value: roundedValue,
        unit: toUnit,
        unitName: toUnitData.name
      },
      factor: toUnitData.factor / fromUnitData.factor,
      precision,
      formula
    };
    
    // Store in history
    const historyEntry: ConversionHistory = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromValue: value,
      fromUnit,
      toValue: roundedValue,
      toUnit,
      category: fromUnitData.category,
      timestamp: new Date().toISOString(),
      userId: req.user?.userId
    };
    
    conversionHistory.unshift(historyEntry);
    
    // Keep only last 1000 conversions
    if (conversionHistory.length > 1000) {
      conversionHistory = conversionHistory.slice(0, 1000);
    }
    
    logger.info('Unit conversion completed', {
      from: `${value} ${fromUnit}`,
      to: `${roundedValue} ${toUnit}`,
      category: fromUnitData.category
    });
    
    res.json({ result });
  } catch (error) {
    logger.error('Error converting units:', error);
    res.status(500).json({ error: 'Failed to convert units' });
  }
});

// POST /api/unit-converter/batch-convert - Convert multiple values at once
unitConverterRouter.post('/unit-converter/batch-convert', (req, res) => {
  try {
    const { conversions } = req.body;
    
    if (!Array.isArray(conversions)) {
      return res.status(400).json({ error: 'Conversions must be an array' });
    }
    
    const results = conversions.map(({ value, fromUnit, toUnit, precision = 6 }) => {
      try {
        const fromUnitData = unitCategories
          .flatMap(cat => cat.units)
          .find(unit => unit.id === fromUnit);
        
        const toUnitData = unitCategories
          .flatMap(cat => cat.units)
          .find(unit => unit.id === toUnit);
        
        if (!fromUnitData || !toUnitData) {
          throw new Error(`Invalid unit: ${fromUnit} or ${toUnit}`);
        }
        
        if (fromUnitData.category !== toUnitData.category) {
          throw new Error(`Cannot convert between different categories: ${fromUnitData.category} and ${toUnitData.category}`);
        }
        
        let convertedValue: number;
        
        if (fromUnitData.category === 'temperature') {
          convertedValue = convertTemperature(value, fromUnit, toUnit);
        } else {
          const baseValue = value * fromUnitData.factor;
          convertedValue = baseValue / toUnitData.factor;
        }
        
        const roundedValue = Math.round(convertedValue * Math.pow(10, precision)) / Math.pow(10, precision);
        
        return {
          success: true,
          from: { value, unit: fromUnit, unitName: fromUnitData.name },
          to: { value: roundedValue, unit: toUnit, unitName: toUnitData.name },
          factor: toUnitData.factor / fromUnitData.factor
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          from: { value, unit: fromUnit },
          to: { unit: toUnit }
        };
      }
    });
    
    res.json({ results });
  } catch (error) {
    logger.error('Error in batch conversion:', error);
    res.status(500).json({ error: 'Failed to perform batch conversion' });
  }
});

// GET /api/unit-converter/history - Get conversion history
unitConverterRouter.get('/unit-converter/history', (req, res) => {
  try {
    const { limit = 50, offset = 0, category } = req.query;
    
    let filteredHistory = conversionHistory;
    
    if (category) {
      filteredHistory = filteredHistory.filter(entry => entry.category === category);
    }
    
    const paginatedHistory = filteredHistory
      .slice(Number(offset), Number(offset) + Number(limit));
    
    res.json({
      history: paginatedHistory,
      total: filteredHistory.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('Error fetching conversion history:', error);
    res.status(500).json({ error: 'Failed to fetch conversion history' });
  }
});

// GET /api/unit-converter/quick-reference - Get quick reference conversions
unitConverterRouter.get('/unit-converter/quick-reference', (req, res) => {
  try {
    const { category } = req.query;
    
    const quickReference = {
      weight: [
        { from: '1 kg', to: '2.205 lb', factor: 2.205 },
        { from: '1 lb', to: '0.454 kg', factor: 0.454 },
        { from: '1 oz', to: '28.35 g', factor: 28.35 },
        { from: '1 g', to: '0.035 oz', factor: 0.035 },
        { from: '1 tonne', to: '2205 lb', factor: 2205 },
      ],
      volume: [
        { from: '1 liter', to: '1.057 qt', factor: 1.057 },
        { from: '1 gallon', to: '3.785 liters', factor: 3.785 },
        { from: '1 cup', to: '236.6 ml', factor: 236.6 },
        { from: '1 fl oz', to: '29.57 ml', factor: 29.57 },
        { from: '1 tbsp', to: '14.79 ml', factor: 14.79 },
        { from: '1 tsp', to: '4.929 ml', factor: 4.929 },
      ],
      length: [
        { from: '1 meter', to: '3.281 ft', factor: 3.281 },
        { from: '1 foot', to: '0.305 m', factor: 0.305 },
        { from: '1 inch', to: '2.54 cm', factor: 2.54 },
        { from: '1 mile', to: '1.609 km', factor: 1.609 },
        { from: '1 yard', to: '0.914 m', factor: 0.914 },
      ],
      area: [
        { from: '1 m²', to: '10.76 ft²', factor: 10.76 },
        { from: '1 ft²', to: '0.093 m²', factor: 0.093 },
        { from: '1 acre', to: '4047 m²', factor: 4047 },
        { from: '1 hectare', to: '2.471 acres', factor: 2.471 },
      ],
      temperature: [
        { from: '0°C', to: '32°F', formula: '°F = °C × 9/5 + 32' },
        { from: '100°C', to: '212°F', formula: '°F = °C × 9/5 + 32' },
        { from: '32°F', to: '0°C', formula: '°C = (°F - 32) × 5/9' },
        { from: '212°F', to: '100°C', formula: '°C = (°F - 32) × 5/9' },
      ],
      custom: [
        { from: '1 dozen', to: '12 pieces', factor: 12 },
        { from: '1 gross', to: '144 pieces', factor: 144 },
        { from: '1 score', to: '20 pieces', factor: 20 },
        { from: '1 baker dozen', to: '13 pieces', factor: 13 },
      ]
    };
    
    if (category && quickReference[category as keyof typeof quickReference]) {
      res.json({ 
        category, 
        conversions: quickReference[category as keyof typeof quickReference] 
      });
    } else {
      res.json({ quickReference });
    }
  } catch (error) {
    logger.error('Error fetching quick reference:', error);
    res.status(500).json({ error: 'Failed to fetch quick reference' });
  }
});

// GET /api/unit-converter/analytics - Get conversion analytics
unitConverterRouter.get('/unit-converter/analytics', (req, res) => {
  try {
    const totalConversions = conversionHistory.length;
    const categoryBreakdown = conversionHistory.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentActivity = {
      last24Hours: conversionHistory.filter(entry => 
        new Date(entry.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      last7Days: conversionHistory.filter(entry => 
        new Date(entry.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      last30Days: conversionHistory.filter(entry => 
        new Date(entry.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    };
    
    const mostUsedUnits = conversionHistory.reduce((acc, entry) => {
      acc[entry.fromUnit] = (acc[entry.fromUnit] || 0) + 1;
      acc[entry.toUnit] = (acc[entry.toUnit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topUnits = Object.entries(mostUsedUnits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([unit, count]) => ({ unit, count }));
    
    res.json({
      overview: {
        totalConversions,
        totalCategories: unitCategories.length,
        totalUnits: unitCategories.reduce((sum, cat) => sum + cat.units.length, 0)
      },
      categoryBreakdown,
      recentActivity,
      topUnits
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST /api/unit-converter/custom-unit - Add custom unit (for future extension)
unitConverterRouter.post('/unit-converter/custom-unit', (req, res) => {
  try {
    const { name, symbol, factor, category, description } = req.body;
    
    if (!name || !symbol || typeof factor !== 'number' || !category) {
      return res.status(400).json({ error: 'Name, symbol, factor, and category are required' });
    }
    
    // Find the category
    const categoryData = unitCategories.find(c => c.id === category);
    if (!categoryData) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Check if unit already exists
    const existingUnit = categoryData.units.find(unit => 
      unit.id === name.toLowerCase().replace(/\s+/g, '_') || 
      unit.symbol === symbol
    );
    
    if (existingUnit) {
      return res.status(400).json({ error: 'Unit with this name or symbol already exists' });
    }
    
    const newUnit: Unit = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      symbol,
      factor,
      category,
      description,
      isCommon: false
    };
    
    categoryData.units.push(newUnit);
    
    logger.info('Custom unit added', { name, symbol, category, factor });
    
    res.json({ 
      success: true, 
      unit: newUnit,
      message: 'Custom unit added successfully' 
    });
  } catch (error) {
    logger.error('Error adding custom unit:', error);
    res.status(500).json({ error: 'Failed to add custom unit' });
  }
});

// DELETE /api/unit-converter/history/:id - Delete specific conversion from history
unitConverterRouter.delete('/unit-converter/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = conversionHistory.findIndex(entry => entry.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Conversion not found' });
    }
    
    conversionHistory.splice(index, 1);
    
    res.json({ 
      success: true,
      message: 'Conversion deleted successfully' 
    });
  } catch (error) {
    logger.error('Error deleting conversion:', error);
    res.status(500).json({ error: 'Failed to delete conversion' });
  }
});

// DELETE /api/unit-converter/history - Clear all conversion history
unitConverterRouter.delete('/unit-converter/history', (req, res) => {
  try {
    conversionHistory = [];
    
    res.json({ 
      success: true,
      message: 'Conversion history cleared successfully' 
    });
  } catch (error) {
    logger.error('Error clearing conversion history:', error);
    res.status(500).json({ error: 'Failed to clear conversion history' });
  }
});
