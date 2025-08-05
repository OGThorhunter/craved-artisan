import { FC } from "react";
import { KpiCard } from "./KpiCard";
import { mockKpis } from "../../../mock/analyticsData";
import { DollarSign, TrendingUp, Package, Users } from "lucide-react";

export const KpiCardTest: FC = () => {
  const icons = [
    <DollarSign key="revenue" size={20} />,
    <DollarSign key="monthly" size={20} />,
    <TrendingUp key="avg" size={20} />,
    <Package key="orders" size={20} />,
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI Cards Test</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKpis.map((kpi, idx) => (
          <KpiCard 
            key={idx} 
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            icon={icons[idx]}
          />
        ))}
      </div>
    </div>
  );
}; 