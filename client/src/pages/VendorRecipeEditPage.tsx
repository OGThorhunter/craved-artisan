import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import RecipeCostCalculator from '../components/RecipeCostCalculator';

interface Ingredient {
  id: string;
  name: string;
  description: string;
  unit: string;
  costPerUnit: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
  ingredient: Ingredient;
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  yield: number;
  yieldUnit: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  isActive: boolean;
  productId?: string;
  product?: Product;
  recipeIngredients: RecipeIngredient[];
}

interface FormData {
  name: string;
  description: string;
  instructions: string;
  yield: number;
  yieldUnit: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  isActive: boolean;
  productId: string;
}

const VendorRecipeEditPage: React.FC = () => {
  const { recipeId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Fetch recipe data
  const { data: recipeData, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const response = await axios.get(`/api/vendor/recipes/${recipeId}`);
      return response.data.recipe;
    },
    enabled: !!recipeId
  });

  // Fetch available ingredients
  const { data: ingredientsData } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const response = await axios.get('/api/ingredients');
      return response.data.ingredients;
    }
  });

  // Fetch available products
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/api/vendor/products');
      return response.data.products;
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.put(`/api/vendor/recipes/${recipeId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Recipe updated successfully');
      queryClient.invalidateQueries(['recipe', recipeId]);
    },
    onError: () => {
      toast.error('Failed to update recipe');
    }
  });

  // Update ingredients mutation
  const updateIngredientsMutation = useMutation({
    mutationFn: async (ingredients: RecipeIngredient[]) => {
      const response = await axios.post(`/api/vendor/recipes/${recipeId}/ingredients`, {
        ingredients: ingredients.map(ing => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        }))
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Ingredients updated successfully');
      queryClient.invalidateQueries(['recipe', recipeId]);
    },
    onError: () => {
      toast.error('Failed to update ingredients');
    }
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();

  // Watch form values for cost calculator
  const watchedYield = watch('yield');
  const watchedYieldUnit = watch('yieldUnit');
  const watchedProductId = watch('productId');

  // Initialize form when recipe data loads
  useEffect(() => {
    if (recipeData) {
      setValue('name', recipeData.name);
      setValue('description', recipeData.description || '');
      setValue('instructions', recipeData.instructions || '');
      setValue('yield', recipeData.yield);
      setValue('yieldUnit', recipeData.yieldUnit);
      setValue('prepTime', recipeData.prepTime || 0);
      setValue('cookTime', recipeData.cookTime || 0);
      setValue('difficulty', recipeData.difficulty || '');
      setValue('isActive', recipeData.isActive);
      setValue('productId', recipeData.productId || '');
      setIngredients(recipeData.recipeIngredients || []);
    }
  }, [recipeData, setValue]);

  // Update available data when fetched
  useEffect(() => {
    if (ingredientsData) {
      setAvailableIngredients(ingredientsData);
    }
  }, [ingredientsData]);

  useEffect(() => {
    if (productsData) {
      setAvailableProducts(productsData);
    }
  }, [productsData]);

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      ingredientId: '',
      quantity: 0,
      unit: '',
      notes: '',
      ingredient: {
        id: '',
        name: '',
        description: '',
        unit: '',
        costPerUnit: 0
      }
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    
    // Update ingredient details if ingredientId changes
    if (field === 'ingredientId') {
      const selectedIngredient = availableIngredients.find(ing => ing.id === value);
      if (selectedIngredient) {
        updatedIngredients[index].ingredient = selectedIngredient;
        updatedIngredients[index].unit = selectedIngredient.unit;
      }
    }
    
    setIngredients(updatedIngredients);
  };

  const saveIngredients = () => {
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }
    updateIngredientsMutation.mutate(ingredients);
  };

  // Get linked product for cost calculator
  const linkedProduct = availableProducts.find(p => p.id === watchedProductId);

  // Prepare ingredients for cost calculator
  const calculatorIngredients = ingredients.map(ing => ({
    id: ing.ingredientId,
    name: ing.ingredient.name,
    quantity: ing.quantity,
    unit: ing.unit,
    costPerUnit: ing.ingredient.costPerUnit,
    notes: ing.notes
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
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
              <h3 className="text-lg font-medium text-red-800">Error Loading Recipe</h3>
            </div>
            <p className="mt-2 text-red-700">Failed to load recipe data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
          <p className="text-gray-600 mt-2">
            Update recipe details and ingredients
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipe Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipe Details</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Name *
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Recipe name is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter recipe name"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter recipe description"
                      />
                    )}
                  />
                </div>

                {/* Yield */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yield *
                    </label>
                    <Controller
                      name="yield"
                      control={control}
                      rules={{ required: 'Yield is required', min: { value: 1, message: 'Yield must be at least 1' } }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                    {errors.yield && (
                      <p className="text-red-600 text-sm mt-1">{errors.yield.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <Controller
                      name="yieldUnit"
                      control={control}
                      rules={{ required: 'Yield unit is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., cookies, servings"
                        />
                      )}
                    />
                    {errors.yieldUnit && (
                      <p className="text-red-600 text-sm mt-1">{errors.yieldUnit.message}</p>
                    )}
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (minutes)
                    </label>
                    <Controller
                      name="prepTime"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cook Time (minutes)
                    </label>
                    <Controller
                      name="cookTime"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    )}
                  />
                </div>

                {/* Linked Product */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Product
                  </label>
                  <Controller
                    name="productId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">No product linked</option>
                        {availableProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${product.price}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <Controller
                    name="instructions"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter step-by-step instructions"
                      />
                    )}
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Recipe is active
                  </label>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Recipe'}
                </button>
              </form>
            </div>

            {/* Ingredients Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
                <button
                  onClick={addIngredient}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </button>
              </div>

              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Ingredient Selection */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ingredient
                        </label>
                        <select
                          value={ingredient.ingredientId}
                          onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select ingredient</option>
                          {availableIngredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} - ${ing.costPerUnit}/{ing.unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Unit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <input
                          type="text"
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={ingredient.notes || ''}
                        onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional notes"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => removeIngredient(index)}
                        className="flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {ingredients.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={saveIngredients}
                    disabled={updateIngredientsMutation.isPending}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {updateIngredientsMutation.isPending ? 'Saving...' : 'Save Ingredients'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cost Calculator */}
          <div>
            <RecipeCostCalculator
              ingredients={calculatorIngredients}
              yield={watchedYield || 0}
              yieldUnit={watchedYieldUnit || ''}
              linkedProduct={linkedProduct}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRecipeEditPage; 