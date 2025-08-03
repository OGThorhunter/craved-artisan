import React, { useMemo } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface RecipeCostCalculatorProps {
  ingredients: Ingredient[];
  yieldAmount: number;
  yieldUnit: string;
  linkedProduct?: Product | null;
  className?: string;
}

const RecipeCostCalculator: React.FC<RecipeCostCalculatorProps> = ({
  ingredients,
  yieldAmount,
  yieldUnit,
  linkedProduct,
  className = ''
}) => {
  const calculations = useMemo(() => {
    // Calculate total ingredient cost
    const totalIngredientCost = ingredients.reduce((total, ingredient) => {
      return total + (ingredient.quantity * ingredient.costPerUnit);
    }, 0);

    // Calculate per-batch cost (total ingredient cost)
    const perBatchCost = totalIngredientCost;

    // Calculate per-unit cost
    const perUnitCost = yieldAmount > 0 ? perBatchCost / yieldAmount : 0;

    // Calculate margin if product is linked
    let margin = 0;
    let marginPercentage = 0;
    let marginColor = 'gray';
    let marginIcon = null;
    let marginLabel = 'No product linked';

    if (linkedProduct && linkedProduct.price > 0) {
      const revenue = linkedProduct.price;
      margin = revenue - perUnitCost;
      marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;

      // Color code based on margin percentage
      if (marginPercentage < 20) {
        marginColor = 'red';
        marginIcon = <AlertTriangle className="h-4 w-4" />;
        marginLabel = 'Low Margin';
      } else if (marginPercentage < 35) {
        marginColor = 'yellow';
        marginIcon = <TrendingUp className="h-4 w-4" />;
        marginLabel = 'Moderate Margin';
      } else {
        marginColor = 'green';
        marginIcon = <CheckCircle className="h-4 w-4" />;
        marginLabel = 'Good Margin';
      }
    }

    return {
      totalIngredientCost,
      perBatchCost,
      perUnitCost,
      margin,
      marginPercentage,
      marginColor,
      marginIcon,
      marginLabel
    };
  }, [ingredients, yieldAmount, linkedProduct]);

  const colorClasses = {
    red: 'text-red-600 bg-red-50 border-red-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    gray: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Calculator className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Cost Calculator</h3>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Ingredient Cost */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Ingredients</div>
          <div className="text-2xl font-bold text-gray-900">
            ${calculations.totalIngredientCost.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Per Batch Cost */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">Per Batch</div>
          <div className="text-2xl font-bold text-blue-900">
            ${calculations.perBatchCost.toFixed(2)}
          </div>
          <div className="text-xs text-blue-500 mt-1">
            Total cost per batch
          </div>
        </div>

        {/* Per Unit Cost */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-600 mb-1">Per Unit</div>
          <div className="text-2xl font-bold text-purple-900">
            ${calculations.perUnitCost.toFixed(2)}
          </div>
          <div className="text-xs text-purple-500 mt-1">
            per {yieldUnit}
          </div>
        </div>
      </div>

      {/* Margin Analysis */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Margin Analysis</h4>
        
        {linkedProduct ? (
          <div className="space-y-3">
            {/* Product Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Linked Product</div>
                <div className="font-medium text-gray-900">{linkedProduct.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Selling Price</div>
                <div className="text-lg font-bold text-gray-900">
                  ${linkedProduct.price.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Margin Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Cost */}
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600 mb-1">Cost</div>
                <div className="text-lg font-bold text-red-900">
                  ${calculations.perUnitCost.toFixed(2)}
                </div>
              </div>

              {/* Margin */}
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Margin</div>
                <div className="text-lg font-bold text-green-900">
                  ${calculations.margin.toFixed(2)}
                </div>
              </div>

              {/* Margin Percentage */}
              <div className={`text-center p-3 rounded-lg border ${colorClasses[calculations.marginColor as keyof typeof colorClasses]}`}>
                <div className="flex items-center justify-center mb-1">
                  {calculations.marginIcon}
                  <span className="text-sm ml-1">{calculations.marginLabel}</span>
                </div>
                <div className="text-lg font-bold">
                  {calculations.marginPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Margin Status */}
            <div className={`p-3 rounded-lg border ${colorClasses[calculations.marginColor as keyof typeof colorClasses]}`}>
              <div className="flex items-center">
                {calculations.marginIcon}
                <span className="ml-2 font-medium">
                  {calculations.marginLabel}: {calculations.marginPercentage.toFixed(1)}% margin
                </span>
              </div>
              <div className="text-sm mt-1 opacity-75">
                {calculations.marginPercentage < 20 && "Consider increasing price or reducing costs"}
                {calculations.marginPercentage >= 20 && calculations.marginPercentage < 35 && "Margin is acceptable but could be improved"}
                {calculations.marginPercentage >= 35 && "Excellent margin - good profitability"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-600 font-medium">No Product Linked</div>
            <div className="text-sm text-gray-500 mt-1">
              Link a product to see margin analysis
            </div>
          </div>
        )}
      </div>

      {/* Ingredient Breakdown */}
      {ingredients.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Ingredient Breakdown</h4>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => {
              const ingredientCost = ingredient.quantity * ingredient.costPerUnit;
              const percentageOfTotal = calculations.totalIngredientCost > 0 
                ? (ingredientCost / calculations.totalIngredientCost) * 100 
                : 0;

              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{ingredient.name}</div>
                    <div className="text-sm text-gray-500">
                      {ingredient.quantity} {ingredient.unit} @ ${ingredient.costPerUnit.toFixed(2)}/{ingredient.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ${ingredientCost.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {percentageOfTotal.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCostCalculator; 