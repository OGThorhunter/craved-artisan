import React from 'react';
import { AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';

interface ProductMarginAlertProps {
  price: number;
  cost: number | null;
  targetMargin: number | null;
  marginAlert: boolean;
  alertNote: string | null;
  className?: string;
}

const ProductMarginAlert: React.FC<ProductMarginAlertProps> = ({ 
  price, 
  cost, 
  targetMargin, 
  marginAlert, 
  className = '' 
}) => {
  if (!marginAlert || !cost) {
    return null;
  }

  const margin = price - cost;
  const marginPercentage = (margin / price) * 100;

  const getAlertType = () => {
    if (marginPercentage < 15) return 'low-margin';
    if (cost / price > 0.7) return 'high-cost';
    if (targetMargin && marginPercentage < targetMargin * 0.8) return 'below-target';
    return 'general';
  };

  const getAlertConfig = () => {
    const type = getAlertType();
    
    switch (type) {
      case 'low-margin':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          label: 'Low Margin'
        };
      case 'high-cost':
        return {
          icon: <DollarSign className="w-4 h-4" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          label: 'High Cost'
        };
      case 'below-target':
        return {
          icon: <TrendingDown className="w-4 h-4" />,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          label: 'Below Target'
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          label: 'Margin Alert'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium border ${config.bgColor} ${config.borderColor} ${config.textColor} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
      <span className="font-bold">({marginPercentage.toFixed(1)}%)</span>
    </div>
  );
};

export default ProductMarginAlert; 