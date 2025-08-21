import React from 'react';
import { BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title = "No Data Available", 
  message = "There's no data to display at the moment.",
  icon = <BarChart3 className="h-12 w-12 text-gray-400" />,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mx-auto">{message}</p>
    </div>
  );
}
