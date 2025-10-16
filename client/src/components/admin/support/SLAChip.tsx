import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface SLAChipProps {
  slaDueAt: string | null;
  status: 'green' | 'yellow' | 'red' | 'breached';
  minutesRemaining: number;
  className?: string;
}

export function SLAChip({ slaDueAt, status, minutesRemaining, className = '' }: SLAChipProps) {
  if (!slaDueAt) {
    return null;
  }
  
  const getStatusConfig = () => {
    switch (status) {
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
        };
      case 'red':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-200',
        };
      case 'breached':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
        };
    }
  };
  
  const config = getStatusConfig();
  
  const formatTime = (minutes: number) => {
    if (minutes < 0) {
      const absMinutes = Math.abs(minutes);
      if (absMinutes < 60) {
        return `${absMinutes}m overdue`;
      }
      const hours = Math.floor(absMinutes / 60);
      const mins = absMinutes % 60;
      return `${hours}h ${mins}m overdue`;
    }
    
    if (minutes < 60) {
      return `${minutes}m left`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m left`;
  };
  
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {status === 'breached' ? (
        <AlertCircle className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      <span>{formatTime(minutesRemaining)}</span>
    </div>
  );
}

