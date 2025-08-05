import { FC } from "react";
import { DollarSign, TrendingUp, Users, Package } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { mockKpis } from "../../../mock/analyticsData";

export const KpiCardExample: FC = () => {
  const icons = [
    <DollarSign key="revenue" size={20} />,
    <DollarSign key="monthly" size={20} />,
    <TrendingUp key="avg" size={20} />,
    <Package key="orders" size={20} />,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {mockKpis.map((kpi, index) => (
        <KpiCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          delta={kpi.delta}
          icon={icons[index]}
        />
      ))}
    </div>
  );
}; 