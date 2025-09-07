import React from 'react';
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  ShoppingCart,
  MapPin,
  Calendar,
  Hash
} from 'lucide-react';
import AIInsightBadge from './AIInsightBadge';
import type { AIInsight } from '../../types/inventory';

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'used_goods';
  unit: string;
  currentStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier?: string;
  isAvailable: boolean;
  expirationDate?: string;
  batchNumber?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onView?: (item: InventoryItem) => void;
  onReorder?: (item: InventoryItem) => void;
  onStockAdjustment?: (item: InventoryItem) => void;
  onInsightAction?: (insight: AIInsight) => void;
  onDismissInsight?: (insightId: string) => void;
  showAlerts?: boolean;
  showAIInsights?: boolean;
  aiInsights?: AIInsight[];
  className?: string;
}

export default function InventoryItemCard({
  item,
  onEdit,
  onDelete,
  onView,
  onReorder,
  onStockAdjustment,
  onInsightAction,
  onDismissInsight,
  showAlerts = true,
  showAIInsights = true,
  aiInsights = [],
  className = ''
}: InventoryItemCardProps) {
  
  // Calculate alerts
  const isLowStock = item.currentStock <= item.reorderPoint;
  const isExpiringSoon = item.expirationDate && 
    new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isExpired = item.expirationDate && new Date(item.expirationDate) <= new Date();
  
  const daysUntilExpiration = item.expirationDate ? 
    Math.ceil((new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food_grade':
        return 'bg-green-100 text-green-700';
      case 'raw_materials':
        return 'bg-blue-100 text-blue-700';
      case 'packaging':
        return 'bg-purple-100 text-purple-700';
      case 'used_goods':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food_grade':
        return <Package className="w-4 h-4" />;
      case 'raw_materials':
        return <Package className="w-4 h-4" />;
      case 'packaging':
        return <Package className="w-4 h-4" />;
      case 'used_goods':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getAlertBadge = () => {
    if (isExpired) {
      return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          EXPIRED
        </div>
      );
    }
    if (isExpiringSoon && daysUntilExpiration !== null) {
      return (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          EXPIRES {daysUntilExpiration}d
        </div>
      );
    }
    if (isLowStock) {
      return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          LOW STOCK
        </div>
      );
    }
    return null;
  };

  const getCardBorderColor = () => {
    if (isExpired) return 'border-red-300 bg-red-50';
    if (isExpiringSoon) return 'border-orange-300 bg-orange-50';
    if (isLowStock) return 'border-red-300 bg-red-50';
    return 'border-gray-200 bg-white';
  };

  const getStockColor = () => {
    if (isLowStock) return 'text-red-600';
    if (item.currentStock <= item.reorderPoint * 1.5) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className={`relative bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${getCardBorderColor()} ${className}`}>
      {showAlerts && getAlertBadge()}
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            )}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                {getCategoryIcon(item.category)}
                {item.category.replace('_', ' ')}
              </span>
              {item.location && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
            <p className={`text-xl font-bold ${getStockColor()}`}>
              {item.currentStock} {item.unit}
            </p>
            <p className="text-xs text-gray-500">
              Reorder at: {item.reorderPoint} {item.unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-xl font-bold text-gray-900">
              ${(item.currentStock * item.costPerUnit).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              ${item.costPerUnit.toFixed(2)} per {item.unit}
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-2 mb-4">
          {item.supplier && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Supplier:</span>
              <span>{item.supplier}</span>
            </div>
          )}
          {item.batchNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="w-3 h-3" />
              <span>Batch: {item.batchNumber}</span>
            </div>
          )}
          {item.expirationDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-3 h-3" />
              <span className={isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                Expires: {new Date(item.expirationDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Alert Messages */}
        {showAlerts && (
          <div className="mb-4 space-y-2">
            {isLowStock && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Stock is below reorder point. Consider reordering soon.
                </span>
              </div>
            )}
            {isExpiringSoon && !isExpired && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700">
                  Expires in {daysUntilExpiration} days. Use or dispose soon.
                </span>
              </div>
            )}
            {isExpired && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">
                  This item has expired. Remove from inventory.
                </span>
              </div>
            )}
          </div>
        )}

        {/* AI Insights */}
        {showAIInsights && aiInsights.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600">AI Insights:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiInsights.slice(0, 2).map((insight) => (
                <AIInsightBadge
                  key={insight.id}
                  insight={insight}
                  onDismiss={onDismissInsight}
                  onAction={onInsightAction}
                />
              ))}
              {aiInsights.length > 2 && (
                <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  +{aiInsights.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onView && (
              <button
                onClick={() => onView(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-sm"
                title="View details"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors text-sm"
                title="Edit item"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onStockAdjustment && (
              <button
                onClick={() => onStockAdjustment(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors text-sm"
                title="Adjust stock"
              >
                <TrendingUp className="w-4 h-4" />
                Adjust
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isLowStock && onReorder && (
              <button
                onClick={() => onReorder(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors text-sm font-medium"
                title="Reorder item"
              >
                <ShoppingCart className="w-4 h-4" />
                Reorder
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors text-sm"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
