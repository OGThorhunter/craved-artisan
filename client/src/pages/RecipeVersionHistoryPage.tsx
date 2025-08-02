import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  RotateCcw, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  User,
  FileText,
  GitCompare,
  Plus
} from 'lucide-react';
import RecipeVersionDiffViewer from '../components/RecipeVersionDiffViewer';
import CreateVersionModal from '../components/CreateVersionModal';

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

interface VersionComparison {
  ingredientId: string;
  ingredientName: string;
  previousPrice?: number;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  isPriceIncrease: boolean;
}

const RecipeVersionHistoryPage: React.FC = () => {
  const { recipeId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<RecipeVersion | null>(null);
  const [comparisonData, setComparisonData] = useState<VersionComparison[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch recipe versions
  const { data: versionsData, isLoading, error } = useQuery({
    queryKey: ['recipe-versions', recipeId],
    queryFn: async () => {
      const response = await axios.get(`/api/vendor/recipes/${recipeId}/versions`);
      return response.data;
    },
    enabled: !!recipeId
  });

  // Fetch current recipe for comparison
  const { data: currentRecipe } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const response = await axios.get(`/api/vendor/recipes/${recipeId}`);
      return response.data.recipe;
    },
    enabled: !!recipeId
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const response = await axios.get(`/api/vendor/recipes/${recipeId}/versions/${selectedVersion?.version}`);
      return response.data.recipeVersion;
    },
    onSuccess: (versionData) => {
      toast.success(`Version ${versionData.version} loaded for editing`);
      // Navigate to recipe editor with version data
      setLocation(`/dashboard/vendor/recipes/${recipeId}/edit?version=${versionData.version}`);
    },
    onError: () => {
      toast.error('Failed to rollback to version');
    }
  });

  // Calculate price changes when versions change
  useEffect(() => {
    if (versionsData?.versions && versionsData.versions.length > 1) {
      const versions = versionsData.versions.sort((a: RecipeVersion, b: RecipeVersion) => a.version - b.version);
      const currentVersion = selectedVersion || versions[versions.length - 1];
      const previousVersion = versions.find((v: RecipeVersion) => v.version === currentVersion.version - 1);

      if (previousVersion) {
        const comparisons: VersionComparison[] = currentVersion.ingredients.map(currentIng => {
          const previousIng = previousVersion.ingredients.find(
            (ing: RecipeIngredientVersion) => ing.ingredient.id === currentIng.ingredient.id
          );

          const previousPrice = previousIng?.pricePerUnit || 0;
          const currentPrice = currentIng.pricePerUnit;
          const priceChange = currentPrice - previousPrice;
          const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

          return {
            ingredientId: currentIng.ingredient.id,
            ingredientName: currentIng.ingredient.name,
            previousPrice,
            currentPrice,
            priceChange,
            priceChangePercent,
            isPriceIncrease: priceChange > 0
          };
        });

        setComparisonData(comparisons);
      } else {
        setComparisonData([]);
      }
    }
  }, [versionsData, selectedVersion]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
              <h3 className="text-lg font-medium text-red-800">Error Loading Version History</h3>
            </div>
            <p className="mt-2 text-red-700">Failed to load recipe versions. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const versions = versionsData?.versions || [];
  const currentVersion = selectedVersion || versions[0];
  const previousVersion = versions.find((v: RecipeVersion) => v.version === (currentVersion?.version || 0) - 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setLocation(`/dashboard/vendor/recipes/${recipeId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipe
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Version History</h1>
              <p className="text-gray-600 mt-2">
                Track changes and costs across recipe versions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Version
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Version List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Versions</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {versions.length} version{versions.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {versions.map((version: RecipeVersion) => (
                    <div
                      key={version.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedVersion?.id === version.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          Version {version.version}
                        </span>
                        {version.version === versions[0].version && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Latest
                          </span>
                        )}
                      </div>
                      
                      {/* Editor Info */}
                      {version.editor && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <User className="h-4 w-4 mr-1" />
                          {version.editor.name || version.editor.email}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(version.createdAt).toLocaleDateString()}
                      </div>
                      
                      {/* Cost Delta */}
                      {version.costDelta !== undefined && version.costDelta !== 0 && (
                        <div className="flex items-center text-sm mb-2">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className={`font-medium ${
                            version.costDelta > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {version.costDelta > 0 ? '+' : ''}{version.costDelta.toFixed(2)}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({version.costDeltaPercent?.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Package className="h-4 w-4 mr-1" />
                          {version.yield} {version.yieldUnit}
                        </div>
                        <div className="flex items-center font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${version.totalCost.toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Version Notes */}
                      {version.notes && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                          <div className="flex items-start">
                            <FileText className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{version.notes}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Version Details */}
          <div className="lg:col-span-2">
            {currentVersion ? (
              <div className="space-y-6">
                {/* Version Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {currentVersion.name}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Version {currentVersion.version} • {new Date(currentVersion.createdAt).toLocaleDateString()}
                      </p>
                      {currentVersion.editor && (
                        <p className="text-sm text-gray-500 mt-1">
                          Created by {currentVersion.editor.name || currentVersion.editor.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Cost</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${currentVersion.totalCost.toFixed(2)}
                        </div>
                        {currentVersion.costDelta !== undefined && currentVersion.costDelta !== 0 && (
                          <div className={`text-sm ${
                            currentVersion.costDelta > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {currentVersion.costDelta > 0 ? '+' : ''}{currentVersion.costDelta.toFixed(2)}
                            ({currentVersion.costDeltaPercent?.toFixed(1)}%)
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowDiff(!showDiff)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <GitCompare className="h-4 w-4 mr-2" />
                          {showDiff ? 'Hide' : 'Show'} Diff
                        </button>
                        <button
                          onClick={() => rollbackMutation.mutate(currentVersion.id)}
                          disabled={rollbackMutation.isPending}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {rollbackMutation.isPending ? 'Loading...' : 'Rollback'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Version Notes */}
                  {currentVersion.notes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-blue-900 mb-1">Version Notes</div>
                          <div className="text-sm text-blue-800">{currentVersion.notes}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diff Viewer */}
                {showDiff && previousVersion && (
                  <RecipeVersionDiffViewer
                    currentVersion={currentVersion}
                    previousVersion={previousVersion}
                  />
                )}

                {/* Recipe Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Recipe Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Yield</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentVersion.yield} {currentVersion.yieldUnit}
                      </div>
                    </div>
                    {currentVersion.prepTime && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Prep Time</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {currentVersion.prepTime} min
                        </div>
                      </div>
                    )}
                    {currentVersion.cookTime && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Cook Time</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {currentVersion.cookTime} min
                        </div>
                      </div>
                    )}
                    {currentVersion.difficulty && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Difficulty</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {currentVersion.difficulty}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ingredients Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ingredient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price/Unit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Cost
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price Change
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentVersion.ingredients.map((ingredient) => {
                            const comparison = comparisonData.find(
                              comp => comp.ingredientId === ingredient.ingredient.id
                            );
                            
                            return (
                              <tr key={ingredient.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {ingredient.ingredient.name}
                                    </div>
                                    {ingredient.notes && (
                                      <div className="text-sm text-gray-500">
                                        {ingredient.notes}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {ingredient.quantity} {ingredient.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${ingredient.pricePerUnit.toFixed(2)}/{ingredient.ingredient.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ${ingredient.totalCost.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {comparison && comparison.previousPrice !== undefined ? (
                                    <div className="flex items-center">
                                      {comparison.isPriceIncrease ? (
                                        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                                      )}
                                      <span className={`text-sm ${
                                        comparison.isPriceIncrease ? 'text-red-600' : 'text-green-600'
                                      }`}>
                                        {comparison.isPriceIncrease ? '+' : ''}${comparison.priceChange.toFixed(2)}
                                        <span className="text-gray-500 ml-1">
                                          ({comparison.isPriceIncrease ? '+' : ''}{comparison.priceChangePercent.toFixed(1)}%)
                                        </span>
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">No previous data</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Instructions */}
                  {currentVersion.instructions && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                          {currentVersion.instructions}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a version to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Version Modal */}
      <CreateVersionModal
        recipeId={recipeId!}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Optionally select the newly created version
          if (versionsData?.versions && versionsData.versions.length > 0) {
            setSelectedVersion(versionsData.versions[0]);
          }
        }}
      />
    </div>
  );
};

export default RecipeVersionHistoryPage; 