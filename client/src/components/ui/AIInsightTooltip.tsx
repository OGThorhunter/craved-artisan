import React, { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface AIInsightTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
}

export const AIInsightTooltip: React.FC<AIInsightTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
  maxWidth = 'max-w-md'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    console.log('AIInsightTooltip: showTooltip called');
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => {
      console.log('AIInsightTooltip: showing tooltip');
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    console.log('AIInsightTooltip: hideTooltip called');
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-3';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-3';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-3';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-3';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-3';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[#5B6E02]';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[#5B6E02]';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[#5B6E02]';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[#5B6E02]';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[#5B6E02]';
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getPositionClasses()}`}
          role="tooltip"
          aria-live="polite"
        >
          <div className={`bg-[#F7F2EC] border border-[#5B6E02] rounded-lg shadow-xl p-4 ${maxWidth} whitespace-normal`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-[#5B6E02]/10 rounded-lg">
                <Brain className="w-4 h-4 text-[#5B6E02]" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">AI Insight</h4>
              <div className="flex items-center gap-1 text-xs text-[#5B6E02] ml-auto">
                <Sparkles className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
            
            {/* Content */}
            <p className="text-sm text-gray-800 leading-relaxed mb-3">
              {content}
            </p>
            
            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-2">
              <span>Hover for full insight</span>
              <span>Updated 2 hours ago</span>
            </div>
          </div>
          
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
        </div>
      )}
    </div>
  );
};

export default AIInsightTooltip;
