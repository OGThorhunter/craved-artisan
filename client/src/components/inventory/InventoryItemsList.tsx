import React from 'react';
import { Edit, Trash2, Eye, AlertTriangle, Calendar, MapPin, Tag, Package } from 'lucide-react';
import type { InventoryItem } from '../../hooks/useInventory';
import DuplicateIndicator from './DuplicateIndicator';

interface InventoryItemsListProps {
  items: InventoryItem[];
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onCombineDuplicates?: (item: InventoryItem) => void;
  deletingId?: string;
  isLoading?: boolean;
  getDuplicateInfo?: (item: InventoryItem) => { count: number; confidence: number } | null;
}

const InventoryItemsList: React.FC<InventoryItemsListProps> = ({
  items,
  onView,
  onEdit,
  onDelete,
  onCombineDuplicates,
  deletingId,
  isLoading = false,
  getDuplicateInfo
}) => {
  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-12 text-center shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
        <p className="text-gray-500">Get started by adding your first inventory item.</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food_grade':
        return 'bg-green-100 text-green-800';
      case 'raw_materials':
        return 'bg-blue-100 text-blue-800';
      case 'packaging':
        return 'bg-purple-100 text-purple-800';
      case 'equipment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.isExpired) {
      return { color: 'text-red-600', icon: AlertTriangle, text: 'Expired' };
    }
    if (item.currentStock <= item.reorderPoint) {
      return { color: 'text-yellow-600', icon: AlertTriangle, text: 'Low Stock' };
    }
    return { color: 'text-green-600', icon: Package, text: 'In Stock' };
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Item</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Stock</div>
          <div className="col-span-2">Value</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-200">
        {items.map((item) => {
          const stockStatus = getStockStatus(item);
          const StatusIcon = stockStatus.icon;
          const isDeleting = deletingId === item.id;

          return (
            <div
              key={item.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                isDeleting ? 'opacity-50' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Item Info */}
                <div className="col-span-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">by {item.supplier}</span>
                        {item.batch && (
                          <span className="text-xs text-gray-400">• {item.batch}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Stock */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className={`text-xs ${stockStatus.color}`}>
                        {stockStatus.text}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-900">
                    ${item.totalValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${item.unitPrice.toFixed(2)}/{item.unit}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    {/* Duplicate Indicator */}
                    {getDuplicateInfo && getDuplicateInfo(item) && (
                      <DuplicateIndicator
                        confidence={getDuplicateInfo(item)!.confidence}
                        duplicateCount={getDuplicateInfo(item)!.count}
                        onClick={() => onCombineDuplicates?.(item)}
                        compact={true}
                      />
                    )}
                    
                    <button
                      onClick={() => onView(item)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit item"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      disabled={isDeleting}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info Row */}
              <div className="mt-2 grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {item.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    {item.expiryDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-8">
                  {item.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryItemsList;
