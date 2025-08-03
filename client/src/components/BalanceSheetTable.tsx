import React from 'react';

interface BalanceSheetData {
  assets: number;
  liabilities: number;
  equity: number;
}

interface BalanceSheetTableProps {
  data: BalanceSheetData;
  className?: string;
}

export const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({ data, className = '' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getValueStyle = (value: number) => {
    return `px-4 py-3 text-center font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`;
  };

  const getBalanceSheetStatus = () => {
    const debtRatio = (data.liabilities / data.assets) * 100;
    
    if (debtRatio > 70) return { status: 'high-debt', color: 'red', icon: '🔴' };
    if (debtRatio > 50) return { status: 'moderate-debt', color: 'yellow', icon: '🟡' };
    return { status: 'strong', color: 'green', icon: '✅' };
  };

  const balanceSheetStatus = getBalanceSheetStatus();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Balance Sheet</h3>
      </div>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                Assets
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                Liabilities
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                Equity
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={getValueStyle(data.assets)}>
                {formatCurrency(data.assets)}
              </td>
              <td className={getValueStyle(-data.liabilities)}>
                {formatCurrency(-data.liabilities)}
              </td>
              <td className={getValueStyle(data.equity)}>
                {formatCurrency(data.equity)} {balanceSheetStatus.icon}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Assets = Liabilities + Equity</span>
            <span className="font-medium">
              {formatCurrency(data.assets)} = {formatCurrency(data.liabilities)} + {formatCurrency(data.equity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 