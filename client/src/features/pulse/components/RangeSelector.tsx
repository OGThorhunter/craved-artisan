import React from 'react';
import type { PulseRange } from '../types';

interface RangeSelectorProps {
  range: PulseRange;
  onRangeChange: (range: PulseRange) => void;
}

export function RangeSelector({ range, onRangeChange }: RangeSelectorProps) {
  const ranges: { value: PulseRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  return (
    <div className="flex bg-white rounded-lg p-1">
      {ranges.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onRangeChange(value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            range === value
              ? 'bg-[#5B6E02] text-white'
              : 'text-[#777] hover:text-[#333]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
