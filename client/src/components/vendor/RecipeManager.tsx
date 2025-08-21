import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChefHat, 
  Package, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Edit,
  Trash2,
  Eye,
  Calculator,
  BarChart3,
  Users,
  Zap,
  Scale,
  Thermometer,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { 
  Recipe, 
  Product, 
  RawMaterial, 
  LaborCost,
  CostAnalysis
} from '../../types/products';

interface RecipeManagerProps {
  products: Product[];
  onRecipeUpdate: () => void;
}

const RecipeManager: React.FC<RecipeManagerProps> = ({ products, onRecipeUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'ingredients' | 'costs'>('overview');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // Mock data - in real app, this would come from API
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [laborCosts, setLaborCosts] = useState<LaborCost[]>([]);

  // Form states
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    version: '1.0',
    yield: 1,
    yieldUnit: 'loaves',
    productId: '',
    ingredients: [] as Array<{
      rawMaterialId: string;
      quantity: number;
      unit: string;
      notes?: string;
    }>,
    laborSteps: [] as Array<{
      laborCostId: string;
      hours: number;
      notes?: string;
    }>,
    notes: ''
  });

  useEffect(() => {
    // Load mock data
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock recipes
    setRecipes([
      {
        id: 'recipe-1',
        name: 'Classic Sourdough Recipe',
        description: 'Traditional sourdough bread recipe with long fermentation',
        version: '1.0',
        yield: 12,
        yieldUnit: 'loaves',
        ingredients: [
          { rawMaterialId: 'flour-1', rawMaterialName: 'Organic Flour', quantity: 5, unit: 'kg', cost: 15.00 },
          { rawMaterialId: 'water-1', rawMaterialName: 'Filtered Water', quantity: 3.5, unit: 'l', cost: 0.50 },
          { rawMaterialId: 'salt-1', rawMaterialName: 'Sea Salt', quantity: 0.1, unit: 'kg', cost: 2.00 },
          { rawMaterialId: 'starter-1', rawMaterialName: 'Sourdough Starter', quantity: 0.5, unit: 'kg', cost: 5.00 }
        ],
        laborSteps: [
          { laborCostId: 'baker-1', role: 'baker', hours: 8, cost: 120.00 },
          { laborCostId: 'assistant-1', role: 'assistant', hours: 4, cost: 60.00 }
        ],
        totalCost: 202.50,
        costPerUnit: 16.88,
        lastUpdated: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'recipe-2',
        name: 'Artisan Croissant Recipe',
        description: 'Buttery, flaky croissants with laminated dough',
        version: '1.0',
        yield: 24,
        yieldUnit: 'pieces',
        ingredients: [
          { rawMaterialId: 'flour-1', rawMaterialName: 'Organic Flour', quantity: 3, unit: 'kg', cost: 9.00 },
          { rawMaterialId: 'butter-1', rawMaterialName: 'European Butter', quantity: 1.5, unit: 'kg', cost: 18.00 },
          { rawMaterialId: 'milk-1', rawMaterialName: 'Whole Milk', quantity: 1, unit: 'l', cost: 2.50 },
          { rawMaterialId: 'yeast-1', rawMaterialName: 'Active Dry Yeast', quantity: 0.05, unit: 'kg', cost: 1.50 }
        ],
        laborSteps: [
          { laborCostId: 'baker-1', role: 'baker', hours: 6, cost: 90.00 },
          { laborCostId: 'assistant-1', role: 'assistant', hours: 3, cost: 45.00 }
        ],
        totalCost: 166.00,
        costPerUnit: 6.92,
        lastUpdated: new Date().toISOString(),
        isActive: true
      }
    ]);

    // Mock raw materials
    setRawMaterials([
      {
        id: 'flour-1',
        name: 'Organic Flour',
        category: 'grain',
        unit: 'kg',
        costPerUnit: 3.00,
        supplier: 'Local Mill Co.',
        currentStock: 50,
        reorderPoint: 10,
        leadTime: 3,
        isActive: true
      },
      {
        id: 'water-1',
        name: 'Filtered Water',
        category: 'other',
        unit: 'l',
        costPerUnit: 0.15,
        supplier: 'City Water',
        currentStock: 1000,
        reorderPoint: 100,
        leadTime: 0,
        isActive: true
      },
      {
        id: 'butter-1',
        name: 'European Butter',
        category: 'dairy',
        unit: 'kg',
        costPerUnit: 12.00,
        supplier: 'Premium Dairy Co.',
        currentStock: 25,
        reorderPoint: 5,
        leadTime: 2,
        isActive: true
      }
    ]);

    // Mock labor costs
    setLaborCosts([
      {
        id: 'baker-1',
        role: 'baker',
        hourlyRate: 25.00,
        hoursPerBatch: 8,
        isActive: true
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        hourlyRate: 18.00,
        hoursPerBatch: 4,
        isActive: true
      }
    ]);
  };

  const handleCreateRecipe = () => {
    if (!recipeForm.name || recipeForm.ingredients.length === 0) {
      toast.error('Please fill in recipe name and add at least one ingredient');
      return;
    }

    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name: recipeForm.name,
      description: recipeForm.description,
      version: recipeForm.version,
      yield: recipeForm.yield,
      yieldUnit: recipeForm.yieldUnit,
      ingredients: recipeForm.ingredients.map(ing => ({
        ...ing,
        rawMaterialName: rawMaterials.find(rm => rm.id === ing.rawMaterialId)?.name || 'Unknown',
        cost: (rawMaterials.find(rm => rm.id === ing.rawMaterialId)?.costPerUnit || 0) * ing.quantity
      })),
      laborSteps: recipeForm.laborSteps.map(step => ({
        ...step,
        role: laborCosts.find(lc => lc.id === step.laborCostId)?.role || 'Unknown',
        cost: (laborCosts.find(lc => lc.id === step.laborCostId)?.hourlyRate || 0) * step.hours
      })),
      totalCost: 0, // Will be calculated
      costPerUnit: 0, // Will be calculated
      lastUpdated: new Date().toISOString(),
      isActive: true
    };

    // Calculate costs
    newRecipe.totalCost = newRecipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0) +
                          newRecipe.laborSteps.reduce((sum, step) => sum + step.cost, 0);
    newRecipe.costPerUnit = newRecipe.totalCost / newRecipe.yield;

    setRecipes([...recipes, newRecipe]);
    setShowRecipeForm(false);
    resetRecipeForm();
    
    toast.success('Recipe created successfully!');
    onRecipeUpdate();
  };

  const resetRecipeForm = () => {
    setRecipeForm({
      name: '',
      description: '',
      version: '1.0',
      yield: 1,
      yieldUnit: 'loaves',
      productId: '',
      ingredients: [],
      laborSteps: [],
      notes: ''
    });
  };

  const addIngredient = () => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { rawMaterialId: '', quantity: 0, unit: 'kg' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addLaborStep = () => {
    setRecipeForm(prev => ({
      ...prev,
      laborSteps: [...prev.laborSteps, { laborCostId: '', hours: 0 }]
    }));
  };

  const removeLaborStep = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      laborSteps: prev.laborSteps.filter((_, i) => i !== index)
    }));
  };

  const updateLaborStep = (index: number, field: string, value: any) => {
    setRecipeForm(prev => ({
      ...prev,
      laborSteps: prev.laborSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const getRecipeMetrics = () => {
    const totalRecipes = recipes.length;
    const activeRecipes = recipes.filter(r => r.isActive).length;
    const totalCost = recipes.reduce((sum, r) => sum + r.totalCost, 0);
    const averageCostPerUnit = recipes.length > 0 ? 
      recipes.reduce((sum, r) => sum + r.costPerUnit, 0) / recipes.length : 0;
    
    return { totalRecipes, activeRecipes, totalCost, averageCostPerUnit };
  };

  const metrics = getRecipeMetrics();

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recipe Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRecipeForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Recipe
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
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
                  ? 'border-b-2 border-green-500 text-green-600'
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
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recipe Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Recipes</p>
                    <p className="text-2xl font-bold text-green-900">{metrics.totalRecipes}</p>
                  </div>
                  <ChefHat className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Active Recipes</p>
                    <p className="text-2xl font-bold text-blue-900">{metrics.activeRecipes}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-900">${metrics.totalCost.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Avg Cost/Unit</p>
                    <p className="text-2xl font-bold text-orange-900">${metrics.averageCostPerUnit.toFixed(2)}</p>
                  </div>
                  <Calculator className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Recent Recipes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Recipes</h3>
              <div className="space-y-2">
                {recipes.slice(0, 5).map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{recipe.name}</p>
                      <p className="text-sm text-gray-600">v{recipe.version} • {recipe.yield} {recipe.yieldUnit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        ${recipe.costPerUnit.toFixed(2)}/unit
                      </span>
                      <button
                        onClick={() => setSelectedRecipe(recipe)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">All Recipes</h3>
              <span className="text-sm text-gray-600">{recipes.length} total recipes</span>
            </div>
            
            <div className="space-y-3">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                      <p className="text-sm text-gray-600">{recipe.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        recipe.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {recipe.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">v{recipe.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Yield:</span>
                      <span className="ml-2 font-medium">{recipe.yield} {recipe.yieldUnit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost/Unit:</span>
                      <span className="ml-2 font-medium">${recipe.costPerUnit.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="ml-2 font-medium">${recipe.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setEditingRecipe(recipe)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Raw Materials & Ingredients</h3>
            <p className="text-gray-600">Manage your raw materials and track costs for recipe calculations.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rawMaterials.map((material) => (
                <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{material.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      material.currentStock <= material.reorderPoint ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {material.currentStock <= material.reorderPoint ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Category: {material.category}</div>
                    <div>Unit: {material.unit}</div>
                    <div>Cost: ${material.costPerUnit.toFixed(2)}/{material.unit}</div>
                    <div>Stock: {material.currentStock} {material.unit}</div>
                    <div>Reorder Point: {material.reorderPoint} {material.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Cost Analysis</h3>
            <p className="text-gray-600">Analyze recipe costs and identify optimization opportunities.</p>
            
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{recipe.name}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-600">Material Costs</div>
                      <div className="text-lg font-bold text-blue-900">
                        ${recipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-600">Labor Costs</div>
                      <div className="text-lg font-bold text-green-900">
                        ${recipe.laborSteps.reduce((sum, step) => sum + step.cost, 0).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-purple-600">Cost per Unit</div>
                      <div className="text-lg font-bold text-purple-900">
                        ${recipe.costPerUnit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Recipe Modal */}
      {showRecipeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Recipe</h3>
              <button
                onClick={() => setShowRecipeForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateRecipe(); }} className="space-y-4">
              {/* Basic Recipe Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    value={recipeForm.name}
                    onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={recipeForm.version}
                    onChange={(e) => setRecipeForm({ ...recipeForm, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yield Quantity *
                  </label>
                  <input
                    type="number"
                    value={recipeForm.yield}
                    onChange={(e) => setRecipeForm({ ...recipeForm, yield: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yield Unit
                  </label>
                  <select
                    value={recipeForm.yieldUnit}
                    onChange={(e) => setRecipeForm({ ...recipeForm, yieldUnit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="loaves">Loaves</option>
                    <option value="pieces">Pieces</option>
                    <option value="dozen">Dozen</option>
                    <option value="kg">Kilogram</option>
                    <option value="lb">Pound</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Product
                  </label>
                  <select
                    value={recipeForm.productId}
                    onChange={(e) => setRecipeForm({ ...recipeForm, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">No product linked</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={recipeForm.description}
                  onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              {/* Ingredients Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Ingredients</h4>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recipeForm.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                      <select
                        value={ingredient.rawMaterialId}
                        onChange={(e) => updateIngredient(index, 'rawMaterialId', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select material</option>
                        {rawMaterials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name} (${material.costPerUnit}/{material.unit})
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Quantity"
                        min="0"
                        step="0.01"
                        required
                      />
                      
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor Steps Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Labor Steps</h4>
                  <button
                    type="button"
                    onClick={addLaborStep}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recipeForm.laborSteps.map((step, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg">
                      <select
                        value={step.laborCostId}
                        onChange={(e) => updateLaborStep(index, 'laborCostId', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select role</option>
                        {laborCosts.map((labor) => (
                          <option key={labor.id} value={labor.id}>
                            {labor.role} (${labor.hourlyRate}/hr)
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        value={step.hours}
                        onChange={(e) => updateLaborStep(index, 'hours', parseFloat(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hours"
                        min="0"
                        step="0.5"
                        required
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeLaborStep(index)}
                        className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Recipe
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecipeForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
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

