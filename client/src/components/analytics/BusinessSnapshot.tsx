import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  CreditCard,
  AlertTriangle,
  Download,
  BarChart3,
  RefreshCw,
  ExternalLink,
  FileText,
  Table
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
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
  salesChannels: Array<{ channel: string; sales: number; sharePct: number }>;
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
  { label: '7 days', days: 7 },
  { label: 'QTD', days: 'qtd' },
  { label: 'YTD', days: 'ytd' },
  { label: 'Custom', days: 'custom' }
] as const;

export const BusinessSnapshot: React.FC<BusinessSnapshotProps> = ({ 
  vendorId, 
  className = '' 
}) => {
  console.log('BusinessSnapshot component rendered with vendorId:', vendorId);
  
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return { from: thirtyDaysAgo, to: today };
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('7 days');
  const [selectedMetric, setSelectedMetric] = useState<string>('netSales');

  // Fetch business snapshot data
  const { data: snapshotData, isLoading, error, refetch } = useQuery({
    queryKey: ['business-snapshot', vendorId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      console.log('Fetching business snapshot data for vendorId:', vendorId);
      console.log('Date range:', dateRange.from.toISOString().split('T')[0], 'to', dateRange.to.toISOString().split('T')[0]);
      
      // Calculate date range multiplier for dynamic data
      const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const rangeMultiplier = Math.max(1, daysDiff / 30); // Normalize to 30-day baseline
      
      // TEMPORARY: Use mock data that changes based on date range
      console.log('Using mock data for Business Snapshot with range multiplier:', rangeMultiplier);
      
      // Add small delay to simulate data loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockData: BusinessSnapshotData = {
        range: {
          dateFrom: dateRange.from.toISOString().split('T')[0],
          dateTo: dateRange.to.toISOString().split('T')[0]
        },
        sales: {
          gross: Math.round(15420.50 * rangeMultiplier * 100) / 100,
          refundsValue: Math.round(245.80 * rangeMultiplier * 100) / 100,
          refundsCount: Math.round(12 * rangeMultiplier),
          discountsValue: Math.round(156.20 * rangeMultiplier * 100) / 100,
          platformFees: Math.round(462.62 * rangeMultiplier * 100) / 100,
          paymentFees: Math.round(231.31 * rangeMultiplier * 100) / 100,
          netSales: Math.round(14324.37 * rangeMultiplier * 100) / 100,
          estNetPayout: Math.round(13630.44 * rangeMultiplier * 100) / 100,
          ordersCount: Math.round(342 * rangeMultiplier),
          aov: Math.round(44.80 * 100) / 100, // AOV typically doesn't scale with time
          disputesOpen: Math.round(2 * rangeMultiplier),
          disputeRate: Math.round(0.6 * 100) / 100 // Rate stays consistent
        },
        funnel: {
          stages: [
            { name: 'Visitors', count: Math.round(2740 * rangeMultiplier) },
            { name: 'Page Views', count: Math.round(1820 * rangeMultiplier) },
            { name: 'Add to Cart', count: Math.round(456 * rangeMultiplier) },
            { name: 'Checkout', count: Math.round(342 * rangeMultiplier) },
            { name: 'Completed', count: Math.round(312 * rangeMultiplier) }
          ],
          abandonment: {
            cartRate: Math.round(25.0 * 100) / 100, // Rate stays consistent
            checkoutRate: Math.round(8.8 * 100) / 100 // Rate stays consistent
          },
          blockers: ['High shipping costs', 'Payment method not available']
        },
        customers: {
          newCount: Math.round(41 * rangeMultiplier),
          returningCount: Math.round(87 * rangeMultiplier),
          repeatRate: Math.round(68.2 * 100) / 100, // Rate stays consistent
          predictedChurnPct: Math.round(12.5 * 100) / 100, // Rate stays consistent
          medianTimeToSecondOrderDays: 14 // Time metric stays consistent
        },
        products: {
          top: [
            { productId: 'prod-1', name: 'Artisan Bread', units: Math.round(89 * rangeMultiplier), revenue: Math.round(1245.50 * rangeMultiplier * 100) / 100, refundRatePct: 1.2 },
            { productId: 'prod-2', name: 'Organic Coffee', units: Math.round(67 * rangeMultiplier), revenue: Math.round(980.25 * rangeMultiplier * 100) / 100, refundRatePct: 0.8 },
            { productId: 'prod-3', name: 'Gluten-Free Cookies', units: Math.round(54 * rangeMultiplier), revenue: Math.round(756.80 * rangeMultiplier * 100) / 100, refundRatePct: 2.1 }
          ],
          underperforming: [
            { productId: 'prod-4', name: 'Seasonal Jam', views: Math.round(45 * rangeMultiplier), orders: Math.round(3 * rangeMultiplier), revenue: Math.round(67.50 * rangeMultiplier * 100) / 100 },
            { productId: 'prod-5', name: 'Herbal Tea', views: Math.round(32 * rangeMultiplier), orders: Math.round(2 * rangeMultiplier), revenue: Math.round(28.00 * rangeMultiplier * 100) / 100 }
          ],
          lowStockCount: Math.round(2 * rangeMultiplier)
        },
        salesChannels: [
          { channel: 'Direct Website', sales: Math.round(1250 * rangeMultiplier), sharePct: 35.2 },
          { channel: 'Social Media', sales: Math.round(890 * rangeMultiplier), sharePct: 25.1 },
          { channel: 'Email Marketing', sales: Math.round(680 * rangeMultiplier), sharePct: 19.2 },
          { channel: 'Referral Program', sales: Math.round(420 * rangeMultiplier), sharePct: 11.8 },
          { channel: 'Paid Ads', sales: Math.round(310 * rangeMultiplier), sharePct: 8.7 }
        ],
        payouts: {
          nextDate: '2024-01-15',
          nextAmount: Math.round(3842.50 * rangeMultiplier * 100) / 100,
          last30d: {
            platformFees: Math.round(462.62 * rangeMultiplier * 100) / 100,
            paymentFees: Math.round(231.31 * rangeMultiplier * 100) / 100,
            taxCollected: Math.round(856.20 * rangeMultiplier * 100) / 100
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
    
    if (preset.days === 'qtd') {
      // Quarter to date - last 4 months
      from.setMonth(today.getMonth() - 3, 1);
    } else if (preset.days === 'ytd') {
      // Year to date - last 12 months
      from.setMonth(today.getMonth() - 11, 1);
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
    console.log('Refreshing business snapshot data...');
    try {
      refetch();
      console.log('Refresh triggered successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Error refreshing data. Please try again.');
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [showExportAllDropdown, setShowExportAllDropdown] = useState(false);
  const exportAllDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportAllDropdownRef.current && !exportAllDropdownRef.current.contains(event.target as Node)) {
        setShowExportAllDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSyncStripe = async () => {
    console.log('Starting Stripe sync...');
    setIsSyncing(true);
    try {
      const response = await axios.post('/api/vendor/analytics/sync-stripe', {
        dateFrom: dateRange.from.toISOString().split('T')[0],
        dateTo: dateRange.to.toISOString().split('T')[0]
      }, {
        withCredentials: true
      });
      
      console.log('Stripe sync response:', response.data);
      
      if (response.data.success) {
        // Refresh data after sync
        refetch();
        alert('Stripe data synced successfully!');
        console.log('Stripe data synced successfully:', response.data.result);
      } else {
        alert('Stripe sync completed but no data was updated.');
        console.log('Stripe sync completed but no data was updated:', response.data);
      }
    } catch (error) {
      console.error('Failed to sync Stripe data:', error);
      alert('Failed to sync Stripe data. Please check your connection and try again.');
    } finally {
      setIsSyncing(false);
    }
  };


  const handleExportAll = (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    console.log('Export all called with format:', format);
    console.log('Snapshot data:', snapshotData);
    
    if (!snapshotData) {
      console.error('No data available for export');
      alert('No data available for export. Please wait for data to load.');
      return;
    }

    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    console.log('Date range:', { dateFrom, dateTo });
    
    try {
      if (format === 'csv') {
        // Create CSV content from current data with better formatting
        const csvContent = `Business Snapshot Comprehensive Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateFrom} to ${dateTo}

Sales Metrics:
Metric,Value
"Net Sales","$${snapshotData.sales.netSales.toLocaleString()}"
"Orders","${snapshotData.sales.ordersCount.toLocaleString()}"
"AOV","$${snapshotData.sales.aov.toFixed(2)}"
"Refund Rate","${((snapshotData.sales.refundsCount / snapshotData.sales.ordersCount) * 100).toFixed(1)}%"
"Discounts","$${snapshotData.sales.discountsValue.toLocaleString()}"
"Est. Net Payout","$${snapshotData.sales.estNetPayout.toLocaleString()}"
"Open Disputes","${snapshotData.sales.disputesOpen.toString()}"

Customer Metrics:
"New Customers","${snapshotData.customers.newCount.toString()}"
"Returning Customers","${snapshotData.customers.returningCount.toString()}"
"Repeat Rate","${snapshotData.customers.repeatRate.toFixed(1)}%"
"Predicted Churn","${snapshotData.customers.predictedChurnPct.toFixed(1)}%"

Summary:
Total Revenue: $${snapshotData.sales.netSales.toLocaleString()}
Total Orders: ${snapshotData.sales.ordersCount.toLocaleString()}
Average Order Value: $${snapshotData.sales.aov.toFixed(2)}
Customer Growth: ${snapshotData.customers.newCount} new customers`;

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `business-snapshot-report-${dateFrom}-to-${dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        alert('PDF export requires jsPDF library. Please run: npm install jspdf jspdf-autotable');
      } else if (format === 'excel') {
        alert('Excel export requires xlsx library. Please run: npm install xlsx');
      }
      
      console.log(`Export all (${format}) completed successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleExportProducts = (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    console.log('Export products called with format:', format);
    console.log('Snapshot data:', snapshotData);
    
    if (!snapshotData) {
      console.error('No data available for export');
      alert('No data available for export. Please wait for data to load.');
      return;
    }

    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    console.log('Date range:', { dateFrom, dateTo });
    console.log('Products data:', snapshotData.products);
    
    try {
      if (format === 'csv') {
        // Create CSV content from current data with better formatting
        const csvContent = `Top Products Performance Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateFrom} to ${dateTo}

Product Name,Units Sold,Revenue,Refund Rate
${snapshotData.products.top.map(product => 
  `"${product.name}","${product.units}","$${product.revenue.toLocaleString()}","${product.refundRatePct.toFixed(1)}%"`
).join('\n')}

Summary:
Total Products: ${snapshotData.products.top.length}
Top Seller: ${snapshotData.products.top[0]?.name || 'N/A'}
Highest Revenue: $${snapshotData.products.top[0]?.revenue.toLocaleString() || '0'}`;

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products-report-${dateFrom}-to-${dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        alert('PDF export requires jsPDF library. Please run: npm install jspdf jspdf-autotable');
      } else if (format === 'excel') {
        alert('Excel export requires xlsx library. Please run: npm install xlsx');
      }
      
      console.log(`Export products (${format}) completed successfully`);
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Error exporting products. Please try again.');
    }
  };

  const handleExportSalesChannels = (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    console.log('Export sales channels called with format:', format);
    console.log('Snapshot data:', snapshotData);
    
    if (!snapshotData) {
      console.error('No data available for export');
      alert('No data available for export. Please wait for data to load.');
      return;
    }

    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    console.log('Date range:', { dateFrom, dateTo });
    console.log('Sales channels data:', snapshotData.salesChannels);
    
    try {
      if (format === 'csv') {
        // Create CSV content from current data with better formatting
        const csvContent = `Sales Channels Performance Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateFrom} to ${dateTo}

Channel Name,Sales Amount,Market Share
${snapshotData.salesChannels.map(channel => 
  `"${channel.channel}","$${channel.sales.toLocaleString()}","${channel.sharePct.toFixed(1)}%"`
).join('\n')}

Summary:
Total Channels: ${snapshotData.salesChannels.length}
Top Performer: ${snapshotData.salesChannels[0]?.channel || 'N/A'}
Highest Sales: $${snapshotData.salesChannels[0]?.sales.toLocaleString() || '0'}`;

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-channels-report-${dateFrom}-to-${dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Create PDF using jsPDF (will be implemented when library is available)
        alert('PDF export requires jsPDF library. Please run: npm install jspdf jspdf-autotable');
      } else if (format === 'excel') {
        // Create Excel using xlsx (will be implemented when library is available)
        alert('Excel export requires xlsx library. Please run: npm install xlsx');
      }
      
      console.log(`Export sales channels (${format}) completed successfully`);
    } catch (error) {
      console.error('Error exporting sales channels:', error);
      alert('Error exporting sales channels. Please try again.');
    }
  };

  const handleExportFunnel = (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    if (!snapshotData) {
      console.error('No data available for export');
      alert('No data available for export. Please wait for data to load.');
      return;
    }

    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];
    
    console.log('Export funnel called with format:', format);
    console.log('Snapshot data:', snapshotData);
    console.log('Funnel data:', snapshotData.funnel);
    
    try {
      if (format === 'csv') {
        // Create CSV content from current data with better formatting
        const csvContent = `Sales & Checkout Funnel Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateFrom} to ${dateTo}

Stage,Count,Conversion Rate
${snapshotData.funnel.stages.map((stage, index) => {
  const prevStage = snapshotData.funnel.stages[index - 1];
  const conversionRate = prevStage ? ((stage.count / prevStage.count) * 100).toFixed(1) : '100.0';
  return `"${stage.name}","${stage.count}","${conversionRate}%"`;
}).join('\n')}

Abandonment Metrics:
Cart Abandonment Rate,${snapshotData.funnel.abandonment.cartRate.toFixed(1)}%
Checkout Abandonment Rate,${snapshotData.funnel.abandonment.checkoutRate.toFixed(1)}%

Summary:
Total Stages: ${snapshotData.funnel.stages.length}
Starting Count: ${snapshotData.funnel.stages[0]?.count || 0}
Final Count: ${snapshotData.funnel.stages[snapshotData.funnel.stages.length - 1]?.count || 0}
Overall Conversion: ${snapshotData.funnel.stages.length > 0 ? ((snapshotData.funnel.stages[snapshotData.funnel.stages.length - 1].count / snapshotData.funnel.stages[0].count) * 100).toFixed(1) : '0.0'}%`;

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `funnel-report-${dateFrom}-to-${dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        alert('PDF export requires jsPDF library. Please run: npm install jspdf jspdf-autotable');
      } else if (format === 'excel') {
        alert('Excel export requires xlsx library. Please run: npm install xlsx');
      }
      
      console.log(`Export funnel (${format}) completed successfully`);
    } catch (error) {
      console.error('Error exporting funnel:', error);
      alert('Error exporting funnel. Please try again.');
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
      <div className="bg-[#F7F2EC] rounded-lg shadow-sm shadow-md p-6">
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
              <div className="relative" ref={exportAllDropdownRef}>
                <Button
                  variant="secondary"
                  onClick={() => setShowExportAllDropdown(!showExportAllDropdown)}
                  title="Export all data"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
                {showExportAllDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleExportAll('csv');
                          setShowExportAllDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExportAll('excel');
                          setShowExportAllDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Table className="w-4 h-4 mr-2" />
                        Export as Excel
                      </button>
                      <button
                        onClick={() => {
                          handleExportAll('pdf');
                          setShowExportAllDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export as PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Section A: Today/Period KPIs */}
          <KPICards 
            data={snapshotData} 
            selectedMetric={selectedMetric}
            onMetricSelect={setSelectedMetric}
            timeRange={selectedPreset}
            dateRange={dateRange}
          />
          
          {/* Section B: Sales & Checkout Funnel */}
          <FunnelSection data={snapshotData} onExportFunnel={handleExportFunnel} />
          
          {/* Section C: Customers & Retention */}
          <CustomersSection data={snapshotData} />
          
          {/* Section D: Products & Locations */}
          <ProductsLocationsSection data={snapshotData} onExportProducts={handleExportProducts} onExportSalesChannels={handleExportSalesChannels} />
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
const KPICards: React.FC<{ 
  data: BusinessSnapshotData;
  selectedMetric: string;
  onMetricSelect: (metric: string) => void;
  timeRange: string;
  dateRange: DateRange;
}> = ({ data, selectedMetric, onMetricSelect, timeRange, dateRange }) => {
  // Generate chart data based on selected metric and time range
  const getChartData = (metric: string, timeRange: string) => {
    const data = [];
    const today = new Date();
    
    // Calculate days difference to determine if we should use monthly intervals
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const shouldUseMonthlyIntervals = daysDiff > 90; // Use monthly for periods > 90 days
    
    switch (timeRange) {
      case '7 days':
        // Last 7 days (7 data points, one per day)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, 7)
          });
        }
        break;
      case '30 days':
        // Last 30 days (30 data points, one per day)
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, 30)
          });
        }
        break;
      case 'qtd':
        // Last 4 months (4 data points, one per month)
        for (let i = 3; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, 4)
          });
        }
        break;
      case 'ytd':
        // Last 12 months (12 data points, one per month)
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, 12)
          });
        }
        break;
      default:
        // For custom ranges, determine interval based on duration
        if (shouldUseMonthlyIntervals) {
          // Use monthly intervals for long periods
          const monthsDiff = Math.ceil(daysDiff / 30);
          for (let i = monthsDiff - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            data.push({
              date: date.toISOString().split('T')[0],
              value: getMetricValue(metric, i, monthsDiff)
            });
          }
        } else {
          // Use daily intervals for short periods
          for (let i = daysDiff - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            data.push({
              date: date.toISOString().split('T')[0],
              value: getMetricValue(metric, i, daysDiff)
            });
          }
        }
        break;
    }
    
    return data;
  };

  // Generate mock metric values based on metric type
  const getMetricValue = (metric: string, index: number, totalPoints: number) => {
    const baseValues = {
      netSales: 1500,
      ordersCount: 50,
      aov: 30,
      refundRate: 5,
      discounts: 200,
      estNetPayout: 1200,
      disputes: 2,
      totalProductsSold: 210
    };
    
    const baseValue = baseValues[metric as keyof typeof baseValues] || 1000;
    
    // Create more realistic monthly patterns for YTD
    let trend, random;
    if (totalPoints === 12) { // YTD - 12 months
      // Seasonal pattern with holiday spike
      const seasonalAdjustment = index === 10 ? 1.5 : index === 11 ? 1.3 : 1; // Nov/Dec boost
      trend = Math.sin((index / totalPoints) * Math.PI * 2) * 0.2 * seasonalAdjustment;
      random = (Math.random() - 0.5) * 0.3;
    } else {
      // Regular pattern for other time ranges
      trend = Math.sin((index / totalPoints) * Math.PI * 2) * 0.3;
      random = (Math.random() - 0.5) * 0.4;
    }
    
    const multiplier = 1 + trend + random;
    
    return Math.round(baseValue * multiplier * 100) / 100;
  };

  const getMetricLabel = (metric: string) => {
    const labels = {
      netSales: 'Net Sales',
      ordersCount: 'Orders',
      aov: 'Average Order Value',
      refundRate: 'Refund Rate',
      discounts: 'Discounts',
      estNetPayout: 'Est. Net Payout',
      disputes: 'Open Disputes',
      totalProductsSold: 'Total Products Sold'
    };
    return labels[metric as keyof typeof labels] || metric;
  };

  const getTimeRangeLabel = (timeRange: string) => {
    const labels = {
      '7 days': 'Last 7 days',
      '30 days': 'Last 30 days',
      'qtd': 'Last 4 months',
      'ytd': 'Last 12 months'
    };
    return labels[timeRange as keyof typeof labels] || timeRange;
  };

  const chartData = getChartData(selectedMetric, timeRange);
  
  // Fallback data if chartData is empty
  const safeChartData = chartData.length > 0 ? chartData : [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 150 },
    { date: '2024-01-03', value: 200 }
  ];

  const cards = [
    {
      title: 'Net Sales',
      value: `$${data.sales.netSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tooltip: 'Total sales after refunds and discounts',
      metricKey: 'netSales'
    },
    {
      title: 'Orders',
      value: data.sales.ordersCount.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tooltip: 'Total number of orders',
      metricKey: 'ordersCount'
    },
    {
      title: 'AOV',
      value: `$${data.sales.aov.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tooltip: 'Average order value',
      metricKey: 'aov'
    },
    {
      title: 'Refund Rate',
      value: `${((data.sales.refundsCount / data.sales.ordersCount) * 100).toFixed(1)}%`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      tooltip: 'Percentage of orders that were refunded',
      metricKey: 'refundRate'
    },
    {
      title: 'Discounts',
      value: `$${data.sales.discountsValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tooltip: 'Total discount value applied',
      metricKey: 'discounts'
    },
    {
      title: 'Est. Net Payout',
      value: `$${data.sales.estNetPayout.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tooltip: 'Estimated payout after all fees (see Stripe for final)',
      metricKey: 'estNetPayout'
    },
    {
      title: 'Open Disputes',
      value: data.sales.disputesOpen.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      tooltip: 'Number of open payment disputes',
      metricKey: 'disputes'
    },
    {
      title: 'Total Products Sold',
      value: data.products.top.reduce((sum, product) => sum + product.units, 0).toLocaleString(),
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tooltip: 'Total number of products sold across all top products',
      metricKey: 'totalProductsSold'
    }
  ];

  return (
    <Card className="p-6 bg-[#F7F2EC] shadow-sm shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Key Performance Indicators
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Tooltip key={index} content={card.tooltip}>
            <div 
              className={`${card.bgColor} shadow-sm rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                selectedMetric === card.metricKey 
                  ? 'ring-2 ring-brand-green shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onMetricSelect(card.metricKey)}
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                {selectedMetric === card.metricKey && (
                  <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                )}
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
      
      {/* Interactive Chart */}
      <div className="mt-8">
        <Card className="p-6 bg-white shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              {getMetricLabel(selectedMetric)} Performance
            </h4>
            <span className="text-sm text-gray-500">
              {getTimeRangeLabel(timeRange)}
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={safeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  interval={
                    timeRange === '30 days' ? 2 : 
                    (timeRange === 'ytd' || (timeRange === 'Custom' && Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) > 90)) ? 1 : 
                    undefined
                  }
                  tickFormatter={(value) => {
                    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                    const shouldUseMonthlyIntervals = daysDiff > 90;
                    
                    if (timeRange === '7 days' || timeRange === '30 days') {
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else if (timeRange === 'qtd' || timeRange === 'ytd' || shouldUseMonthlyIntervals) {
                      return new Date(value).toLocaleDateString('en-US', { month: 'short' });
                    }
                    return value;
                  }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (selectedMetric === 'netSales' || selectedMetric === 'aov' || selectedMetric === 'discounts' || selectedMetric === 'estNetPayout') {
                      return `$${value.toLocaleString()}`;
                    } else if (selectedMetric === 'refundRate') {
                      return `${value}%`;
                    }
                    return value.toLocaleString();
                  }}
                />
                <RechartsTooltip
                  formatter={(value: number) => {
                    if (selectedMetric === 'netSales' || selectedMetric === 'aov' || selectedMetric === 'discounts' || selectedMetric === 'estNetPayout') {
                      return [`$${Number(value).toLocaleString()}`, getMetricLabel(selectedMetric)];
                    } else if (selectedMetric === 'refundRate') {
                      return [`${Number(value).toFixed(1)}%`, getMetricLabel(selectedMetric)];
                    }
                    return [Number(value).toLocaleString(), getMetricLabel(selectedMetric)];
                  }}
                  labelFormatter={(label) => {
                    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                    const shouldUseMonthlyIntervals = daysDiff > 90;
                    
                    if (timeRange === '7 days' || timeRange === '30 days') {
                      return new Date(label).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    } else if (timeRange === 'qtd' || timeRange === 'ytd' || shouldUseMonthlyIntervals) {
                      return new Date(label).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      });
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#5B6E02" 
                  strokeWidth={3}
                  dot={{ fill: '#5B6E02', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#5B6E02', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Card>
  );
};

// Funnel Section Component
const FunnelSection: React.FC<{ data: BusinessSnapshotData; onExportFunnel: (format: 'csv' | 'pdf' | 'excel') => void }> = ({ data, onExportFunnel }) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Card className="p-6 bg-[#F7F2EC] shadow-sm shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Sales & Checkout Funnel
        </h3>
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="secondary" 
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            title="Export funnel data"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    onExportFunnel('csv');
                    setShowExportDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    onExportFunnel('excel');
                    setShowExportDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Table className="w-4 h-4 mr-2" />
                  Export as Excel
                </button>
                <button
                  onClick={() => {
                    onExportFunnel('pdf');
                    setShowExportDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </button>
              </div>
            </div>
          )}
        </div>
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
                {Math.round(data.funnel.stages[1].count * (data.funnel.abandonment.cartRate / 100)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Cart Abandonments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(data.funnel.stages[2].count * (data.funnel.abandonment.checkoutRate / 100)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Checkout Abandonments</div>
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
    <Card className="p-6 bg-[#F7F2EC] shadow-sm shadow-md">
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
const ProductsLocationsSection: React.FC<{ data: BusinessSnapshotData; onExportProducts: (format: 'csv' | 'pdf' | 'excel') => void; onExportSalesChannels: (format: 'csv' | 'pdf' | 'excel') => void }> = ({ data, onExportProducts, onExportSalesChannels }) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <Card className="p-6 bg-[#F7F2EC] shadow-sm shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top Products
          </h3>
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="secondary" 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              title="Export products data"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onExportProducts('csv');
                      setShowExportDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      onExportProducts('excel');
                      setShowExportDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Table className="w-4 h-4 mr-2" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => {
                      onExportProducts('pdf');
                      setShowExportDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
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
      
      {/* Sales Channels */}
      <Card className="p-6 bg-[#F7F2EC] shadow-sm shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Sales Channels
          </h3>
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="secondary" 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              title="Export sales channels data"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onExportSalesChannels('csv');
                      setShowExportDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      onExportSalesChannels('excel');
                      setShowExportDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Table className="w-4 h-4 mr-2" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => {
                      onExportSalesChannels('pdf');
                      setShowExportDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="space-y-3">
            {/* Top 5 Sales Channel chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {data.salesChannels.slice(0, 5).map((channel) => (
                <span key={channel.channel} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200">
                  {channel.channel}
                </span>
              ))}
            </div>
            
            {/* Sales Channels Table */}
            <div className="space-y-2">
              {data.salesChannels.slice(0, 5).map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{channel.channel}</div>
                  <div className="text-sm text-gray-600">
                    ${channel.sales.toLocaleString()} ({channel.sharePct.toFixed(1)}%)
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
    <Card className="sticky top-6 p-6 bg-[#F7F2EC] shadow-sm shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payout & Fees
        </h3>
      </div>
      <div className="space-y-6">
        {/* Next Payout */}
        <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
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
        <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-blue-800">Tax Collected</div>
          <div className="text-2xl font-bold text-blue-900 mt-2">
            ${data.payouts.last30d.taxCollected.toLocaleString()}
          </div>
          <Button 
            variant="secondary" 
            onClick={() => {
              console.log('Opening Stripe Tax Dashboard...');
              try {
                const newWindow = window.open('https://dashboard.stripe.com/tax', '_blank');
                if (!newWindow) {
                  alert('Popup blocked. Please allow popups for this site and try again.');
                } else {
                  console.log('Stripe Tax Dashboard opened successfully');
                }
              } catch (error) {
                console.error('Error opening Stripe Tax Dashboard:', error);
                alert('Error opening Stripe Tax Dashboard. Please try again.');
              }
            }}
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
            onClick={() => {
              console.log('Opening Stripe Dashboard...');
              try {
                const newWindow = window.open('https://dashboard.stripe.com', '_blank');
                if (!newWindow) {
                  alert('Popup blocked. Please allow popups for this site and try again.');
                } else {
                  console.log('Stripe Dashboard opened successfully');
                }
              } catch (error) {
                console.error('Error opening Stripe Dashboard:', error);
                alert('Error opening Stripe Dashboard. Please try again.');
              }
            }}
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


