import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckSquare,
  Square,
  Settings,
  Play,
  AlertCircle,
  CheckCircle,
  X,
  Filter,
  Search,
  Download,
  Upload,
  Loader2,
  Tag
} from 'lucide-react';
import type { Product } from '../../types/products';
import { ProductLabelProfileSelector } from './ProductLabelProfileSelector';

interface BulkUpdateRule {
  id: string;
  name: string;
  description: string;
  condition: 'all' | 'empty' | 'specific' | 'category';
}

interface BulkUpdateProgress {
  total: number;
  completed: number;
  failed: number;
  isRunning: boolean;
  errors: Array<{ productId: string; productName: string; error: string }>;
}

interface BulkLabelProfileUpdaterProps {
  products: Product[];
  onUpdateProducts: (updates: Array<{ productId: string; labelProfileId: string | undefined }>) => Promise<void>;
  onClose: () => void;
  className?: string;
}

const BULK_UPDATE_RULES: BulkUpdateRule[] = [
  {
    id: 'all',
    name: 'Update All Products',
    description: 'Update label profile for all selected products, overwriting existing profiles'
  },
  {
    id: 'empty',
    name: 'Only Empty Profiles',
    description: 'Only update products that currently have no label profile assigned'
  },
  {
    id: 'specific',
    name: 'Replace Specific Profile',
    description: 'Only update products that currently use a specific label profile'
  },
  {
    id: 'category',
    name: 'By Category',
    description: 'Update products in specific categories only'
  }
];

export const BulkLabelProfileUpdater: React.FC<BulkLabelProfileUpdaterProps> = ({
  products,
  onUpdateProducts,
  onClose,
  className = ''
}) => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedRule, setSelectedRule] = useState<string>('all');
  const [targetProfileId, setTargetProfileId] = useState<string | undefined>(undefined);
  const [specificProfileId, setSpecificProfileId] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState<BulkUpdateProgress | null>(null);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  // Calculate affected products based on current rule
  const getAffectedProducts = (): Product[] => {
    const selected = Array.from(selectedProducts)
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as Product[];

    switch (selectedRule) {
      case 'all':
        return selected;
      case 'empty':
        return selected.filter(p => !p.labelProfileId);
      case 'specific':
        return selected.filter(p => p.labelProfileId === specificProfileId);
      case 'category':
        return selected.filter(p => p.category === selectedCategory);
      default:
        return [];
    }
  };

  const affectedProducts = getAffectedProducts();

  // Select/deselect all products
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Toggle individual product selection
  const handleProductToggle = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  // Execute bulk update
  const handleExecuteUpdate = async () => {
    if (affectedProducts.length === 0 || !targetProfileId) return;

    setProgress({
      total: affectedProducts.length,
      completed: 0,
      failed: 0,
      isRunning: true,
      errors: []
    });

    const updates = affectedProducts.map(product => ({
      productId: product.id,
      labelProfileId: targetProfileId
    }));

    try {
      await onUpdateProducts(updates);
      
      setProgress(prev => prev ? {
        ...prev,
        completed: prev.total,
        isRunning: false
      } : null);

      // Auto-close after successful update
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setProgress(prev => prev ? {
        ...prev,
        failed: prev.total,
        isRunning: false,
        errors: [{
          productId: 'bulk',
          productName: 'Bulk Update',
          error: error instanceof Error ? error.message : 'Unknown error'
        }]
      } : null);
    }
  };

  const canExecute = affectedProducts.length > 0 && targetProfileId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bulk Label Profile Update</h2>
                <p className="text-sm text-gray-600">Update label profiles for multiple products</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Product Selection */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Select Products</h3>
              
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-sm"
                />
              </div>

              {/* Select All */}
              <label className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Select all ({filteredProducts.length} products)</span>
              </label>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredProducts.map(product => (
                  <label
                    key={product.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>${product.price}</span>
                        {product.category && (
                          <>
                            <span>•</span>
                            <span>{product.category}</span>
                          </>
                        )}
                        {product.labelProfileId && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>Has Label</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Update Configuration */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Update Configuration</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Update Rule Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Rule
                </label>
                <div className="space-y-2">
                  {BULK_UPDATE_RULES.map(rule => (
                    <label
                      key={rule.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="updateRule"
                        value={rule.id}
                        checked={selectedRule === rule.id}
                        onChange={(e) => setSelectedRule(e.target.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{rule.name}</div>
                        <div className="text-sm text-gray-600">{rule.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rule-specific options */}
              {selectedRule === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Replace This Profile
                  </label>
                  <ProductLabelProfileSelector
                    selectedProfileId={specificProfileId}
                    onProfileSelect={setSpecificProfileId}
                    showPreview={false}
                  />
                </div>
              )}

              {selectedRule === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Label Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Label Profile
                </label>
                <ProductLabelProfileSelector
                  selectedProfileId={targetProfileId}
                  onProfileSelect={setTargetProfileId}
                  showPreview={false}
                />
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-medium text-blue-900 mb-1">Update Summary</div>
                <div className="text-sm text-blue-800">
                  {selectedProducts.size} products selected • {affectedProducts.length} will be updated
                </div>
                {affectedProducts.length > 0 && (
                  <div className="text-xs text-blue-600 mt-2">
                    Products: {affectedProducts.slice(0, 3).map(p => p.name).join(', ')}
                    {affectedProducts.length > 3 && ` and ${affectedProducts.length - 3} more`}
                  </div>
                )}
              </div>

              {/* Progress */}
              {progress && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Update Progress</span>
                    {progress.isRunning && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-brand-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {progress.completed} of {progress.total} completed
                    {progress.failed > 0 && (
                      <span className="text-red-600 ml-2">({progress.failed} failed)</span>
                    )}
                  </div>

                  {progress.errors.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      {progress.errors.slice(0, 3).map((error, index) => (
                        <div key={index}>{error.productName}: {error.error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedProducts.size} products selected • {affectedProducts.length} will be updated
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={progress?.isRunning}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteUpdate}
                disabled={!canExecute || progress?.isRunning}
                className="px-4 py-2 bg-brand-green text-white rounded hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {progress?.isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Execute Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
