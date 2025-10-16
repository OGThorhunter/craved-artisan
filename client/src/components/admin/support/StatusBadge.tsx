import React from 'react';

type TicketStatus = 'OPEN' | 'PENDING' | 'AWAITING_VENDOR' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusConfig: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  OPEN: {
    label: 'Open',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
  AWAITING_VENDOR: {
    label: 'Awaiting Vendor',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
  CLOSED: {
    label: 'Closed',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
  ESCALATED: {
    label: 'Escalated',
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.OPEN;
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
}

