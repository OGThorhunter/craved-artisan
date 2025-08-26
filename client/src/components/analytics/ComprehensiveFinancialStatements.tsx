import React, { useState, Component, ErrorInfo, ReactNode, useEffect } from 'react';
// Card usage removed - using simple div structure instead
import { Button } from '@/components/ui';
import { ProfitLossStatement } from './ProfitLossStatement';
import { BalanceSheetStatement } from './BalanceSheetStatement';
import { CashFlowStatement } from './CashFlowStatement';
import { AccountsReceivableManagement } from './AccountsReceivableManagement';
import { AccountsPayableManagement } from './AccountsPayableManagement';

import { useFinancials } from '@/hooks/analytics/useFinancials';
import type { ComprehensiveFinancialsData } from '@/hooks/analytics/useFinancials';

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600">An error occurred while rendering this component.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

type StatementTab = 'overview' | 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'ar' | 'ap';

interface Props {
  data?: ComprehensiveFinancialsData | null;
  vendorId: string;
}

// Null-safety helpers
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const fmt = (v: unknown, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', opts).format(num(v));
const money = (v: unknown) => fmt(v, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Color coding helper for financial numbers
const getFinancialColor = (value: number) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-900';
};

// Export functionality
const exportToCSV = (data: ComprehensiveFinancialsData, filename: string) => {
  try {
    // Convert data to CSV format
    const csvContent = convertDataToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export to CSV failed:', error);
    alert('Export failed. Please try again.');
  }
};

const exportToPDF = (data: ComprehensiveFinancialsData, filename: string) => {
  try {
    // For now, we'll use a simple approach - in production you might want to use a library like jsPDF
    const printContent = generatePrintContent(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  } catch (error) {
    console.error('Export to PDF failed:', error);
    alert('Export failed. Please try again.');
  }
};

const convertDataToCSV = (data: ComprehensiveFinancialsData): string => {
  const rows = [
    ['Comprehensive Financial Statements', ''],
    ['Generated on', new Date().toLocaleDateString()],
    ['', ''],
    ['Profit & Loss', ''],
    ['Revenue', data.profitLoss?.revenue?.netSales || data.profitLoss?.revenue?.grossSales || data.profitLoss?.revenue || 0],
    ['Gross Profit', data.profitLoss?.grossProfit || 0],
    ['Net Income', data.profitLoss?.netIncome || 0],
    ['', ''],
    ['Balance Sheet', ''],
    ['Total Assets', data.balanceSheet?.assets?.totalAssets || 0],
    ['Current Assets', data.balanceSheet?.assets?.current?.totalCurrent || 0],
    ['Total Liabilities', data.balanceSheet?.liabilities?.totalLiabilities || 0],
    ['Total Equity', data.balanceSheet?.equity?.totalEquity || 0],
    ['', ''],
    ['Cash Flow', ''],
    ['Operating Cash Flow', data.cashFlow?.operating?.netCashFlow || 0],
    ['Investing Cash Flow', data.cashFlow?.investing?.netCashFlow || 0],
    ['Financing Cash Flow', data.cashFlow?.financing?.netCashFlow || 0],
    ['Net Cash Change', data.cashFlow?.netCashChange || 0],
    ['', ''],
    ['Accounts Receivable', ''],
    ['Total AR', data.accountsReceivable?.totalAmount || 0],
    ['Overdue AR', data.accountsReceivable?.overdueAmount || 0],
    ['', ''],
    ['Accounts Payable', ''],
    ['Total AP', data.accountsPayable?.totalAmount || 0],
    ['Overdue AP', data.accountsPayable?.overdueAmount || 0]
  ];
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
};

const generatePrintContent = (data: ComprehensiveFinancialsData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Financial Statements</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h3 { border-bottom: 2px solid #333; padding-bottom: 5px; }
        .row { display: flex; justify-content: space-between; margin: 5px 0; }
        .label { font-weight: bold; }
        .value { text-align: right; }
        .disclaimer { font-size: 12px; color: #666; margin-top: 30px; padding: 15px; border: 1px solid #ccc; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Comprehensive Financial Statements</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h3>Profit & Loss</h3>
        <div class="row">
          <span class="label">Revenue:</span>
          <span class="value">$${(data.profitLoss?.revenue?.netSales || data.profitLoss?.revenue?.grossSales || data.profitLoss?.revenue || 0).toLocaleString()}</span>
        </div>
        <div class="row">
          <span class="label">Gross Profit:</span>
          <span class="value">$${(data.profitLoss?.grossProfit || 0).toLocaleString()}</span>
        </div>
        <div class="row">
          <span class="label">Net Income:</span>
          <span class="value">$${(data.profitLoss?.netIncome || 0).toLocaleString()}</span>
        </div>
      </div>
      
      <div class="section">
        <h3>Balance Sheet</h3>
        <div class="row">
          <span class="label">Total Assets:</span>
          <span class="value">$${(data.balanceSheet?.assets?.totalAssets || 0).toLocaleString()}</span>
        </div>
        <div class="row">
          <span class="label">Total Liabilities:</span>
          <span class="value">$${(data.balanceSheet?.liabilities?.totalLiabilities || 0).toLocaleString()}</span>
        </div>
        <div class="row">
          <span class="label">Total Equity:</span>
          <span class="value">$${(data.balanceSheet?.equity?.totalEquity || 0).toLocaleString()}</span>
        </div>
      </div>
      
      <div class="disclaimer">
        <strong>Financial Data Disclaimer:</strong> All financial data displayed is for informational purposes only. 
        Users are responsible for verifying the accuracy and security of their financial information. 
        This report does not constitute financial advice. Please consult with qualified financial professionals 
        before making any financial decisions.
      </div>
    </body>
    </html>
  `;
};

export function ComprehensiveFinancialStatements({ data, vendorId }: Props) {
  const [activeTab, setActiveTab] = useState<StatementTab>('overview');
  const [showCharts, setShowCharts] = useState(true);

  // Safe tab change handler with logging
  const handleTabChange = (newTab: StatementTab) => {
    console.log('Changing tab from', activeTab, 'to', newTab);
    try {
      setActiveTab(newTab);
    } catch (error) {
      console.error('Error changing tab:', error);
      // Fallback to overview if there's an error
      setActiveTab('overview');
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('ComprehensiveFinancialStatements mounted with data:', !!data, 'vendorId:', vendorId);
  }, [data, vendorId]);

  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  // Guard against missing data
  if (!data) {
    return (
      <div className="flex items-center justify-center p-8 bg-[#F7F2EC] rounded-lg">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No Financial Data Available</div>
          <div className="text-sm">Please select a different period or check back later.</div>
        </div>
      </div>
    );
  }

  // Safe data destructuring with fallbacks
  const pl = data.profitLoss ?? {};
  const bs = data.balanceSheet ?? {};
  const cf = data.cashFlow ?? {};
  const ar = data.accountsReceivable ?? {};
  const ap = data.accountsPayable ?? {};
  const kpis = data.kpis ?? {};

  const tabs: Array<{ id: StatementTab; label: string; icon?: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'profit-loss', label: 'Profit & Loss' },
    { id: 'balance-sheet', label: 'Balance Sheet' },
    { id: 'cash-flow', label: 'Cash Flow' },
    { id: 'ar', label: 'Accounts Receivable' },
    { id: 'ap', label: 'Accounts Payable' }
  ];

  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'overview':
          return (
            <div className="space-y-6">
              <div className="text-center text-gray-500 py-8">
                <div className="text-lg font-medium mb-2">Overview Dashboard</div>
                <div className="text-sm">Select a specific tab above to view detailed financial information.</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Profit & Loss Overview */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Profit & Loss</h4>
                                         <div className="space-y-3">
                       <div className="flex justify-between">
                         <span className="text-gray-600">Revenue</span>
                         <span className={`font-semibold ${getFinancialColor(num(pl.revenue?.netSales || pl.revenue?.grossSales || pl.revenue))}`}>
                           {money(pl.revenue?.netSales || pl.revenue?.grossSales || pl.revenue)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Gross Profit</span>
                         <span className={`font-semibold ${getFinancialColor(num(pl.grossProfit))}`}>
                           {money(pl.grossProfit)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Net Income</span>
                         <span className={`font-semibold ${getFinancialColor(num(pl.netIncome))}`}>
                           {money(pl.netIncome)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Gross Margin</span>
                         <span className={`font-semibold ${getFinancialColor((num(pl.grossProfit) / num(pl.revenue?.netSales || pl.revenue?.grossSales || pl.revenue)) * 100)}`}>
                           {((num(pl.grossProfit) / num(pl.revenue?.netSales || pl.revenue?.grossSales || pl.revenue)) * 100).toFixed(1)}%
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Net Margin</span>
                         <span className={`font-semibold ${getFinancialColor((num(pl.netIncome) / num(pl.revenue?.netSales || pl.revenue?.grossSales || pl.revenue)) * 100)}`}>
                           {((num(pl.netIncome) / num(pl.revenue?.netSales || pl.revenue?.grossSales || pl.revenue)) * 100).toFixed(1)}%
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* Balance Sheet Overview */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Balance Sheet</h4>
                                         <div className="space-y-3">
                       <div className="flex justify-between">
                         <span className="text-gray-600">Total Assets</span>
                         <span className={`font-semibold ${getFinancialColor(num(bs.assets?.totalAssets))}`}>
                           {money(bs.assets?.totalAssets)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Current Assets</span>
                         <span className={`font-semibold ${getFinancialColor(num(bs.assets?.current?.totalCurrent))}`}>
                           {money(bs.assets?.current?.totalCurrent)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Total Liabilities</span>
                         <span className={`font-semibold ${getFinancialColor(num(bs.liabilities?.totalLiabilities))}`}>
                           {money(bs.liabilities?.totalLiabilities)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Total Equity</span>
                         <span className={`font-semibold ${getFinancialColor(num(bs.equity?.totalEquity))}`}>
                           {money(bs.equity?.totalEquity)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Current Ratio</span>
                         <span className={`font-semibold ${getFinancialColor((num(bs.assets?.current?.totalCurrent) / num(bs.liabilities?.current?.totalCurrent)))}`}>
                           {(num(bs.assets?.current?.totalCurrent) / num(bs.liabilities?.current?.totalCurrent)).toFixed(2)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Debt-to-Equity</span>
                         <span className={`font-semibold ${getFinancialColor((num(bs.liabilities?.totalLiabilities) / num(bs.equity?.totalEquity)))}`}>
                           {(num(bs.liabilities?.totalLiabilities) / num(bs.equity?.totalEquity)).toFixed(2)}
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* Cash Flow Overview */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Cash Flow</h4>
                                         <div className="space-y-3">
                       <div className="flex justify-between">
                         <span className="text-gray-600">Operating Cash Flow</span>
                         <span className={`font-semibold ${getFinancialColor(num(cf.operating?.netCashFlow))}`}>
                           {money(cf.operating?.netCashFlow)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Investing Cash Flow</span>
                         <span className={`font-semibold ${getFinancialColor(num(cf.investing?.netCashFlow))}`}>
                           {money(cf.investing?.netCashFlow)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Financing Cash Flow</span>
                         <span className={`font-semibold ${getFinancialColor(num(cf.financing?.netCashFlow))}`}>
                           {money(cf.financing?.netCashFlow)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Net Cash Change</span>
                         <span className={`font-semibold ${getFinancialColor(num(cf.netCashChange))}`}>
                           {money(cf.netCashChange)}
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* Accounts Receivable & Payable Overview */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">AR & AP</h4>
                                         <div className="space-y-3">
                       <div className="flex justify-between">
                         <span className="text-gray-600">Total AR</span>
                         <span className={`font-semibold ${getFinancialColor(num(ar.totalAmount))}`}>
                           {money(ar.totalAmount)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Overdue AR</span>
                         <span className={`font-semibold ${getFinancialColor(num(ar.overdueAmount))}`}>
                           {money(ar.overdueAmount)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Total AP</span>
                         <span className={`font-semibold ${getFinancialColor(num(ap.totalAmount))}`}>
                           {money(ap.totalAmount)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Overdue AP</span>
                         <span className={`font-semibold ${getFinancialColor(num(ap.overdueAmount))}`}>
                           {money(ap.overdueAmount)}
                         </span>
                       </div>
                     </div>
                  </div>

                </div>
              </div>
            </div>
          );

        case 'profit-loss':
          try {
            if (!ProfitLossStatement) {
              throw new Error('ProfitLossStatement component not found');
            }
            return <ProfitLossStatement data={pl || {}} />;
          } catch (error) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profit & Loss</h3>
                <p className="text-red-600">Unable to display profit and loss statement. Please try again.</p>
                <button 
                  onClick={() => handleTabChange('overview')}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Return to Overview
                </button>
              </div>
            );
          }

        case 'balance-sheet':
          try {
            if (!BalanceSheetStatement) {
              throw new Error('BalanceSheetStatement component not found');
            }
            return <BalanceSheetStatement data={bs || {}} />;
          } catch (error) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Balance Sheet</h3>
                <p className="text-red-600">Unable to display balance sheet. Please try again.</p>
                <button 
                  onClick={() => handleTabChange('overview')}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Return to Overview
                </button>
              </div>
            );
          }

        case 'cash-flow':
          try {
            if (!CashFlowStatement) {
              throw new Error('CashFlowStatement component not found');
            }
            return <CashFlowStatement data={cf || {}} />;
          } catch (error) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Cash Flow</h3>
                <p className="text-red-600">Unable to display cash flow statement. Please try again.</p>
                <button 
                  onClick={() => handleTabChange('overview')}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Return to Overview
                </button>
              </div>
            );
          }

        case 'ar':
          try {
            if (!AccountsReceivableManagement) {
              throw new Error('AccountsReceivableManagement component not found');
            }
            // Provide default AR data structure
            const defaultARData = {
              summary: {
                totalOutstanding: 0,
                totalOverdue: 0,
                averageDaysOutstanding: 0,
                collectionRate: 0
              },
              aging: {
                current: 0,
                '1-30': 0,
                '31-60': 0,
                '61-90': 0,
                '90+': 0
              },
              invoices: []
            };
            return <AccountsReceivableManagement data={ar.summary ? ar : defaultARData} />;
          } catch (error) {
            console.error('AR loading error:', error);
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading AR Summary</h3>
                <p className="text-red-600">Unable to display accounts receivable summary. Please try again.</p>
                <button 
                  onClick={() => handleTabChange('overview')}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Return to Overview
                </button>
              </div>
            );
          }

        case 'ap':
          try {
            if (!AccountsPayableManagement) {
              throw new Error('AccountsPayableManagement component not found');
            }
            // Provide default AP data structure
            const defaultAPData = {
              summary: {
                totalOutstanding: 0,
                totalOverdue: 0,
                averageDaysOutstanding: 0,
                paymentRate: 0
              },
              aging: {
                current: 0,
                '1-30': 0,
                '31-60': 0,
                '61-90': 0,
                '90+': 0
              },
              bills: []
            };
            return <AccountsPayableManagement data={ap.summary ? ap : defaultAPData} />;
          } catch (error) {
            console.error('AP loading error:', error);
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading AP Summary</h3>
                <p className="text-red-600">Unable to display accounts payable summary. Please try again.</p>
                <button 
                  onClick={() => handleTabChange('overview')}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Return to Overview
                </button>
              </div>
            );
          }

        default:
          return <div>Select a tab to view financial data</div>;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unexpected Error</h3>
          <p className="text-red-600">Something went wrong while loading this tab. Please try again.</p>
          <button 
            onClick={() => handleTabChange('overview')}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Return to Overview
          </button>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg"> {/* White background with padding */}
             {/* Header with Controls */}
       <div className="bg-[#F7F2EC] p-6 rounded-lg shadow border"> {/* Light cream header box */}
         <div className="flex justify-between items-center">
           <h1 className="text-3xl font-bold text-gray-900">Comprehensive Financial Statements</h1>
           <div className="flex items-center space-x-4">
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 checked={showCharts}
                 onChange={(e) => setShowCharts(e.target.checked)}
                 className="rounded border-gray-300 text-[#5B6E02] focus:ring-[#5B6E02]"
               />
               <span className="text-sm font-medium text-gray-700">Show Charts</span>
             </label>
             <Button 
               variant="outline" 
               className="border-[#5B6E02] text-[#5B6E02] hover:bg-[#5B6E02] hover:text-white"
               onClick={() => exportToPDF(data, `financial-statements-${new Date().toISOString().split('T')[0]}`)}
             >
               Export PDF
             </Button>
             <Button 
               variant="outline" 
               className="border-[#5B6E02] text-[#5B6E02] hover:bg-[#5B6E02] hover:text-white"
               onClick={() => exportToCSV(data, `financial-statements-${new Date().toISOString().split('T')[0]}`)}
             >
               Export CSV
             </Button>
           </div>
         </div>
       </div>

       {/* Discreet Disclaimers */}
       <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
         <div className="flex items-start space-x-2">
           <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
           </svg>
           <div>
             <p className="font-medium text-gray-600 mb-1">Important Disclaimers</p>
             <p className="text-gray-500 leading-relaxed">
               Financial data is for informational purposes only and does not constitute financial advice. 
               AI-powered insights may contain errors and should be reviewed by professionals. 
               Users are responsible for data accuracy and security. 
               Please consult qualified professionals before making financial decisions.
             </p>
           </div>
         </div>
       </div>

      {/* Tab Navigation */}
      <div className="bg-[#F7F2EC] p-4 rounded-lg shadow border"> {/* Light cream navigation box */}
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#5B6E02] text-[#5B6E02]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-[#F7F2EC] p-6 rounded-lg shadow border min-h-[600px]"> {/* Light cream content box */}
        <ErrorBoundary>
          {renderTabContent()}
        </ErrorBoundary>
      </div>
    </div>
  );
}
