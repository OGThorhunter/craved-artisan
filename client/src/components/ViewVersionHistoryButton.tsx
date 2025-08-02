import React from 'react';
import { useLocation } from 'wouter';
import { History } from 'lucide-react';

interface ViewVersionHistoryButtonProps {
  recipeId: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ViewVersionHistoryButton: React.FC<ViewVersionHistoryButtonProps> = ({
  recipeId,
  className = '',
  variant = 'outline',
  size = 'md'
}) => {
  const [, setLocation] = useLocation();

  const baseClasses = 'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      onClick={() => setLocation(`/dashboard/vendor/recipes/${recipeId}/versions`)}
      className={classes}
    >
      <History className="h-4 w-4 mr-2" />
      View History
    </button>
  );
};

export default ViewVersionHistoryButton; 