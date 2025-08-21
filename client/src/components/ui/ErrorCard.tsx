import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({ 
  title = "Something went wrong", 
  message = "An error occurred while loading the data. Please try again.",
  onRetry,
  className = ""
}: ErrorCardProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800">{title}</h3>
          <p className="mt-2 text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
