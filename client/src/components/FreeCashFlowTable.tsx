import React from 'react';

interface CashFlowData {
  cashIn: number;
  cashOut: number;
  investingOutflow?: number;
  financingInflow?: number;
}

interface FreeCashFlowTableProps {
  data: CashFlowData;
  className?: string;
}

export const FreeCashFlowTable: React.FC<FreeCashFlowTableProps> = ({ data, className = '' }) => {
  const operatingCashInflow = data.cashIn;
  const operatingCashOutflow = data.cashOut;
  const netOperatingCashFlow = operatingCashInflow - operatingCashOutflow;
  const investingOutflow = data.investingOutflow || 0;
  const financingInflow = data.financingInflow || 0;
  const freeCashFlow = netOperatingCashFlow - investingOutflow + financingInflow;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRowStyle = (value: number, isTotal: boolean = false) => {
    const baseStyle = 'px-4 py-3 border-b border-gray-200';
    const totalStyle = isTotal ? 'font-semibold bg-gray-50' : '';
    const valueStyle = value >= 0 ? 'text-green-600' : 'text-red-600';
    return `${baseStyle} ${totalStyle} ${valueStyle}`;
  };

  const getCashFlowStatus = () => {
    if (freeCashFlow < 0) return { status: 'negative', color: 'red', icon: '🔴' };
    if (freeCashFlow < netOperatingCashFlow * 0.5) return { status: 'low', color: 'yellow', icon: '🟡' };
    return { status: 'strong', color: 'green', icon: '✅' };
  };

  const cashFlowStatus = getCashFlowStatus();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Free Cash Flow</h3>
      </div>
      <div className="overflow-hidden">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Operating Cash Inflow
              </td>
              <td className={getRowStyle(operatingCashInflow)}>
                {formatCurrency(operatingCashInflow)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Operating Cash Outflow
              </td>
              <td className={getRowStyle(-operatingCashOutflow)}>
                {formatCurrency(-operatingCashOutflow)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Net Operating Cash Flow
              </td>
              <td className={getRowStyle(netOperatingCashFlow)}>
                {formatCurrency(netOperatingCashFlow)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Investing Outflow
              </td>
              <td className={getRowStyle(-investingOutflow)}>
                {formatCurrency(-investingOutflow)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                Financing Inflow
              </td>
              <td className={getRowStyle(financingInflow)}>
                {formatCurrency(financingInflow)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium text-gray-700">
                Free Cash Flow
              </td>
              <td className={getRowStyle(freeCashFlow, true)}>
                {formatCurrency(freeCashFlow)} {cashFlowStatus.icon}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}; 