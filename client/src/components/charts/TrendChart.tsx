import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type TrendChartProps = {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  height?: number;
};

export default function TrendChart({
  data = [],
  xKey,
  yKey,
  height = 240,
}: TrendChartProps) {
  if (!Array.isArray(data)) data = [];
  if (data.length === 0) {
    return <div className="text-sm text-neutral-500">No data available</div>;
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 