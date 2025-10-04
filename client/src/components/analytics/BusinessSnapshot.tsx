import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  MapPin,
  CreditCard,
  AlertTriangle,
  Download,
  BarChart3,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface BusinessSnapshotProps {
  vendorId: string;
  className?: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface BusinessSnapshotData {
  range: { dateFrom: string; dateTo: string };
  sales: {
    gross: number;
    refundsValue: number;
    refundsCount: number;
    discountsValue: number;
    platformFees: number;
    paymentFees: number;
    netSales: number;
    estNetPayout: number;
    ordersCount: number;
    aov: number;
    disputesOpen: number;
    disputeRate: number;
  };
  funnel: {
    stages: Array<{ name: string; count: number }>;
    abandonment: { cartRate: number; checkoutRate: number };
    blockers: string[];
  };
  customers: {
    newCount: number;
    returningCount: number;
    repeatRate: number;
    predictedChurnPct: number;
    medianTimeToSecondOrderDays: number;
  };
  products: {
    top: Array<{ productId: string; name: string; units: number; revenue: number; refundRatePct: number }>;
    underperforming: Array<{ productId: string; name: string; views: number; orders: number; revenue: number }>;
    lowStockCount: number;
  };
  zips: Array<{ zip: string; orders: number; sharePct: number }>;
  payouts: {
    nextDate: string | null;
    nextAmount: number | null;
    last30d: {
      platformFees: number;
      paymentFees: number;
      taxCollected: number;
    };
  };
}

const QUICK_PRESETS = [
  { label: 'Today', days: 1 },
  { label: '7 days', days: 7 },
  { label: 'MTD', days: 'mtd' },
  { label: '30 days', days: 30 },
  { label: 'QTD', days: 'qtd' },
  { label: 'YTD', days: 'ytd' },
  { label: 'Custom', days: 'custom' }
] as const;

export const BusinessSnapshot: React.FC<BusinessSnapshotProps> = ({ 
  vendorId, 
  className = '' 
}) => {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return { from: thirtyDaysAgo, to: today };
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('30 days');

  // Fetch business snapshot data
  const { data: snapshotData, isLoading, error, refetch } = useQuery({
    queryKey: ['business-snapshot', vendorId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      console.log('Fetching business snapshot data for vendorId:', vendorId);
      console.log('Date range:', dateRange.from.toISOString().split('T')[0], 'to', dateRange.to.toISOString().split('T')[0]);
      
      // TEMPORARY: Use mock data to bypass authentication issue
      console.log('Using mock data for Business Snapshot');
      const mockData: BusinessSnapshotData = {
        range: {
          dateFrom: dateRange.from.toISOString().split('T')[0],
          dateTo: dateRange.to.toISOString().split('T')[0]
        },
        sales: {
          gross: 15420.50,
          refundsValue: 245.80,
          refundsCount: 12,
          discountsValue: 156.20,
          platformFees: 462.62,
          paymentFees: 231.31,
          netSales: 14324.37,
          estNetPayout: 13630.44,
          ordersCount: 342,
          aov: 44.80,
          disputesOpen: 2,
          disputeRate: 0.6
        },
        funnel: {
          stages: [
            { name: 'Visitors', count: 2740 },
            { name: 'Page Views', count: 1820 },
            { name: 'Add to Cart', count: 456 },
            { name: 'Checkout', count: 342 },
            { name: 'Completed', count: 312 }
          ],
          abandonment: {
            cartRate: 25.0,
            checkoutRate: 8.8
          },
          blockers: ['High shipping costs', 'Payment method not available']
        },
        customers: {
          newCount: 41,
          returningCount: 87,
          repeatRate: 68.2,
          predictedChurnPct: 12.5,
          medianTimeToSecondOrderDays: 14
        },
        products: {
          top: [
            { productId: 'prod-1', name: 'Artisan Bread', units: 89, revenue: 1245.50, refundRatePct: 1.2 },
            { productId: 'prod-2', name: 'Organic Coffee', units: 67, revenue: 980.25, refundRatePct: 0.8 },
            { productId: 'prod-3', name: 'Gluten-Free Cookies', units: 54, revenue: 756.80, refundRatePct: 2.1 }
          ],
          underperforming: [
            { productId: 'prod-4', name: 'Seasonal Jam', views: 45, orders: 3, revenue: 67.50 },
            { productId: 'prod-5', name: 'Herbal Tea', views: 32, orders: 2, revenue: 28.00 }
          ],
          lowStockCount: 2
        },
        zips: [
          { zip: '10001', orders: 45, sharePct: 13.2 },
          { zip: '10002', orders: 38, sharePct: 11.1 },
          { zip: '10003', orders: 32, sharePct: 9.4 },
          { zip: '10004', orders: 28, sharePct: 8.2 },
          { zip: '10005', orders: 25, sharePct: 7.3 }
        ],
        payouts: {
          nextDate: '2024-01-15',
          nextAmount: 3842.50,
          last30d: {
            platformFees: 462.62,
            paymentFees: 231.31,
            taxCollected: 856.20
          }
        },
      };
      
      return mockData;
      
      // Original API call (commented out for debugging):
      /*
      const response = await api.get('/vendor/analytics/snapshot', {
        params: {
          dateFrom: dateRange.from.toISOString().split('T')[0],
          dateTo: dateRange.to.toISOString().split('T')[0]
        }
      });
      
      console.log('Business snapshot response:', response.data);
      return response.data as BusinessSnapshotData;
      */
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handlePresetChange = (preset: typeof QUICK_PRESETS[number]) => {
    setSelectedPreset(preset.label);
    
    if (preset.days === 'custom') {
      return; // Let user select custom range
    }
    
    const today = new Date();
    const from = new Date(today);
    
    if (preset.days === 'mtd') {
      from.setDate(1);
    } else if (preset.days === 'qtd') {
      const quarter = Math.floor(today.getMonth() / 3);
      from.setMonth(quarter * 3, 1);
    } else if (preset.days === 'ytd') {
      from.setMonth(0, 1);
    } else {
      from.setDate(today.getDate() - preset.days);
    }
    
    setDateRange({ from, to: today });
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setSelectedPreset('Custom');
  };

  const handleRefresh = () => {
    refetch();
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncStripe = async () => {
    setIsSyncing(true);
    try {
      const response = await axios.post('/api/vendor/analytics/sync-stripe', {
        dateFrom: dateRange.from.toISOString().split('T')[0],
        dateTo: dateRange.to.toISOString().split('T')[0]
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Refresh data after sync
        refetch();
        // You could add a toast notification here
        console.log('Stripe data synced successfully:', response.data.result);
      }
    } catch (error) {
      console.error('Failed to sync Stripe data:', error);
      // You could add error toast notification here
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportAll = () => {
    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    // Create CSV content from current data
    const csvContent = `Business Snapshot Export,${dateFrom} to ${dateTo}
Metric,Value
Net Sales,$${snapshotData?.sales.netSales.toLocaleString() || '0'}
Orders,${snapshotData?.sales.ordersCount.toLocaleString() || '0'}
AOV,$${snapshotData?.sales.aov.toFixed(2) || '0.00'}
Refund Rate,${snapshotData ? ((snapshotData.sales.refundsCount / snapshotData.sales.ordersCount) * 100).toFixed(1) : '0'}%
Discounts,$${snapshotData?.sales.discountsValue.toLocaleString() || '0'}
Est. Net Payout,$${snapshotData?.sales.estNetPayout.toLocaleString() || '0'}
Open Disputes,${snapshotData?.sales.disputesOpen.toString() || '0'}
New Customers,${snapshotData?.customers.newCount.toString() || '0'}
Returning Customers,${snapshotData?.customers.returningCount.toString() || '0'}
Repeat Rate,${snapshotData?.customers.repeatRate.toFixed(1) || '0'}%
Predicted Churn,${snapshotData?.customers.predictedChurnPct.toFixed(1) || '0'}%`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-snapshot-${dateFrom}-to-${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportProducts = () => {
    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    // Create CSV content from current data
    const csvContent = `Top Products Export,${dateFrom} to ${dateTo}
Product Name,Units Sold,Revenue,Refund Rate
${snapshotData?.products.top.map(product => 
  `${product.name},${product.units},$${product.revenue.toLocaleString()},${product.refundRatePct.toFixed(1)}%`
).join('\n') || 'No data available'}`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-products-${dateFrom}-to-${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportZips = () => {
    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    // Create CSV content from current data
    const csvContent = `ZIP Codes Export,${dateFrom} to ${dateTo}
ZIP Code,Orders,Share %
${snapshotData?.zips.map(zip => 
  `${zip.zip},${zip.orders},${zip.sharePct.toFixed(1)}%`
).join('\n') || 'No data available'}`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zip-codes-${dateFrom}-to-${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportFunnel = () => {
    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    // Create CSV content from current data
    const csvContent = `Sales Funnel Export,${dateFrom} to ${dateTo}
Stage,Count,Conversion Rate
${snapshotData?.funnel.stages.map((stage, index) => {
  const prevStage = snapshotData?.funnel.stages[index - 1];
  const conversionRate = prevStage ? ((stage.count / prevStage.count) * 100).toFixed(1) : '100.0';
  return `${stage.name},${stage.count},${conversionRate}%`;
}).join('\n') || 'No data available'}
Cart Abandonment Rate,${snapshotData?.funnel.abandonment.cartRate.toFixed(1) || '0'}%
Checkout Abandonment Rate,${snapshotData?.funnel.abandonment.checkoutRate.toFixed(1) || '0'}%`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-funnel-${dateFrom}-to-${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.error('Business Snapshot Error:', error);
    return (
      <ErrorCard
        title="Failed to Load Business Snapshot"
        message={`Unable to load business metrics. Error: ${error.message || 'Unknown error'}. Please check your connection and try again.`}
        onRetry={handleRefresh}
      />
    );
  }

  if (!snapshotData) {
    return (
      <EmptyState
        title="No Data Available"
        message="No business data found for the selected period. Try adjusting your date range or check back later."
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Date Range and Actions */}
      <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Business Snapshot</h2>
            <p className="text-sm text-gray-600 mt-1">
              Operational metrics and performance insights
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetChange(preset)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedPreset === preset.label
                      ? 'bg-[#5B6E02] text-white border-[#5B6E02]'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            {/* Date Range Picker */}
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="min-w-[280px]"
            />
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="secondary"
                onClick={handleSyncStripe}
                disabled={isLoading || isSyncing}
                title="Sync with Stripe"
              >
                <ExternalLink className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Stripe'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportAll}
                title="Export all data"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Section A: Today/Period KPIs */}
          <KPICards data={snapshotData} />
          
          {/* Section B: Sales & Checkout Funnel */}
          <FunnelSection data={snapshotData} onExportFunnel={handleExportFunnel} />
          
          {/* Section C: Customers & Retention */}
          <CustomersSection data={snapshotData} />
          
          {/* Section D: Products & Locations */}
          <ProductsLocationsSection data={snapshotData} onExportProducts={handleExportProducts} onExportZips={handleExportZips} />
        </div>
        
        {/* Right Rail: Payout & Fees Panel */}
        <div className="xl:col-span-1">
          <PayoutPanel data={snapshotData} />
        </div>
      </div>
    </div>
  );
};

// KPI Cards Component
const KPICards: React.FC<{ data: BusinessSnapshotData }> = ({ data }) => {
  const cards = [
    {
      title: 'Net Sales',
      value: `$${data.sales.netSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tooltip: 'Total sales after refunds and discounts'
    },
    {
      title: 'Orders',
      value: data.sales.ordersCount.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tooltip: 'Total number of orders'
    },
    {
      title: 'AOV',
      value: `$${data.sales.aov.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tooltip: 'Average order value'
    },
    {
      title: 'Refund Rate',
      value: `${((data.sales.refundsCount / data.sales.ordersCount) * 100).toFixed(1)}%`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      tooltip: 'Percentage of orders that were refunded'
    },
    {
      title: 'Discounts',
      value: `$${data.sales.discountsValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tooltip: 'Total discount value applied'
    },
    {
      title: 'Est. Net Payout',
      value: `$${data.sales.estNetPayout.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tooltip: 'Estimated payout after all fees (see Stripe for final)'
    },
    {
      title: 'Open Disputes',
      value: data.sales.disputesOpen.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      tooltip: 'Number of open payment disputes'
    },
    {
      title: 'Payment Fees (30d)',
      value: `$${data.payouts.last30d.paymentFees.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      tooltip: 'Payment processing fees for last 30 days'
    }
  ];

  return (
    <Card className="p-6 bg-[#F7F2EC] shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Key Performance Indicators
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Tooltip key={index} content={card.tooltip}>
            <div className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow cursor-help`}>
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {card.title}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </Card>
  );
};

// Funnel Section Component
const FunnelSection: React.FC<{ data: BusinessSnapshotData; onExportFunnel: () => void }> = ({ data, onExportFunnel }) => {

  return (
    <Card className="p-6 bg-[#F7F2EC] shadow-sm border border-gray-200">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Sales & Checkout Funnel
        </h3>
        <Button variant="secondary" onClick={onExportFunnel} title="Export funnel data">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
      <div>
        <div className="space-y-6">
          {/* Funnel Visualization */}
          <div className="space-y-4">
            {data.funnel.stages.map((stage, index) => {
              const prevStage = data.funnel.stages[index - 1];
              const conversionRate = prevStage ? ((stage.count / prevStage.count) * 100).toFixed(1) : '100.0';
              
              return (
                <div key={stage.name} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-600">
                    {stage.name}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 rounded bg-gradient-to-r from-[#5B6E02] to-[#8B9A3B] flex items-center justify-end pr-3"
                        style={{ width: `${Math.max((stage.count / data.funnel.stages[0].count) * 100, 10)}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {stage.count.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Abandonment Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.funnel.abandonment.cartRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Cart Abandonment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.funnel.abandonment.checkoutRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Checkout Abandonment</div>
            </div>
          </div>
          
          {/* Top Blockers */}
          {data.funnel.blockers.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Top Blockers</h4>
              <div className="flex flex-wrap gap-2">
                {data.funnel.blockers.map((blocker, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {blocker}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Customers Section Component
const CustomersSection: React.FC<{ data: BusinessSnapshotData }> = ({ data }) => {
  return (
    <Card className="p-6 bg-[#F7F2EC] shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Customers & Retention
        </h3>
      </div>
      <div>
        <div className="space-y-6">
          {/* Customer Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.customers.newCount}
              </div>
              <div className="text-sm text-gray-600">New Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.customers.returningCount}
              </div>
              <div className="text-sm text-gray-600">Returning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.customers.repeatRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Repeat Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.customers.predictedChurnPct.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Predicted Churn</div>
            </div>
          </div>
          
          {/* Time to Second Order */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              Median Time to 2nd Order
            </div>
            <div className="text-3xl font-bold text-[#5B6E02] mt-2">
              {data.customers.medianTimeToSecondOrderDays} days
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Products & Locations Section Component
const ProductsLocationsSection: React.FC<{ data: BusinessSnapshotData; onExportProducts: () => void; onExportZips: () => void }> = ({ data, onExportProducts, onExportZips }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <Card className="p-6 bg-[#F7F2EC] shadow-sm border border-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top Products
          </h3>
          <Button variant="secondary" onClick={onExportProducts} title="Export products data">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div>
          <div className="space-y-3">
            {data.products.top.map((product) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.units} units • ${product.revenue.toLocaleString()} revenue
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {product.refundRatePct.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">refund rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* ZIP Codes */}
      <Card className="p-6 bg-[#F7F2EC] shadow-sm border border-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top ZIP Codes
          </h3>
          <Button variant="secondary" onClick={onExportZips} title="Export ZIP codes data">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div>
          <div className="space-y-3">
            {/* Top 5 ZIP chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {data.zips.slice(0, 5).map((zip) => (
                <span key={zip.zip} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200">
                  {zip.zip} ({zip.sharePct.toFixed(1)}%)
                </span>
              ))}
            </div>
            
            {/* ZIP Table */}
            <div className="space-y-2">
              {data.zips.slice(0, 10).map((zip) => (
                <div key={zip.zip} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{zip.zip}</div>
                  <div className="text-sm text-gray-600">
                    {zip.orders} orders ({zip.sharePct.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Payout Panel Component
const PayoutPanel: React.FC<{ data: BusinessSnapshotData }> = ({ data }) => {
  return (
    <Card className="sticky top-6 p-6 bg-[#F7F2EC] shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payout & Fees
        </h3>
      </div>
      <div className="space-y-6">
        {/* Next Payout */}
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-800">Next Payout</div>
          <div className="text-lg font-bold text-green-900 mt-1">
            {data.payouts.nextDate ? new Date(data.payouts.nextDate).toLocaleDateString() : 'Pending'}
          </div>
          {data.payouts.nextAmount && (
            <div className="text-2xl font-bold text-green-900 mt-2">
              ${data.payouts.nextAmount.toLocaleString()}
            </div>
          )}
        </div>
        
        {/* 30d Fees Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Last 30 Days Fees</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fees</span>
              <span className="font-medium">${data.payouts.last30d.platformFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Fees</span>
              <span className="font-medium">${data.payouts.last30d.paymentFees.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-medium">
              <span>Total Fees</span>
              <span>${(data.payouts.last30d.platformFees + data.payouts.last30d.paymentFees).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Tax Collected */}
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800">Tax Collected</div>
          <div className="text-2xl font-bold text-blue-900 mt-2">
            ${data.payouts.last30d.taxCollected.toLocaleString()}
          </div>
          <Button 
            variant="secondary" 
            onClick={() => window.open('https://dashboard.stripe.com/tax', '_blank')}
            title="Open Stripe Tax Dashboard"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Stripe Tax
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-2">
          <Button 
            variant="secondary" 
            onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
            title="Open Stripe Dashboard"
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Stripe Dashboard
          </Button>
        </div>
      </div>
    </Card>
  );
};
