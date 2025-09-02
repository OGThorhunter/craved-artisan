import React from 'react';
import type { Kpi } from '../types';

interface KpiCardProps {
  kpi: Kpi;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const isPositive = kpi.deltaPct && kpi.deltaPct > 0;
  const isMonetary = kpi.label.includes('Revenue') || kpi.label.includes('AOV');
  
  return (
    <div className="bg-white rounded-lg p-4 text-center">
      <h3 className="text-sm font-medium text-[#777] mb-2">{kpi.label}</h3>
      <div className="text-2xl font-bold text-[#333] mb-1">
        {isMonetary ? `$${kpi.value.toLocaleString()}` : kpi.value}
      </div>
      {kpi.deltaPct !== null && (
        <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {kpi.deltaPct > 0 ? '+' : ''}{kpi.deltaPct}%
        </div>
      )}
    </div>
  );
}
