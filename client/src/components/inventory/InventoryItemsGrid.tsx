import React from 'react';
import { Package, Search } from 'lucide-react';
import type { InventoryItem } from '../../hooks/useInventory';
import InventoryItemCard from './InventoryItemCard';

interface InventoryItemsGridProps {
  items: InventoryItem[];
  isLoading?: boolean;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  deletingId?: string;
}

const InventoryItemsGrid: React.FC<InventoryItemsGridProps> = ({
  items,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  deletingId
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse shadow-md" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Get started by adding your first inventory item. You can track stock levels, 
            manage suppliers, and monitor expiration dates.
          </p>
          <button
            onClick={() => onEdit({} as InventoryItem)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="h-4 w-4" />
            Add Your First Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === item.id}
        />
      ))}
    </div>
  );
};

export default InventoryItemsGrid;

