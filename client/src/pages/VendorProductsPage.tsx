import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Package, Tag, DollarSign, FileText, Edit, Trash2, Eye, X, Image as ImageIcon, Brain, AlertTriangle, RefreshCw, Search, Filter, Grid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';

// Types
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
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
}

// API functions
const fetchProducts = async (): Promise<{ products: Product[]; count: number }> => {
  try {
    const response = await axios.get('/api/vendor/products', {
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to view your products');
    }
    throw new Error(error.response?.data?.message || 'Failed to load products');
  }
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

const VendorProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);

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
    staleTime: 5 * 60 * 1000,
  });

  // Filter and search products
  const filteredProducts = React.useMemo(() => {
    if (!productsData?.products) return [];
    
    let filtered = productsData.products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterAvailable !== null) {
      filtered = filtered.filter(product => product.isAvailable === filterAvailable);
    }
    
    return filtered;
  }, [productsData?.products, searchTerm, filterAvailable]);

  // React Query mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
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

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      setShowAddForm(false);
      setEditing(null);
      reset();
      setTags([]);
      setImagePreview('');
      setTagInput('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
    }
  });

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

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
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
      recipeId: ''
    }
  });

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
    reset({
      ...product,
      tags: '',
      targetMargin: product.targetMargin || 0,
      recipeId: product.recipeId || ''
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

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
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
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={filterAvailable === null ? 'all' : filterAvailable.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterAvailable(value === 'all' ? null : value === 'true');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="true">Available Only</option>
                  <option value="false">Unavailable Only</option>
                </select>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                        minLength: { value: 1, message: 'Name must be at least 1 character' }
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    {...register('imageUrl')}
                    onChange={(e) => setImagePreview(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
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
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

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
                  Your Products ({filteredProducts.length} of {productsData?.count || 0})
                </h2>
                <button
                  onClick={() => refetch()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterAvailable !== null ? 'No products found' : 'No products yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterAvailable !== null 
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first artisan product to showcase your work.'
                  }
                </p>
                {!searchTerm && filterAvailable === null && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'divide-y divide-gray-200'}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={viewMode === 'grid' ? 'bg-gray-50 rounded-lg p-4' : 'p-6 hover:bg-gray-50 transition-colors'}>
                    <div className={viewMode === 'grid' ? 'space-y-3' : 'flex items-start justify-between'}>
                      <div className={viewMode === 'grid' ? 'space-y-3' : 'flex-1'}>
                        <div className={viewMode === 'grid' ? 'space-y-3' : 'flex items-center gap-4'}>
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className={viewMode === 'grid' ? 'w-full h-48 object-cover rounded-lg' : 'w-16 h-16 object-cover rounded-lg'}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className={viewMode === 'grid' ? 'space-y-2' : 'flex-1'}>
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
                            </div>

                            {product.description && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {product.description}
                              </p>
                            )}

                            {product.tags && product.tags.length > 0 && (
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
                            )}

                            <div className="text-xs text-gray-500">
                              Created: {formatDate(product.createdAt)}
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => startEdit(product)}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
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
                onClick={() => setDeleteConfirm({ show: false, product: null })}
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

export default VendorProductsPage; 
