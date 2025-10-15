import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Tag,
  Receipt
} from 'lucide-react';

interface LedgerTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LedgerTypeBadge: React.FC<LedgerTypeBadgeProps> = ({ type, size = 'md' }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'ORDER_FEE':
        return {
          label: 'Order Fee',
          icon: DollarSign,
          color: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'PROCESSING_FEE':
        return {
          label: 'Processing Fee',
          icon: CreditCard,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'EVENT_FEE':
        return {
          label: 'Event Fee',
          icon: Calendar,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'SUBSCRIPTION_FEE':
        return {
          label: 'Subscription',
          icon: Receipt,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'PAYOUT':
        return {
          label: 'Payout',
          icon: DollarSign,
          color: 'bg-teal-100 text-teal-800 border-teal-200',
        };
      case 'REFUND':
        return {
          label: 'Refund',
          icon: RefreshCw,
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'DISPUTE_HOLD':
        return {
          label: 'Dispute Hold',
          icon: AlertTriangle,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'DISPUTE_WIN':
        return {
          label: 'Dispute Win',
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'DISPUTE_LOSS':
        return {
          label: 'Dispute Loss',
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'ADJUSTMENT':
        return {
          label: 'Adjustment',
          icon: Edit,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      case 'PROMO_APPLIED':
        return {
          label: 'Promo Applied',
          icon: Tag,
          color: 'bg-pink-100 text-pink-800 border-pink-200',
        };
      case 'TAX_COLLECTED':
        return {
          label: 'Tax',
          icon: Receipt,
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      default:
        return {
          label: type,
          icon: DollarSign,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getTypeConfig(type);
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

