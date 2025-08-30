import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Search,
  Package,
  DollarSign,
  Tag,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';

// Simplified Product interface for Phase 1
interface SimpleProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  tags: string;
}

// API functions
const fetchProducts = async (): Promise<{ products: SimpleProduct[]; count: number }> => {
  const response = await api.get('/vendor/products');
  return response.data;
};

const createProduct = async (productData: CreateProductForm): Promise<{ message: string; product: SimpleProduct }> => {
  const tags = (productData.tags || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const response = await api.post('/vendor/products', {
    ...productData,
    tags,
    price: Number(productData.price),
    stock: Number(productData.stock)
  });
  return response.data;
};

const updateProduct = async (productData: CreateProductForm & { id: string }): Promise<{ message: string; product: SimpleProduct }> => {
  const tags = (productData.tags || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const response = await api.put(`/vendor/products/${productData.id}`, {
    ...productData,
    tags,
    price: Number(productData.price),
    stock: Number(productData.stock)
  });
  return response.data;
};

const SimpleVendorProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<SimpleProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; product: SimpleProduct | null }>({
    show: false,
    product: null
  });
  const [searchTerm, setSearchTerm] = useState('');

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
      stock: 0,
      imageUrl: '',
      tags: ''
    }
  });

  // Queries
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: fetchProducts
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
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

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
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

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vendor/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      setDeleteConfirm({ show: false, product: null });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    }
  });

  // Form handlers
  const onSubmit = (data: CreateProductForm) => {
    if (editing) {
      updateProductMutation.mutate({ ...data, id: editing.id });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product: SimpleProduct) => {
    setEditing(product);
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      tags: product.tags?.join(', ') || ''
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditing(null);
    reset();
  };

  // Filter products based on search
  const filteredProducts = productsData?.products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">Something went wrong while loading your products.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">Manage your product catalog and inventory</p>
          </div>
                            <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 sm:mt-0 bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors flex items-center gap-2"
                    aria-label="Add new product"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {product.stock} in stock
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{product.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${product.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${product.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ show: true, product })}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editing ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Product name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('price', { 
                          required: 'Price is required',
                          min: { value: 0, message: 'Price must be positive' }
                        })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('stock', { 
                        min: { value: 0, message: 'Stock cannot be negative' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
                    )}
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      {...register('imageUrl')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      {...register('tags')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-brand-green text-white px-4 py-2 rounded-md hover:bg-brand-green/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : (editing ? 'Update Product' : 'Create Product')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Product</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deleteConfirm.product?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, product: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm.product && deleteProductMutation.mutate(deleteConfirm.product.id)}
                  disabled={deleteProductMutation.isPending}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
};

export default SimpleVendorProductsPage;
