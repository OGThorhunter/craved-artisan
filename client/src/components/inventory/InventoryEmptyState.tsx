import React from 'react';
import { Package, Plus, Upload, Search, Brain } from 'lucide-react';
import Button from '../ui/Button';

interface InventoryEmptyStateProps {
  type: 'no-items' | 'no-results' | 'no-insights';
  onAddItem?: () => void;
  onImport?: () => void;
  onClearFilters?: () => void;
}

const InventoryEmptyState: React.FC<InventoryEmptyStateProps> = ({
  type,
  onAddItem,
  onImport,
  onClearFilters,
}) => {
  if (type === 'no-items') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-[#333] mb-2">No inventory items yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start building your inventory by adding items manually, importing from CSV, or scanning receipts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAddItem && (
            <Button
              onClick={onAddItem}
              className="flex items-center gap-2 bg-[#7F232E] hover:bg-[#7F232E]/90"
            >
              <Plus className="w-4 h-4" />
              Add Your First Item
            </Button>
          )}
          {onImport && (
            <Button
              onClick={onImport}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import from CSV
            </Button>
          )}
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>💡 <strong>Pro tip:</strong> Use the receipt scanner to quickly add multiple items at once!</p>
        </div>
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-[#333] mb-2">No items found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          No inventory items match your current search and filter criteria. Try adjusting your filters or search terms.
        </p>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="secondary"
            className="flex items-center gap-2"
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  if (type === 'no-insights') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-[#333] mb-2">No AI insights available</h3>
        <p className="text-gray-600 text-sm mb-4">
          Add items and set up price watches to get AI recommendations for restocking and cost optimization.
        </p>
        <div className="text-xs text-gray-500">
          <p>Insights include:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Restock alerts for low inventory</li>
            <li>Price watch hits from B2B marketplace</li>
            <li>Seasonal build-up recommendations</li>
            <li>Shortfall warnings for upcoming orders</li>
          </ul>
        </div>
      </div>
    );
  }

  return null;
};

export default InventoryEmptyState;
