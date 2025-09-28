import React, { useState } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Eye, Clock, Target, BarChart3 } from 'lucide-react';
import type { EventAnalytics, ZoneAnalytics, FunnelStep, PaceTracking, UTMAttribution } from '@/lib/api/analytics-communications';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercentage, 
  formatDuration,
  getPaceStatusColor,
  getPaceStatusText,
  calculateConversionRate,
  getRevenuePerVisitor,
  getRevenuePerOrder,
  getTrafficSourceBreakdown,
  getTopTrafficSources,
  getBestPerformingCampaigns,
  getROASLeaders,
  getZonePerformanceRanking,
  getZoneConversionRanking,
  getZoneOccupancyRanking
} from '@/lib/api/analytics-communications';

interface AnalyticsDashboardProps {
  analytics: EventAnalytics;
  zoneAnalytics: ZoneAnalytics[];
  funnelSteps: FunnelStep[];
  paceTracking: PaceTracking;
  utmAttribution: UTMAttribution[];
  loading?: boolean;
  onSetPaceGoals: (goals: any) => void;
}

export function AnalyticsDashboard({
  analytics,
  zoneAnalytics,
  funnelSteps,
  paceTracking,
  utmAttribution,
  loading = false,
  onSetPaceGoals
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'zones' | 'utm' | 'pace'>('overview');

  const trafficBreakdown = getTrafficSourceBreakdown(analytics);
  const topTrafficSources = getTopTrafficSources(utmAttribution);
  const bestCampaigns = getBestPerformingCampaigns(utmAttribution);
  const roasLeaders = getROASLeaders(utmAttribution);
  const zonePerformance = getZonePerformanceRanking(zoneAnalytics);
  const zoneConversion = getZoneConversionRanking(zoneAnalytics);
  const zoneOccupancy = getZoneOccupancyRanking(zoneAnalytics);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-md border animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Event performance insights and key metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Period:</span>
          <span className="text-sm font-medium">
            {new Date(analytics.periodStart).toLocaleDateString()} - {new Date(analytics.periodEnd).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
              <p className="text-sm text-gray-500">Revenue per visitor: {formatCurrency(getRevenuePerVisitor(analytics))}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalViews)}</p>
              <p className="text-sm text-gray-500">Unique visitors: {formatNumber(analytics.uniqueVisitors)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders Completed</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.ordersCompleted)}</p>
              <p className="text-sm text-gray-500">Avg order value: {formatCurrency(getRevenuePerOrder(analytics))}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics.overallConversionRate)}</p>
              <p className="text-sm text-gray-500">Avg session: {formatDuration(analytics.avgSessionDuration)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'funnel', label: 'Funnel', icon: Target },
              { id: 'zones', label: 'Zone Performance', icon: Users },
              { id: 'utm', label: 'UTM Attribution', icon: TrendingUp },
              { id: 'pace', label: 'Pace Tracking', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-brand-green text-brand-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Traffic Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Mobile</span>
                      <span className="text-sm font-bold text-gray-900">{formatPercentage(trafficBreakdown.mobile)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${trafficBreakdown.mobile}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(analytics.mobileTraffic)} visitors</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Desktop</span>
                      <span className="text-sm font-bold text-gray-900">{formatPercentage(trafficBreakdown.desktop)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${trafficBreakdown.desktop}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(analytics.desktopTraffic)} visitors</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Tablet</span>
                      <span className="text-sm font-bold text-gray-900">{formatPercentage(trafficBreakdown.tablet)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${trafficBreakdown.tablet}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(analytics.tabletTraffic)} visitors</p>
                  </div>
                </div>
              </div>

              {/* Top Traffic Sources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Traffic Sources</h3>
                <div className="space-y-3">
                  {topTrafficSources.map((source, index) => (
                    <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium text-gray-900">{source.utmSource}</span>
                        <span className="text-xs text-gray-500">{source.utmCampaign}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{formatNumber(source.totalViews)} views</span>
                        <span className="text-sm text-gray-600">{formatPercentage(source.conversionRate)}</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(source.totalRevenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'funnel' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
              <div className="space-y-4">
                {funnelSteps.map((step, index) => {
                  const previousStep = index > 0 ? funnelSteps[index - 1] : null;
                  const dropoffRate = previousStep ? 
                    ((previousStep.completedStep - step.completedStep) / previousStep.completedStep) * 100 : 0;
                  
                  return (
                    <div key={step.id} className="relative">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-brand-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {step.stepOrder}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{step.stepName}</h4>
                            <p className="text-sm text-gray-600">
                              {formatNumber(step.completedStep)} completed • {formatDuration(step.avgTimeOnStep)} avg time
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatPercentage(step.conversionRate)}</p>
                          <p className="text-sm text-gray-600">
                            {formatNumber(step.droppedOff)} dropped off
                          </p>
                        </div>
                      </div>
                      
                      {index < funnelSteps.length - 1 && (
                        <div className="flex items-center justify-center py-2">
                          <div className="w-px h-8 bg-gray-300"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Zone Performance</h3>
              
              {/* Zone Performance Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {zonePerformance.map((zone) => (
                      <tr key={zone.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{zone.zone?.name}</div>
                          <div className="text-sm text-gray-500">{zone.zone?.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(zone.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(zone.ordersCompleted)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(zone.conversionRate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(zone.occupancyRate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(zone.avgOrderValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'utm' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">UTM Attribution</h3>
              
              {/* Best Performing Campaigns */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Best Performing Campaigns</h4>
                <div className="space-y-3">
                  {bestCampaigns.map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{campaign.utmCampaign}</p>
                          <p className="text-xs text-gray-500">{campaign.utmSource} • {campaign.utmMedium}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{formatPercentage(campaign.conversionRate)}</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(campaign.totalRevenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROAS Leaders */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">ROAS Leaders</h4>
                <div className="space-y-3">
                  {roasLeaders.map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{campaign.utmCampaign}</p>
                          <p className="text-xs text-gray-500">Spent: {formatCurrency(campaign.adSpend || 0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">ROAS: {campaign.returnOnAdSpend?.toFixed(2)}x</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(campaign.totalRevenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pace' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pace vs Goals</h3>
              
              {/* Goal Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Revenue Goal</span>
                    <span 
                      className="inline-block px-2 py-1 text-xs rounded-full font-medium"
                      style={{ 
                        backgroundColor: getPaceStatusColor(paceTracking.paceStatus) + '20',
                        color: getPaceStatusColor(paceTracking.paceStatus)
                      }}
                    >
                      {getPaceStatusText(paceTracking.paceStatus)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {formatCurrency(paceTracking.currentRevenue)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    of {formatCurrency(paceTracking.salesGoal)} goal
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-green h-2 rounded-full" 
                      style={{ width: `${Math.min(paceTracking.revenueProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPercentage(paceTracking.revenueProgress)} complete
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Orders Goal</span>
                    <span className="text-xs text-gray-500">{paceTracking.daysRemaining} days left</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {formatNumber(paceTracking.currentOrders)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    of {formatNumber(paceTracking.ordersGoal)} goal
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-green h-2 rounded-full" 
                      style={{ width: `${Math.min(paceTracking.ordersProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPercentage(paceTracking.ordersProgress)} complete
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Stalls Goal</span>
                    <span className="text-xs text-gray-500">Required daily: {formatNumber(paceTracking.requiredDailyRevenue)}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {formatNumber(paceTracking.currentStalls)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    of {formatNumber(paceTracking.stallsGoal)} goal
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-green h-2 rounded-full" 
                      style={{ width: `${Math.min(paceTracking.stallsProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPercentage(paceTracking.stallsProgress)} complete
                  </div>
                </div>
              </div>

              {/* Projections */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-blue-900 mb-3">Projected Outcomes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Projected Revenue</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(paceTracking.projectedRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Projected Orders</p>
                    <p className="text-lg font-bold text-blue-900">{formatNumber(paceTracking.projectedOrders)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Confidence Level</p>
                    <p className="text-lg font-bold text-blue-900">{formatPercentage(paceTracking.confidenceLevel * 100)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
