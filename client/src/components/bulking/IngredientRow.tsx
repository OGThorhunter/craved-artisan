import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { allUnits, convertBetweenUnits } from '../../utils/units';

export interface IngredientRowData {
  id: string;
  ingredient: string;
  baseQty: number;
  unit: string;
  densityGPerMl?: number;
  packSize: number;
  packUnit: string;
  packPrice: number;
  supplier: string;
}

interface IngredientRowProps {
  data: IngredientRowData;
  onChange: (data: IngredientRowData) => void;
  onRemove: () => void;
  needsDensityWarning?: boolean;
}

const IngredientRow: React.FC<IngredientRowProps> = ({
  data,
  onChange,
  onRemove,
  needsDensityWarning = false
}) => {
  const handleFieldChange = (field: keyof IngredientRowData, value: string | number) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleQuickConversion = (targetUnit: string) => {
    const result = convertBetweenUnits(data.baseQty, data.unit, targetUnit, data.densityGPerMl);
    if (result.note === 'needsDensity') {
      return; // Don't convert if density is missing
    }
    handleFieldChange('baseQty', result.qty);
    handleFieldChange('unit', targetUnit);
  };

  const getRelatedUnits = () => {
    const currentUnit = data.unit;
    if (currentUnit === 'g') return ['kg', 'oz', 'lb'];
    if (currentUnit === 'kg') return ['g', 'oz', 'lb'];
    if (currentUnit === 'oz') return ['g', 'kg', 'lb'];
    if (currentUnit === 'lb') return ['g', 'kg', 'oz'];
    if (currentUnit === 'ml') return ['L', 'cup', 'Tbsp', 'tsp'];
    if (currentUnit === 'L') return ['ml', 'cup', 'Tbsp', 'tsp'];
    if (currentUnit === 'cup') return ['ml', 'L', 'Tbsp', 'tsp'];
    if (currentUnit === 'Tbsp') return ['ml', 'L', 'cup', 'tsp'];
    if (currentUnit === 'tsp') return ['ml', 'L', 'cup', 'Tbsp'];
    return [];
  };

  const relatedUnits = getRelatedUnits();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <input
          type="text"
          value={data.ingredient}
          onChange={(e) => handleFieldChange('ingredient', e.target.value)}
          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ingredient name"
        />
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            value={data.baseQty}
            onChange={(e) => handleFieldChange('baseQty', parseFloat(e.target.value) || 0)}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            title="Base quantity"
          />
          <select
            value={data.unit}
            onChange={(e) => handleFieldChange('unit', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Unit of measurement"
          >
            {allUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          {needsDensityWarning && (
            <div className="flex items-center text-yellow-600" title="Needs density to convert between mass and volume">
              <AlertTriangle className="h-4 w-4" />
            </div>
          )}
        </div>
        {relatedUnits.length > 0 && (
          <div className="flex gap-1 mt-1">
            <span className="text-xs text-gray-500">Quick:</span>
            {relatedUnits.map(unit => (
              <button
                key={unit}
                onClick={() => handleQuickConversion(unit)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {unit}
              </button>
            ))}
          </div>
        )}
      </td>
      
      <td className="px-4 py-3">
        <input
          type="number"
          step="0.01"
          value={data.densityGPerMl || ''}
          onChange={(e) => handleFieldChange('densityGPerMl', parseFloat(e.target.value) || undefined)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="g/ml"
        />
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            value={data.packSize}
            onChange={(e) => handleFieldChange('packSize', parseFloat(e.target.value) || 0)}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            title="Pack size"
          />
          <select
            value={data.packUnit}
            onChange={(e) => handleFieldChange('packUnit', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Pack unit"
          >
            {allUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <input
          type="number"
          step="0.01"
          value={data.packPrice}
          onChange={(e) => handleFieldChange('packPrice', parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </td>
      
      <td className="px-4 py-3">
        <input
          type="text"
          value={data.supplier}
          onChange={(e) => handleFieldChange('supplier', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Supplier"
        />
      </td>
      
      <td className="px-4 py-3">
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Remove ingredient"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

export default IngredientRow;
