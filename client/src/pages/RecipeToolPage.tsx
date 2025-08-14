'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import {
  ChefHat, Plus, Edit, Trash, Save, Copy, History, Eye,
  Calculator, DollarSign, Package, AlertTriangle, CheckCircle,
  Camera, Upload, Download, Share2, Settings, Grid, List,
  Search, Filter, Star, Clock, Users, Calendar, MapPin,
  ShoppingCart, Heart, Brain, Zap, Target, TrendingUp,
  BarChart3, PieChart, LineChart, Activity, ArrowUpRight,
  ArrowDownRight, AlertCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  cost: number;
  supplier: string;
  allergen: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  inStock: number;
  minStock: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  yield: number;
  yieldUnit: string;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  allergens: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  costPerUnit: number;
  suggestedPrice: number;
  margin: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  imageUrl?: string;
  notes: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  recipeId: string;
  price: number;
  category: string;
  tags: string[];
  allergens: string[];
  isAvailable: boolean;
  maxStock: number;
  currentStock: number;
  eventSpecific?: string[];
  daypart?: string[];
  seasonal?: {
    startDate: string;
    endDate: string;
  };
  bundleItems?: string[];
  tieredPricing?: {
    quantity: number;
    price: number;
  }[];
  fulfillmentMethods: {
    pickup: boolean;
    delivery: boolean;
    event: boolean;
  };
  imageUrl?: string;
  featured: boolean;
}

interface RecipeVersion {
  id: string;
  recipeId: string;
  version: number;
  changes: string;
  ingredients: Ingredient[];
  costPerUnit: number;
  createdAt: string;
  createdBy: string;
}

export default function RecipeToolPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'recipes' | 'menu' | 'analytics'>('recipes');
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [showCreateMenuItem, setShowCreateMenuItem] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [showNutritionAnalysis, setShowNutritionAnalysis] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [scalingFactor, setScalingFactor] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockRecipes: Recipe[] = [
      {
        id: 'rec1',
        name: 'Artisan Sourdough Bread',
        description: 'Traditional sourdough bread with a crispy crust and tangy flavor',
        ingredients: [
          {
            id: 'ing1',
            name: 'Bread Flour',
            amount: 500,
            unit: 'g',
            cost: 2.50,
            supplier: 'Local Mill Co.',
            allergen: [],
            nutrition: { calories: 364, protein: 12, carbs: 76, fat: 1, fiber: 3 },
            inStock: 2000,
            minStock: 500
          },
          {
            id: 'ing2',
            name: 'Active Sourdough Starter',
            amount: 100,
            unit: 'g',
            cost: 0.50,
            supplier: 'Home Made',
            allergen: [],
            nutrition: { calories: 100, protein: 4, carbs: 20, fat: 0, fiber: 1 },
            inStock: 500,
            minStock: 200
          }
        ],
        instructions: [
          'Mix flour and starter in a large bowl',
          'Knead for 10 minutes until smooth',
          'Let rise for 4-6 hours',
          'Shape and bake at 450°F for 30 minutes'
        ],
        yield: 1,
        yieldUnit: 'loaf',
        prepTime: 30,
        cookTime: 30,
        difficulty: 'medium',
        category: 'Bread',
        tags: ['sourdough', 'artisan', 'traditional'],
        allergens: [],
        nutrition: { calories: 464, protein: 16, carbs: 96, fat: 1, fiber: 4 },
        costPerUnit: 3.00,
        suggestedPrice: 8.50,
        margin: 65,
        version: 1,
        createdAt: '2024-02-15T10:00:00Z',
        updatedAt: '2024-02-15T10:00:00Z',
        createdBy: 'Chef Sarah',
        isActive: true,
        notes: 'Best served fresh or toasted'
      }
    ];

    const mockMenuItems: MenuItem[] = [
      {
        id: 'menu1',
        name: 'Artisan Sourdough Loaf',
        description: 'Fresh-baked sourdough bread',
        recipeId: 'rec1',
        price: 8.50,
        category: 'Bread',
        tags: ['fresh', 'artisan', 'sourdough'],
        allergens: [],
        isAvailable: true,
        maxStock: 20,
        currentStock: 15,
        fulfillmentMethods: {
          pickup: true,
          delivery: true,
          event: true
        },
        featured: true
      }
    ];

    setRecipes(mockRecipes);
    setMenuItems(mockMenuItems);
  }, []);

  const handleAiRecipeGeneration = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI recipe generation
    setTimeout(() => {
      const newRecipe: Recipe = {
        id: `rec${Date.now()}`,
        name: 'AI Generated Recipe',
        description: `Recipe based on: "${aiPrompt}"`,
        ingredients: [],
        instructions: [],
        yield: 1,
        yieldUnit: 'serving',
        prepTime: 30,
        cookTime: 30,
        difficulty: 'medium',
        category: 'AI Generated',
        tags: ['ai-generated'],
        allergens: [],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        costPerUnit: 0,
        suggestedPrice: 0,
        margin: 0,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'AI Assistant',
        isActive: true,
        notes: 'Generated using AI prompt'
      };
      
      setRecipes(prev => [...prev, newRecipe]);
      setSelectedRecipe(newRecipe);
      setShowCreateRecipe(true);
      setIsGenerating(false);
      setAiPrompt('');
    }, 3000);
  };

  const handleRecipeScaling = (recipe: Recipe, factor: number) => {
    const scaledRecipe = {
      ...recipe,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        amount: ing.amount * factor,
        cost: ing.cost * factor
      })),
      yield: recipe.yield * factor,
      costPerUnit: recipe.costPerUnit * factor
    };
    
    setSelectedRecipe(scaledRecipe);
    setScalingFactor(factor);
  };

  const calculateNutrition = (ingredients: Ingredient[]) => {
    return ingredients.reduce((total, ing) => ({
      calories: total.calories + (ing.nutrition.calories * ing.amount / 100),
      protein: total.protein + (ing.nutrition.protein * ing.amount / 100),
      carbs: total.carbs + (ing.nutrition.carbs * ing.amount / 100),
      fat: total.fat + (ing.nutrition.fat * ing.amount / 100),
      fiber: total.fiber + (ing.nutrition.fiber * ing.amount / 100)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const detectAllergens = (ingredients: Ingredient[]) => {
    const allergenMap: { [key: string]: string[] } = {
      'dairy': ['milk', 'cheese', 'butter', 'cream'],
      'nuts': ['almond', 'walnut', 'pecan', 'cashew'],
      'gluten': ['wheat', 'flour', 'bread'],
      'eggs': ['egg', 'egg white', 'egg yolk'],
      'soy': ['soy', 'soybean', 'tofu'],
      'fish': ['fish', 'salmon', 'tuna'],
      'shellfish': ['shrimp', 'crab', 'lobster'],
      'peanuts': ['peanut', 'peanut butter']
    };

    const detected: string[] = [];
    ingredients.forEach(ing => {
      Object.entries(allergenMap).forEach(([allergen, keywords]) => {
        if (keywords.some(keyword => ing.name.toLowerCase().includes(keyword))) {
          if (!detected.includes(allergen)) {
            detected.push(allergen);
          }
        }
      });
    });

    return detected;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate OCR processing
      console.log('Processing image with OCR...');
    }
  };

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recipe Tool & Menu Builder</h1>
              <p className="text-gray-600">AI-enhanced recipe creation, cost analysis, and menu management</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateRecipe(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
              >
                <Plus className="w-4 h-4" />
                New Recipe
              </button>
              <button
                onClick={() => setShowCreateMenuItem(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600/90"
              >
                <Plus className="w-4 h-4" />
                New Menu Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recipe Composer */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Smart Recipe Composer</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Describe your recipe idea and let AI create it for you with cost analysis and allergen detection
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Make a vegan sourdough using oat milk and maple"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleAiRecipeGeneration}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Create Recipe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'recipes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <ChefHat className="w-4 h-4 inline mr-2" />
            Recipes
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'menu' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4 inline mr-2" />
            Menu Builder
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            {/* Recipe Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-brand-green" />
                        <span className="text-xs text-gray-500">{recipe.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-green-600">${recipe.costPerUnit.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">cost</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime + recipe.cookTime} min
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Package className="w-3 h-3" />
                        {recipe.yield} {recipe.yieldUnit}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        recipe.difficulty === 'easy' ? 'text-green-600 bg-green-100' :
                        recipe.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {recipe.difficulty}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                          <Calculator className="w-3 h-3" />
                        </button>
                        <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Menu Items Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedMenuItem(item)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-500">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">price</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Package className="w-3 h-3" />
                        {item.currentStock}/{item.maxStock} in stock
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CheckCircle className="w-3 h-3" />
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.featured ? 'text-yellow-600 bg-yellow-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {item.featured ? 'Featured' : 'Standard'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <ChefHat className="w-8 h-8 text-brand-green" />
                  <div>
                    <p className="text-sm text-gray-600">Total Recipes</p>
                    <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Menu Items</p>
                    <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(recipes.reduce((sum, r) => sum + r.costPerUnit, 0) / recipes.length || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Margin</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(recipes.reduce((sum, r) => sum + r.margin, 0) / recipes.length || 0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedRecipe.name}</h2>
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Recipe Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recipe Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Yield:</span>
                      <span className="font-medium">{selectedRecipe.yield} {selectedRecipe.yieldUnit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prep Time:</span>
                      <span className="font-medium">{selectedRecipe.prepTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cook Time:</span>
                      <span className="font-medium">{selectedRecipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedRecipe.difficulty === 'easy' ? 'text-green-600 bg-green-100' :
                        selectedRecipe.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {selectedRecipe.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cost Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost per Unit:</span>
                      <span className="font-medium text-green-600">${selectedRecipe.costPerUnit.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Suggested Price:</span>
                      <span className="font-medium">${selectedRecipe.suggestedPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Margin:</span>
                      <span className="font-medium text-blue-600">{selectedRecipe.margin}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scaling Controls */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Dynamic Scaling</h4>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600">Scale Factor:</label>
                  <input
                    type="number"
                    value={scalingFactor}
                    onChange={(e) => setScalingFactor(parseFloat(e.target.value) || 1)}
                    min="0.1"
                    step="0.1"
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => handleRecipeScaling(selectedRecipe, scalingFactor)}
                    className="px-3 py-1 bg-brand-green text-white rounded text-sm hover:bg-brand-green/90"
                  >
                    Apply Scaling
                  </button>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {ingredient.amount} {ingredient.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        ${ingredient.cost.toFixed(2)} • {ingredient.supplier}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Instructions</h3>
                <ol className="space-y-2">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-brand-green text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Recipe Modal */}
      {showCreateRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Recipe</h2>
                <button
                  onClick={() => setShowCreateRecipe(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="e.g., Artisan Sourdough Bread"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent">
                      <option>Bread</option>
                      <option>Pastry</option>
                      <option>Dessert</option>
                      <option>Beverage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Describe your recipe..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Camera className="w-4 h-4" />
                      Upload Image or Take Photo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports OCR for handwritten recipes
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t">
                  <button className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                    Save Recipe
                  </button>
                  <button
                    onClick={() => setShowCreateRecipe(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
