import React, { useState } from 'react';
import { Edit, Trash2, Eye, AlertTriangle, Calendar, MapPin, Tag, Plus, Minus } from 'lucide-react';
import type { InventoryItem } from '../../hooks/useInventory';

interface InventoryItemCardProps {
  item: InventoryItem;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onQuickUpdate?: (id: string, newStock: number) => void;
  isDeleting?: boolean;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onView,
  onEdit,
  onDelete,
  onQuickUpdate,
  isDeleting = false
}) => {
  const [showQuickUpdate, setShowQuickUpdate] = useState(false);
  const [quickAmount, setQuickAmount] = useState(1);
  const isLowStock = item.currentStock <= item.reorderPoint;
  const isExpired = item.isExpired;

  const handleQuickAdd = () => {
    if (onQuickUpdate) {
      onQuickUpdate(item.id, item.currentStock + quickAmount);
      setShowQuickUpdate(false);
      setQuickAmount(1);
    }
  };

  const handleQuickSubtract = () => {
    if (onQuickUpdate) {
      const newStock = Math.max(0, item.currentStock - quickAmount);
      onQuickUpdate(item.id, newStock);
      setShowQuickUpdate(false);
      setQuickAmount(1);
    }
  };

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

  const getStockStatusColor = () => {
    if (isExpired) return 'text-red-600';
    if (isLowStock) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-6 flex flex-col transition-all duration-200 shadow-md ${
      isDeleting ? 'opacity-50' : ''
    }`} style={{ backgroundColor: '#F7F2EC' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex flex-col gap-1 ml-2">
          {isExpired && (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <Calendar className="h-3 w-3" />
              <span>Expired</span>
            </div>
          )}
          {isLowStock && !isExpired && (
            <div className="flex items-center gap-1 text-yellow-600 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>Low Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
          {item.category.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Stock Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Stock:</span>
          {showQuickUpdate ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={quickAmount}
                onChange={(e) => setQuickAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="1"
                aria-label="Quantity to add or remove"
                title="Quantity to add or remove"
              />
              <button
                onClick={handleQuickSubtract}
                className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                title="Remove stock"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                onClick={handleQuickAdd}
                className="p-1 bg-green-100 hover:bg-green-200 text-green-600 rounded transition-colors"
                title="Add stock"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => {
                  setShowQuickUpdate(false);
                  setQuickAmount(1);
                }}
                className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`font-medium ${getStockStatusColor()}`}>
                {item.currentStock} {item.unit}
              </span>
              {onQuickUpdate && (
                <button
                  onClick={() => setShowQuickUpdate(true)}
                  className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition-colors"
                  title="Quick update stock"
                >
                  <Edit className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Reorder Point:</span>
          <span className="font-medium text-gray-900">
            {item.reorderPoint} {item.unit}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Unit Price:</span>
          <span className="font-medium text-gray-900">
            ${item.unitPrice.toFixed(2)}/{item.unit}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Value:</span>
          <span className="font-medium text-gray-900">
            ${item.totalValue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-1 mb-4 text-xs text-gray-500">
        {item.supplier && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>Supplier: {item.supplier}</span>
          </div>
        )}
        
        {item.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Location: {item.location}</span>
          </div>
        )}
        
        {item.batch && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>Batch: {item.batch}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(item)}
          className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          disabled={isDeleting}
          aria-label={`View details for ${item.name}`}
        >
          <Eye className="h-4 w-4" />
          View
        </button>
        
        <button
          onClick={() => onEdit(item)}
          className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          disabled={isDeleting}
          aria-label={`Edit ${item.name}`}
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
        
        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          disabled={isDeleting}
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default InventoryItemCard;