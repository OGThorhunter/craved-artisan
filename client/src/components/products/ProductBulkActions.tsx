import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Settings, 
  Tag, 
  Download, 
  Upload, 
  Trash2,
  CheckSquare
} from 'lucide-react';
import type { Product } from '../../types/products';
import { BulkLabelProfileUpdater } from './BulkLabelProfileUpdater';
import { executeBulkLabelUpdate } from '../../services/bulkLabelProfileService';

interface ProductBulkActionsProps {
  products: Product[];
  selectedProducts: string[];
  onProductsUpdated?: () => void;
  className?: string;
}

export const ProductBulkActions: React.FC<ProductBulkActionsProps> = ({
  products,
  selectedProducts,
  onProductsUpdated,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLabelUpdater, setShowLabelUpdater] = useState(false);

  const selectedCount = selectedProducts.length;
  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const handleBulkLabelUpdate = async (updates: Array<{ productId: string; labelProfileId: string | undefined }>) => {
    try {
      await executeBulkLabelUpdate(updates);
      onProductsUpdated?.();
    } catch (error) {
      console.error('Bulk update failed:', error);
      throw error; // Re-throw for the component to handle
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bulk Actions Trigger */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
      >
        <CheckSquare className="w-4 h-4" />
        <span>{selectedCount} selected</span>
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 mb-1">
                Bulk Actions ({selectedCount} items)
              </div>
              
              <button
                onClick={() => {
                  setShowLabelUpdater(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Tag className="w-4 h-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Update Label Profiles</div>
                  <div className="text-xs text-gray-500">Assign label profiles to selected products</div>
                </div>
              </button>

              <button
                onClick={() => {
                  // TODO: Implement bulk export
                  console.log('Bulk export products:', selectedProducts);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Download className="w-4 h-4 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">Export Selected</div>
                  <div className="text-xs text-gray-500">Download product data as CSV</div>
                </div>
              </button>

              <button
                onClick={() => {
                  // TODO: Implement bulk settings update
                  console.log('Bulk settings update:', selectedProducts);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium">Update Settings</div>
                  <div className="text-xs text-gray-500">Change status, categories, etc.</div>
                </div>
              </button>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${selectedCount} product(s)?`)) {
                      // TODO: Implement bulk delete
                      console.log('Bulk delete products:', selectedProducts);
                    }
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Delete Selected</div>
                    <div className="text-xs text-red-500">Permanently remove products</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Label Profile Updater Modal */}
      {showLabelUpdater && (
        <BulkLabelProfileUpdater
          products={selectedProductsData}
          onUpdateProducts={handleBulkLabelUpdate}
          onClose={() => setShowLabelUpdater(false)}
        />
      )}
    </div>
  );
};
