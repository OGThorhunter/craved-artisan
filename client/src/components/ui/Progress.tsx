import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  tooltip?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className = '',
  indicatorClassName = '',
  tooltip,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div 
      className={`relative overflow-hidden rounded-full bg-gray-200 ${className}`}
      title={tooltip}
    >
      <div
        className={`h-full transition-all duration-300 ease-in-out ${indicatorClassName}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
























