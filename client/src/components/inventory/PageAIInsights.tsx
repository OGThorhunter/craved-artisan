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
  X,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import type { AIInsight } from '../../types/inventory';

interface PageAIInsightsProps {
  insights: AIInsight[];
  onDismiss?: (insightId: string) => void;
  onAction?: (insight: AIInsight) => void;
  onRefresh?: () => void;
  className?: string;
}

export default function PageAIInsights({ 
  insights, 
  onDismiss, 
  onAction,
  onRefresh,
  className = '' 
}: PageAIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter(insight => !dismissedInsights.has(insight.id));

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
    onDismiss?.(insightId);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'reorder_suggestion':
        return <Package className="w-5 h-5" />;
      case 'price_alert':
        return <DollarSign className="w-5 h-5" />;
      case 'demand_forecast':
        return <TrendingUp className="w-5 h-5" />;
      case 'supplier_alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'seasonal_trend':
        return <Clock className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
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

  const getPriorityCounts = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    visibleInsights.forEach(insight => {
      counts[insight.priority]++;
    });
    return counts;
  };

  const priorityCounts = getPriorityCounts();
  const totalInsights = visibleInsights.length;

  if (totalInsights === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div 
        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              <p className="text-sm text-gray-600">
                {totalInsights} insight{totalInsights !== 1 ? 's' : ''} available
                {priorityCounts.high > 0 && (
                  <span className="ml-2 text-red-600 font-medium">
                    • {priorityCounts.high} high priority
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh insights"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Priority Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{priorityCounts.high}</div>
              <div className="text-sm text-red-600">High Priority</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{priorityCounts.medium}</div>
              <div className="text-sm text-orange-600">Medium Priority</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{priorityCounts.low}</div>
              <div className="text-sm text-blue-600">Low Priority</div>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            {visibleInsights
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              })
              .map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={getInsightIconColor(insight.priority)}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getInsightColor(insight.priority)}`}>
                            {insight.priority} priority
                          </span>
                          <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                            {formatConfidence(insight.confidence)} confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismiss(insight.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Dismiss insight"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm mb-3">{insight.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </div>
                    {insight.actionable && onAction && (
                      <button
                        onClick={() => onAction(insight)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        <Target className="w-3 h-3" />
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                AI insights are updated every hour based on your inventory patterns
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Lightbulb className="w-3 h-3" />
                Powered by AI
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
