import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Plus, FileDown, Printer, Package, ArrowRightLeft, Shuffle } from 'lucide-react';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import { convertBetweenUnits, isMassUnit, isVolumeUnit } from '../../../../../utils/units';
import { downloadCSV } from '../../../../../utils/csv';

// Common units for conversion
const MASS_UNITS = ['g', 'kg', 'oz', 'lb'];
const VOLUME_UNITS = ['ml', 'l', 'tsp', 'tbsp', 'cup', 'pt', 'qt', 'gal'];

// Mock products with recipes - in production, this would come from your products API/database
const MOCK_PRODUCTS = [
  { 
    id: 'prod-1', 
    name: 'Sourdough Bread Loaf', 
    unitCost: 4.50, 
    category: 'Bread',
    recipe: [
      { ingredient: 'Bread Flour', amount: 500, unit: 'g', costPerUnit: 0.002 },
      { ingredient: 'Water', amount: 350, unit: 'g', costPerUnit: 0.0001 },
      { ingredient: 'Sourdough Starter', amount: 100, unit: 'g', costPerUnit: 0.01 },
      { ingredient: 'Salt', amount: 10, unit: 'g', costPerUnit: 0.001 },
    ]
  },
  { 
    id: 'prod-2', 
    name: 'Croissant (Dozen)', 
    unitCost: 12.00, 
    category: 'Pastry',
    recipe: [
      { ingredient: 'All-Purpose Flour', amount: 600, unit: 'g', costPerUnit: 0.0018 },
      { ingredient: 'Butter', amount: 400, unit: 'g', costPerUnit: 0.012 },
      { ingredient: 'Milk', amount: 200, unit: 'ml', costPerUnit: 0.002 },
      { ingredient: 'Sugar', amount: 50, unit: 'g', costPerUnit: 0.002 },
      { ingredient: 'Yeast', amount: 10, unit: 'g', costPerUnit: 0.02 },
      { ingredient: 'Salt', amount: 12, unit: 'g', costPerUnit: 0.001 },
    ]
  },
  { 
    id: 'prod-3', 
    name: 'Baguette', 
    unitCost: 3.00, 
    category: 'Bread',
    recipe: [
      { ingredient: 'Bread Flour', amount: 300, unit: 'g', costPerUnit: 0.002 },
      { ingredient: 'Water', amount: 200, unit: 'g', costPerUnit: 0.0001 },
      { ingredient: 'Yeast', amount: 3, unit: 'g', costPerUnit: 0.02 },
      { ingredient: 'Salt', amount: 6, unit: 'g', costPerUnit: 0.001 },
    ]
  },
  { 
    id: 'prod-4', 
    name: 'Chocolate Chip Cookies (Dozen)', 
    unitCost: 8.00, 
    category: 'Cookies',
    recipe: [
      { ingredient: 'All-Purpose Flour', amount: 280, unit: 'g', costPerUnit: 0.0018 },
      { ingredient: 'Butter', amount: 200, unit: 'g', costPerUnit: 0.012 },
      { ingredient: 'Sugar', amount: 150, unit: 'g', costPerUnit: 0.002 },
      { ingredient: 'Brown Sugar', amount: 150, unit: 'g', costPerUnit: 0.0025 },
      { ingredient: 'Chocolate Chips', amount: 200, unit: 'g', costPerUnit: 0.01 },
      { ingredient: 'Eggs', amount: 2, unit: 'unit', costPerUnit: 0.30 },
      { ingredient: 'Vanilla Extract', amount: 5, unit: 'ml', costPerUnit: 0.15 },
      { ingredient: 'Baking Soda', amount: 5, unit: 'g', costPerUnit: 0.002 },
      { ingredient: 'Salt', amount: 5, unit: 'g', costPerUnit: 0.001 },
    ]
  },
];

interface ProductEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

interface JobCostEstimatorState {
  jobName: string;
  laborPercent: number;
  wastePercent: number;
  products: ProductEntry[];
}

const JobCostEstimatorTab: React.FC = () => {
  const [state, setState] = useState<JobCostEstimatorState>({
    jobName: '',
    laborPercent: 2,
    wastePercent: 5,
    products: []
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [outputUnit, setOutputUnit] = useState<string>('g');
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  
  // Unit converter state
  const [converterFrom, setConverterFrom] = useState({ value: 1, unit: 'g' });
  const [converterTo, setConverterTo] = useState({ unit: 'cup' });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('job-cost-estimator-draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (error) {
        console.warn('Failed to load job cost estimator draft:', error);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('job-cost-estimator-draft', JSON.stringify(state));
  }, [state]);

  // Helper to convert units
  const convertUnit = (amount: number, fromUnit: string, toUnit: string): { value: number; canConvert: boolean; note?: string } => {
    if (fromUnit === toUnit) return { value: amount, canConvert: true };
    
    // Check if we're trying to convert between mass and volume
    const fromIsMass = isMassUnit(fromUnit);
    const fromIsVolume = isVolumeUnit(fromUnit);
    const toIsMass = isMassUnit(toUnit);
    const toIsVolume = isVolumeUnit(toUnit);
    
    // Don't allow cross-type conversions (mass to volume or vice versa)
    if ((fromIsMass && toIsVolume) || (fromIsVolume && toIsMass)) {
      return { 
        value: amount, 
        canConvert: false, 
        note: 'Cannot convert between mass and volume - density varies by ingredient'
      };
    }
    
    try {
      const result = convertBetweenUnits(amount, fromUnit, toUnit);
      if (result.note === 'needsDensity') {
        return { value: amount, canConvert: false, note: 'Conversion requires density data' };
      }
      return { value: result.qty, canConvert: true };
    } catch {
      // If conversion fails, return original amount
      return { value: amount, canConvert: false, note: 'Conversion failed' };
    }
  };

  // Calculate aggregated ingredients from all products
  const aggregatedIngredients = useMemo(() => {
    const ingredientMap = new Map<string, { amount: number; unit: string; costPerUnit: number; originalUnit: string }>();
    
    state.products.forEach(productEntry => {
      const product = MOCK_PRODUCTS.find(p => p.id === productEntry.productId);
      if (!product || !product.recipe) return;
      
      product.recipe.forEach(recipeItem => {
        const totalAmount = recipeItem.amount * productEntry.quantity;
        const key = `${recipeItem.ingredient}-${recipeItem.unit}`;
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          ingredientMap.set(key, {
            ...existing,
            amount: existing.amount + totalAmount
          });
        } else {
          ingredientMap.set(key, {
            amount: totalAmount,
            unit: recipeItem.unit,
            originalUnit: recipeItem.unit,
            costPerUnit: recipeItem.costPerUnit
          });
        }
      });
    });
    
    return Array.from(ingredientMap.entries()).map(([key, value]) => {
      const grossAmount = value.amount * (1 + state.wastePercent / 100);
      
      // Try to convert to output unit if compatible
      let displayAmount = grossAmount;
      let displayUnit = value.unit;
      let conversionNote: string | undefined;
      
      if (outputUnit && outputUnit !== value.unit) {
        const converted = convertUnit(grossAmount, value.unit, outputUnit);
        if (converted.canConvert) {
          displayAmount = converted.value;
          displayUnit = outputUnit;
        } else {
          // Keep original but note why conversion failed
          conversionNote = converted.note;
        }
      }
      
      return {
        ingredient: key.split('-')[0],
        requiredNet: value.amount,
        requiredGross: grossAmount,
        displayAmount,
        unit: value.originalUnit,
        displayUnit,
        costPerUnit: value.costPerUnit,
        totalCost: grossAmount * value.costPerUnit,
        conversionNote
      };
    });
  }, [state.products, state.wastePercent, outputUnit]);

  const costingSummary = useMemo(() => {
    const totalIngredientCost = aggregatedIngredients.reduce((sum, ing) => sum + ing.totalCost, 0);
    const laborCost = totalIngredientCost * (state.laborPercent / 100);
    const totalCost = totalIngredientCost + laborCost;
    
    return {
      totalIngredientCost,
      laborCost,
      totalCost,
      totalProducts: state.products.reduce((sum, p) => sum + p.quantity, 0),
      costPerUnit: state.products.length > 0 ? totalCost / state.products.reduce((sum, p) => sum + p.quantity, 0) : 0
    };
  }, [aggregatedIngredients, state.laborPercent, state.products]);

  const handleStateChange = (updates: Partial<JobCostEstimatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addProductFromList = () => {
    if (!selectedProductId || productQuantity <= 0) return;
    
    const product = MOCK_PRODUCTS.find(p => p.id === selectedProductId);
    if (!product) return;

    const newProduct: ProductEntry = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      quantity: productQuantity,
      unitCost: product.unitCost
    };
    
    handleStateChange({
      products: [...state.products, newProduct]
    });
    
    setSelectedProductId('');
    setProductQuantity(1);
    setShowProductSelector(false);
  };

  const updateProduct = (id: string, quantity: number) => {
    handleStateChange({
      products: state.products.map(p => p.id === id ? { ...p, quantity } : p)
    });
  };

  const removeProduct = (id: string) => {
    handleStateChange({
      products: state.products.filter(p => p.id !== id)
    });
  };

  const handleExportCSV = () => {
    // Simple CSV export for ingredients
    const headers = ['Ingredient', 'Required (Net)', 'With Waste', 'Unit', 'Cost Per Unit', 'Total Cost'];
    const rows = aggregatedIngredients.map(ing => [
      ing.ingredient,
      ing.requiredNet.toFixed(2),
      ing.requiredGross.toFixed(2),
      ing.unit,
      `$${ing.costPerUnit.toFixed(4)}`,
      `$${ing.totalCost.toFixed(2)}`
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const filename = `job-cost-estimator-${state.jobName || 'job'}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  // Unit converter calculation
  const converterResult = useMemo(() => {
    if (!converterFrom.value || !converterFrom.unit || !converterTo.unit) return null;
    
    const converted = convertUnit(converterFrom.value, converterFrom.unit, converterTo.unit);
    
    if (!converted.canConvert) {
      return {
        value: 0,
        unit: converterTo.unit,
        error: converted.note || 'Cannot convert between these units'
      };
    }
    
    return {
      value: converted.value,
      unit: converterTo.unit
    };
  }, [converterFrom, converterTo]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Cost Estimator - ${state.jobName || 'Job'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .cost-highlight { font-size: 1.2em; font-weight: bold; color: #2563eb; }
          </style>
        </head>
        <body>
          <h1>Job Cost Estimator Results</h1>
          <p><strong>Job:</strong> ${state.jobName || 'Untitled Job'}</p>
          <p><strong>Waste Buffer:</strong> ${state.wastePercent}%</p>
          <p><strong>Labor:</strong> ${state.laborPercent}%</p>
          
          <h2>Total Ingredients Needed</h2>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Required Net</th>
                <th>Required Gross</th>
                <th>Cost Per Unit</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              ${aggregatedIngredients.map(ing => `
                <tr>
                  <td>${ing.ingredient}</td>
                  <td>${ing.requiredNet.toFixed(2)} ${ing.unit}</td>
                  <td>${ing.requiredGross.toFixed(2)} ${ing.unit}</td>
                  <td>$${ing.costPerUnit.toFixed(4)}</td>
                  <td>$${ing.totalCost.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Ingredient Cost:</strong> <span class="cost-highlight">$${costingSummary.totalIngredientCost.toFixed(2)}</span></p>
            <p><strong>Labor Cost:</strong> <span class="cost-highlight">$${costingSummary.laborCost.toFixed(2)}</span></p>
            <p><strong>Total Cost:</strong> <span class="cost-highlight">$${costingSummary.totalCost.toFixed(2)}</span></p>
            <p><strong>Cost per Unit:</strong> <span class="cost-highlight">$${costingSummary.costPerUnit.toFixed(2)}</span></p>
            <p><strong>Total Units:</strong> ${costingSummary.totalProducts}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            Job Cost Estimator
          </h2>
          <p className="text-gray-600 mt-1">
            Add products to calculate total ingredient requirements for planning and job costing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowUnitConverter(!showUnitConverter)}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Unit Converter
          </Button>
        </div>
      </div>

      {/* Inputs Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Meta Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job/Order Name</label>
              <input
                type="text"
                value={state.jobName}
                onChange={(e) => handleStateChange({ jobName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Farmers Market - Oct 12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labor %</label>
              <input
                type="number"
                step="0.1"
                value={state.laborPercent}
                onChange={(e) => handleStateChange({ laborPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waste %</label>
              <input
                type="number"
                step="0.1"
                value={state.wastePercent}
                onChange={(e) => handleStateChange({ wastePercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                Output Unit
                <span className="text-xs text-gray-500">(for mass/volume)</span>
              </label>
              <select
                value={outputUnit}
                onChange={(e) => setOutputUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Select output measurement unit"
              >
                <optgroup label="Mass">
                  {MASS_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </optgroup>
                <optgroup label="Volume">
                  {VOLUME_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowProductSelector(!showProductSelector)} 
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Select Product
                </Button>
              </div>
            </div>

            {/* Product Selector Modal */}
            {showProductSelector && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Product</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select a product"
                    >
                      <option value="">-- Select Product --</option>
                      {MOCK_PRODUCTS.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                      title="Enter product quantity"
                    />
                  </div>
                  <div className="flex gap-2 pt-6">
                    <Button 
                      onClick={addProductFromList}
                      disabled={!selectedProductId}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowProductSelector(false);
                        setSelectedProductId('');
                        setProductQuantity(1);
                      }}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {state.products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products added</h3>
                <p className="text-gray-600 mb-4">Select products to calculate total ingredient requirements</p>
                <Button 
                  onClick={() => setShowProductSelector(true)} 
                  className="flex items-center gap-2 mx-auto"
                >
                  <Package className="h-4 w-4" />
                  Select Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extended Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProduct(product.id, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            title="Product quantity"
                            placeholder="1"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">${product.unitCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${(product.quantity * product.unitCost).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      {state.products.length > 0 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Results</h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleExportCSV} className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Total Ingredients Table */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Total Ingredients Needed</h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Net</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buffer (%)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Gross</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packs to Buy</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rounded Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leftover</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aggregatedIngredients.map((ing, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{ing.ingredient}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{ing.requiredNet.toFixed(2)} {ing.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{state.wastePercent.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span>{ing.displayAmount.toFixed(2)} {ing.displayUnit}</span>
                            {ing.displayUnit !== ing.unit && !ing.conversionNote && (
                              <span className="text-xs text-gray-500">({ing.requiredGross.toFixed(2)} {ing.unit})</span>
                            )}
                            {ing.conversionNote && (
                              <span className="text-xs text-amber-600 flex items-center gap-1" title={ing.conversionNote}>
                                ⚠️ {ing.unit} (density varies)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">-</td>
                        <td className="px-4 py-3 text-sm text-gray-900">-</td>
                        <td className="px-4 py-3 text-sm text-gray-900">-</td>
                        <td className="px-4 py-3 text-sm text-gray-900">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ingredient Costing */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Ingredient Costing</h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packs</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extended Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aggregatedIngredients.map((ing, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{ing.ingredient}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{ing.requiredGross.toFixed(2)} {ing.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${ing.costPerUnit.toFixed(4)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${ing.totalCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Ingredient Cost</h5>
                <p className="text-2xl font-bold text-blue-600">${costingSummary.totalIngredientCost.toFixed(2)}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-amber-900 mb-2">Labor Cost ({state.laborPercent}%)</h5>
                <p className="text-2xl font-bold text-amber-600">${costingSummary.laborCost.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-green-900 mb-2">Total Cost</h5>
                <p className="text-2xl font-bold text-green-600">${costingSummary.totalCost.toFixed(2)}</p>
              </div>
            </div>

            {/* Job Summary Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-amber-900 mb-3">Job Summary</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-amber-700 mb-1">Total Units</p>
                  <p className="text-lg font-semibold text-amber-900">{costingSummary.totalProducts}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-700 mb-1">Cost Per Unit</p>
                  <p className="text-lg font-semibold text-amber-900">${costingSummary.costPerUnit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-700 mb-1">Unique Ingredients</p>
                  <p className="text-lg font-semibold text-amber-900">{aggregatedIngredients.length}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-700 mb-1">Waste Buffer</p>
                  <p className="text-lg font-semibold text-amber-900">{state.wastePercent}%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Unit Converter Modal */}
      {showUnitConverter && (
        <Card className="p-6 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-blue-600" />
              Quick Unit Converter
            </h3>
            <button
              onClick={() => setShowUnitConverter(false)}
              className="text-gray-400 hover:text-gray-600"
              title="Close converter"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={converterFrom.value}
                    onChange={(e) => setConverterFrom(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Amount"
                  />
                  <select
                    value={converterFrom.unit}
                    onChange={(e) => setConverterFrom(prev => ({ ...prev, unit: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select from unit"
                  >
                    <optgroup label="Mass">
                      {MASS_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Volume">
                      {VOLUME_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRightLeft className="h-8 w-8 text-blue-600" />
            </div>

            {/* To Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                    <span className="text-lg font-semibold text-gray-900">
                      {converterResult ? converterResult.value.toFixed(4) : '0'}
                    </span>
                  </div>
                  <select
                    value={converterTo.unit}
                    onChange={(e) => setConverterTo(prev => ({ ...prev, unit: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select to unit"
                  >
                    <optgroup label="Mass">
                      {MASS_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Volume">
                      {VOLUME_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Result Display */}
          {converterResult && (
            <div className={`mt-4 p-4 rounded-lg border ${converterResult.error ? 'bg-amber-50 border-amber-300' : 'bg-white border-blue-200'}`}>
              {converterResult.error ? (
                <div className="text-center">
                  <p className="text-amber-800 font-medium mb-2">⚠️ Cannot Convert</p>
                  <p className="text-sm text-amber-700">{converterResult.error}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Mass and volume conversions require ingredient-specific density data.<br />
                    For example: 1 cup flour ≈ 120g, but 1 cup sugar ≈ 200g
                  </p>
                </div>
              ) : (
                <p className="text-center text-lg">
                  <span className="font-bold text-blue-600">{converterFrom.value} {converterFrom.unit}</span>
                  {' = '}
                  <span className="font-bold text-green-600">{converterResult.value.toFixed(4)} {converterResult.unit}</span>
                </p>
              )}
            </div>
          )}

          {/* Quick Reference Tables */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Quick Reference</h4>
            
            {/* Standard Unit Conversions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium text-gray-900">Mass Conversions:</p>
                <p className="text-gray-600">• 1 kg = 1000 g</p>
                <p className="text-gray-600">• 1 lb = 453.592 g</p>
                <p className="text-gray-600">• 1 oz = 28.35 g</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">Volume Conversions:</p>
                <p className="text-gray-600">• 1 cup = 236.588 ml</p>
                <p className="text-gray-600">• 1 tbsp = 14.787 ml</p>
                <p className="text-gray-600">• 1 tsp = 4.929 ml</p>
              </div>
            </div>

            {/* Ingredient-Specific Mass to Volume Guide */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-3">Ingredient-Specific: Mass to Volume Guide</h5>
              <p className="text-xs text-gray-600 mb-3 italic">
                These conversions are approximate and vary by ingredient brand, moisture, and packing method
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {/* Flours & Grains */}
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 text-xs uppercase tracking-wide">Flours & Grains</p>
                  <div className="space-y-1">
                    <p className="text-gray-700"><strong>All-Purpose Flour:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 120-125g</p>
                    <p className="text-gray-700"><strong>Bread Flour:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 127-130g</p>
                    <p className="text-gray-700"><strong>Cake Flour:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 114-120g</p>
                    <p className="text-gray-700"><strong>Whole Wheat Flour:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 120-128g</p>
                    <p className="text-gray-700"><strong>Almond Flour:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 96-112g</p>
                  </div>
                </div>

                {/* Sugars & Sweeteners */}
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 text-xs uppercase tracking-wide">Sugars & Sweeteners</p>
                  <div className="space-y-1">
                    <p className="text-gray-700"><strong>Granulated Sugar:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 200g</p>
                    <p className="text-gray-700"><strong>Brown Sugar (packed):</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 220g</p>
                    <p className="text-gray-700"><strong>Powdered Sugar:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 120-130g</p>
                    <p className="text-gray-700"><strong>Honey:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 340g</p>
                    <p className="text-gray-700"><strong>Maple Syrup:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 315g</p>
                  </div>
                </div>

                {/* Fats, Dairy & Other */}
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 text-xs uppercase tracking-wide">Fats, Dairy & Other</p>
                  <div className="space-y-1">
                    <p className="text-gray-700"><strong>Butter:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 227g</p>
                    <p className="text-gray-600 text-xs">• 1 stick ≈ 113g</p>
                    <p className="text-gray-700"><strong>Oil (vegetable, olive):</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 218g</p>
                    <p className="text-gray-700"><strong>Milk/Water:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 240g</p>
                    <p className="text-gray-700"><strong>Cocoa Powder:</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 85-100g</p>
                    <p className="text-gray-700"><strong>Salt (table):</strong></p>
                    <p className="text-gray-600 text-xs">• 1 cup ≈ 292g</p>
                    <p className="text-gray-600 text-xs">• 1 tsp ≈ 6g</p>
                  </div>
                </div>
              </div>

              {/* Additional Common Measurements */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="font-medium text-gray-900 text-sm mb-2">Additional Common Measurements:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  <p>• Baking Powder/Soda: 1 tsp ≈ 5g</p>
                  <p>• Vanilla Extract: 1 tsp ≈ 4g</p>
                  <p>• Yeast (active dry): 1 packet ≈ 7g</p>
                  <p>• Chocolate Chips: 1 cup ≈ 170g</p>
                  <p>• Rolled Oats: 1 cup ≈ 90g</p>
                  <p>• Nuts (chopped): 1 cup ≈ 120-150g</p>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>💡 Pro Tip:</strong> For best accuracy, always weigh ingredients when possible. 
                  Volume measurements can vary based on how ingredients are scooped, packed, and settled.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default JobCostEstimatorTab;

