import React from 'react';
import { Badge } from '../../ui/Badge';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

type StatusType = 'OK' | 'WARN' | 'CRIT' | 'UNKNOWN';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  message?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  message,
  pulse = false,
  className = ''
}) => {
  const getVariant = () => {
    switch (status) {
      case 'OK':
        return 'success';
      case 'WARN':
        return 'warning';
      case 'CRIT':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4" />;
      case 'WARN':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CRIT':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'OK':
        return 'bg-green-500';
      case 'WARN':
        return 'bg-yellow-500';
      case 'CRIT':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status dot */}
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${getColor()}`} />
        {pulse && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${getColor()} animate-ping opacity-75`} />
        )}
      </div>

      {/* Label and message */}
      <div className="flex items-center gap-2">
        {label && (
          <span className="text-sm font-medium text-[#2b2b2b]">{label}</span>
        )}
        <Badge variant={getVariant() as any} className="flex items-center gap-1">
          {getIcon()}
          {status}
        </Badge>
        {message && (
          <span className="text-sm text-[#4b4b4b]">{message}</span>
        )}
      </div>
    </div>
  );
};

