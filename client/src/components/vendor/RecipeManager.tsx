import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  ChefHat, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Archive, 
  TrendingUp,
  Calculator,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Scale,
  DollarSign
} from 'lucide-react';
import type { Product, Recipe, RecipeIngredient, Ingredient } from '../../types/products';

interface RecipeManagerProps {
  products: Product[];
  onRecipeUpdate: () => void;
}

const RecipeManager: React.FC<RecipeManagerProps> = ({ products, onRecipeUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'ingredients' | 'costs'>('overview');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Mock data for demonstration
  const mockRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Classic Sourdough Bread',
      description: 'Traditional sourdough bread with long fermentation',
      instructions: 'Mix ingredients, let rise for 18 hours, shape, proof, bake at 450°F for 45 minutes',
      version: '1.0.0',
      yield: 2,
      yieldUnit: 'loaves',
      prepTime: 30,
      cookTime: 45,
      difficulty: 'Intermediate',
      isActive: true,
      vendorProfileId: 'mock-vendor-id',
      productId: '1',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z',
      lastUpdated: '2025-08-01T00:00:00Z',
      laborSteps: [],
      totalCost: 4.24,
      costPerUnit: 2.12,
      ingredients: [
        {
          id: '1',
          recipeId: '1',
          ingredientId: '1',
          ingredientName: 'Organic Flour',
          rawMaterialId: '1',
          rawMaterialName: 'Organic Flour',
          quantity: 1000,
          unit: 'grams',
          notes: 'High protein bread flour',
          costPerUnit: 0.0035,
          totalCost: 3.50,
          cost: 3.50
        },
        {
          id: '2',
          recipeId: '1',
          ingredientId: '2',
          ingredientName: 'Water',
          rawMaterialId: '2',
          rawMaterialName: 'Water',
          quantity: 750,
          unit: 'grams',
          notes: 'Filtered water at room temperature',
          costPerUnit: 0.0001,
          totalCost: 0.08,
          cost: 0.08
        },
        {
          id: '3',
          recipeId: '1',
          ingredientId: '3',
          ingredientName: 'Sourdough Starter',
          rawMaterialId: '3',
          rawMaterialName: 'Sourdough Starter',
          quantity: 200,
          unit: 'grams',
          notes: 'Active 100% hydration starter',
          costPerUnit: 0.0025,
          totalCost: 0.50,
          cost: 0.50
        },
        {
          id: '4',
          recipeId: '1',
          ingredientId: '4',
          ingredientName: 'Sea Salt',
          rawMaterialId: '4',
          rawMaterialName: 'Sea Salt',
          quantity: 20,
          unit: 'grams',
          notes: 'Fine sea salt',
          costPerUnit: 0.008,
          totalCost: 0.16,
          cost: 0.16
        }
      ]
    },
    {
      id: '2',
      name: 'Artisan Coffee Mug',
      description: 'Hand-thrown ceramic coffee mug with custom glaze',
      instructions: 'Center clay, throw cylinder, shape, trim, glaze, fire to cone 6',
      version: '1.0.0',
      yield: 1,
      yieldUnit: 'mug',
      prepTime: 45,
      cookTime: 0,
      difficulty: 'Advanced',
      isActive: true,
      vendorProfileId: 'mock-vendor-id',
      productId: '2',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z',
      lastUpdated: '2025-08-01T00:00:00Z',
      laborSteps: [],
      totalCost: 2.50,
      costPerUnit: 2.50,
      ingredients: [
        {
          id: '5',
          recipeId: '2',
          ingredientId: '5',
          ingredientName: 'Stoneware Clay',
          rawMaterialId: '5',
          rawMaterialName: 'Stoneware Clay',
          quantity: 500,
          unit: 'grams',
          notes: 'Cone 6 stoneware clay body',
          costPerUnit: 0.002,
          totalCost: 1.00,
          cost: 1.00
        },
        {
          id: '6',
          recipeId: '2',
          ingredientId: '6',
          ingredientName: 'Glaze',
          rawMaterialId: '6',
          rawMaterialName: 'Glaze',
          quantity: 100,
          unit: 'grams',
          notes: 'Food-safe cone 6 glaze',
          costPerUnit: 0.015,
          totalCost: 1.50,
          cost: 1.50
        }
      ]
    }
  ];

  const mockIngredients: Ingredient[] = [
    {
      id: '1',
      name: 'Organic Flour',
      description: 'High protein bread flour for artisan breads',
      unit: 'grams',
      costPerUnit: 0.0035,
      supplier: 'Local Mill Co.',
      stockQty: 50000,
      lowStockThreshold: 5000,
      isAvailable: true,
      vendorProfileId: 'mock-vendor-id',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Water',
      description: 'Filtered water for consistent results',
      unit: 'grams',
      costPerUnit: 0.0001,
      supplier: 'City Water',
      stockQty: 1000000,
      lowStockThreshold: 100000,
      isAvailable: true,
      vendorProfileId: 'mock-vendor-id',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Sourdough Starter',
      description: 'Active 100% hydration sourdough starter',
      unit: 'grams',
      costPerUnit: 0.0025,
      supplier: 'In-house',
      stockQty: 2000,
      lowStockThreshold: 500,
      isAvailable: true,
      vendorProfileId: 'mock-vendor-id',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Sea Salt',
      description: 'Fine sea salt for bread making',
      unit: 'grams',
      costPerUnit: 0.008,
      supplier: 'Salt Co.',
      stockQty: 5000,
      lowStockThreshold: 1000,
      isAvailable: true,
      vendorProfileId: 'mock-vendor-id',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= threshold) return { status: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const calculateRecipeCost = (recipe: Recipe): number => {
    return recipe.ingredients.reduce((total, ingredient) => total + ingredient.totalCost, 0);
  };

  const calculateCostPerUnit = (recipe: Recipe): number => {
    const totalCost = calculateRecipeCost(recipe);
    return recipe.yield > 0 ? totalCost / recipe.yield : 0;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipe Management</h2>
          <p className="text-gray-600">Create and manage recipes, track ingredients, and analyze costs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRecipeForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Recipe
          </button>
          <button
            onClick={() => setShowIngredientForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            New Ingredient
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'recipes', label: 'Recipes', icon: ChefHat },
          { id: 'ingredients', label: 'Ingredients', icon: Package },
          { id: 'costs', label: 'Cost Analysis', icon: Calculator }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Recipe Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                <p className="text-2xl font-bold text-blue-600">{mockRecipes.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ChefHat className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Recipes</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockRecipes.filter(r => r.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ingredients</p>
                <p className="text-2xl font-bold text-purple-600">{mockIngredients.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockIngredients.filter(i => i.stockQty <= i.lowStockThreshold).length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recipes</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockRecipes.map((recipe) => (
              <div key={recipe.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{recipe.name}</h4>
                                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(recipe.difficulty ?? '')}`}>
                          {recipe.difficulty}
                        </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        recipe.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recipe.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {recipe.description && (
                      <p className="text-gray-600 mb-3">{recipe.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Yield:</span>
                        <span className="ml-2 font-medium">{recipe.yield} {recipe.yieldUnit}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Prep Time:</span>
                        <span className="ml-2 font-medium">{formatDuration(recipe.prepTime || 0)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Cook Time:</span>
                        <span className="ml-2 font-medium">{formatDuration(recipe.cookTime || 0)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total Cost:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {formatCost(calculateRecipeCost(recipe))}
                        </span>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Ingredients:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">
                              {ingredient.ingredientName} ({ingredient.quantity} {ingredient.unit})
                            </span>
                            <span className="font-medium">{formatCost(ingredient.totalCost)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {recipe.instructions && (
                      <div className="text-sm text-gray-600 italic">"{recipe.instructions}"</div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View recipe details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded" title="Edit recipe">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="Duplicate recipe">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Archive recipe">
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ingredients' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockIngredients.map((ingredient) => {
              const stockStatus = getStockStatus(ingredient.stockQty, ingredient.lowStockThreshold);
              return (
                <div key={ingredient.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{ingredient.name}</h4>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${stockStatus.bg}`}>
                          {stockStatus.status}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          ingredient.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ingredient.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      {ingredient.description && (
                        <p className="text-gray-600 mb-3">{ingredient.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-600">Unit:</span>
                          <span className="ml-2 font-medium">{ingredient.unit}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Cost per Unit:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {formatCost(ingredient.costPerUnit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Current Stock:</span>
                          <span className="ml-2 font-medium">{ingredient.stockQty.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Low Stock Threshold:</span>
                          <span className="ml-2 font-medium">{ingredient.lowStockThreshold.toLocaleString()}</span>
                        </div>
                      </div>

                      {ingredient.supplier && (
                        <div className="text-sm text-gray-600">
                          <span className="text-gray-500">Supplier:</span>
                          <span className="ml-2">{ingredient.supplier}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View ingredient details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded" title="Edit ingredient">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded" title="Add to stock">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="space-y-6">
          {/* Recipe Cost Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Cost Analysis</h3>
            <div className="space-y-4">
              {mockRecipes.map((recipe) => {
                const totalCost = calculateRecipeCost(recipe);
                const costPerUnit = calculateCostPerUnit(recipe);
                return (
                  <div key={recipe.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                      <span className="text-sm text-gray-500">Yield: {recipe.yield} {recipe.yieldUnit}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Total Cost:</span>
                        <span className="ml-2 font-medium text-green-600">{formatCost(totalCost)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Cost per Unit:</span>
                        <span className="ml-2 font-medium text-blue-600">{formatCost(costPerUnit)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Ingredients:</span>
                        <span className="ml-2 font-medium">{recipe.ingredients.length}</span>
                      </div>
                    </div>
                    
                    {/* Cost Breakdown */}
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Cost Breakdown:</h5>
                      <div className="space-y-1">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {ingredient.ingredientName} ({ingredient.quantity} {ingredient.unit})
                            </span>
                            <span className="font-medium">{formatCost(ingredient.totalCost)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ingredient Cost Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredient Cost Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCost(mockIngredients.reduce((total, i) => total + (i.costPerUnit * i.stockQty), 0))}
                </div>
                <div className="text-sm text-gray-600">Total Inventory Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCost(mockIngredients.reduce((total, i) => total + i.costPerUnit, 0))}
                </div>
                <div className="text-sm text-gray-600">Average Cost per Unit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {mockIngredients.length}
                </div>
                <div className="text-sm text-gray-600">Total Ingredients</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Form Modal */}
      {showRecipeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
              </h2>
              <button
                onClick={() => {
                  setShowRecipeForm(false);
                  setEditingRecipe(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter recipe name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="easy">Easy</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your recipe..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yield</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yield Unit</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="loaves, pieces, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Step-by-step instructions..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecipeForm(false);
                    setEditingRecipe(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ingredient Form Modal */}
      {showIngredientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingIngredient ? 'Edit Ingredient' : 'New Ingredient'}
              </h2>
              <button
                onClick={() => {
                  setShowIngredientForm(false);
                  setEditingIngredient(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ingredient name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="grams, pieces, etc."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the ingredient..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Unit</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowIngredientForm(false);
                    setEditingIngredient(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingIngredient ? 'Update Ingredient' : 'Create Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeManager;

