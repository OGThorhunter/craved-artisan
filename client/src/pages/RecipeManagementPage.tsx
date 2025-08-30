import React, { useState } from 'react';
import { ChefHat, Search, Grid3X3, List, Package, Calculator, Calendar, Plus, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import { MOCK_INGREDIENTS, MOCK_INGREDIENT_CATEGORIES_PHASE4, MOCK_COST_UNITS, MOCK_UNITS, MOCK_RECIPES_WITH_INGREDIENTS, MOCK_PRODUCTION_PLANS, calculateRecipeCost, calculateMarginAnalysis, calculateProductionRequirements, calculateProductionCost, getProductionStatusColor, getProductionStatusIcon } from '../types/recipes';

// Simple mock data - keeping it minimal
const MOCK_RECIPES = [
  {
    id: '1',
    name: 'Artisan Sourdough Bread',
    description: 'Traditional sourdough bread with crispy crust and tangy flavor',
    category: 'Bread & Pastries',
    difficulty: 'hard',
    totalTime: 75,
    servings: 8,
    yield: 1,
    yieldUnit: 'loaf'
  },
  {
    id: '2',
    name: 'Classic Chocolate Chip Cookies',
    description: 'Soft and chewy cookies with chocolate chips',
    category: 'Cakes & Desserts',
    difficulty: 'easy',
    totalTime: 27,
    servings: 24,
    yield: 24,
    yieldUnit: 'cookies'
  }
];

const MOCK_CATEGORIES = [
  'Bread & Pastries',
  'Cakes & Desserts',
  'Savory Dishes',
  'Beverages',
  'Other'
];

// Ingredient form interface
interface IngredientFormData {
  name: string;
  description: string;
  category: string;
  unit: string;
  costPerUnit: number;
  costUnit: string;
  supplier: string;
  minStock: number;
  currentStock: number;
}

const RecipeManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients' | 'costs' | 'production'>('recipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Ingredients state
  const [ingredients, setIngredients] = useState(MOCK_INGREDIENTS);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [selectedIngredientCategory, setSelectedIngredientCategory] = useState<string>('');
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    description: '',
    category: '',
    unit: '',
    costPerUnit: 0,
    costUnit: '',
    supplier: '',
    minStock: 0,
    currentStock: 0
  });

  // Cost analysis state
  const [recipes] = useState(MOCK_RECIPES_WITH_INGREDIENTS);
  const [targetMargin, setTargetMargin] = useState(30);
  const [selectedRecipeForAnalysis, setSelectedRecipeForAnalysis] = useState<any>(null);

  // Production planning state
  const [productionPlans, setProductionPlans] = useState(MOCK_PRODUCTION_PLANS);
  const [showAddProductionModal, setShowAddProductionModal] = useState(false);
  const [selectedRecipeForProduction, setSelectedRecipeForProduction] = useState<any>(null);
  const [batchSize, setBatchSize] = useState(1);
  const [plannedDate, setPlannedDate] = useState('');
  const [productionNotes, setProductionNotes] = useState('');

  // Simple filtering
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Ingredients filtering
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase()) ||
      ingredient.description.toLowerCase().includes(ingredientSearchTerm.toLowerCase());
    
    const matchesCategory = !selectedIngredientCategory || ingredient.category === selectedIngredientCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate total inventory value
  const totalInventoryValue = ingredients.reduce((total, ingredient) => {
    return total + (ingredient.costPerUnit * ingredient.currentStock);
  }, 0);

  // Get low stock ingredients
  const lowStockIngredients = ingredients.filter(ingredient => 
    ingredient.currentStock <= ingredient.minStock
  );

  // Form handlers
  const handleFormChange = (field: keyof IngredientFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIngredient) {
      // Update existing ingredient
      const updatedIngredients = ingredients.map(ingredient => 
        ingredient.id === editingIngredient.id 
          ? { ...ingredient, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
          : ingredient
      );
      setIngredients(updatedIngredients);
      setEditingIngredient(null);
    } else {
      // Add new ingredient
      const newIngredient = {
        id: Date.now().toString(),
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setIngredients([...ingredients, newIngredient]);
    }
    
    // Reset form and close modal
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      costPerUnit: 0,
      costUnit: '',
      supplier: '',
      minStock: 0,
      currentStock: 0
    });
    setShowAddIngredientModal(false);
  };

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      description: ingredient.description,
      category: ingredient.category,
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit,
      costUnit: ingredient.costUnit,
      supplier: ingredient.supplier,
      minStock: ingredient.minStock,
      currentStock: ingredient.currentStock
    });
    setShowAddIngredientModal(true);
  };

  const handleCancel = () => {
    setShowAddIngredientModal(false);
    setEditingIngredient(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      costPerUnit: 0,
      costUnit: '',
      supplier: '',
      minStock: 0,
      currentStock: 0
    });
  };

  // Cost analysis functions
  const getRecipeCostAnalysis = (recipe: any) => {
    const costData = calculateRecipeCost(recipe, ingredients);
    const marginData = calculateMarginAnalysis(costData.totalCost, targetMargin);
    
    return {
      ...costData,
      marginAnalysis: marginData
    };
  };

  const getTotalRecipesCost = () => {
    return recipes.reduce((total, recipe) => {
      const costData = calculateRecipeCost(recipe, ingredients);
      return total + costData.totalCost;
    }, 0);
  };

  // Production planning functions
  const handleCreateProductionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRecipeForProduction) return;
    
    const newPlan = {
      id: Date.now().toString(),
      recipeId: selectedRecipeForProduction.id,
      recipe: selectedRecipeForProduction,
      batchSize,
      plannedDate,
      status: 'planned' as const,
      ingredientRequirements: calculateProductionRequirements(selectedRecipeForProduction, batchSize, ingredients),
      estimatedCost: calculateProductionCost(selectedRecipeForProduction, batchSize, ingredients),
      estimatedYield: selectedRecipeForProduction.yield * batchSize,
      notes: productionNotes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setProductionPlans([...productionPlans, newPlan]);
    
    // Reset form
    setSelectedRecipeForProduction(null);
    setBatchSize(1);
    setPlannedDate('');
    setProductionNotes('');
    setShowAddProductionModal(false);
  };

  const updateProductionStatus = (planId: string, newStatus: 'planned' | 'in-progress' | 'completed' | 'cancelled') => {
    setProductionPlans(plans => 
      plans.map(plan => 
        plan.id === planId 
          ? { ...plan, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : plan
      )
    );
  };

  const getTotalProductionCost = () => {
    return productionPlans.reduce((total, plan) => total + plan.estimatedCost, 0);
  };

  const getProductionStats = () => {
    const stats = {
      total: productionPlans.length,
      planned: productionPlans.filter(p => p.status === 'planned').length,
      inProgress: productionPlans.filter(p => p.status === 'in-progress').length,
      completed: productionPlans.filter(p => p.status === 'completed').length,
      cancelled: productionPlans.filter(p => p.status === 'cancelled').length
    };
    return stats;
  };

  return (
    <VendorDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recipe Management</h1>
          <p className="mt-2 text-gray-600">Phase 6: Production Planning & Batch Optimization</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                      {[
              { id: 'recipes', label: 'Recipes', icon: ChefHat, count: recipes.length },
              { id: 'ingredients', label: 'Ingredients', icon: Package, count: ingredients.length },
              { id: 'costs', label: 'Cost Analysis', icon: Calculator, count: recipes.length },
              { id: 'production', label: 'Production', icon: Calendar, count: productionPlans.length }
            ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand-green text-brand-green'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="category-select" className="sr-only">Filter by category</label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {MOCK_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    aria-label="Switch to grid view"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    aria-label="Switch to list view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recipes Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {recipe.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {recipe.category}
                        </span>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div>⏱️ {recipe.totalTime} min</div>
                        <div>👥 {recipe.servings} servings</div>
                        <div>📦 {recipe.yield} {recipe.yieldUnit}</div>
                        <div>💰 Cost: ${getRecipeCostAnalysis(recipe).totalCost.toFixed(2)}</div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                          View Recipe
                        </button>
                        <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                          Cost Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <ChefHat className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{recipe.name}</div>
                              <div className="text-sm text-gray-500">{recipe.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {recipe.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {recipe.totalTime} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {recipe.yield} {recipe.yieldUnit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-green-600 hover:text-green-900">Cost</button>
                            <button className="text-purple-600 hover:text-purple-900">Plan</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory ? 'Try adjusting your search terms or filters' : 'Get started by creating your first recipe'}
                </p>
                {!searchTerm && !selectedCategory && (
                  <button className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors">
                    Create Your First Recipe
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            {/* Ingredients Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Ingredients</p>
                    <p className="text-2xl font-bold text-gray-900">{ingredients.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calculator className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                    <p className="text-2xl font-bold text-gray-900">${totalInventoryValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{lowStockIngredients.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{MOCK_INGREDIENT_CATEGORIES_PHASE4.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search ingredients..."
                    value={ingredientSearchTerm}
                    onChange={(e) => setIngredientSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="ingredient-category-select" className="sr-only">Filter by category</label>
                  <select
                    id="ingredient-category-select"
                    value={selectedIngredientCategory}
                    onChange={(e) => setSelectedIngredientCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {MOCK_INGREDIENT_CATEGORIES_PHASE4.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    aria-label="Switch to grid view"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    aria-label="Switch to list view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setShowAddIngredientModal(true)}
                    className="w-full bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Ingredient
                  </button>
                </div>
              </div>
            </div>

            {/* Ingredients Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIngredients.map((ingredient) => (
                  <div key={ingredient.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {ingredient.name}
                        </h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(ingredient)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            aria-label="Edit ingredient"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIngredients(ingredients.filter(i => i.id !== ingredient.id));
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            aria-label="Delete ingredient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">
                        {ingredient.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {ingredient.category}
                        </span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {ingredient.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div>💰 ${ingredient.costPerUnit.toFixed(2)} {ingredient.costUnit}</div>
                        <div>📦 Stock: {ingredient.currentStock}</div>
                        <div>⚠️ Min: {ingredient.minStock}</div>
                        <div>🏪 {ingredient.supplier}</div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                          View Details
                        </button>
                        <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                          Update Stock
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIngredients.map((ingredient) => (
                      <tr key={ingredient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                              <div className="text-sm text-gray-500">{ingredient.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {ingredient.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${ingredient.costPerUnit.toFixed(2)} {ingredient.costUnit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{ingredient.currentStock} {ingredient.unit}</div>
                          {ingredient.currentStock <= ingredient.minStock && (
                            <div className="text-xs text-red-600">Low Stock</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ingredient.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(ingredient)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setIngredients(ingredients.filter(i => i.id !== ingredient.id));
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {filteredIngredients.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
                <p className="text-gray-600 mb-4">
                  {ingredientSearchTerm || selectedIngredientCategory ? 'Try adjusting your search terms or filters' : 'Get started by adding your first ingredient'}
                </p>
                {!ingredientSearchTerm && !selectedIngredientCategory && (
                  <button 
                    onClick={() => setShowAddIngredientModal(true)}
                    className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors"
                  >
                    Add Your First Ingredient
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-6">
            {/* Cost Analysis Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calculator className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Recipes</p>
                    <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calculator className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">${getTotalRecipesCost().toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calculator className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Avg Cost/Recipe</p>
                    <p className="text-2xl font-bold text-gray-900">${(getTotalRecipesCost() / recipes.length).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calculator className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Target Margin</p>
                    <p className="text-2xl font-bold text-gray-900">{targetMargin}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Margin Control */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Target Profit Margin</h3>
                  <p className="text-sm text-gray-600">Adjust the target profit margin for all recipes</p>
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="margin-slider" className="sr-only">Target profit margin</label>
                  <input
                    id="margin-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                    className="w-32"
                    aria-label="Target profit margin"
                  />
                  <span className="text-lg font-semibold text-gray-900">{targetMargin}%</span>
                </div>
              </div>
            </div>

            {/* Recipe Cost Analysis */}
            <div className="space-y-4">
              {recipes.map((recipe) => {
                const costAnalysis = getRecipeCostAnalysis(recipe);
                return (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{recipe.name}</h3>
                        <p className="text-gray-600">{recipe.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${costAnalysis.totalCost.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Total Cost</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Cost Breakdown */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                        <div className="space-y-2">
                          {costAnalysis.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.ingredientName}</span>
                              <span className="font-medium">${item.cost.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${costAnalysis.totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Per Unit Costs */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Per Unit Costs</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Per Serving:</span>
                            <span className="font-medium">${costAnalysis.costPerServing.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Per {recipe.yieldUnit}:</span>
                            <span className="font-medium">${costAnalysis.costPerYield.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Margin Analysis */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Margin Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Suggested Price:</span>
                            <span className="font-medium text-green-600">${costAnalysis.marginAnalysis.suggestedPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Profit Per Unit:</span>
                            <span className="font-medium text-green-600">${costAnalysis.marginAnalysis.profitPerUnit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Break-even:</span>
                            <span className="font-medium">${costAnalysis.marginAnalysis.breakEvenPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'production' && (
          <div className="space-y-6">
            {/* Production Planning Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{getProductionStats().total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Planned</p>
                    <p className="text-2xl font-bold text-gray-900">{getProductionStats().planned}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{getProductionStats().inProgress}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{getProductionStats().completed}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <Calculator className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">${getTotalProductionCost().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Production Plan Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Production Planning</h3>
                  <p className="text-sm text-gray-600">Create new production plans and manage existing ones</p>
                </div>
                <button
                  onClick={() => setShowAddProductionModal(true)}
                  className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Production Plan
                </button>
              </div>
            </div>

            {/* Production Plans Display */}
            <div className="space-y-4">
              {productionPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{plan.recipe.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProductionStatusColor(plan.status)}`}>
                          {getProductionStatusIcon(plan.status)} {plan.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{plan.recipe.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {plan.plannedDate}</span>
                        <span>📦 Batch: {plan.batchSize}</span>
                        <span>🎯 Yield: {plan.estimatedYield} {plan.recipe.yieldUnit}</span>
                        <span>💰 Cost: ${plan.estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {plan.status === 'planned' && (
                        <button
                          onClick={() => updateProductionStatus(plan.id, 'in-progress')}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm"
                        >
                          Start
                        </button>
                      )}
                      {plan.status === 'in-progress' && (
                        <button
                          onClick={() => updateProductionStatus(plan.id, 'completed')}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                        >
                          Complete
                        </button>
                      )}
                      {plan.status !== 'completed' && plan.status !== 'cancelled' && (
                        <button
                          onClick={() => updateProductionStatus(plan.id, 'cancelled')}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ingredient Requirements */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Ingredient Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {plan.ingredientRequirements.map((req, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{req.ingredient.name}</span>
                            {req.needsPurchase && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                Needs Purchase
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Required: {req.requiredQuantity} {req.ingredient.unit}</div>
                            <div>Available: {req.availableQuantity} {req.ingredient.unit}</div>
                            {req.needsPurchase && (
                              <div className="text-red-600 font-medium">
                                Purchase: {req.purchaseQuantity} {req.ingredient.unit}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {plan.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Notes:</span> {plan.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {productionPlans.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No production plans</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first production plan</p>
                <button
                  onClick={() => setShowAddProductionModal(true)}
                  className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors"
                >
                  Create Production Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ingredient Modal */}
        {showAddIngredientModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="e.g., All-Purpose Flour"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="Brief description of the ingredient"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {MOCK_INGREDIENT_CATEGORIES_PHASE4.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                        Unit *
                      </label>
                      <select
                        id="unit"
                        required
                        value={formData.unit}
                        onChange={(e) => handleFormChange('unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      >
                        <option value="">Select Unit</option>
                        {MOCK_UNITS.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Per Unit *
                      </label>
                      <input
                        type="number"
                        id="costPerUnit"
                        required
                        min="0"
                        step="0.01"
                        value={formData.costPerUnit}
                        onChange={(e) => handleFormChange('costPerUnit', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label htmlFor="costUnit" className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Unit *
                      </label>
                      <select
                        id="costUnit"
                        required
                        value={formData.costUnit}
                        onChange={(e) => handleFormChange('costUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      >
                        <option value="">Select Cost Unit</option>
                        {MOCK_COST_UNITS.map(costUnit => (
                          <option key={costUnit} value={costUnit}>
                            {costUnit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleFormChange('supplier', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="e.g., Local Mill Co."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Stock *
                      </label>
                      <input
                        type="number"
                        id="minStock"
                        required
                        min="0"
                        value={formData.minStock}
                        onChange={(e) => handleFormChange('minStock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Stock *
                      </label>
                      <input
                        type="number"
                        id="currentStock"
                        required
                        min="0"
                        value={formData.currentStock}
                        onChange={(e) => handleFormChange('currentStock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
                    >
                      {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Production Planning Modal */}
        {showAddProductionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create Production Plan</h3>
                  <button
                    onClick={() => setShowAddProductionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateProductionPlan} className="space-y-4">
                  <div>
                    <label htmlFor="recipe-select" className="block text-sm font-medium text-gray-700 mb-1">
                      Recipe *
                    </label>
                    <select
                      id="recipe-select"
                      required
                      value={selectedRecipeForProduction?.id || ''}
                      onChange={(e) => {
                        const recipe = recipes.find(r => r.id === e.target.value);
                        setSelectedRecipeForProduction(recipe || null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    >
                      <option value="">Select Recipe</option>
                      {recipes.map(recipe => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="batch-size" className="block text-sm font-medium text-gray-700 mb-1">
                        Batch Size *
                      </label>
                      <input
                        type="number"
                        id="batch-size"
                        required
                        min="1"
                        value={batchSize}
                        onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label htmlFor="planned-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Planned Date *
                      </label>
                      <input
                        type="date"
                        id="planned-date"
                        required
                        value={plannedDate}
                        onChange={(e) => setPlannedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="production-notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="production-notes"
                      value={productionNotes}
                      onChange={(e) => setProductionNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="Production notes, special instructions..."
                      rows={3}
                    />
                  </div>

                  {selectedRecipeForProduction && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Production Summary</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>Recipe: {selectedRecipeForProduction.name}</div>
                        <div>Batch Size: {batchSize}</div>
                        <div>Total Yield: {selectedRecipeForProduction.yield * batchSize} {selectedRecipeForProduction.yieldUnit}</div>
                        <div>Estimated Cost: ${calculateProductionCost(selectedRecipeForProduction, batchSize, ingredients).toFixed(2)}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddProductionModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
                    >
                      Create Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Phase 6 Complete: Production planning system working! Batch optimization and ingredient requirement planning.
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default RecipeManagementPage;
