import React from 'react';
import { AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';

type TicketSeverity = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

interface SeverityBadgeProps {
  severity: TicketSeverity;
  className?: string;
}

const severityConfig: Record<TicketSeverity, {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}> = {
  LOW: {
    label: 'Low',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    icon: <Info className="w-3 h-3" />,
  },
  NORMAL: {
    label: 'Normal',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: <Info className="w-3 h-3" />,
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: <Zap className="w-3 h-3" />,
  },
};

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const config = severityConfig[severity] || severityConfig.NORMAL;
  
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

