import React from 'react';
import { Clock, Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PayoutStatusChipProps {
  status: 'PENDING' | 'IN_TRANSIT' | 'PAID' | 'CANCELED' | 'FAILED';
  size?: 'sm' | 'md' | 'lg';
}

export const PayoutStatusChip: React.FC<PayoutStatusChipProps> = ({
  status,
  size = 'md',
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'IN_TRANSIT':
        return {
          label: 'In Transit',
          icon: Send,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'PAID':
        return {
          label: 'Paid',
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'CANCELED':
        return {
          label: 'Canceled',
          icon: XCircle,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      case 'FAILED':
        return {
          label: 'Failed',
          icon: AlertTriangle,
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};

