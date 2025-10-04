import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Zap,
  BarChart3,
  Users,
  Package,
  Clock
} from 'lucide-react';

interface Metrics {
  totalRevenue?: number;
  revenueGrowthRate?: number;
  avgRevenue?: number;
  totalProfit?: number;
  profitMargin?: number;
  profitGrowthRate?: number;
  cashIn?: number;
  cashOut?: number;
  burnRate?: number;
  currentBalance?: number;
  totalCustomers?: number;
  customerGrowthRate?: number;
  avgOrderValue?: number;
  inventoryTurnover?: number;
  operationalEfficiency?: number;
}

interface CategorySpecificInsightsProps {
  category: 'revenue' | 'profit' | 'cashflow' | 'customers' | 'inventory' | 'operations';
  metrics: Metrics;
  className?: string;
}

interface Insight {
  type: 'opportunity' | 'warning' | 'success' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const CategorySpecificInsights: React.FC<CategorySpecificInsightsProps> = ({
  category,
  metrics,
  className = ''
}) => {
  const generateInsights = (category: string, metrics: Metrics): Insight[] => {
    const insights: Insight[] = [];

    switch (category) {
      case 'revenue':
        insights.push(...generateRevenueInsights(metrics));
        break;
      case 'profit':
        insights.push(...generateProfitInsights(metrics));
        break;
      case 'cashflow':
        insights.push(...generateCashFlowInsights(metrics));
        break;
      case 'customers':
        insights.push(...generateCustomerInsights(metrics));
        break;
      case 'inventory':
        insights.push(...generateInventoryInsights(metrics));
        break;
      case 'operations':
        insights.push(...generateOperationsInsights(metrics));
        break;
    }

    return insights;
  };

  const generateRevenueInsights = (metrics: Metrics): Insight[] => {
    const insights: Insight[] = [];
    const revenue = metrics.totalRevenue || 0;
    const growthRate = metrics.revenueGrowthRate || 0;

    if (growthRate > 15) {
      insights.push({
        type: 'success',
        title: 'Strong Revenue Growth',
        description: `Your revenue is growing at ${growthRate.toFixed(1)}%, which is excellent for business expansion.`,
        impact: 'high',
        action: 'Consider scaling production and marketing to capitalize on this momentum.',
        icon: TrendingUp,
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    } else if (growthRate < 5 && growthRate > 0) {
      insights.push({
        type: 'warning',
        title: 'Slow Revenue Growth',
        description: `Revenue growth of ${growthRate.toFixed(1)}% is below industry average. Consider new strategies.`,
        impact: 'medium',
        action: 'Review pricing strategy, expand product line, or improve marketing efforts.',
        icon: AlertTriangle,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      });
    }

    if (revenue > 50000) {
      insights.push({
        type: 'opportunity',
        title: 'Scale Revenue Opportunities',
        description: 'With strong revenue performance, you\'re ready for advanced growth strategies.',
        impact: 'high',
        action: 'Consider premium product lines, wholesale partnerships, or geographic expansion.',
        icon: Target,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      });
    }

    return insights;
  };

  const generateProfitInsights = (metrics: Metrics): Insight[] => {
    const insights: Insight[] = [];
    const profit = metrics.totalProfit || 0;
    const margin = metrics.profitMargin || 0;

    if (margin > 20) {
      insights.push({
        type: 'success',
        title: 'Excellent Profit Margins',
        description: `Your ${margin.toFixed(1)}% profit margin is well above industry standards.`,
        impact: 'high',
        action: 'Maintain current pricing strategy and consider premium positioning.',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    } else if (margin < 10) {
      insights.push({
        type: 'warning',
        title: 'Low Profit Margins',
        description: `Your ${margin.toFixed(1)}% margin is below recommended levels.`,
        impact: 'high',
        action: 'Review cost structure, consider price increases, or optimize operations.',
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50 border-red-200'
      });
    }

    if (profit > 10000) {
      insights.push({
        type: 'opportunity',
        title: 'Investment Opportunities',
        description: 'Strong profits provide capital for business expansion and improvement.',
        impact: 'medium',
        action: 'Consider equipment upgrades, staff expansion, or new product development.',
        icon: DollarSign,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      });
    }

    return insights;
  };

  const generateCashFlowInsights = (metrics: Metrics): Insight[] => {
    const insights: Insight[] = [];
    const cashIn = metrics.cashIn || 0;
    const cashOut = metrics.cashOut || 0;
    const netCashFlow = cashIn - cashOut;

    if (netCashFlow > 0) {
      insights.push({
        type: 'success',
        title: 'Positive Cash Flow',
        description: 'Your business is generating more cash than it\'s spending.',
        impact: 'high',
        action: 'Consider building cash reserves or investing in growth opportunities.',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Negative Cash Flow',
        description: 'You\'re spending more cash than you\'re generating.',
        impact: 'high',
        action: 'Review expenses, improve collections, or secure additional funding.',
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50 border-red-200'
      });
    }

    const burnRate = metrics.burnRate || 0;
    if (burnRate > 0 && burnRate < 3) {
      insights.push({
        type: 'recommendation',
        title: 'Healthy Burn Rate',
        description: `Your burn rate of ${burnRate.toFixed(1)} months is sustainable.`,
        impact: 'medium',
        action: 'Continue current operations while monitoring cash flow trends.',
        icon: Clock,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      });
    }

    return insights;
  };

  const generateCustomerInsights = (metrics: Metrics): Insight[] => {
    const insights: Insight[] = [];
    const totalCustomers = metrics.totalCustomers || 0;
    const customerGrowth = metrics.customerGrowthRate || 0;

    if (customerGrowth > 20) {
      insights.push({
        type: 'success',
        title: 'Rapid Customer Growth',
        description: `Your customer base is growing at ${customerGrowth.toFixed(1)}% - excellent market penetration.`,
        impact: 'high',
        action: 'Focus on customer retention and referral programs to maintain momentum.',
        icon: Users,
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    }

    if (totalCustomers > 100) {
      insights.push({
        type: 'opportunity',
        title: 'Customer Segmentation',
        description: 'With a substantial customer base, you can implement targeted marketing strategies.',
        impact: 'medium',
        action: 'Analyze customer data to create targeted campaigns and product recommendations.',
        icon: Target,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      });
    }

    return insights;
  };

  const generateInventoryInsights = (metrics: Metrics): Insight[] => {
    const insights: Insight[] = [];
    const turnover = metrics.inventoryTurnover || 0;

    if (turnover > 6) {
      insights.push({
        type: 'success',
        title: 'High Inventory Turnover',
        description: `Your inventory turnover of ${turnover.toFixed(1)}x indicates strong sales velocity.`,
        impact: 'high',
        action: 'Consider increasing stock levels for top-performing products.',
        icon: Package,
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    } else if (turnover < 2) {
      insights.push({
        type: 'warning',
        title: 'Low Inventory Turnover',
        description: `Turnover of ${turnover.toFixed(1)}x suggests slow-moving inventory.`,
        impact: 'medium',
        action: 'Review product mix, consider promotions, or liquidate slow-moving items.',
        icon: AlertTriangle,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      });
    }

    return insights;
  };

  const generateOperationsInsights = (metrics: Metrics): Insight[] => {
    const insights: Insight[] = [];
    const efficiency = metrics.operationalEfficiency || 0;

    if (efficiency > 80) {
      insights.push({
        type: 'success',
        title: 'High Operational Efficiency',
        description: 'Your operations are running smoothly with minimal waste.',
        impact: 'high',
        action: 'Document best practices and consider scaling your successful processes.',
        icon: Zap,
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    }

    insights.push({
      type: 'recommendation',
      title: 'Process Optimization',
      description: 'Regular review of operational metrics can identify improvement opportunities.',
      impact: 'medium',
      action: 'Implement regular process audits and employee feedback systems.',
      icon: Lightbulb,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    });

    return insights;
  };

  const insights = generateInsights(category, metrics);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {category.charAt(0).toUpperCase() + category.slice(1)} Insights
        </h3>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-8 h-8 mx-auto mb-2" />
          <p>No specific insights available for this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${insight.color} ${getImpactColor(insight.impact)}`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
