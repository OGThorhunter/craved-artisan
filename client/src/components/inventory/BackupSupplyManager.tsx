import React, { useState } from 'react';
import { Shield, AlertTriangle, Package, TrendingUp, DollarSign, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface BackupItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  normalStock: number;
  backupPercentage: number; // percentage above normal stock
  backupQuantity: number; // calculated backup amount
  lastUpdated: string;
  riskLevel: 'low' | 'medium' | 'high';
  costPerUnit: number;
  totalBackupValue: number;
}

interface EmergencyScenario {
  id: string;
  name: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  affectedItems: string[];
  mitigation: string;
}

const BackupSupplyManager: React.FC = () => {
  const [backupItems, setBackupItems] = useState<BackupItem[]>([
    {
      id: '1',
      name: 'Organic Bread Flour',
      category: 'Flour',
      currentStock: 50,
      normalStock: 25,
      backupPercentage: 100, // 100% extra
      backupQuantity: 25,
      lastUpdated: '2024-01-15',
      riskLevel: 'high',
      costPerUnit: 2.50,
      totalBackupValue: 62.50
    },
    {
      id: '2',
      name: 'Active Dry Yeast',
      category: 'Yeast',
      currentStock: 15,
      normalStock: 10,
      backupPercentage: 50, // 50% extra
      backupQuantity: 5,
      lastUpdated: '2024-01-14',
      riskLevel: 'medium',
      costPerUnit: 0.15,
      totalBackupValue: 0.75
    },
    {
      id: '3',
      name: 'Sea Salt',
      category: 'Seasoning',
      currentStock: 8,
      normalStock: 5,
      backupPercentage: 60, // 60% extra
      backupQuantity: 3,
      lastUpdated: '2024-01-16',
      riskLevel: 'low',
      costPerUnit: 0.25,
      totalBackupValue: 0.75
    },
    {
      id: '4',
      name: 'Olive Oil',
      category: 'Oil',
      currentStock: 12,
      normalStock: 8,
      backupPercentage: 50, // 50% extra
      backupQuantity: 4,
      lastUpdated: '2024-01-13',
      riskLevel: 'medium',
      costPerUnit: 1.20,
      totalBackupValue: 4.80
    }
  ]);

  const [emergencyScenarios] = useState<EmergencyScenario[]>([
    {
      id: '1',
      name: 'Flour Contamination',
      description: 'Bad batch of flour received from supplier',
      probability: 'medium',
      impact: 'high',
      affectedItems: ['Organic Bread Flour', 'Whole Wheat Flour'],
      mitigation: 'Maintain 2-week backup supply of flour from different suppliers'
    },
    {
      id: '2',
      name: 'Starter Failure',
      description: 'Sourdough starter dies or becomes contaminated',
      probability: 'low',
      impact: 'high',
      affectedItems: ['Sourdough Starter', 'Flour'],
      mitigation: 'Keep frozen backup starter and emergency yeast supply'
    },
    {
      id: '3',
      name: 'Supplier Delay',
      description: 'Primary supplier has shipping delays',
      probability: 'high',
      impact: 'medium',
      affectedItems: ['All ingredients'],
      mitigation: 'Maintain 1-week backup supply of critical ingredients'
    }
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    normalStock: 0,
    backupPercentage: 50,
    costPerUnit: 0
  });

  const calculateBackupQuantity = (normalStock: number, percentage: number) => {
    return Math.ceil((normalStock * percentage) / 100);
  };

  const calculateTotalValue = (quantity: number, costPerUnit: number) => {
    return quantity * costPerUnit;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.category && newItem.normalStock > 0) {
      const backupQuantity = calculateBackupQuantity(newItem.normalStock, newItem.backupPercentage);
      const totalBackupValue = calculateTotalValue(backupQuantity, newItem.costPerUnit);
      
      const item: BackupItem = {
        id: Date.now().toString(),
        name: newItem.name,
        category: newItem.category,
        currentStock: newItem.normalStock + backupQuantity,
        normalStock: newItem.normalStock,
        backupPercentage: newItem.backupPercentage,
        backupQuantity,
        lastUpdated: new Date().toISOString().split('T')[0],
        riskLevel: newItem.backupPercentage > 75 ? 'low' : newItem.backupPercentage > 50 ? 'medium' : 'high',
        costPerUnit: newItem.costPerUnit,
        totalBackupValue
      };
      
      setBackupItems([...backupItems, item]);
      setNewItem({
        name: '',
        category: '',
        normalStock: 0,
        backupPercentage: 50,
        costPerUnit: 0
      });
    }
  };

  const handleRemoveItem = (id: string) => {
    setBackupItems(backupItems.filter(item => item.id !== id));
  };

  const totalBackupValue = backupItems.reduce((sum, item) => sum + item.totalBackupValue, 0);
  const highRiskItems = backupItems.filter(item => item.riskLevel === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-600" />
            Backup Supply Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage emergency backup supplies to protect against ingredient failures and supplier issues
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Backup Value</p>
              <p className="text-2xl font-bold text-green-600">${totalBackupValue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Protected</p>
              <p className="text-2xl font-bold text-blue-600">{backupItems.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Items</p>
              <p className="text-2xl font-bold text-red-600">{highRiskItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Backup %</p>
              <p className="text-2xl font-bold text-purple-600">
                {backupItems.length > 0 ? Math.round(backupItems.reduce((sum, item) => sum + item.backupPercentage, 0) / backupItems.length) : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Emergency Scenarios */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Emergency Scenarios & Mitigation</h3>
        </div>
        <div className="space-y-4">
          {emergencyScenarios.map((scenario) => (
            <div key={scenario.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{scenario.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Mitigation:</strong> {scenario.mitigation}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      Affects: {scenario.affectedItems.join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(scenario.probability)}`}>
                    {scenario.probability} probability
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(scenario.impact)}`}>
                    {scenario.impact} impact
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add New Backup Item */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Backup Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Organic Flour"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Flour"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Normal Stock</label>
            <input
              type="number"
              value={newItem.normalStock}
              onChange={(e) => setNewItem({...newItem, normalStock: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Backup %</label>
            <input
              type="number"
              value={newItem.backupPercentage}
              onChange={(e) => setNewItem({...newItem, backupPercentage: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="50"
            />
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleAddItem} className="w-full">
              Add Item
            </Button>
          </div>
        </div>
      </Card>

      {/* Backup Items Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Backup Supply Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backup Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backup %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backup Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backupItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.normalStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.backupQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.backupPercentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>
                      {item.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.totalBackupValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Update Backup Levels
        </Button>
        <Button variant="secondary" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Generate Order List
        </Button>
        <Button variant="secondary" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          View Cost Analysis
        </Button>
      </div>
    </div>
  );
};

export default BackupSupplyManager;




