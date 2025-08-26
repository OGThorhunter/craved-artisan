"use client";

import { KpiCard } from "./KpiCard";
import { TrendingUp, Clock, Star, Target } from "lucide-react";

const performanceData = [
  {
    label: "Order Fulfillment Rate",
    value: "98.5%",
    delta: 2.1,
    icon: <Target size={20} />,
  },
  {
    label: "Avg Preparation Time",
    value: "15 min",
    delta: -8.3,
    icon: <Clock size={20} />,
  },
  {
    label: "Customer Rating",
    value: "4.8/5",
    delta: 0.2,
    icon: <Star size={20} />,
  },
  {
    label: "Return Rate",
    value: "0.5%",
    delta: -12.5,
    icon: <TrendingUp size={20} />,
  },
];

export function PerformanceKpis() {
  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.map((kpi, idx) => (
          <KpiCard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            icon={kpi.icon}
          />
        ))}
      </div>
    </div>
  );
} 