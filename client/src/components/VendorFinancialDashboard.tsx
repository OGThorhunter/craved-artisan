import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { RefreshCw, TrendingUp, DollarSign } from 'lucide-react';
import { ProfitLossTable } from './ProfitLossTable';
import { FreeCashFlowTable } from './FreeCashFlowTable';
import { BalanceSheetTable } from './BalanceSheetTable';
import { FinancialHealthIndicator } from './FinancialHealthIndicator';
import { FinancialFilters } from './FinancialFilters';
import LoadingSpinner from './LoadingSpinner';
import CSVImportButton from './CSVImportButton';
import { EditableFinancialTable } from './EditableFinancialTable';
import { FinancialInsights } from './FinancialInsights';
import { FinancialSummary } from './FinancialSummary';

interface FinancialSnapshot {
  id: string;
  vendorId: string;
  date: string;
  revenue: number;
  cogs: number;
  opex: number;
  netProfit: number;
  assets: number;
  liabilities: number;
  equity: number;
  cashIn: number;
  cashOut: number;
  notes?: string;
}

interface VendorFinancialsResponse {
  vendor: {
    id: string;
    storeName: string;
  };
  range: string;
  year?: number;
  quarter?: string | null;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalRevenue: number;
    totalProfit: number;
    avgProfitMargin: number;
    totalCashFlow: number;
    currentNetWorth: number;
    snapshotCount: number;
  };
  snapshots: FinancialSnapshot[];
}

interface VendorFinancialDashboardProps {
  vendorId: string;
  className?: string;
}

export const VendorFinancialDashboard: React.FC<VendorFinancialDashboardProps> = ({ 
  vendorId, 
  className = '' 
}) => {

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch financial data
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['vendor-financials', vendorId, selectedYear, selectedQuarter],
    queryFn: async (): Promise<VendorFinancialsResponse> => {
      const params = new URLSearchParams();
      if (selectedYear) {
        params.append('year', selectedYear.toString());
      }
      if (selectedQuarter) {
        params.append('quarter', selectedQuarter);
      }
      if (!selectedYear && !selectedQuarter) {
        params.append('range', 'monthly');
      }
      
      const response = await axios.get(`/api/vendors/${vendorId}/financials/test?${params.toString()}`, {
        withCredentials: true
      });
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate financial snapshot
  const generateSnapshotMutation = useMutation({
    mutationFn: async ({ period, notes }: { period: string; notes?: string }) => {
      const response = await axios.post(`/api/vendors/${vendorId}/financials/generate/test`, {
        period,
        notes
      }, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Financial snapshot generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendor-financials', vendorId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate snapshot');
    }
  });

  const handleGenerateSnapshot = () => {
    generateSnapshotMutation.mutate({
      period: selectedRange,
      notes: `Auto-generated ${selectedRange} snapshot`
    });
  };



  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleQuarterChange = (quarter: string | null) => {
    setSelectedQuarter(quarter);
  };

  // Export functions
  const handleExportCSV = async () => {
    try {
      // Use server-side CSV export endpoint
      const response = await axios.get(`/api/vendors/${vendorId}/financials/export.csv/test`, {
        withCredentials: true,
        responseType: 'blob'
      });

      // Create and download file
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `financials-${vendorId}-${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV export completed!');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Use server-side PDF export endpoint
      const response = await axios.get(`/api/vendors/${vendorId}/financials/export.pdf/test`, {
        withCredentials: true,
        responseType: 'blob'
      });

      // Create and download file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `financials-${vendorId}-${new Date().toISOString().split('T')[0]}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('PDF export completed!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Financial Data</h3>
          <p>Failed to load financial information. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return null;
  }

  // Get the latest snapshot for current financial position
  const latestSnapshot = financialData.snapshots[0];
  
  // Prepare data for components
  const profitLossData = {
    totalRevenue: financialData.summary.totalRevenue,
    cogs: latestSnapshot?.cogs || 0,
    opex: latestSnapshot?.opex || 0,
    netProfit: financialData.summary.totalProfit,
  };

  const cashFlowData = {
    cashIn: latestSnapshot?.cashIn || 0,
    cashOut: latestSnapshot?.cashOut || 0,
    investingOutflow: 1200, // Mock data - in real app would come from API
    financingInflow: 0, // Mock data - in real app would come from API
  };

  const balanceSheetData = {
    assets: latestSnapshot?.assets || 0,
    liabilities: latestSnapshot?.liabilities || 0,
    equity: latestSnapshot?.equity || 0,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {financialData.vendor.storeName} - Financial Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              {financialData.period.start} to {financialData.period.end}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateSnapshot}
              disabled={generateSnapshotMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateSnapshotMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              Generate Snapshot
            </button>
          </div>
        </div>
      </div>

      {/* Financial Filters */}
      <FinancialFilters
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        onYearChange={handleYearChange}
        onQuarterChange={handleQuarterChange}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Import Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Import Financial Data</h3>
            <p className="text-sm text-gray-600">Upload CSV files to import historical financial data</p>
          </div>
          <CSVImportButton 
            vendorId={vendorId} 
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['vendor-financials', vendorId] });
            }} 
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              ${financialData.summary.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Net Profit</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              ${financialData.summary.totalProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Profit Margin</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {financialData.summary.avgProfitMargin.toFixed(1)}%
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Net Worth</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              ${financialData.summary.currentNetWorth.toLocaleString()}
            </p>
          </div>
        </div>

      {/* Financial Health Indicator */}
      <FinancialHealthIndicator 
        metrics={{
          netProfit: financialData.summary.totalProfit,
          totalRevenue: financialData.summary.totalRevenue,
          cogs: latestSnapshot?.cogs || 0,
          cashIn: latestSnapshot?.cashIn || 0,
          cashOut: latestSnapshot?.cashOut || 0,
          assets: latestSnapshot?.assets || 0,
          liabilities: latestSnapshot?.liabilities || 0,
        }}
      />

      {/* Financial Insights */}
      <FinancialInsights
        vendorId={vendorId}
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        className="mt-6"
      />

      {/* Financial Summary Charts */}
      <FinancialSummary
        vendorId={vendorId}
        className="mt-6"
      />

      {/* Financial Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfitLossTable data={profitLossData} />
        <FreeCashFlowTable data={cashFlowData} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <BalanceSheetTable data={balanceSheetData} />
      </div>

      {/* Editable Financial Table */}
      <EditableFinancialTable 
        data={financialData.snapshots}
        vendorId={vendorId}
        className="mt-6"
      />

      {/* Snapshot History */}
      {financialData.snapshots.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Snapshots ({financialData.snapshots.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Net Profit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Equity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {financialData.snapshots.slice(0, 5).map((snapshot) => (
                  <tr key={snapshot.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(snapshot.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      ${snapshot.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">
                      ${snapshot.netProfit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-600">
                      ${snapshot.equity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {snapshot.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 