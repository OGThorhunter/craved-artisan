import React from 'react';
import { Brain, Lightbulb, Target, TrendingUp, Heart, Star } from 'lucide-react';

interface MotivationalQuoteProps {
  quote: string;
  author: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'pink';
  className?: string;
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ 
  quote, 
  author, 
  icon: Icon = Brain,
  variant = 'default',
  className = ''
}) => {
  const variantStyles = {
    default: {
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    success: {
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    warning: {
      gradient: 'from-yellow-50 to-amber-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    info: {
      gradient: 'from-cyan-50 to-blue-50',
      border: 'border-cyan-200',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600'
    },
    purple: {
      gradient: 'from-purple-50 to-violet-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    pink: {
      gradient: 'from-pink-50 to-rose-50',
      border: 'border-pink-200',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`bg-gradient-to-r ${styles.gradient} rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border ${styles.border} ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`p-2 ${styles.iconBg} rounded-lg flex-shrink-0`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-medium italic leading-relaxed text-sm sm:text-base">
            "{quote}"
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">— {author}</p>
        </div>
      </div>
    </div>
  );
};

export default MotivationalQuote;

