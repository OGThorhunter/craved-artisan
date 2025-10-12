import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface BulkItem {
  id: string;
  name: string;
  currentPrice: number;
  currentQuantity: number;
  bulkPrice: number;
  bulkQuantity: number;
  savings: number;
  savingsPercentage: number;
}

const JobCostEstimator: React.FC = () => {
  const [items, setItems] = useState<BulkItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    currentPrice: 0,
    currentQuantity: 1,
    bulkPrice: 0,
    bulkQuantity: 1
  });

  const calculateSavings = (item: Omit<BulkItem, 'id' | 'savings' | 'savingsPercentage'>) => {
    const currentCost = item.currentPrice * item.currentQuantity;
    const bulkCost = item.bulkPrice;
    const savings = currentCost - bulkCost;
    const savingsPercentage = currentCost > 0 ? (savings / currentCost) * 100 : 0;
    
    return {
      savings: Math.max(0, savings),
      savingsPercentage: Math.max(0, savingsPercentage)
    };
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.currentPrice > 0 && newItem.bulkPrice > 0) {
      const savings = calculateSavings(newItem);
      const item: BulkItem = {
        id: Date.now().toString(),
        ...newItem,
        ...savings
      };
      setItems([...items, item]);
      setNewItem({
        name: '',
        currentPrice: 0,
        currentQuantity: 1,
        bulkPrice: 0,
        bulkQuantity: 1
      });
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalSavings = items.reduce((sum, item) => sum + item.savings, 0);
  const averageSavings = items.length > 0 ? totalSavings / items.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            Job Cost Estimator
          </h2>
          <p className="text-gray-600 mt-1">
            Calculate savings from bulk purchases and optimize your inventory costs
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-green-600">${totalSavings.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Analyzed</p>
              <p className="text-2xl font-bold text-blue-600">{items.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Savings</p>
              <p className="text-2xl font-bold text-purple-600">${averageSavings.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Add New Item Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Item for Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Organic Flour"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={newItem.currentPrice}
              onChange={(e) => setNewItem({...newItem, currentPrice: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Qty</label>
            <input
              type="number"
              value={newItem.currentQuantity}
              onChange={(e) => setNewItem({...newItem, currentQuantity: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={newItem.bulkPrice}
              onChange={(e) => setNewItem({...newItem, bulkPrice: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleAddItem} className="w-full">
              Add Item
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      {items.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Purchase Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulk Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(item.currentPrice * item.currentQuantity).toFixed(2)}
                      <div className="text-xs text-gray-500">
                        ${item.currentPrice.toFixed(2)} × {item.currentQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.bulkPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${item.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.savings > 0 ? '+' : ''}${item.savings.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${item.savingsPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.savingsPercentage > 0 ? '+' : ''}{item.savingsPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {items.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {items.filter(item => item.savingsPercentage > 20).length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>High Savings Alert:</strong> {items.filter(item => item.savingsPercentage > 20).length} items show over 20% savings with bulk purchases.
                </p>
              </div>
            )}
            
            {items.filter(item => item.savings < 0).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Cost Increase Warning:</strong> {items.filter(item => item.savings < 0).length} items would cost more in bulk. Review quantities.
                </p>
              </div>
            )}
            
            {totalSavings > 100 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Bulk Purchase Opportunity:</strong> You could save over ${totalSavings.toFixed(2)} by purchasing these items in bulk.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JobCostEstimator;




















