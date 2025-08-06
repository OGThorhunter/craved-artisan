import { FC } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import clsx from "clsx";

type Props = {
  label: string;
  value: string;
  delta: number; // e.g. +12.5 or -8.4
  icon?: React.ReactNode; // Optional icon component
};

export const KpiCard: FC<Props> = ({ label, value, delta, icon }) => {
  const isPositive = delta >= 0;

  return (
    <div className="bg-[#F7F2EC] shadow-md rounded-2xl p-4 w-full max-w-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span
          className={clsx(
            "flex items-center text-sm font-semibold",
            isPositive ? "text-green-600" : "text-red-600"
          )}
        >
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}; 