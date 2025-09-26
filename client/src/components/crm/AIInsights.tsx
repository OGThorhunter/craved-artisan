import React from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Target,
  Users,
  DollarSign,
  Clock,
  Star
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'customer-health' | 'sales-opportunity' | 'task-management' | 'pipeline-optimization';
}

interface AIInsightsProps {
  insights: AIInsight[];
  isLoading?: boolean;
  onInsightClick?: (insight: AIInsight) => void;
  maxInsights?: number;
  showCategories?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  insights,
  isLoading = false,
  onInsightClick,
  maxInsights = 5,
  showCategories = false
}) => {
  const getInsightIcon = (type: string, category: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'recommendation':
        return <Target className="h-4 w-4 text-purple-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      case 'recommendation':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customer-health':
        return <Users className="h-3 w-3" />;
      case 'sales-opportunity':
        return <DollarSign className="h-3 w-3" />;
      case 'task-management':
        return <Clock className="h-3 w-3" />;
      case 'pipeline-optimization':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  const sortedInsights = insights
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, maxInsights);

  if (isLoading) {
    return (
      <div className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#F7F2EC' }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#F7F2EC' }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="text-center py-4">
          <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No insights available at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#F7F2EC' }}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">AI Insights</h3>
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
          {insights.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {sortedInsights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 p-3 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${getInsightColor(insight.type)}`}
            onClick={() => onInsightClick?.(insight)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type, insight.category)}
                <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                  {insight.priority}
                </span>
                {showCategories && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {getCategoryIcon(insight.category)}
                    <span className="capitalize">{insight.category.replace('-', ' ')}</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full" 
                    style={{ width: `${insight.confidence}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
              </div>
              
              {insight.action && (
                <span className="text-xs text-purple-600 font-medium hover:text-purple-700">
                  {insight.action} →
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
