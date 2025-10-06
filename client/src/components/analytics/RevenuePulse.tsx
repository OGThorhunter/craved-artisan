import React, { useState } from 'react';
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface DateRange {
  from: Date;
  to: Date;
}

interface RevenuePulseProps {
  vendorId?: string;
  className?: string;
}

const RevenuePulse: React.FC<RevenuePulseProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState('7 days');
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Mock data for the three metrics
  const mockData = {
    sales: {
      value: 2277.84,
      change: 12.9,
      trend: 'up'
    },
    followers: {
      value: 997,
      change: 14.5,
      trend: 'up'
    },
    averageOrderValue: {
      value: 36.16,
      change: 5.6,
      trend: 'up'
    }
  };

  // Generate mock chart data based on metric and time range
  const getMetricValue = (metric: string, index: number, totalPoints: number) => {
    const baseValues = {
      sales: 1500,
      followers: 800,
      averageOrderValue: 30
    };
    
    const baseValue = baseValues[metric as keyof typeof baseValues] || 1000;
    const trend = Math.sin((index / totalPoints) * Math.PI * 2) * 0.3;
    const random = (Math.random() - 0.5) * 0.4;
    const multiplier = 1 + trend + random;
    
    return Math.round(baseValue * multiplier * 100) / 100;
  };

  const getChartData = (metric: string, timeRange: string) => {
    const data = [];
    const today = new Date();
    
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
          const date = new Date(today);
          const targetMonth = today.getMonth() - i;
          if (targetMonth < 0) {
            date.setFullYear(today.getFullYear() - 1);
            date.setMonth(12 + targetMonth);
          } else {
            date.setMonth(targetMonth);
          }
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, 4)
          });
        }
        break;
      case 'ytd':
        // Last 12 months (12 data points, one per month)
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          const targetMonth = today.getMonth() - i;
          if (targetMonth < 0) {
            date.setFullYear(today.getFullYear() - 1);
            date.setMonth(12 + targetMonth);
          } else {
            date.setMonth(targetMonth);
          }
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, 12)
          });
        }
        break;
      case 'custom': {
        // Custom date range
        const daysDiff = Math.ceil((customDateRange.to.getTime() - customDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        const dataPoints = Math.min(daysDiff, 30); // Limit to 30 data points max
        
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date(customDateRange.from);
          date.setDate(customDateRange.from.getDate() + i);
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, dataPoints)
          });
        }
        break;
      }
      default:
        // Default to 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          data.push({
            date: date.toISOString().split('T')[0],
            value: getMetricValue(metric, i, 7)
          });
        }
        break;
    }
    
    return data;
  };

  const getMetricLabel = (metric: string) => {
    const labels = {
      sales: 'Sales',
      followers: 'Followers',
      averageOrderValue: 'Average Order Value'
    };
    return labels[metric as keyof typeof labels] || metric;
  };

  const getTimeRangeLabel = (timeRange: string) => {
    const labels = {
      '7 days': 'Last 7 days',
      '30 days': 'Last 30 days',
      'qtd': 'Last 4 months',
      'ytd': 'Last 12 months',
      'custom': 'Custom Range'
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

  const timeRangeButtons = [
    { id: '7 days', label: '7 Days' },
    { id: '30 days', label: '30 Days' },
    { id: 'qtd', label: 'QTD' },
    { id: 'ytd', label: 'YTD' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const metrics = [
    {
      id: 'sales',
      label: 'Sales',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      value: mockData.sales.value,
      change: mockData.sales.change,
      trend: mockData.sales.trend
    },
    {
      id: 'followers',
      label: 'Followers',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      value: mockData.followers.value,
      change: mockData.followers.change,
      trend: mockData.followers.trend
    },
    {
      id: 'averageOrderValue',
      label: 'Avg Order Value',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      value: mockData.averageOrderValue.value,
      change: mockData.averageOrderValue.change,
      trend: mockData.averageOrderValue.trend
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Revenue Pulse Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Revenue Pulse</h2>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          {timeRangeButtons.map((button) => (
            <Button
              key={button.id}
              variant={timeRange === button.id ? 'primary' : 'secondary'}
              onClick={() => {
                if (button.id === 'custom') {
                  setShowCustomDateRange(!showCustomDateRange);
                } else {
                  setTimeRange(button.id);
                  setShowCustomDateRange(false);
                }
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                timeRange === button.id
                  ? 'bg-[#5B6E02] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomDateRange && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <DateRangePicker
              value={customDateRange}
              onChange={setCustomDateRange}
            />
            <Button
              onClick={() => {
                setTimeRange('custom');
                setShowCustomDateRange(false);
              }}
              className="px-4 py-2 bg-[#5B6E02] text-white rounded-md hover:bg-[#5B6E02]/80 transition-colors"
            >
              Apply Range
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isSelected = selectedMetric === metric.id;
          
          return (
            <Card
              key={metric.id}
              className={`p-6 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-[#5B6E02] ring-opacity-50 bg-[#5B6E02]/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                {isSelected && (
                  <div className="w-3 h-3 bg-[#5B6E02] rounded-full"></div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {metric.id === 'sales' ? `$${metric.value.toLocaleString()}` : 
                   metric.id === 'followers' ? metric.value.toLocaleString() :
                   `$${metric.value.toFixed(2)}`}
                </div>
                
                <div className="flex items-center gap-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    +{metric.change}%
                  </span>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-7)}>
                    <Bar 
                      dataKey="value" 
                      fill={metric.color.replace('text-', '')}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Interactive Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {getMetricLabel(selectedMetric)} Performance
          </h3>
          <span className="text-sm text-gray-500">
            {getTimeRangeLabel(timeRange)}
          </span>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                interval={timeRange === 'custom' ? (() => {
                  const daysDiff = Math.ceil((customDateRange.to.getTime() - customDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                  if (daysDiff <= 7) return 0; // Show every day
                  if (daysDiff <= 30) return 2; // Show every 3rd day
                  if (daysDiff <= 90) return 6; // Show every week
                  return 14; // Show every 2 weeks for longer periods
                })() : undefined}
                tickFormatter={(value) => {
                  if (timeRange === '7 days') {
                    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } else if (timeRange === '30 days') {
                    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } else if (timeRange === 'qtd' || timeRange === 'ytd') {
                    return new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  } else if (timeRange === 'custom') {
                    // Smart intervals for custom date ranges
                    const daysDiff = Math.ceil((customDateRange.to.getTime() - customDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff <= 7) {
                      // Show every day for 7 days or less
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else if (daysDiff <= 30) {
                      // Show every 3 days for up to 30 days
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else if (daysDiff <= 90) {
                      // Show every week for up to 90 days
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else {
                      // Show monthly for longer periods
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }
                  }
                  return value;
                }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => {
                  if (selectedMetric === 'sales' || selectedMetric === 'averageOrderValue') {
                    return `$${value.toLocaleString()}`;
                  }
                  return value.toLocaleString();
                }}
              />
              <RechartsTooltip
                formatter={(value: number) => {
                  if (selectedMetric === 'sales' || selectedMetric === 'averageOrderValue') {
                    return [`$${Number(value).toLocaleString()}`, getMetricLabel(selectedMetric)];
                  }
                  return [Number(value).toLocaleString(), getMetricLabel(selectedMetric)];
                }}
                labelFormatter={(label) => {
                  if (timeRange === '7 days' || timeRange === '30 days') {
                    return new Date(label).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
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
  );
};

export default RevenuePulse;
