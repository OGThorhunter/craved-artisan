import React from 'react';
import type { TrendPoint } from '../types';

interface TrendCardProps {
  title: string;
  data: readonly TrendPoint[];
  color: string;
}

export function TrendCard({ title, data, color }: TrendCardProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold text-[#333] mb-4">{title}</h3>
      <div className="h-32 flex items-end space-x-1">
        {data.map((point, index) => {
          const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50;
          return (
            <div
              key={index}
              className="flex-1 bg-opacity-20 rounded-t"
              style={{
                height: `${height}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
