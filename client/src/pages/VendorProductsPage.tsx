import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Package, Tag, DollarSign, FileText, Edit, Trash2, Eye, X, Image as ImageIcon, Brain, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Types
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  stock: number;
  isAvailable: boolean;
  targetMargin?: number;
  recipeId?: string;
  onWatchlist: boolean;
  lastAiSuggestion?: number;
  aiSuggestionNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface MarginAnalysis {
  product: {
    id: string;
    name: string;
    currentPrice: number;
    targetMargin: number | null;
  };
  costAnalysis: {
    unitCost: number;
    recipeYield: number;
    hasRecipe: boolean;
  };
  marginAnalysis: {
    currentMargin: number;
    status: 'danger' | 'warning' | 'safe';
    suggestedPrice: number | null;
  };
}

interface AiSuggestionResponse {
  message: string;
  product: {
    id: string;
    name: string;
    currentPrice: number;
    targetMargin: number;
    onWatchlist: boolean;
  };
  costAnalysis: {
    unitCost: number;
    hasRecipe: boolean;
  };
  aiSuggestion: {
    suggestedPrice: number;
    note: string;
    volatilityDetected: boolean;
    confidence: number;
    priceDifference: number;
    percentageChange: number;
  };
  watchlistUpdate: {
    addedToWatchlist: boolean;
    reason: string;
  };
}

interface ProductsResponse {
  products: Product[];
  count: number;
}

interface CreateProductForm {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: string;
  stock: number;
  isAvailable: boolean;
  targetMargin: number;
  recipeId: string;
  onWatchlist: boolean;
  lastAiSuggestion: number;
  aiSuggestionNote: string;
}

// API functions
const fetchProducts = async (): Promise<ProductsResponse> => {
  const response = await axios.get('/api/vendor/products', {
    withCredentials: true
  });
  return response.data;
};

const createProduct = async (productData: CreateProductForm): Promise<{ message: string; product: Product }> => {
  // Convert tags string to array
  const tags = productData.tags
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
  // Convert tags string to array
  const tags = productData.tags
    .split(',')
    .map(tag => tag.trim())
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

const VendorProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null); // product or null
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
      // Refresh the products data to show updated watchlist status and AI suggestion data
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
      targetMargin: 0,
      recipeId: '',
      onWatchlist: false,
      lastAiSuggestion: 0,
      aiSuggestionNote: ''
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
      tags: tags, // Use the tags state instead of parsing from string
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
    setTags(product.tags);
    setImagePreview(product.imageUrl || '');
    setMarginData(null);
    setShowMarginAnalysis(false);
    reset({
      ...product,
      tags: '', // We'll use the tags state instead
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
              <h3 className="responsive-subheading text-red-800 mb-2">Error Loading Products</h3>
              <p className="text-red-600 mb-4">
                {error instanceof Error ? error.message : 'Failed to load products'}
              </p>
              <button
                onClick={() => refetch()}
                className="bg-red-600 text-white responsive-button rounded-lg hover:bg-red-700 transition-colors"
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
              <h1 className="responsive-heading text-gray-900">Products</h1>
              <p className="text-gray-600 mt-2">
                Manage your artisan products and inventory
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
              className="bg-blue-600 text-white responsive-button rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="responsive-subheading text-gray-900 mb-4">
              {editing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-1">
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
                  <label className="block responsive-text font-medium text-gray-700 mb-1">
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
                  <label className="block responsive-text font-medium text-gray-700 mb-1">
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
                   <label className="block responsive-text font-medium text-gray-700 mb-1">
                     Image URL
                   </label>
                   <input
                     type="url"
                     {...register('imageUrl', {
                       pattern: {
                         value: /^https?:\/\/.+/,
                         message: 'Please enter a valid URL'
                       }
                     })}
                     onChange={(e) => handleImageUrlChange(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="https://example.com/image.jpg"
                   />
                   {errors.imageUrl && (
                     <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
                   )}
                   
                   {/* Image Preview */}
                   {imagePreview && (
                     <div className="mt-3">
                       <label className="block responsive-text font-medium text-gray-700 mb-2">Preview:</label>
                       <div className="relative inline-block">
                         <img
                           src={imagePreview}
                           alt="Product preview"
                           className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                           onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             e.currentTarget.nextElementSibling?.classList.remove('hidden');
                           }}
                         />
                         <div className="hidden w-32 h-32 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                           <ImageIcon className="w-8 h-8 text-gray-400" />
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your product..."
                />
              </div>

                             <div>
                 <label className="block responsive-text font-medium text-gray-700 mb-1">
                   Tags
                 </label>
                 
                 {/* Tag Input */}
                 <div className="flex gap-2 mb-3">
                   <input
                     type="text"
                     value={tagInput}
                     onChange={(e) => setTagInput(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Add a tag..."
                   />
                   <button
                     type="button"
                     onClick={addTag}
                     className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                   >
                     Add
                   </button>
                 </div>
                 
                 {/* Tag Chips */}
                 {tags.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {tags.map((tag, index) => (
                       <span
                         key={index}
                         className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                       >
                         <Tag className="w-3 h-3" />
                         {tag}
                         <button
                           type="button"
                           onClick={() => removeTag(tag)}
                           className="ml-1 hover:text-blue-600 transition-colors"
                           title={`Remove tag: ${tag}`}
                         >
                           <X className="w-3 h-3" />
                         </button>
                       </span>
                     ))}
                   </div>
                 )}
                 
                 <p className="text-gray-500 text-sm mt-2">
                   Press Enter or click Add to add tags
                 </p>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-1">
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
                  <p className="text-gray-500 text-sm mt-1">
                    Set your desired profit margin percentage
                  </p>
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-1">
                    Recipe ID (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('recipeId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter recipe ID for cost calculation"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Link to a recipe for automatic cost calculation
                  </p>
                </div>
              </div>

              {/* Watchlist Warning Banner */}
              {editing && editing.onWatchlist && (
                <div className="border-t pt-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="responsive-text font-medium text-yellow-800">Product on Watchlist</h4>
                    </div>
                    <p className="text-yellow-700 text-sm">
                      This product is being monitored due to price volatility, low confidence in AI suggestions, or significant price differences.
                    </p>
                    {editing.aiSuggestionNote && (
                      <p className="text-yellow-600 text-sm mt-2">
                        <strong>AI Note:</strong> {editing.aiSuggestionNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* AI Suggestion Section */}
              {editing && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="responsive-subheading text-gray-900">AI Price Suggestion</h3>
                    <button
                      type="button"
                      onClick={() => aiSuggestionMutation.mutate(editing.id)}
                      disabled={aiSuggestionMutation.isPending}
                      className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {aiSuggestionMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Recalculate
                        </>
                      )}
                    </button>
                  </div>

                  {editing.lastAiSuggestion && (
                    <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <h4 className="responsive-text font-medium text-purple-900">Last AI Suggestion</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-purple-700">Suggested Price:</span>
                          <span className="ml-2 font-medium text-purple-900">
                            ${editing.lastAiSuggestion.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-purple-700">Price Difference:</span>
                          <span className={`ml-2 font-medium ${
                            editing.lastAiSuggestion > editing.price ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${(editing.lastAiSuggestion - editing.price).toFixed(2)}
                          </span>
                        </div>
                        {editing.aiSuggestionNote && (
                          <div className="col-span-2">
                            <span className="text-purple-700">AI Note:</span>
                            <p className="ml-2 text-purple-800 text-sm mt-1">{editing.aiSuggestionNote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Margin Analysis Section */}
              {editing && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="responsive-subheading text-gray-900">Margin Analysis</h3>
                    <button
                      type="button"
                      onClick={() => marginAnalysisMutation.mutate(editing.id)}
                      disabled={marginAnalysisMutation.isPending}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {marginAnalysisMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-3 w-3" />
                          Calculate Margin
                        </>
                      )}
                    </button>
                  </div>

                  {showMarginAnalysis && marginData && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Cost Analysis */}
                      <div>
                        <h4 className="responsive-text font-medium text-gray-900 mb-2">Cost Analysis</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Unit Cost:</span>
                            <span className="ml-2 font-medium">${marginData.costAnalysis.unitCost.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Recipe Yield:</span>
                            <span className="ml-2 font-medium">{marginData.costAnalysis.recipeYield}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Has Recipe:</span>
                            <span className={`ml-2 font-medium ${marginData.costAnalysis.hasRecipe ? 'text-green-600' : 'text-gray-500'}`}>
                              {marginData.costAnalysis.hasRecipe ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Margin Analysis */}
                      <div>
                        <h4 className="responsive-text font-medium text-gray-900 mb-2">Margin Analysis</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Current Margin:</span>
                            <span className={`ml-2 font-medium ${
                              marginData.marginAnalysis.status === 'danger' ? 'text-red-600' :
                              marginData.marginAnalysis.status === 'warning' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {marginData.marginAnalysis.currentMargin.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                              marginData.marginAnalysis.status === 'danger' ? 'bg-red-100 text-red-800' :
                              marginData.marginAnalysis.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {marginData.marginAnalysis.status === 'danger' ? 'Danger' :
                               marginData.marginAnalysis.status === 'warning' ? 'Warning' : 'Safe'}
                            </span>
                          </div>
                          {marginData.marginAnalysis.suggestedPrice && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Suggested Price:</span>
                              <span className="ml-2 font-medium text-blue-600">
                                ${marginData.marginAnalysis.suggestedPrice.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      reset();
                      setTags([]);
                      setImagePreview('');
                      setTagInput('');
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditing(null);
                    reset();
                    setTags([]);
                    setImagePreview('');
                    setTagInput('');
                    setMarginData(null);
                    setShowMarginAnalysis(false);
                    setAiSuggestionData(null);
                    setShowAiSuggestionModal(false);
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
              <h2 className="responsive-subheading text-gray-900">
                Your Products ({productsData?.count || 0})
              </h2>
              <button
                onClick={() => refetch()}
                className="text-blue-600 hover:text-blue-700 responsive-text font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {productsData?.products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="responsive-subheading text-gray-900 mb-2">No products yet</h3>
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
                   setMarginData(null);
                   setShowMarginAnalysis(false);
                   setAiSuggestionData(null);
                   setShowAiSuggestionModal(false);
                 }}
                 className="bg-blue-600 text-white responsive-button rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Add Your First Product
               </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {productsData?.products.map((product) => (
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
                          
                          <div className="flex items-center gap-6 responsive-text text-gray-600 mb-2">
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
                            {product.onWatchlist && (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-yellow-600 font-medium">Watchlist</span>
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

                          {product.tags.length > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <div className="flex flex-wrap gap-1">
                                {product.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                                                     <div className="text-xs text-gray-500">
                             Created: {formatDate(product.createdAt)} â€¢ 
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

                                         <div className="flex items-center gap-2 ml-4">
                       <button
                         className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                         title="View details"
                       >
                         <Eye className="h-4 w-4" />
                       </button>
                       <button
                         onClick={() => startEdit(product)}
                         className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                         title="Edit product"
                       >
                         <Edit className="h-4 w-4" />
                       </button>
                                               <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteProductMutation.isPending}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete product"
                        >
                          {deleteProductMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                className="responsive-button text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteProductMutation.isPending}
                className="responsive-button bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

      {/* Margin Analysis Modal */}
      {showMarginAnalysis && marginData && !editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Margin Analysis</h3>
              </div>
              <button
                onClick={() => {
                  setShowMarginAnalysis(false);
                  setMarginData(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close margin analysis"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="responsive-text font-medium text-gray-900 mb-2">Product Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{marginData.product.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Price:</span>
                    <span className="ml-2 font-medium">${marginData.product.currentPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Target Margin:</span>
                    <span className="ml-2 font-medium">
                      {marginData.product.targetMargin ? `${marginData.product.targetMargin}%` : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="responsive-text font-medium text-gray-900 mb-2">Cost Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Unit Cost:</span>
                    <span className="ml-2 font-medium">${marginData.costAnalysis.unitCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Recipe Yield:</span>
                    <span className="ml-2 font-medium">{marginData.costAnalysis.recipeYield}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Has Recipe:</span>
                    <span className={`ml-2 font-medium ${marginData.costAnalysis.hasRecipe ? 'text-green-600' : 'text-gray-500'}`}>
                      {marginData.costAnalysis.hasRecipe ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Margin Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="responsive-text font-medium text-gray-900 mb-2">Margin Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Current Margin:</span>
                    <span className={`ml-2 font-medium text-lg ${
                      marginData.marginAnalysis.status === 'danger' ? 'text-red-600' :
                      marginData.marginAnalysis.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {marginData.marginAnalysis.currentMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-3 py-1 responsive-text font-medium rounded-full ${
                      marginData.marginAnalysis.status === 'danger' ? 'bg-red-100 text-red-800' :
                      marginData.marginAnalysis.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {marginData.marginAnalysis.status === 'danger' ? 'Danger' :
                       marginData.marginAnalysis.status === 'warning' ? 'Warning' : 'Safe'}
                    </span>
                  </div>
                  {marginData.marginAnalysis.suggestedPrice && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Suggested Price:</span>
                      <span className="ml-2 font-medium text-blue-600 text-lg">
                        ${marginData.marginAnalysis.suggestedPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowMarginAnalysis(false);
                  setMarginData(null);
                }}
                className="responsive-button bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestion Modal */}
      {showAiSuggestionModal && aiSuggestionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI Suggestion</h3>
              </div>
              <button
                onClick={() => {
                  setShowAiSuggestionModal(false);
                  setAiSuggestionData(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close AI suggestion"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="responsive-text font-medium text-gray-900 mb-2">Product Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{aiSuggestionData.product.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Price:</span>
                    <span className="ml-2 font-medium">${aiSuggestionData.product.currentPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Target Margin:</span>
                    <span className="ml-2 font-medium">
                      {aiSuggestionData.product.targetMargin ? `${aiSuggestionData.product.targetMargin}%` : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                 <h4 className="responsive-text font-medium text-gray-900 mb-2">Cost Analysis</h4>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="text-gray-600">Unit Cost:</span>
                     <span className="ml-2 font-medium">${aiSuggestionData.costAnalysis.unitCost.toFixed(2)}</span>
                   </div>
                   <div>
                     <span className="text-gray-600">Has Recipe:</span>
                     <span className={`ml-2 font-medium ${aiSuggestionData.costAnalysis.hasRecipe ? 'text-green-600' : 'text-gray-500'}`}>
                       {aiSuggestionData.costAnalysis.hasRecipe ? 'Yes' : 'No'}
                     </span>
                   </div>
                 </div>
               </div>

              {/* AI Suggestion */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="responsive-text font-medium text-gray-900 mb-2">AI Suggestion</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Suggested Price:</span>
                    <span className="ml-2 font-medium text-blue-600 text-lg">
                      ${aiSuggestionData.aiSuggestion.suggestedPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Note:</span>
                    <p className="ml-2 text-gray-600 text-sm">{aiSuggestionData.aiSuggestion.note}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Volatility Detected:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      aiSuggestionData.aiSuggestion.volatilityDetected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {aiSuggestionData.aiSuggestion.volatilityDetected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-2 font-medium">{aiSuggestionData.aiSuggestion.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price Difference:</span>
                    <span className="ml-2 font-medium">${aiSuggestionData.aiSuggestion.priceDifference.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Percentage Change:</span>
                    <span className="ml-2 font-medium">{aiSuggestionData.aiSuggestion.percentageChange.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Watchlist Update */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="responsive-text font-medium text-gray-900 mb-2">Watchlist Update</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Added to Watchlist:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      aiSuggestionData.watchlistUpdate.addedToWatchlist ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {aiSuggestionData.watchlistUpdate.addedToWatchlist ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <p className="ml-2 text-gray-600 text-sm">{aiSuggestionData.watchlistUpdate.reason}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowAiSuggestionModal(false);
                  setAiSuggestionData(null);
                }}
                className="responsive-button bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
};

export default VendorProductsPage; 
