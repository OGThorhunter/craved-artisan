import React from 'react';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';
import type { InventoryItem } from '../../hooks/useInventory';

interface InventoryOverviewCardsProps {
  items: InventoryItem[];
  isLoading?: boolean;
}

const InventoryOverviewCards: React.FC<InventoryOverviewCardsProps> = ({ 
  items, 
  isLoading = false 
}) => {
  // Calculate metrics
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.currentStock <= item.reorderPoint).length;
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
  const expiredItems = items.filter(item => item.isExpired).length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-4">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: Package,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      valueColor: 'text-gray-900'
    },
    {
      title: 'Low Stock',
      value: lowStockItems,
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      valueColor: lowStockItems > 0 ? 'text-yellow-600' : 'text-gray-900'
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      valueColor: 'text-gray-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.valueColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 ${card.iconBg} rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
            
            {/* Additional info for low stock */}
            {card.title === 'Low Stock' && lowStockItems > 0 && (
              <div className="mt-3 text-xs text-yellow-600">
                ⚠️ {lowStockItems} item{lowStockItems !== 1 ? 's' : ''} need{lowStockItems === 1 ? 's' : ''} restocking
              </div>
            )}
            
            {/* Additional info for expired items */}
            {card.title === 'Total Items' && expiredItems > 0 && (
              <div className="mt-3 text-xs text-red-600">
                🚨 {expiredItems} expired item{expiredItems !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InventoryOverviewCards;

