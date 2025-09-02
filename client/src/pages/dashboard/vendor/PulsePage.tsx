import React, { useState } from 'react';
import { usePulse, type PulseRange } from '@/features/pulse';
import { useAuth } from '@/contexts/AuthContext';
import {
  RangeSelector,
  KpiCard,
  TrendCard,
  LeaderboardRow,
  AttentionTab,
  SystemPill,
  PulsePageSkeleton
} from '@/features/pulse/components';

export default function PulsePage() {
  const { user } = useAuth();
  const [range, setRange] = useState<PulseRange>('today');
  
  // Fallback to dev vendor ID if not authenticated
  const vendorId = user?.userId || 'dev-user-id';
  
  const { data: pulseData, isLoading, error, refetch } = usePulse(vendorId, range);

  const handleRangeChange = (newRange: PulseRange) => {
    setRange(newRange);
  };

  if (isLoading) {
    return <PulsePageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F2EC] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-[#333] mb-4">Couldn't load Pulse</h1>
            <p className="text-[#777] mb-6">There was an error loading your business pulse data.</p>
            <button
              onClick={() => refetch()}
              className="bg-[#5B6E02] text-white px-6 py-3 rounded-lg hover:bg-[#4A5D01] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!pulseData) {
    return (
      <div className="min-h-screen bg-[#F7F2EC] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-[#333] mb-4">No data available</h1>
            <p className="text-[#777]">No pulse data found for this time range yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F2EC] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with range selector */}
        <header className="bg-[#E8CBAE] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[#333]">Pulse</h1>
            <RangeSelector range={range} onRangeChange={handleRangeChange} />
          </div>
        </header>

        {/* KPI Ribbon */}
        <section className="bg-[#E8CBAE] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#333] mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {pulseData.kpis.map((kpi, index) => (
              <KpiCard key={index} kpi={kpi} />
            ))}
          </div>
        </section>

        {/* Trends Grid */}
        <section className="bg-[#E8CBAE] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#333] mb-4">Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendCard title="Revenue" data={pulseData.trends.revenue} color="#5B6E02" />
            <TrendCard title="Orders" data={pulseData.trends.orders} color="#7F232E" />
          </div>
        </section>

        {/* Leaderboard */}
        <section className="bg-[#E8CBAE] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#333] mb-4">Top Products</h2>
          <div className="space-y-3">
            {pulseData.leaderboard.map((product, index) => (
              <LeaderboardRow key={product.productId} product={product} rank={index + 1} />
            ))}
          </div>
        </section>

        {/* Attention Center */}
        <section className="bg-[#E8CBAE] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#333] mb-4">Attention Center</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AttentionTab title="Pickups" items={pulseData.attention.pickups} type="pickup" />
            <AttentionTab title="Inventory" items={pulseData.attention.inventory} type="inventory" />
            <AttentionTab title="CRM" items={pulseData.attention.crm} type="crm" />
          </div>
        </section>

        {/* Insights */}
        <section className="bg-[#E8CBAE] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#333] mb-4">Smart Suggestions</h2>
          <div className="space-y-3">
            {pulseData.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-[#5B6E02]">
                <p className="text-[#333]">{suggestion}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System Status Footer */}
        <footer className="bg-[#E8CBAE] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {pulseData.system.map((pill, index) => (
                <SystemPill key={index} pill={pill} />
              ))}
            </div>
            <div className="text-sm text-[#777]">
              Last updated: {new Date(pulseData.asOfISO).toLocaleString()}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
