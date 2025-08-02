import React from 'react';
import { Plus, Minus, ArrowRight } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  description: string;
  unit: string;
  costPerUnit: number;
}

interface RecipeIngredientVersion {
  id: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalCost: number;
  notes?: string;
  ingredient: Ingredient;
}

interface RecipeVersion {
  id: string;
  version: number;
  name: string;
  description?: string;
  instructions?: string;
  yield: number;
  yieldUnit: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  totalCost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  editor?: {
    id: string;
    name?: string;
    email: string;
  };
  costDelta?: number;
  costDeltaPercent?: number;
  ingredients: RecipeIngredientVersion[];
}

interface RecipeVersionDiffViewerProps {
  currentVersion: RecipeVersion;
  previousVersion?: RecipeVersion;
  className?: string;
}

interface IngredientDiff {
  ingredientId: string;
  ingredientName: string;
  changeType: 'added' | 'removed' | 'modified' | 'unchanged';
  currentQuantity?: number;
  previousQuantity?: number;
  currentUnit?: string;
  previousUnit?: string;
  currentPricePerUnit?: number;
  previousPricePerUnit?: number;
  currentTotalCost?: number;
  previousTotalCost?: number;
  currentNotes?: string;
  previousNotes?: string;
  quantityDelta?: number;
  priceDelta?: number;
  costDelta?: number;
}

const RecipeVersionDiffViewer: React.FC<RecipeVersionDiffViewerProps> = ({
  currentVersion,
  previousVersion,
  className = ''
}) => {
  const calculateDiff = (): IngredientDiff[] => {
    if (!previousVersion) {
      // No previous version, show all current ingredients as added
      return currentVersion.ingredients.map(ing => ({
        ingredientId: ing.ingredient.id,
        ingredientName: ing.ingredient.name,
        changeType: 'added' as const,
        currentQuantity: ing.quantity,
        currentUnit: ing.unit,
        currentPricePerUnit: ing.pricePerUnit,
        currentTotalCost: ing.totalCost,
        currentNotes: ing.notes
      }));
    }

    const currentIngredients = new Map(
      currentVersion.ingredients.map(ing => [ing.ingredient.id, ing])
    );
    const previousIngredients = new Map(
      previousVersion.ingredients.map(ing => [ing.ingredient.id, ing])
    );

    const allIngredientIds = new Set([
      ...currentIngredients.keys(),
      ...previousIngredients.keys()
    ]);

    const diffs: IngredientDiff[] = [];

    for (const ingredientId of allIngredientIds) {
      const current = currentIngredients.get(ingredientId);
      const previous = previousIngredients.get(ingredientId);

      if (current && !previous) {
        // Added ingredient
        diffs.push({
          ingredientId,
          ingredientName: current.ingredient.name,
          changeType: 'added',
          currentQuantity: current.quantity,
          currentUnit: current.unit,
          currentPricePerUnit: current.pricePerUnit,
          currentTotalCost: current.totalCost,
          currentNotes: current.notes
        });
      } else if (!current && previous) {
        // Removed ingredient
        diffs.push({
          ingredientId,
          ingredientName: previous.ingredient.name,
          changeType: 'removed',
          previousQuantity: previous.quantity,
          previousUnit: previous.unit,
          previousPricePerUnit: previous.pricePerUnit,
          previousTotalCost: previous.totalCost,
          previousNotes: previous.notes
        });
      } else if (current && previous) {
        // Modified ingredient
        const quantityDelta = current.quantity - previous.quantity;
        const priceDelta = current.pricePerUnit - previous.pricePerUnit;
        const costDelta = current.totalCost - previous.totalCost;
        const hasChanges = quantityDelta !== 0 || priceDelta !== 0 || 
                          current.unit !== previous.unit || 
                          current.notes !== previous.notes;

        diffs.push({
          ingredientId,
          ingredientName: current.ingredient.name,
          changeType: hasChanges ? 'modified' : 'unchanged',
          currentQuantity: current.quantity,
          previousQuantity: previous.quantity,
          currentUnit: current.unit,
          previousUnit: previous.unit,
          currentPricePerUnit: current.pricePerUnit,
          previousPricePerUnit: previous.pricePerUnit,
          currentTotalCost: current.totalCost,
          previousTotalCost: previous.totalCost,
          currentNotes: current.notes,
          previousNotes: previous.notes,
          quantityDelta,
          priceDelta,
          costDelta
        });
      }
    }

    return diffs.sort((a, b) => {
      // Sort by change type: removed, modified, added, unchanged
      const typeOrder = { removed: 0, modified: 1, added: 2, unchanged: 3 };
      return typeOrder[a.changeType] - typeOrder[b.changeType];
    });
  };

  const diffs = calculateDiff();

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'modified':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return 'border-green-200 bg-green-50';
      case 'removed':
        return 'border-red-200 bg-red-50';
      case 'modified':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDelta = (delta: number, isPercentage = false) => {
    if (delta === 0) return '0';
    const sign = delta > 0 ? '+' : '';
    const value = Math.abs(delta);
    return `${sign}${value.toFixed(isPercentage ? 1 : 2)}${isPercentage ? '%' : ''}`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Version Comparison</h3>
        <div className="text-sm text-gray-600">
          {previousVersion ? (
            <>
              Version {previousVersion.version} → Version {currentVersion.version}
            </>
          ) : (
            'Initial Version'
          )}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Previous Cost</div>
            <div className="text-lg font-semibold text-gray-900">
              ${previousVersion?.totalCost.toFixed(2) || '0.00'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Current Cost</div>
            <div className="text-lg font-semibold text-gray-900">
              ${currentVersion.totalCost.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Cost Delta</div>
            <div className={`text-lg font-semibold ${
              (currentVersion.costDelta || 0) > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatDelta(currentVersion.costDelta || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">% Change</div>
            <div className={`text-lg font-semibold ${
              (currentVersion.costDeltaPercent || 0) > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatDelta(currentVersion.costDeltaPercent || 0, true)}
            </div>
          </div>
        </div>
      </div>

      {/* Ingredient Changes */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Ingredient Changes</h4>
        <div className="space-y-3">
          {diffs.map((diff, index) => (
            <div
              key={`${diff.ingredientId}-${index}`}
              className={`p-4 rounded-lg border ${getChangeColor(diff.changeType)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getChangeIcon(diff.changeType)}
                  <span className="font-medium text-gray-900">
                    {diff.ingredientName}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    diff.changeType === 'added' ? 'bg-green-100 text-green-800' :
                    diff.changeType === 'removed' ? 'bg-red-100 text-red-800' :
                    diff.changeType === 'modified' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {diff.changeType.charAt(0).toUpperCase() + diff.changeType.slice(1)}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Quantity */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">Quantity</div>
                  {diff.changeType === 'added' && (
                    <div className="text-sm font-medium text-green-700">
                      {diff.currentQuantity} {diff.currentUnit}
                    </div>
                  )}
                  {diff.changeType === 'removed' && (
                    <div className="text-sm font-medium text-red-700">
                      {diff.previousQuantity} {diff.previousUnit}
                    </div>
                  )}
                  {diff.changeType === 'modified' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-red-700">
                        {diff.previousQuantity} {diff.previousUnit}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-green-700">
                        {diff.currentQuantity} {diff.currentUnit}
                      </span>
                      {diff.quantityDelta !== 0 && (
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          diff.quantityDelta > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {formatDelta(diff.quantityDelta)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Price per Unit */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">Price/Unit</div>
                  {diff.changeType === 'added' && (
                    <div className="text-sm font-medium text-green-700">
                      ${diff.currentPricePerUnit?.toFixed(2)}/{diff.currentUnit}
                    </div>
                  )}
                  {diff.changeType === 'removed' && (
                    <div className="text-sm font-medium text-red-700">
                      ${diff.previousPricePerUnit?.toFixed(2)}/{diff.previousUnit}
                    </div>
                  )}
                  {diff.changeType === 'modified' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-red-700">
                        ${diff.previousPricePerUnit?.toFixed(2)}/{diff.previousUnit}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-green-700">
                        ${diff.currentPricePerUnit?.toFixed(2)}/{diff.currentUnit}
                      </span>
                      {diff.priceDelta !== 0 && (
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          diff.priceDelta > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {formatDelta(diff.priceDelta)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Total Cost */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                  {diff.changeType === 'added' && (
                    <div className="text-sm font-medium text-green-700">
                      ${diff.currentTotalCost?.toFixed(2)}
                    </div>
                  )}
                  {diff.changeType === 'removed' && (
                    <div className="text-sm font-medium text-red-700">
                      ${diff.previousTotalCost?.toFixed(2)}
                    </div>
                  )}
                  {diff.changeType === 'modified' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-red-700">
                        ${diff.previousTotalCost?.toFixed(2)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-green-700">
                        ${diff.currentTotalCost?.toFixed(2)}
                      </span>
                      {diff.costDelta !== 0 && (
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          diff.costDelta > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {formatDelta(diff.costDelta)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {(diff.currentNotes || diff.previousNotes) && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-1">Notes</div>
                  {diff.changeType === 'added' && diff.currentNotes && (
                    <div className="text-sm text-green-700">{diff.currentNotes}</div>
                  )}
                  {diff.changeType === 'removed' && diff.previousNotes && (
                    <div className="text-sm text-red-700">{diff.previousNotes}</div>
                  )}
                  {diff.changeType === 'modified' && (
                    <div className="flex items-start space-x-2">
                      {diff.previousNotes && (
                        <div className="text-sm text-red-700 flex-1">
                          <div className="text-xs text-gray-500">Previous:</div>
                          {diff.previousNotes}
                        </div>
                      )}
                      {diff.currentNotes && (
                        <div className="text-sm text-green-700 flex-1">
                          <div className="text-xs text-gray-500">Current:</div>
                          {diff.currentNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">Change Summary</div>
        <div className="flex flex-wrap gap-2">
          {diffs.filter(d => d.changeType === 'added').length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Plus className="h-3 w-3 mr-1" />
              {diffs.filter(d => d.changeType === 'added').length} added
            </span>
          )}
          {diffs.filter(d => d.changeType === 'removed').length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Minus className="h-3 w-3 mr-1" />
              {diffs.filter(d => d.changeType === 'removed').length} removed
            </span>
          )}
          {diffs.filter(d => d.changeType === 'modified').length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <ArrowRight className="h-3 w-3 mr-1" />
              {diffs.filter(d => d.changeType === 'modified').length} modified
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeVersionDiffViewer; 