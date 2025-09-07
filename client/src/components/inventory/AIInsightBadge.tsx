import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Clock,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import type { AIInsight } from '../../types/inventory';

interface AIInsightBadgeProps {
  insight: AIInsight;
  onDismiss?: (insightId: string) => void;
  onAction?: (insight: AIInsight) => void;
  className?: string;
}

export default function AIInsightBadge({ 
  insight, 
  onDismiss, 
  onAction,
  className = '' 
}: AIInsightBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'reorder_suggestion':
        return <Package className="w-4 h-4" />;
      case 'price_alert':
        return <DollarSign className="w-4 h-4" />;
      case 'demand_forecast':
        return <TrendingUp className="w-4 h-4" />;
      case 'supplier_alert':
        return <AlertTriangle className="w-4 h-4" />;
      case 'seasonal_trend':
        return <Clock className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getInsightIconColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatConfidence = (confidence: number) => {
    if (confidence >= 90) return 'High';
    if (confidence >= 80) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer hover:shadow-sm transition-all duration-200 ${getInsightColor(insight.priority)}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={getInsightIconColor(insight.priority)}>
          {getInsightIcon(insight.type)}
        </div>
        <span className="truncate max-w-32">{insight.title}</span>
        <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
          {insight.confidence}%
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={getInsightIconColor(insight.priority)}>
                {getInsightIcon(insight.type)}
              </div>
              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getInsightColor(insight.priority)}`}>
                {formatConfidence(insight.confidence)} Confidence
              </span>
              {onDismiss && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(insight.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Dismiss insight"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{insight.message}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {new Date(insight.createdAt).toLocaleDateString()}
            </div>
            {insight.actionable && onAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(insight);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Take Action
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
