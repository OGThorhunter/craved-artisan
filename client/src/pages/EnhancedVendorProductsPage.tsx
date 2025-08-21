import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Package, 
  Tag, 
  DollarSign, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Image as ImageIcon, 
  Brain, 
  AlertTriangle, 
  RefreshCw,
  BarChart3,
  Factory,
  TrendingUp,
  Users,
  Calendar,
  Calculator,
  Zap,
  ChefHat
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import ProductionManager from '../components/vendor/ProductionManager';
import RecipeManager from '../components/vendor/RecipeManager';
import type { 
  Product, 
  CreateProductForm, 
  MarginAnalysis, 
  AiSuggestionResponse, 
  ProductsResponse,
  CostAnalysis
} from '../types/products';

// API functions
const fetchProducts = async (): Promise<ProductsResponse> => {
  const response = await axios.get('/api/vendor/products', {
    withCredentials: true
  });
  return response.data;
};

const createProduct = async (productData: CreateProductForm): Promise<{ message: string; product: Product }> => {
  const tags = (productData.tags || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const response = await axios.post('/api/vendor/products', {
    ...productData,
    tags,
    price: Number(productData.price),
    stock: Number(productData.stock),
    targetMargin: productData.targetMargin ? Number(productData.targetMargin) : null,
    recipeId: productData.recipeId || null
  }, {
    withCredentials: true
  });
  return response.data;
};

const updateProduct = async (productData: CreateProductForm & { id: string }): Promise<{ message: string; product: Product }> => {
  const tags = (productData.tags || '')
    .split(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const response = await axios.put(`/api/vendor/products/${productData.id}`, {
    ...productData,
    tags,
    price: Number(productData.price),
    stock: Number(productData.stock),
    targetMargin: productData.targetMargin ? Number(productData.targetMargin) : null,
    recipeId: productData.recipeId || null
  }, {
    withCredentials: true
  });
  return response.data;
};

const fetchMarginAnalysis = async (productId: string): Promise<MarginAnalysis> => {
  const response = await axios.get(`/api/vendor/products/${productId}/margin`, {
    withCredentials: true
  });
  return response.data;
};

const fetchAiSuggestion = async (productId: string): Promise<AiSuggestionResponse> => {
  const response = await axios.post(`/api/vendor/products/${productId}/ai-suggest`, {}, {
    withCredentials: true
  });
  return response.data;
};

const EnhancedVendorProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'products' | 'production' | 'recipes' | 'analytics' | 'financials'>('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [marginData, setMarginData] = useState<MarginAnalysis | null>(null);
  const [showMarginAnalysis, setShowMarginAnalysis] = useState(false);
  const [aiSuggestionData, setAiSuggestionData] = useState<AiSuggestionResponse | null>(null);
  const [showAiSuggestionModal, setShowAiSuggestionModal] = useState(false);

  // React Query for fetching products
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: fetchProducts,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Ensure we have safe data to work with
  const safeProductsData = productsData || { products: [], count: 0 };
  const safeProducts = safeProductsData.products || [];

  // React Query for creating products
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      toast.success('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      setShowAddForm(false);
      reset();
      setTags([]);
      setImagePreview('');
      setTagInput('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create product';
      toast.error(message);
    }
  });

  // React Query for updating products
  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      setShowAddForm(false);
      setEditing(null);
      reset();
      setTags([]);
      setImagePreview('');
      setTagInput('');
      setMarginData(null);
      setShowMarginAnalysis(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
    }
  });

  // React Query for deleting products
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/vendor/products/${id}`, {
      withCredentials: true
    }),
    onSuccess: () => {
      toast.success('Product deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    }
  });

  // React Query for margin analysis
  const marginAnalysisMutation = useMutation({
    mutationFn: fetchMarginAnalysis,
    onSuccess: (data) => {
      setMarginData(data);
      setShowMarginAnalysis(true);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to fetch margin analysis';
      toast.error(message);
    }
  });

  // React Query for AI suggestion
  const aiSuggestionMutation = useMutation({
    mutationFn: fetchAiSuggestion,
    onSuccess: (data) => {
      setAiSuggestionData(data);
      setShowAiSuggestionModal(true);
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      toast.success('AI suggestion applied successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to fetch AI suggestion';
      toast.error(message);
    }
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateProductForm>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      tags: '',
      stock: 0,
      isAvailable: true,
      targetMargin: 30,
      recipeId: '',
      onWatchlist: false,
      lastAiSuggestion: 0,
      aiSuggestionNote: '',
      // Enhanced fields
      category: 'bread',
      unit: 'loaf',
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderQuantity: 50,
      productionLeadTime: 1,
      batchSize: 12,
      productionFrequency: 'daily',
      allergens: [],
      dietaryRestrictions: [],
      certifications: [],
      expirationDays: 7,
      storageRequirements: 'Store in a cool, dry place',
      // Additional fields
      isFeatured: false,
      isSeasonal: false,
      hasAllergens: false,
      requiresRefrigeration: false
    }
  });

  // Watch price and target margin for real-time calculations
  const watchedPrice = watch('price');
  const watchedTargetMargin = watch('targetMargin');

  const onSubmit = (data: CreateProductForm) => {
    const payload = {
      ...data,
      price: parseFloat(data.price.toString()),
      stock: parseInt(data.stock.toString()),
      tags: tags,
    };

    if (editing) {
      updateProductMutation.mutate({ ...payload, id: editing.id });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const startEdit = (product: Product) => {
    setEditing(product);
    setShowAddForm(true);
    setTags(product.tags || []);
    setImagePreview(product.imageUrl || '');
    setMarginData(null);
    setShowMarginAnalysis(false);
    reset({
      ...product,
      tags: '',
      targetMargin: product.targetMargin || 0,
      recipeId: product.recipeId || '',
      onWatchlist: product.onWatchlist,
      lastAiSuggestion: product.lastAiSuggestion || 0,
      aiSuggestionNote: product.aiSuggestionNote || ''
    });
  };

  const handleDelete = (product: Product) => {
    setDeleteConfirm({ show: true, product });
  };

  const confirmDelete = () => {
    if (deleteConfirm.product) {
      deleteProductMutation.mutate(deleteConfirm.product.id);
      setDeleteConfirm({ show: false, product: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, product: null });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
  };

  const handleProductionUpdate = () => {
    // Refresh products data when production is updated
    refetch();
  };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Products</h3>
              <p className="text-red-600 mb-4">
                {error instanceof Error ? error.message : 'Failed to load products'}
              </p>
              <button
                onClick={() => refetch()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Enhanced Products & Production</h1>
                <p className="text-gray-600 mt-2">
                  Manage your artisan products, track production, and optimize costs
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (!showAddForm) {
                    setEditing(null);
                    reset();
                    setTags([]);
                    setImagePreview('');
                    setTagInput('');
                    setMarginData(null);
                    setShowMarginAnalysis(false);
                    setAiSuggestionData(null);
                    setShowAiSuggestionModal(false);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'production', label: 'Production', icon: Factory },
              { id: 'recipes', label: 'Recipes', icon: ChefHat },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'financials', label: 'Financials', icon: DollarSign }
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
          {activeTab === 'products' && (
            <>
              {/* Add/Edit Product Form */}
              {showAddForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {editing ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          {...register('name', { 
                            required: 'Product name is required',
                            minLength: { value: 1, message: 'Name must be at least 1 character' },
                            maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter product name"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('price', { 
                            required: 'Price is required',
                            min: { value: 0, message: 'Price must be positive' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          {...register('category')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="bread">Bread</option>
                          <option value="pastry">Pastry</option>
                          <option value="dessert">Dessert</option>
                          <option value="beverage">Beverage</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <select
                          {...register('unit')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="loaf">Loaf</option>
                          <option value="piece">Piece</option>
                          <option value="dozen">Dozen</option>
                          <option value="kg">Kilogram</option>
                          <option value="lb">Pound</option>
                          <option value="unit">Unit</option>
                        </select>
                      </div>
                    </div>

                    {/* Enhanced Production Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Stock Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          {...register('minStockLevel', { 
                            min: { value: 0, message: 'Min stock must be non-negative' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10"
                        />
                        {errors.minStockLevel && (
                          <p className="text-red-500 text-sm mt-1">{errors.minStockLevel.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Stock Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          {...register('maxStockLevel', { 
                            min: { value: 0, message: 'Max stock must be non-negative' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="100"
                        />
                        {errors.maxStockLevel && (
                          <p className="text-red-500 text-sm mt-1">{errors.maxStockLevel.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reorder Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          {...register('reorderQuantity', { 
                            min: { value: 0, message: 'Reorder quantity must be non-negative' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="50"
                        />
                        {errors.reorderQuantity && (
                          <p className="text-red-500 text-sm mt-1">{errors.reorderQuantity.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Production Lead Time (days)
                        </label>
                        <input
                          type="number"
                          min="0"
                          {...register('productionLeadTime', { 
                            min: { value: 0, message: 'Lead time must be non-negative' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1"
                        />
                        {errors.productionLeadTime && (
                          <p className="text-red-500 text-sm mt-1">{errors.productionLeadTime.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Batch Size
                        </label>
                        <input
                          type="number"
                          min="1"
                          {...register('batchSize', { 
                            min: { value: 1, message: 'Batch size must be at least 1' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="12"
                        />
                        {errors.batchSize && (
                          <p className="text-red-500 text-sm mt-1">{errors.batchSize.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Production Frequency
                        </label>
                        <select
                          {...register('productionFrequency')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="bi-weekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="on-demand">On-demand</option>
                        </select>
                      </div>
                    </div>

                    {/* Quality & Compliance Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiration Days
                        </label>
                        <input
                          type="number"
                          min="1"
                          {...register('expirationDays', { 
                            min: { value: 1, message: 'Expiration must be at least 1 day' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="7"
                        />
                        {errors.expirationDays && (
                          <p className="text-red-500 text-sm mt-1">{errors.expirationDays.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Storage Requirements
                        </label>
                        <input
                          type="text"
                          {...register('storageRequirements')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Store in a cool, dry place"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your product..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          {...register('stock', { 
                            min: { value: 0, message: 'Stock must be non-negative' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                        {errors.stock && (
                          <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Margin (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...register('targetMargin', { 
                            min: { value: 0, message: 'Target margin must be non-negative' },
                            max: { value: 100, message: 'Target margin cannot exceed 100%' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0"
                        />
                        {errors.targetMargin && (
                          <p className="text-red-500 text-sm mt-1">{errors.targetMargin.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Recipe and Advanced Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recipe (Optional)
                        </label>
                        <select
                          {...register('recipeId')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No recipe linked</option>
                          {/* Recipe options would be populated from API */}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Link to a recipe for automatic cost calculation
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Margin (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...register('targetMargin', { 
                            min: { value: 0, message: 'Target margin must be non-negative' },
                            max: { value: 100, message: 'Target margin cannot exceed 100%' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="30.0"
                        />
                        {errors.targetMargin && (
                          <p className="text-red-500 text-sm mt-1">{errors.targetMargin.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Product Status and Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('isAvailable')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Product is available for purchase
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('isFeatured')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Feature this product prominently
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('isSeasonal')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Seasonal product
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('onWatchlist')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Add to cost watchlist
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('hasAllergens')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Contains allergens
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('requiresRefrigeration')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Requires refrigeration
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {editing ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            {editing ? 'Update Product' : 'Create Product'}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditing(null);
                          reset();
                          setTags([]);
                          setImagePreview('');
                          setTagInput('');
                        }}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products List */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Your Products ({safeProductsData.count || 0})
                    </h2>
                    <button
                      onClick={() => refetch()}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {(!safeProducts || safeProducts.length === 0) ? (
                  <div className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start by adding your first artisan product to showcase your work.
                    </p>
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setEditing(null);
                        reset();
                        setTags([]);
                        setImagePreview('');
                        setTagInput('');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {safeProducts.map((product) => (
                      <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              {product.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {product.name}
                                  </h3>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    product.isAvailable 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {product.isAvailable ? 'Available' : 'Unavailable'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="font-medium">{formatPrice(product.price)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Package className="h-4 w-4" />
                                    <span>{product.stock} in stock</span>
                                  </div>
                                  {product.targetMargin && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Target:</span>
                                      <span className="font-medium">{product.targetMargin}%</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Factory className="h-4 w-4" />
                                    <span>{product.batchSize || 'N/A'} per batch</span>
                                  </div>
                                </div>

                                {/* Production Status */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${
                                      product.stock <= (product.minStockLevel || 0) ? 'bg-red-500' :
                                      product.stock <= (product.minStockLevel || 0) * 1.5 ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}></span>
                                    <span>Stock: {product.stock <= (product.minStockLevel || 0) ? 'Low' : 'Good'}</span>
                                  </div>
                                  {product.recipeId && (
                                    <div className="flex items-center gap-1">
                                      <ChefHat className="h-3 w-3" />
                                      <span>Recipe linked</span>
                                    </div>
                                  )}
                                  {product.isFeatured && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-500">⭐ Featured</span>
                                    </div>
                                  )}
                                  {product.isSeasonal && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-orange-500">🌱 Seasonal</span>
                                    </div>
                                  )}
                                </div>

                                {product.description && (
                                  <div className="flex items-start gap-1 mb-2">
                                    <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                      {product.description}
                                    </p>
                                  </div>
                                )}

                                <div className="text-xs text-gray-500">
                                  Created: {formatDate(product.createdAt)} • 
                                  Updated: {formatDate(product.updatedAt)}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => startEdit(product)}
                                    disabled={updateProductMutation.isPending}
                                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => marginAnalysisMutation.mutate(product.id)}
                                    disabled={marginAnalysisMutation.isPending}
                                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    <DollarSign className="h-3 w-3" />
                                    Margin
                                  </button>
                                  <button
                                    onClick={() => aiSuggestionMutation.mutate(product.id)}
                                    disabled={aiSuggestionMutation.isPending}
                                    className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    <Brain className="h-3 w-3" />
                                    AI Suggestion
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product)}
                                    disabled={deleteProductMutation.isPending}
                                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'production' && (
            <ProductionManager 
              products={safeProducts}
              onProductionUpdate={handleProductionUpdate}
            />
          )}

          {activeTab === 'recipes' && (
            <RecipeManager 
              products={safeProducts}
              onRecipeUpdate={handleProductionUpdate}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Production Analytics</h2>
              <p className="text-gray-600">Comprehensive analytics and insights for your production operations.</p>
              
              {/* Analytics content would go here */}
              <div className="text-center py-8 text-gray-500">
                Production analytics features coming soon...
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Management</h2>
              <p className="text-gray-600">Track your business finances, margins, and profitability.</p>
              
              {/* Financial content would go here */}
              <div className="text-center py-8 text-gray-500">
                Financial management features coming soon...
                <br />
                <a 
                  href="/dashboard/vendor/financials" 
                  className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                >
                  Go to Full Financial Dashboard →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.product.name}"</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="text-gray-700 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteProductMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteProductMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
};

export default EnhancedVendorProductsPage;
