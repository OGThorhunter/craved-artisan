import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Save, 
  X,
  Plus,
  Minus,
  Calculator,
  Eye,
  EyeOff
} from 'lucide-react';

interface CashFlowItem {
  id: string;
  category: string;
  amount: number;
  type: 'operating' | 'investing' | 'financing';
  period: string;
  isEditable?: boolean;
}

interface CashFlowData {
  period: string;
  operating: number;
  investing: number;
  financing: number;
  netCashFlow: number;
  beginningBalance: number;
  endingBalance: number;
}

const InteractiveCashFlow = () => {
  const [viewMode, setViewMode] = useState<'direct' | 'indirect'>('direct');
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([
    { id: '1', category: 'Net Income', amount: 125000, type: 'operating', period: 'Q1 2024' },
    { id: '2', category: 'Depreciation', amount: 15000, type: 'operating', period: 'Q1 2024' },
    { id: '3', category: 'Accounts Receivable', amount: -25000, type: 'operating', period: 'Q1 2024' },
    { id: '4', category: 'Inventory', amount: -10000, type: 'operating', period: 'Q1 2024' },
    { id: '5', category: 'Equipment Purchase', amount: -50000, type: 'investing', period: 'Q1 2024' },
    { id: '6', category: 'Loan Proceeds', amount: 100000, type: 'financing', period: 'Q1 2024' },
    { id: '7', category: 'Dividend Payment', amount: -20000, type: 'financing', period: 'Q1 2024' },
  ]);

  // Generate cash flow data for chart
  const generateCashFlowData = (): CashFlowData[] => {
    const periods = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
    let balance = 50000; // Starting balance

    return periods.map((period, index) => {
      const operatingItems = cashFlowItems.filter(item => item.type === 'operating' && item.period === period);
      const investingItems = cashFlowItems.filter(item => item.type === 'investing' && item.period === period);
      const financingItems = cashFlowItems.filter(item => item.type === 'financing' && item.period === period);

      const operating = operatingItems.reduce((sum, item) => sum + item.amount, 0);
      const investing = investingItems.reduce((sum, item) => sum + item.amount, 0);
      const financing = financingItems.reduce((sum, item) => sum + item.amount, 0);
      const netCashFlow = operating + investing + financing;

      const beginningBalance = balance;
      balance += netCashFlow;
      const endingBalance = balance;

      return {
        period,
        operating,
        investing,
        financing,
        netCashFlow,
        beginningBalance,
        endingBalance
      };
    });
  };

  const cashFlowData = generateCashFlowData();

  // Calculate totals
  const totals = {
    operating: cashFlowItems.filter(item => item.type === 'operating').reduce((sum, item) => sum + item.amount, 0),
    investing: cashFlowItems.filter(item => item.type === 'investing').reduce((sum, item) => sum + item.amount, 0),
    financing: cashFlowItems.filter(item => item.type === 'financing').reduce((sum, item) => sum + item.amount, 0),
    net: cashFlowItems.reduce((sum, item) => sum + item.amount, 0)
  };

  const handleEditItem = (id: string, field: keyof CashFlowItem, value: any) => {
    setCashFlowItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addCashFlowItem = () => {
    const newItem: CashFlowItem = {
      id: Date.now().toString(),
      category: 'New Item',
      amount: 0,
      type: 'operating',
      period: 'Q1 2024',
      isEditable: true
    };
    setCashFlowItems(prev => [...prev, newItem]);
  };

  const removeCashFlowItem = (id: string) => {
    setCashFlowItems(prev => prev.filter(item => item.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'operating': return '#3B82F6';
      case 'investing': return '#10B981';
      case 'financing': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'operating': return 'Operating Activities';
      case 'investing': return 'Investing Activities';
      case 'financing': return 'Financing Activities';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Interactive Cash Flow</h2>
            <p className="text-sm text-gray-600">Direct & indirect method analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={showDetails ? 'Hide details' : 'Show details'}
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isEditing 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm font-medium text-gray-700">Method:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('direct')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'direct' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setViewMode('indirect')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'indirect' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Indirect
          </button>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashFlowData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
            />
            <Legend />
            <Bar dataKey="operating" fill="#3B82F6" name="Operating" />
            <Bar dataKey="investing" fill="#10B981" name="Investing" />
            <Bar dataKey="financing" fill="#F59E0B" name="Financing" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Flow Details */}
      {showDetails && (
        <div className="space-y-6">
          {/* Operating Activities */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Operating Activities
            </h4>
            <div className="space-y-2">
              {cashFlowItems
                .filter(item => item.type === 'operating')
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      {isEditing ? (
                                                 <input
                           type="text"
                           value={item.category}
                           onChange={(e) => handleEditItem(item.id, 'category', e.target.value)}
                           className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                           aria-label="Edit category name"
                         />
                      ) : (
                        <span className="text-sm font-medium">{item.category}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                                                 <input
                           type="number"
                           value={item.amount}
                           onChange={(e) => handleEditItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                           className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                           aria-label="Edit amount"
                         />
                      ) : (
                        <span className={`text-sm font-semibold ${
                          item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${item.amount.toLocaleString()}
                        </span>
                      )}
                      {isEditing && (
                        <button
                          onClick={() => removeCashFlowItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              {isEditing && (
                <button
                  onClick={addCashFlowItem}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Operating Item</span>
                </button>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net Operating Cash Flow</span>
                <span className={`font-bold text-lg ${
                  totals.operating >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totals.operating.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Investing Activities */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Investing Activities
            </h4>
            <div className="space-y-2">
              {cashFlowItems
                .filter(item => item.type === 'investing')
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className={`text-sm font-semibold ${
                      item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net Investing Cash Flow</span>
                <span className={`font-bold text-lg ${
                  totals.investing >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totals.investing.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Financing Activities */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Financing Activities
            </h4>
            <div className="space-y-2">
              {cashFlowItems
                .filter(item => item.type === 'financing')
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className={`text-sm font-semibold ${
                      item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net Financing Cash Flow</span>
                <span className={`font-bold text-lg ${
                  totals.financing >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totals.financing.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Net Cash Flow Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Net Cash Flow Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Operating</p>
                <p className={`text-xl font-bold ${
                  totals.operating >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totals.operating.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Investing</p>
                <p className={`text-xl font-bold ${
                  totals.investing >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totals.investing.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Financing</p>
                <p className={`text-xl font-bold ${
                  totals.financing >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totals.financing.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Net Change in Cash</span>
                <span className={`text-2xl font-bold ${
                  totals.net >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totals.net.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCashFlow; 