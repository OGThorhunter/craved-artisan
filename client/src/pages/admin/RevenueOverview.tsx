import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { RefreshCw, Download } from 'lucide-react';
import { KpiCards } from '../../components/admin/revenue/KpiCards';
import { RevenueTrendChart } from '../../components/admin/revenue/RevenueTrendChart';
import { SubNavigation } from '../../components/admin/revenue/SubNavigation';
import FeeManager from './FeeManager';
import RevenueLedger from './RevenueLedger';
import PromoManager from './PromoManager';
import PayoutsManager from './PayoutsManager';
import PLDashboard from '../../components/admin/revenue/PLDashboard';
import StaffManagement from '../../components/admin/revenue/StaffManagement';
import CostOverride from '../../components/admin/revenue/CostOverride';

type SubView = 'overview' | 'fees' | 'ledger' | 'promos' | 'payouts' | 'pl' | 'staff' | 'costs';

export const RevenueOverview: React.FC = () => {
  const [activeView, setActiveView] = useState<SubView>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [accountingMode, setAccountingMode] = useState<'accrual' | 'cash'>('accrual');

  // Calculate date range
  const getDateRange = () => {
    const to = new Date();
    let from = new Date();
    
    switch (dateRange) {
      case '7d':
        from.setDate(from.getDate() - 7);
        break;
      case '30d':
        from.setDate(from.getDate() - 30);
        break;
      case '90d':
        from.setDate(from.getDate() - 90);
        break;
      default:
        from.setDate(from.getDate() - 30);
    }

    return { from: from.toISOString(), to: to.toISOString() };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['revenue-overview', dateRange, accountingMode],
    queryFn: async () => {
      const { from, to } = getDateRange();
      const response = await axios.get('/api/admin/revenue/overview', {
        params: { from, to, mode: accountingMode },
        withCredentials: true,
      });
      return response.data;
    },
    enabled: activeView === 'overview',
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export clicked');
  };

  // Render based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'fees':
        return <FeeManager />;
      case 'ledger':
        return <RevenueLedger />;
      case 'promos':
        return <PromoManager />;
      case 'payouts':
        return <PayoutsManager />;
      case 'pl':
        return <PLDashboard />;
      case 'staff':
        return <StaffManagement />;
      case 'costs':
        return <CostOverride />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Platform revenue, fees, and financial insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Accounting Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAccountingMode('accrual')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                accountingMode === 'accrual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Accrual
            </button>
            <button
              onClick={() => setAccountingMode('cash')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                accountingMode === 'cash'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cash
            </button>
          </div>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Select date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Refresh data"
            title="Refresh revenue data"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Failed to load revenue data. Please try again.</p>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {/* KPI Cards */}
          {data.kpis && <KpiCards kpis={data.kpis} />}

          {/* Revenue Trend Chart */}
          {data.trend && data.trend.length > 0 && (
            <RevenueTrendChart data={data.trend} />
          )}

          {/* Revenue by Role */}
          {data.revenueByRole && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800">Vendors (Marketplace)</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    ${(data.revenueByRole.vendors / 100).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-800">Events</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    ${(data.revenueByRole.events / 100).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800">Subscriptions</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ${(data.revenueByRole.subscriptions / 100).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveView('fees')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <p className="font-medium text-gray-900">Manage Fee Schedules</p>
                <p className="text-sm text-gray-600 mt-1">Update platform take rates</p>
              </button>
              <button
                onClick={() => setActiveView('ledger')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <p className="font-medium text-gray-900">View Ledger</p>
                <p className="text-sm text-gray-600 mt-1">Detailed transaction log</p>
              </button>
              <button
                onClick={() => setActiveView('promos')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <p className="font-medium text-gray-900">Create Promo</p>
                <p className="text-sm text-gray-600 mt-1">Issue credit or discount</p>
              </button>
              <button
                onClick={() => setActiveView('payouts')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <p className="font-medium text-gray-900">Manage Payouts</p>
                <p className="text-sm text-gray-600 mt-1">Track vendor payments</p>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <SubNavigation activeView={activeView} onViewChange={setActiveView} />
      {renderContent()}
    </div>
  );
};

export default RevenueOverview;
