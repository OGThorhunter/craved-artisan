import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Package, Tag, DollarSign, FileText, Edit, Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';
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
  createdAt: string;
  updatedAt: string;
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
    stock: Number(productData.stock)
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
    stock: Number(productData.stock)
  }, {
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
      isAvailable: true
    }
  });

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
    reset({
      ...product,
      tags: '', // We'll use the tags state instead
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
      <div className="min-h-screen bg-gray-50 p-6">
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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
                 }
               }}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
             >
               <Plus className="h-4 w-4" />
               Add Product
             </button>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
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
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="handmade, artisan, wooden"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Separate tags with commas (e.g., handmade, artisan, wooden)
                </p>
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
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      reset();
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
                Your Products ({productsData?.count || 0})
              </h2>
              <button
                onClick={() => refetch()}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {productsData?.products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first artisan product to showcase your work.
              </p>
                             <button
                 onClick={() => {
                   setShowAddForm(true);
                   setEditing(null);
                   reset();
                 }}
                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">{formatPrice(product.price)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              <span>{product.stock} in stock</span>
                            </div>
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
  );
};

export default VendorProductsPage; 