import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Eye,
  MousePointer,
  Gift,
  Calendar,
  Download,
  Filter,
  Search,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Settings,
  MoreHorizontal,
  X,
  Percent,
  Activity,
  CreditCard,
  ShoppingCart,
  MessageSquare,
  Share2,
  Heart
} from 'lucide-react';

// Consolidated analytics types
interface AnalyticsDashboard {
  dateRange: { startDate: string; endDate: string };
  overview: {
    activeCampaigns: number;
    activePromotions: number;
    totalRevenue: number;
    totalPromotionUses: number;
    totalSocialEngagement: number;
  };
  campaigns: {
    totals: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
      cost: number;
      reach: number;
      engagement: number;
    };
    roi: number;
    topPerforming: Array<{
      id: string;
      name: string;
      type: string;
      revenue: number;
      conversions: number;
    }>;
  };
  promotions: {
    totals: {
      views: number;
      uses: number;
      revenue: number;
      discountGiven: number;
    };
    conversionRate: number;
    topPerforming: Array<{
      id: string;
      name: string;
      type: string;
      code?: string;
      revenue: number;
      uses: number;
    }>;
  };
  socialMedia: {
    totals: {
      impressions: number;
      reach: number;
      likes: number;
      comments: number;
      shares: number;
      clicks: number;
    };
    engagementRate: number;
    postCount: number;
  };
}

interface CampaignPerformance {
  campaign: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  dateRange: { startDate: string; endDate: string };
  totals: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    reach: number;
    engagement: number;
  };
  metrics: {
    clickThroughRate: number;
    conversionRate: number;
    costPerClick: number;
    roi: number;
    engagementRate: number;
  };
  dailyData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    reach: number;
    engagement: number;
  }>;
  promotions: Array<{
    id: string;
    name: string;
    type: string;
    code?: string;
    views: number;
    uses: number;
    revenue: number;
    discountGiven: number;
    conversionRate: number;
    totalUses: number;
  }>;
}

interface PromotionPerformance {
  promotion: {
    id: string;
    name: string;
    type: string;
    code?: string;
    campaign?: {
      id: string;
      name: string;
      type: string;
    };
  };
  dateRange: { startDate: string; endDate: string };
  totals: {
    views: number;
    uses: number;
    revenue: number;
    discountGiven: number;
  };
  metrics: {
    conversionRate: number;
    avgDiscountPerUse: number;
    avgRevenuePerUse: number;
    totalUses: number;
    uniqueCustomers: number;
    repeatUsageRate: number;
  };
  dailyData: Array<{
    date: string;
    views: number;
    uses: number;
    revenue: number;
    discountGiven: number;
    conversionRate: number;
  }>;
  usagePatterns: {
    byDayOfWeek: { [key: string]: number };
    byHour: { [key: string]: number };
  };
  topCustomers: Array<{
    count: number;
    discount: number;
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }>;
  recentUsage: Array<{
    id: string;
    userId: string;
    usedAt: string;
    discountAmount: number;
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }>;
}

const ConsolidatedAnalyticsManager: React.FC = () => {
  // Consolidated state management
  const [activeView, setActiveView] = useState<'dashboard' | 'campaigns' | 'promotions' | 'social'>('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Consolidated API calls - single dashboard endpoint instead of multiple separate calls
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['promotions-analytics-dashboard', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await fetch(`/api/vendor/promotions-analytics/dashboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard analytics');
      const result = await response.json();
      return result.data as AnalyticsDashboard;
    }
  });

  const { data: campaignPerformance, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign-performance', selectedCampaign, dateRange],
    queryFn: async () => {
      if (!selectedCampaign) return null;
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await fetch(`/api/vendor/promotions-analytics/campaigns/${selectedCampaign}/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch campaign performance');
      const result = await response.json();
      return result.data as CampaignPerformance;
    },
    enabled: !!selectedCampaign
  });

  const { data: promotionPerformance, isLoading: promotionLoading } = useQuery({
    queryKey: ['promotion-performance', selectedPromotion, dateRange],
    queryFn: async () => {
      if (!selectedPromotion) return null;
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await fetch(`/api/vendor/promotions-analytics/promotions/${selectedPromotion}/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch promotion performance');
      const result = await response.json();
      return result.data as PromotionPerformance;
    },
    enabled: !!selectedPromotion
  });

  // Consolidated metric cards component
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Consolidated dashboard view
  const renderDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-6">
        {/* Overview metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Active Campaigns"
            value={dashboardData.overview.activeCampaigns}
            icon={Target}
            color="bg-blue-600"
          />
          <MetricCard
            title="Active Promotions"
            value={dashboardData.overview.activePromotions}
            icon={Percent}
            color="bg-green-600"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${dashboardData.overview.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-purple-600"
          />
          <MetricCard
            title="Promotion Uses"
            value={dashboardData.overview.totalPromotionUses.toLocaleString()}
            icon={ShoppingCart}
            color="bg-orange-600"
          />
          <MetricCard
            title="Social Engagement"
            value={dashboardData.overview.totalSocialEngagement.toLocaleString()}
            icon={Heart}
            color="bg-pink-600"
          />
        </div>

        {/* Campaign performance overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Impressions</span>
                <span className="font-semibold">{dashboardData.campaigns.totals.impressions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Clicks</span>
                <span className="font-semibold">{dashboardData.campaigns.totals.clicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Conversions</span>
                <span className="font-semibold">{dashboardData.campaigns.totals.conversions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI</span>
                <span className={`font-semibold ${dashboardData.campaigns.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardData.campaigns.roi}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views</span>
                <span className="font-semibold">{dashboardData.promotions.totals.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Uses</span>
                <span className="font-semibold">{dashboardData.promotions.totals.uses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-blue-600">{dashboardData.promotions.conversionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discounts Given</span>
                <span className="font-semibold">${dashboardData.promotions.totals.discountGiven.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
            <div className="space-y-3">
              {dashboardData.campaigns.topPerforming.slice(0, 5).map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{campaign.name}</span>
                    <p className="text-sm text-gray-600">{campaign.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${campaign.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{campaign.conversions} conversions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Promotions</h3>
            <div className="space-y-3">
              {dashboardData.promotions.topPerforming.slice(0, 5).map((promotion, index) => (
                <div key={promotion.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{promotion.name}</span>
                    <p className="text-sm text-gray-600">
                      {promotion.code && <code className="bg-gray-100 px-1 rounded">{promotion.code}</code>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${promotion.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{promotion.uses} uses</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social media overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{dashboardData.socialMedia.totals.impressions.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{dashboardData.socialMedia.totals.reach.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Reach</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {(dashboardData.socialMedia.totals.likes + dashboardData.socialMedia.totals.comments + dashboardData.socialMedia.totals.shares).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Engagements</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dashboardData.socialMedia.engagementRate}%</p>
              <p className="text-sm text-gray-600">Engagement Rate</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Consolidated campaign details view
  const renderCampaignDetails = () => {
    if (!campaignPerformance) return <div>Select a campaign to view details</div>;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaignPerformance.campaign.name}</h3>
          <p className="text-gray-600 mb-4">{campaignPerformance.campaign.type} • {campaignPerformance.campaign.status}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Click-through Rate</p>
              <p className="text-2xl font-bold text-blue-600">{campaignPerformance.metrics.clickThroughRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">{campaignPerformance.metrics.conversionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cost per Click</p>
              <p className="text-2xl font-bold text-orange-600">${campaignPerformance.metrics.costPerClick}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ROI</p>
              <p className={`text-2xl font-bold ${campaignPerformance.metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {campaignPerformance.metrics.roi}%
              </p>
            </div>
          </div>
        </div>

        {/* Campaign promotions performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Performance</h3>
          <div className="space-y-3">
            {campaignPerformance.promotions.map((promotion) => (
              <div key={promotion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{promotion.name}</p>
                  <p className="text-sm text-gray-600">
                    {promotion.code && <code className="bg-white px-2 py-1 rounded">{promotion.code}</code>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${promotion.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{promotion.uses} uses • {promotion.conversionRate}% CVR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Consolidated promotion details view
  const renderPromotionDetails = () => {
    if (!promotionPerformance) return <div>Select a promotion to view details</div>;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{promotionPerformance.promotion.name}</h3>
          {promotionPerformance.promotion.code && (
            <code className="bg-gray-100 px-3 py-1 rounded text-sm">{promotionPerformance.promotion.code}</code>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-blue-600">{promotionPerformance.metrics.conversionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-green-600">{promotionPerformance.metrics.uniqueCustomers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Revenue per Use</p>
              <p className="text-2xl font-bold text-purple-600">${promotionPerformance.metrics.avgRevenuePerUse}</p>
            </div>
          </div>
        </div>

        {/* Usage patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Day of Week</h3>
            <div className="space-y-2">
              {Object.entries(promotionPerformance.usagePatterns.byDayOfWeek)
                .sort(([,a], [,b]) => b - a)
                .map(([day, count]) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-gray-700">{day}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {promotionPerformance.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{customer.user.name || customer.user.email}</p>
                    <p className="text-sm text-gray-600">{customer.count} uses</p>
                  </div>
                  <p className="font-semibold text-green-600">${customer.discount.toFixed(2)} saved</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Consolidated header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track and analyze your promotional performance</p>
        </div>

        {/* Date range selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="analytics-start-date" className="text-sm text-gray-600">From:</label>
            <input
              id="analytics-start-date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              title="Start date"
              aria-label="Start date"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="analytics-end-date" className="text-sm text-gray-600">To:</label>
            <input
              id="analytics-end-date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              title="End date"
              aria-label="End date"
            />
          </div>
        </div>
      </div>

      {/* Consolidated navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'campaigns', label: 'Campaigns', icon: Target },
            { id: 'promotions', label: 'Promotions', icon: Percent },
            { id: 'social', label: 'Social Media', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Consolidated content */}
      {dashboardLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'campaigns' && renderCampaignDetails()}
          {activeView === 'promotions' && renderPromotionDetails()}
          {activeView === 'social' && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Media Analytics</h3>
              <p className="text-gray-600">Social media analytics coming soon...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConsolidatedAnalyticsManager;
