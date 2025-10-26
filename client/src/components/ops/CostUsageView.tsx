import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Server, Database, Zap, Mail, CreditCard, HardDrive, TrendingUp, Activity } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';

export default function CostUsageView() {
  const { data: costs } = useQuery({
    queryKey: ['admin', 'ops', 'costs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/costs/current');
      if (!response.ok) throw new Error('Failed to fetch costs');
      const result = await response.json();
      return result.data;
    }
  });

  const { data: trend } = useQuery({
    queryKey: ['admin', 'ops', 'costs', 'trend'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/costs/trend');
      if (!response.ok) throw new Error('Failed to fetch cost trend');
      const result = await response.json();
      return result.data;
    }
  });

  const { data: usage } = useQuery({
    queryKey: ['admin', 'ops', 'usage'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/usage/metrics');
      if (!response.ok) throw new Error('Failed to fetch usage');
      const result = await response.json();
      return result.data;
    }
  });

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const costItems = costs ? [
    { name: 'Render (Hosting)', icon: Server, cost: costs.renderCostCents, color: 'text-blue-600' },
    { name: 'Redis (Cache)', icon: Zap, cost: costs.redisCostCents, color: 'text-purple-600' },
    { name: 'Database', icon: Database, cost: costs.databaseCostCents, color: 'text-green-600' },
    { name: 'SendGrid (Email)', icon: Mail, cost: costs.sendGridCostCents, color: 'text-orange-600' },
    { name: 'Stripe (Fees)', icon: CreditCard, cost: costs.stripeFeesCents, color: 'text-indigo-600' },
    { name: 'Storage', icon: HardDrive, cost: costs.storageCostCents, color: 'text-yellow-600' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Cost Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Daily Cost Breakdown (Estimates)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {costItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.name} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-gray-100 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-[#4b4b4b]">{item.name}</p>
                    <p className="text-xl font-bold text-[#2b2b2b]">{formatCost(item.cost)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {costs && (
          <Card className="p-6 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b4b4b]">Total Daily Cost</p>
                <p className="text-3xl font-bold text-[#2b2b2b]">{formatCost(costs.totalCostCents)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4b4b4b]">Estimated Monthly</p>
                <p className="text-2xl font-bold text-[#7F232E]">{formatCost(costs.totalCostCents * 30)}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These are estimates. Exact costs are available in provider dashboards (Render, Redis Cloud, SendGrid, Stripe).
          </p>
        </div>
      </div>

      {/* Cost Trend */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">30-Day Cost Trend</h3>
        <Card className="p-6">
          {trend && trend.length > 0 ? (
            <div className="space-y-4">
              {/* Simple bar chart */}
              <div className="space-y-2">
                {trend.slice(-10).map((day: any) => {
                  const widthPercent = Math.min((day.totalCostCents / 10000) * 100, 100);
                  const widthClass = widthPercent > 90 ? 'w-full' : widthPercent > 75 ? 'w-11/12' : widthPercent > 50 ? 'w-3/4' : widthPercent > 25 ? 'w-1/2' : 'w-1/4';
                  
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs text-[#4b4b4b] w-20">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden relative">
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <div className={`h-full bg-[#7F232E] flex items-center justify-end pr-2 absolute left-0 top-0 bottom-0`} style={{ width: `${widthPercent}%` }}>
                          <span className="text-xs text-white font-medium">
                            {formatCost(day.totalCostCents)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#7F232E]/10">
                <p className="text-sm text-[#4b4b4b]">
                  Average daily cost: {formatCost(
                    Math.floor(trend.reduce((sum: number, d: any) => sum + d.totalCostCents, 0) / trend.length)
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-[#4b4b4b]">No cost trend data available</p>
          )}
        </Card>
      </div>

      {/* Usage Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Usage Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">Request Volume</h4>
            </div>
            {usage && (
              <div>
                <p className="text-3xl font-bold text-[#2b2b2b]">
                  {usage.requestVolume.toLocaleString()}
                </p>
                <p className="text-sm text-[#4b4b4b] mt-1">Last 24 hours</p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">Avg Queue Depth</h4>
            </div>
            {usage && (
              <div>
                <p className="text-3xl font-bold text-[#2b2b2b]">
                  {usage.queueDepthAvg}
                </p>
                <p className="text-sm text-[#4b4b4b] mt-1">jobs waiting</p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">DB Connections</h4>
            </div>
            {usage && (
              <div>
                <p className="text-3xl font-bold text-[#2b2b2b]">
                  {usage.databaseConnections}
                </p>
                <p className="text-sm text-[#4b4b4b] mt-1">active connections</p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">Cache Hit Rate</h4>
            </div>
            {usage && (
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {usage.cacheHitRate.toFixed(1)}%
                </p>
                <p className="text-sm text-[#4b4b4b] mt-1">efficiency</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Budget Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Budget Alerts</h3>
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Daily budget: $100</p>
                <p className="text-sm text-green-700">Current: {costs ? formatCost(costs.totalCostCents) : '$0.00'}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">On Track</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Monthly budget: $3,000</p>
                <p className="text-sm text-blue-700">Projected: {costs ? formatCost(costs.totalCostCents * 30) : '$0.00'}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">On Track</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

