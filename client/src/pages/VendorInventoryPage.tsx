import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'wouter';
import axios from 'axios';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { 
  Plus, 
  AlertTriangle, 
  Package, 
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Package2,
  AlertCircle,
  CheckCircle,
  X
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

interface CreateIngredientData {
  name: string;
  description?: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
}

const LOW_STOCK_THRESHOLD = 10; // You can adjust this threshold

export default function VendorInventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateIngredientData>();

  // Fetch ingredients
  const { data: ingredients = [], isLoading, error } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/ingredients');
        return response.data?.ingredients || [];
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        return [];
      }
    }
  });

  // Create ingredient mutation
  const createIngredientMutation = useMutation({
    mutationFn: async (data: CreateIngredientData) => {
      const response = await axios.post('/api/ingredients', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      toast.success('Ingredient added successfully!');
      reset();
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add ingredient');
    }
  });

  // Update ingredient mutation
  const updateIngredientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateIngredientData }) => {
      const response = await axios.put(`/api/ingredients/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      toast.success('Ingredient updated successfully!');
      reset();
      setEditingIngredient(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update ingredient');
    }
  });

  // Delete ingredient mutation
  const deleteIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/ingredients/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      toast.success('Ingredient deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete ingredient');
    }
  });

  const onSubmit = (data: CreateIngredientData) => {
    if (editingIngredient) {
      updateIngredientMutation.mutate({ id: editingIngredient.id, data });
    } else {
      createIngredientMutation.mutate(data);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    reset({
      name: ingredient.name,
      description: ingredient.description || '',
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit,
      supplier: ingredient.supplier || ''
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingIngredient(null);
    reset();
  };

  const handleDelete = (ingredient: Ingredient) => {
    if (window.confirm(`Are you sure you want to delete "${ingredient.name}"?`)) {
      deleteIngredientMutation.mutate(ingredient.id);
    }
  };

  // Calculate stats
  const totalIngredients = ingredients.length;
  const availableIngredients = ingredients.filter(i => i.isAvailable).length;
  const lowStockIngredients = ingredients.filter(i => !i.isAvailable).length; // Using isAvailable as proxy for stock status

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="responsive-subheading text-gray-900 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600">Failed to load your ingredients. Please try again.</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="py-8">
        <div className="container-responsive">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="responsive-heading text-gray-900">Inventory Management</h1>
              <p className="mt-2 text-gray-600">Manage your ingredients, track stock levels, and create recipes</p>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/dashboard/vendor/recipes/create"
                className="inline-flex items-center gap-2 responsive-button bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Create Recipe
              </Link>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center p-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Total Ingredients</p>
                <p className="responsive-heading text-gray-900">{totalIngredients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center p-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Available</p>
                <p className="responsive-heading text-gray-900">{availableIngredients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center p-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Low Stock</p>
                <p className="responsive-heading text-gray-900">{lowStockIngredients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Total Value</p>
                <p className="responsive-heading text-gray-900">
                  ${ingredients.reduce((sum, i) => sum + i.costPerUnit, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="responsive-subheading text-gray-900">
                {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
              </h3>
            </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Organic Flour"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    {...register('unit', { required: 'Unit is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    <option value="grams">Grams</option>
                    <option value="kilograms">Kilograms</option>
                    <option value="ounces">Ounces</option>
                    <option value="pounds">Pounds</option>
                    <option value="cups">Cups</option>
                    <option value="tablespoons">Tablespoons</option>
                    <option value="teaspoons">Teaspoons</option>
                    <option value="pieces">Pieces</option>
                    <option value="bottles">Bottles</option>
                    <option value="packages">Packages</option>
                  </select>
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Cost per Unit *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('costPerUnit', { 
                      required: 'Cost per unit is required',
                      min: { value: 0, message: 'Cost must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  {errors.costPerUnit && (
                    <p className="mt-1 text-sm text-red-600">{errors.costPerUnit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    {...register('supplier')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Local Market"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description of the ingredient..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="responsive-button text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ingredients List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="responsive-subheading text-gray-900">Ingredients</h3>
          </div>
          
          {ingredients.length === 0 ? (
            <div className="p-8 text-center">
              <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="responsive-subheading text-gray-900 mb-2">No ingredients yet</h3>
              <p className="text-gray-600 mb-4">Start building your inventory by adding your first ingredient.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Ingredient
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingredient
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ingredients.map((ingredient) => (
                    <tr key={ingredient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="responsive-text font-medium text-gray-900">
                            {ingredient.name}
                          </div>
                          {ingredient.description && (
                            <div className="responsive-text text-gray-500">
                              {ingredient.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ingredient.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${ingredient.costPerUnit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap responsive-text text-gray-500">
                        {ingredient.supplier || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ingredient.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ingredient.isAvailable ? 'Available' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap responsive-text font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(ingredient)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit ingredient"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ingredient)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete ingredient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        {lowStockIngredients > 0 && (
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <h4 className="responsive-text font-medium text-orange-800">
                  Low Stock Alert
                </h4>
                <p className="text-sm text-orange-700 mt-1">
                  You have {lowStockIngredients} ingredient{lowStockIngredients !== 1 ? 's' : ''} that need{lowStockIngredients !== 1 ? '' : 's'} restocking.
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
} 
