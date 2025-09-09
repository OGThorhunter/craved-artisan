import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'wouter';
import axios from 'axios';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import {
  Plus, Minus, Save, ArrowLeft, Package, ChefHat, 
  Clock, Users, BarChart3, AlertCircle
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  description?: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface CreateRecipeData {
  name: string;
  description?: string;
  instructions?: string;
  yield: number;
  yieldUnit: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  productId?: string;
  ingredients: RecipeIngredient[];
}

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const YIELD_UNITS = ['pieces', 'servings', 'batches', 'loaves', 'cookies', 'cakes'];

export default function VendorRecipeCreatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [showCustomIngredient, setShowCustomIngredient] = useState(false);
  const [customIngredientName, setCustomIngredientName] = useState('');
  const [customIngredientAmount, setCustomIngredientAmount] = useState(0);
  const [customIngredientUnit, setCustomIngredientUnit] = useState('');
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateRecipeData>({
    defaultValues: {
      name: '',
      description: '',
      instructions: '',
      yield: 1,
      yieldUnit: 'pieces',
      prepTime: 0,
      cookTime: 0,
      difficulty: 'Easy',
      ingredients: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  });

  // Fetch available ingredients
  const { data: ingredients = [], isLoading: ingredientsLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const response = await axios.get('/api/ingredients');
      return response.data.ingredients as Ingredient[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch available products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/api/vendor/products');
      return response.data.products as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: async (data: CreateRecipeData) => {
      const response = await axios.post('/api/recipes', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Recipe created successfully!');
      reset();
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error: any) => {
      console.error('Error creating recipe:', error);
      toast.error(error.response?.data?.message || 'Failed to create recipe');
    }
  });

  const onSubmit = async (data: CreateRecipeData) => {
    setIsSubmitting(true);
    try {
      await createRecipeMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    append({
      ingredientId: '',
      quantity: 1,
      unit: '',
      notes: ''
    });
  };

  const addCustomIngredient = () => {
    if (customIngredientName.trim() && customIngredientAmount > 0 && customIngredientUnit.trim()) {
      append({
        ingredientId: `custom-${Date.now()}`,
        quantity: customIngredientAmount,
        unit: customIngredientUnit,
        notes: `Custom ingredient: ${customIngredientName}`
      });
      
      // Reset form
      setCustomIngredientName('');
      setCustomIngredientAmount(0);
      setCustomIngredientUnit('');
      setShowCustomIngredient(false);
      
      toast.success('Custom ingredient added!');
    }
  };

  const removeIngredient = (index: number) => {
    remove(index);
  };

  const getIngredientName = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    return ingredient?.name || 'Unknown ingredient';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown product';
  };

  if (ingredientsLoading || productsLoading) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ingredients and products...</p>
        </div>
      </div>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="py-8 bg-white min-h-screen">
        <div className="container-responsive">
          {/* Header */}
          <DashboardHeader 
            title="Recipe Creation"
            description="Create and manage your culinary recipes with detailed ingredient tracking and cost analysis"
          />

          {/* Motivational Quote */}
          <MotivationalQuote
            quote={getQuoteByCategory('innovation').quote}
            author={getQuoteByCategory('innovation').author}
            icon={getQuoteByCategory('innovation').icon}
            variant={getQuoteByCategory('innovation').variant}
          />
          
          {/* Current View Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Currently viewing: <span className="text-green-600 font-medium">Recipe Builder</span></p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Recipe Builder
              </button>
            </div>
          </div>

        {/* Recipe Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Recipe Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block responsive-text font-medium text-gray-700 mb-2">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Recipe name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Chocolate Chip Cookies"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="productId" className="block responsive-text font-medium text-gray-700 mb-2">
                  Linked Product (Optional)
                </label>
                <select
                  id="productId"
                  {...register('productId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block responsive-text font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the recipe..."
              />
            </div>

            {/* Yield and Timing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="yield" className="block responsive-text font-medium text-gray-700 mb-2">
                  Yield Quantity *
                </label>
                <input
                  type="number"
                  id="yield"
                  {...register('yield', { 
                    required: 'Yield is required',
                    min: { value: 1, message: 'Yield must be at least 1' }
                  })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.yield && (
                  <p className="mt-1 text-sm text-red-600">{errors.yield.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="yieldUnit" className="block responsive-text font-medium text-gray-700 mb-2">
                  Yield Unit *
                </label>
                <select
                  id="yieldUnit"
                  {...register('yieldUnit', { required: 'Yield unit is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {YIELD_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.yieldUnit && (
                  <p className="mt-1 text-sm text-red-600">{errors.yieldUnit.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="prepTime" className="block responsive-text font-medium text-gray-700 mb-2">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  {...register('prepTime', { min: 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="cookTime" className="block responsive-text font-medium text-gray-700 mb-2">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  id="cookTime"
                  {...register('cookTime', { min: 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="difficulty" className="block responsive-text font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DIFFICULTY_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block responsive-text font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                id="instructions"
                {...register('instructions')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Step-by-step instructions for making this recipe..."
              />
            </div>

            {/* Ingredients Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="responsive-subheading text-gray-900">Ingredient Management</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUnitConverter(!showUnitConverter)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Unit Converter
                  </button>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Ingredient
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomIngredient(!showCustomIngredient)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Custom
                  </button>
                </div>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No ingredients added yet</p>
                  <p className="text-sm text-gray-400">Click "Add Ingredient" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block responsive-text font-medium text-gray-700 mb-1">
                            Ingredient *
                          </label>
                          <select
                            {...register(`ingredients.${index}.ingredientId` as const, {
                              required: 'Ingredient is required'
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select ingredient...</option>
                            {ingredients.map((ingredient) => (
                              <option key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} ({ingredient.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block responsive-text font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`ingredients.${index}.quantity` as const, {
                              required: 'Quantity is required',
                              min: { value: 0.01, message: 'Quantity must be positive' }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block responsive-text font-medium text-gray-700 mb-1">
                            Unit *
                          </label>
                          <input
                            type="text"
                            {...register(`ingredients.${index}.unit` as const, {
                              required: 'Unit is required'
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., cups, grams"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            title={`Remove ingredient ${index + 1}`}
                            className="w-full px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <Minus className="h-4 w-4 mx-auto" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block responsive-text font-medium text-gray-700 mb-1">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          {...register(`ingredients.${index}.notes` as const)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., room temperature, finely chopped"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Ingredient Form */}
              {showCustomIngredient && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add Custom Ingredient</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ingredient Name *
                      </label>
                      <input
                        type="text"
                        value={customIngredientName}
                        onChange={(e) => setCustomIngredientName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g., Organic Vanilla Extract"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Amount *
                      </label>
                      <input
                        type="number"
                        value={customIngredientAmount}
                        onChange={(e) => setCustomIngredientAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit *
                      </label>
                      <select
                        value={customIngredientUnit}
                        onChange={(e) => setCustomIngredientUnit(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        aria-label="Select unit for custom ingredient"
                      >
                        <option value="">Select unit...</option>
                        <option value="grams">grams (g)</option>
                        <option value="kilograms">kilograms (kg)</option>
                        <option value="ounces">ounces (oz)</option>
                        <option value="pounds">pounds (lb)</option>
                        <option value="milliliters">milliliters (ml)</option>
                        <option value="liters">liters (l)</option>
                        <option value="cups">cups</option>
                        <option value="tablespoons">tablespoons (tbsp)</option>
                        <option value="teaspoons">teaspoons (tsp)</option>
                        <option value="pieces">pieces</option>
                        <option value="pinch">pinch</option>
                        <option value="dash">dash</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={addCustomIngredient}
                        disabled={!customIngredientName.trim() || !customIngredientAmount || !customIngredientUnit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomIngredientName('');
                          setCustomIngredientAmount(0);
                          setCustomIngredientUnit('');
                          setShowCustomIngredient(false);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  {/* Custom Ingredient Notice */}
                  <div className="mt-3 bg-blue-100 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Custom Ingredient Notice</p>
                      <p>This custom ingredient will be added to your vendor inventory at zero stock. You can manage inventory levels later in your inventory dashboard.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Unit Converter */}
              {showUnitConverter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Unit Converter</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Converter Input */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Convert Units</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            From
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="0"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" aria-label="Select from unit">
                              <option value="grams">grams (g)</option>
                              <option value="kilograms">kg</option>
                              <option value="ounces">oz</option>
                              <option value="pounds">lb</option>
                              <option value="milliliters">ml</option>
                              <option value="liters">l</option>
                              <option value="cups">cups</option>
                              <option value="tablespoons">tbsp</option>
                              <option value="teaspoons">tsp</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            To
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="0"
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                            />
                            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" aria-label="Select to unit">
                              <option value="grams">grams (g)</option>
                              <option value="kilograms">kg</option>
                              <option value="ounces">oz</option>
                              <option value="pounds">lb</option>
                              <option value="milliliters">ml</option>
                              <option value="liters">l</option>
                              <option value="cups">cups</option>
                              <option value="tablespoons">tbsp</option>
                              <option value="teaspoons">tsp</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Reference Table */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Quick Reference</h5>
                      <div className="bg-white rounded border border-gray-200 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-2 py-1 text-left font-medium text-gray-700">Unit</th>
                              <th className="px-2 py-1 text-left font-medium text-gray-700">Grams</th>
                              <th className="px-2 py-1 text-left font-medium text-gray-700">Ounces</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-2 py-1 text-gray-600">1 cup flour</td>
                              <td className="px-2 py-1 text-gray-600">120g</td>
                              <td className="px-2 py-1 text-gray-600">4.2oz</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1 text-gray-600">1 cup sugar</td>
                              <td className="px-2 py-1 text-gray-600">200g</td>
                              <td className="px-2 py-1 text-gray-600">7.1oz</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1 text-gray-600">1 cup butter</td>
                              <td className="px-2 py-1 text-gray-600">227g</td>
                              <td className="px-2 py-1 text-gray-600">8oz</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1 text-gray-600">1 tbsp</td>
                              <td className="px-2 py-1 text-gray-600">15g</td>
                              <td className="px-2 py-1 text-gray-600">0.5oz</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1 text-gray-600">1 tsp</td>
                              <td className="px-2 py-1 text-gray-600">5g</td>
                              <td className="px-2 py-1 text-gray-600">0.18oz</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1 text-gray-600">1 lb</td>
                              <td className="px-2 py-1 text-gray-600">454g</td>
                              <td className="px-2 py-1 text-gray-600">16oz</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/vendor/inventory"
                className="inline-flex items-center responsive-button border border-gray-300 responsive-text font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center responsive-button border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Recipe
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
} 
