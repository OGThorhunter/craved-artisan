import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Eye, EyeOff, Package, Tag, DollarSign, Users, Hash, Check, ShoppingCart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { WindowProduct } from '../../types/sales-windows';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
  productType?: 'food' | 'service' | 'non-food';
  onWatchlist: boolean;
  lastAiSuggestion?: number;
  aiSuggestionNote?: string;
  createdAt: string;
  updatedAt: string;
  vendorProfileId: string;
}

interface ProductSelectionStepProps {
  selectedProducts: WindowProduct[];
  onProductsChange: (products: WindowProduct[]) => void;
  onCreateBatchOrders?: (products: Array<{product: WindowProduct, quantity: number}>) => void;
}

const ProductSelectionStep: React.FC<ProductSelectionStepProps> = ({
  selectedProducts,
  onProductsChange,
  onCreateBatchOrders
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyInStock, setShowOnlyInStock] = useState(true);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [showBatchOrderModal, setShowBatchOrderModal] = useState(false);

  // Fetch vendor products
  const { data: vendorProducts = [], isLoading, error } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const response = await axios.get('/api/vendor/products');
      return response.data;
    }
  });

  // Filter products based on search and filters
  const getFilteredProducts = () => {
    let filtered = vendorProducts.filter(p => p.isAvailable);

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.productType === selectedCategory);
    }

    if (showOnlyInStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    return filtered;
  };

  const addProduct = (product: Product) => {
    const existingProduct = selectedProducts.find(p => p.productId === product.id);
    if (existingProduct) {
      toast.error('Product already added to this sales window');
      return;
    }

    const newWindowProduct: WindowProduct = {
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      tags: product.tags,
      stock: product.stock,
      isAvailable: product.isAvailable,
      targetMargin: product.targetMargin,
      recipeId: product.recipeId,
      productType: product.productType,
      onWatchlist: product.onWatchlist,
      lastAiSuggestion: product.lastAiSuggestion,
      aiSuggestionNote: product.aiSuggestionNote,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      vendorProfileId: product.vendorProfileId,
      priceOverride: product.price,
      perOrderLimit: 5,
      totalCap: product.stock,
      isVisible: true,
      currentStock: product.stock
    };

    onProductsChange([...selectedProducts, newWindowProduct]);
    setProductQuantities(prev => ({ ...prev, [product.id]: 1 }));
    toast.success(`${product.name} added to sales window`);
  };

  const removeProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter(p => p.productId !== productId));
    setProductQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setProductQuantities(prev => ({ ...prev, [productId]: Math.max(1, quantity) }));
  };

  const handleCreateBatchOrders = () => {
    const productsWithQuantities = selectedProducts
      .filter(product => productQuantities[product.productId] > 0)
      .map(product => ({
        product,
        quantity: productQuantities[product.productId] || 1
      }));

    if (productsWithQuantities.length === 0) {
      toast.error('Please select products and quantities for batch orders');
      return;
    }

    if (onCreateBatchOrders) {
      onCreateBatchOrders(productsWithQuantities);
      toast.success(`Created ${productsWithQuantities.length} batch orders`);
    } else {
      toast.success(`Would create ${productsWithQuantities.length} batch orders`);
    }
  };

  const updateProduct = (productId: string, field: keyof WindowProduct, value: any) => {
    const updatedProducts = selectedProducts.map(p => 
      p.productId === productId ? { ...p, [field]: value } : p
    );
    onProductsChange(updatedProducts);
  };

  const getCategories = () => {
    const categories = [...new Set(vendorProducts.map(p => p.productType).filter(Boolean))];
    return categories.sort();
  };

  const filteredProducts = getFilteredProducts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-red-600">
          <Package className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <p>Failed to load products. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Package className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">
            Select products to include in this sales window. You can customize pricing, limits, and visibility for each product.
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="category-filter" className="sr-only">Filter by category</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOnlyInStock}
              onChange={(e) => setShowOnlyInStock(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">In stock only</span>
          </label>
        </div>
      </div>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const isSelected = selectedProducts.some(p => p.productId === product.id);
          return (
            <div
              key={product.id}
              className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
              onClick={() => isSelected ? removeProduct(product.id) : addProduct(product)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${
                    isSelected ? 'text-green-900' : 'text-gray-900'
                  }`}>{product.name}</h4>
                  {product.description && (
                    <p className={`text-xs mt-1 line-clamp-2 ${
                      isSelected ? 'text-green-700' : 'text-gray-600'
                    }`}>{product.description}</p>
                  )}
                </div>
                {isSelected ? (
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <Check className="h-3 w-3" />
                    Added
                  </div>
                ) : (
                  <Plus className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                )}
              </div>
              
              <div className={`flex items-center justify-between text-xs ${
                isSelected ? 'text-green-600' : 'text-gray-600'
              }`}>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${product.price.toFixed(2)}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {product.stock} in stock
                </span>
              </div>
              
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isSelected 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {product.tags.length > 3 && (
                    <span className={`text-xs ${
                      isSelected ? 'text-green-500' : 'text-gray-500'
                    }`}>+{product.tags.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No products found matching your criteria.</p>
        </div>
      )}

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Selected Products ({selectedProducts.length})
          </h4>
          
          <div className="space-y-4">
            {selectedProducts.map((product) => (
              <div key={product.productId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{product.name}</h5>
                    <p className="text-sm text-gray-600">Base price: ${vendorProducts.find(p => p.id === product.productId)?.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeProduct(product.productId)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove product"
                    aria-label="Remove product"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Price Override */}
                  <div>
                    <label htmlFor={`price-${product.productId}`} className="block text-xs font-medium text-gray-700 mb-1">
                      Price Override ($)
                    </label>
                    <input
                      id={`price-${product.productId}`}
                      type="number"
                      step="0.01"
                      value={product.priceOverride || ''}
                      onChange={(e) => updateProduct(product.productId, 'priceOverride', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Per Order Limit */}
                  <div>
                    <label htmlFor={`limit-${product.productId}`} className="block text-xs font-medium text-gray-700 mb-1">
                      Per Order Limit
                    </label>
                    <input
                      id={`limit-${product.productId}`}
                      type="number"
                      min="1"
                      value={product.perOrderLimit || ''}
                      onChange={(e) => updateProduct(product.productId, 'perOrderLimit', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>

                  {/* Total Cap */}
                  <div>
                    <label htmlFor={`cap-${product.productId}`} className="block text-xs font-medium text-gray-700 mb-1">
                      Total Cap
                    </label>
                    <input
                      id={`cap-${product.productId}`}
                      type="number"
                      min="1"
                      max={product.currentStock}
                      value={product.totalCap || ''}
                      onChange={(e) => updateProduct(product.productId, 'totalCap', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-end">
                    <button
                      onClick={() => updateProduct(product.productId, 'isVisible', !product.isVisible)}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                        product.isVisible
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {product.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {product.isVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Quantity Selection for Batch Orders */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <label htmlFor={`quantity-${product.productId}`} className="text-sm font-medium text-gray-700">
                        Batch Order Quantity:
                      </label>
                      <input
                        id={`quantity-${product.productId}`}
                        type="number"
                        min="1"
                        max={product.currentStock}
                        value={productQuantities[product.productId] || 1}
                        onChange={(e) => updateQuantity(product.productId, Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                      />
                      <span className="text-sm text-gray-500">
                        (Max: {product.currentStock})
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: ${((productQuantities[product.productId] || 1) * (product.priceOverride || product.price)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Batch Order Creation */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Create Batch Orders</h4>
                <p className="text-sm text-gray-600">
                  Generate individual orders for each product with selected quantities
                </p>
              </div>
              <button
                onClick={handleCreateBatchOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Create Batch Orders</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelectionStep;
