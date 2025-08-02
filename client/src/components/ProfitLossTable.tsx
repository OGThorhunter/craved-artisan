import React from 'react';

interface ProfitLossData {
  totalRevenue: number;
  cogs: number;
  opex: number;
  netProfit: number;
}

interface ProfitLossTableProps {
  data: ProfitLossData;
  className?: string;
}

export const ProfitLossTable: React.FC<ProfitLossTableProps> = ({ data, className = '' }) => {
  const grossProfit = data.totalRevenue - data.cogs;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getRowStyle = (value: number, isTotal: boolean = false, isWarning: boolean = false) => {
    const baseStyle = 'px-4 py-3 border-b border-gray-200';
    const totalStyle = isTotal ? 'font-semibold bg-gray-50' : '';
    let valueStyle = value >= 0 ? 'text-green-600' : 'text-red-600';
    
    // Add warning styling for problematic metrics
    if (isWarning) {
      valueStyle = 'text-red-600 font-semibold';
    }
    
    return `${baseStyle} ${totalStyle} ${valueStyle}`;
  };

  const getNetMarginStatus = () => {
    const netMargin = ((data.totalRevenue - data.cogs - data.opex) / data.totalRevenue) * 100;
    if (netMargin < 15) return { status: 'warning', color: 'red', icon: '🔴' };
    if (netMargin < 20) return { status: 'caution', color: 'yellow', icon: '🟡' };
    return { status: 'good', color: 'green', icon: '✅' };
  };

  const netMarginStatus = getNetMarginStatus();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Profit & Loss</h3>
      </div>
      <div className="overflow-hidden">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Total Revenue
              </td>
              <td className={getRowStyle(data.totalRevenue)}>
                {formatCurrency(data.totalRevenue)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Cost of Goods Sold
              </td>
              <td className={getRowStyle(-data.cogs)}>
                {formatCurrency(-data.cogs)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Gross Profit
              </td>
              <td className={getRowStyle(grossProfit)}>
                {formatCurrency(grossProfit)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Operating Expenses
              </td>
              <td className={getRowStyle(-data.opex)}>
                {formatCurrency(-data.opex)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium text-gray-700">
                Net Profit
              </td>
              <td className={getRowStyle(data.netProfit, true)}>
                {formatCurrency(data.netProfit)} {netMarginStatus.icon}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}; 