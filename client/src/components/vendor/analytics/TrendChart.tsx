"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
} from "recharts";
import { useState } from "react";
import { mockTrendData } from "@/mock/analyticsData";

const toggleOptions = ["daily", "weekly", "monthly"] as const;
type Toggle = (typeof toggleOptions)[number];

export function TrendChart() {
  const [view, setView] = useState<Toggle>("daily");
  const data = mockTrendData[view];

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-4 shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Order & Revenue Trends</h2>
        <div className="space-x-2">
          {toggleOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setView(opt)}
              className={`px-3 py-1 text-sm rounded-full border transition ${
                view === opt
                  ? "bg-[#7F232E] text-white border-transparent"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" label={{ value: "Revenue", angle: -90, position: "insideLeft" }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: "Orders", angle: -90, position: "insideRight" }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#5B6E02" strokeWidth={2} name="Revenue ($)" />
          <Bar yAxisId="right" dataKey="orders" fill="#7F232E" name="Orders" barSize={20} radius={[4, 4, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 