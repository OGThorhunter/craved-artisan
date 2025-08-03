import React from 'react';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface FinancialMetrics {
  netProfit: number;
  totalRevenue: number;
  cogs: number;
  cashIn: number;
  cashOut: number;
  assets: number;
  liabilities: number;
}

interface FinancialHealthIndicatorProps {
  metrics: FinancialMetrics;
  className?: string;
}

export const FinancialHealthIndicator: React.FC<FinancialHealthIndicatorProps> = ({ 
  metrics, 
  className = '' 
}) => {
  const calculateHealthScore = () => {
    let score = 0;
    const issues: string[] = [];
    const strengths: string[] = [];

    // Net margin analysis
    const netMargin = (metrics.netProfit / metrics.totalRevenue) * 100;
    if (netMargin < 15) {
      score -= 2;
      issues.push(`Low net margin: ${netMargin.toFixed(1)}%`);
    } else if (netMargin > 25) {
      score += 1;
      strengths.push(`Strong net margin: ${netMargin.toFixed(1)}%`);
    }

    // COGS vs Revenue analysis
    const cogsRatio = (metrics.cogs / metrics.totalRevenue) * 100;
    if (cogsRatio > 70) {
      score -= 1;
      issues.push(`High COGS ratio: ${cogsRatio.toFixed(1)}%`);
    } else if (cogsRatio < 50) {
      score += 1;
      strengths.push(`Low COGS ratio: ${cogsRatio.toFixed(1)}%`);
    }

    // Cash flow analysis
    const netCashFlow = metrics.cashIn - metrics.cashOut;
    if (netCashFlow < 0) {
      score -= 2;
      issues.push('Negative cash flow');
    } else if (netCashFlow > metrics.totalRevenue * 0.1) {
      score += 1;
      strengths.push('Strong positive cash flow');
    }

    // Balance sheet analysis
    const debtToEquity = metrics.liabilities / metrics.assets;
    if (debtToEquity > 0.7) {
      score -= 1;
      issues.push(`High debt ratio: ${(debtToEquity * 100).toFixed(1)}%`);
    } else if (debtToEquity < 0.3) {
      score += 1;
      strengths.push(`Low debt ratio: ${(debtToEquity * 100).toFixed(1)}%`);
    }

    return { score, issues, strengths };
  };

  const { score, issues, strengths } = calculateHealthScore();

  const getHealthStatus = () => {
    if (score >= 2) return { status: 'excellent', color: 'green', icon: CheckCircle };
    if (score >= 0) return { status: 'good', color: 'blue', icon: TrendingUp };
    if (score >= -2) return { status: 'caution', color: 'yellow', icon: AlertTriangle };
    return { status: 'warning', color: 'red', icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus();
  const IconComponent = healthStatus.icon;

  const getStatusText = () => {
    switch (healthStatus.status) {
      case 'excellent': return 'Excellent Financial Health';
      case 'good': return 'Good Financial Health';
      case 'caution': return 'Financial Caution Required';
      case 'warning': return 'Financial Warning';
      default: return 'Financial Health';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full bg-${healthStatus.color}-100`}>
          <IconComponent className={`w-5 h-5 text-${healthStatus.color}-600`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getStatusText()}</h3>
          <p className="text-sm text-gray-600">Financial Health Score: {score}</p>
        </div>
      </div>

      {/* Smart Highlights */}
      <div className="space-y-3">
        {strengths.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Financial Strengths
            </h4>
            <ul className="space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {issues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Areas of Concern
            </h4>
            <ul className="space-y-1">
              {issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Net Margin</p>
          <p className={`text-sm font-semibold ${(metrics.netProfit / metrics.totalRevenue) * 100 < 15 ? 'text-red-600' : 'text-green-600'}`}>
            {((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">COGS Ratio</p>
          <p className={`text-sm font-semibold ${(metrics.cogs / metrics.totalRevenue) * 100 > 70 ? 'text-red-600' : 'text-green-600'}`}>
            {((metrics.cogs / metrics.totalRevenue) * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Cash Flow</p>
          <p className={`text-sm font-semibold ${metrics.cashIn - metrics.cashOut < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${(metrics.cashIn - metrics.cashOut).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Debt Ratio</p>
          <p className={`text-sm font-semibold ${(metrics.liabilities / metrics.assets) * 100 > 70 ? 'text-red-600' : 'text-green-600'}`}>
            {((metrics.liabilities / metrics.assets) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}; 