import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface AnalyticsTooltipProps {
  explanation: string;
  className?: string;
}

export const AnalyticsTooltip: React.FC<AnalyticsTooltipProps> = ({
  explanation,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={`More information`}
      >
        <Info className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close tooltip */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip */}
          <div 
            className="absolute z-50 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 top-full left-1/2 transform -translate-x-1/2 mt-2 shadow-lg"
            style={{
              width: 'max-content',
              minWidth: '200px',
              maxWidth: '300px',
              whiteSpace: 'normal',
              wordWrap: 'break-word'
            }}
          >
            {explanation}
            
            {/* Arrow pointing up */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </>
      )}
    </div>
  );
};

