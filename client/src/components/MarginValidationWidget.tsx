import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  AlertTriangle, CheckCircle, DollarSign, TrendingUp, TrendingDown,
  Calculator, Settings, RefreshCw, Info, AlertCircle, Target
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MarginValidationResult {
  isValid: boolean;
  margin: number;
  minMargin: number;
  error?: string;
  warning?: string;
  suggestion?: string;
}

interface MarginCalculation {
  margin: number;
  marginPercent: number;
  profit: number;
  cost: number;
  price: number;
}

interface MarginAnalysis {
  current: MarginCalculation;
  recommended: MarginCalculation;
  minRequired: MarginCalculation;
  analysis: {
    isProfitable: boolean;
    meetsMinimum: boolean;
    marginHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    recommendations: string[];
  };
}

interface MarginValidationWidgetProps {
  vendorId: string;
  initialPrice?: number;
  initialCost?: number;
  onValidationChange?: (isValid: boolean, margin: number) => void;
  showOverride?: boolean;
  className?: string;
}

const MarginValidationWidget: React.FC<MarginValidationWidgetProps> = ({
  vendorId,
  initialPrice = 0,
  initialCost = 0,
  onValidationChange,
  showOverride = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [price, setPrice] = useState(initialPrice);
  const [cost, setCost] = useState(initialCost);
  const [allowOverride, setAllowOverride] = useState(false);
  const [validation, setValidation] = useState<MarginValidationResult | null>(null);
  const [analysis, setAnalysis] = useState<MarginAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateMargin = async () => {
    if (!price || !cost) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/margin-management/validate', {
        vendorId,
        price,
        cost,
        allowOverride
      }, { withCredentials: true });

      const { validation: validationResult } = response.data;
      setValidation(validationResult);

      // Get detailed analysis
      const analysisResponse = await axios.post('/api/margin-management/analysis', {
        vendorId,
        price,
        cost
      }, { withCredentials: true });

      setAnalysis(analysisResponse.data.analysis);

      // Call parent callback
      if (onValidationChange) {
        onValidationChange(validationResult.isValid, validationResult.margin);
      }

      // Show toast notification
      if (validationResult.isValid) {
        if (validationResult.warning) {
          toast.warning(validationResult.warning);
        } else {
          toast.success(`Margin validation passed: ${validationResult.margin.toFixed(1)}%`);
        }
      } else {
        toast.error(validationResult.error || 'Margin validation failed');
      }
    } catch (err: any) {
      console.error('Error validating margin:', err);
      setError(err.response?.data?.message || 'Failed to validate margin');
      toast.error('Failed to validate margin');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (price > 0 && cost > 0) {
      validateMargin();
    }
  }, [price, cost, allowOverride]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMarginHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMarginHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'fair': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Calculator className="w-8 h-8 mx-auto mb-2" />
          <p>Please log in to validate margins</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Margin Validation</h3>
              <p className="text-sm text-gray-500">Ensure minimum margin requirements</p>
            </div>
          </div>
          <button
            onClick={validateMargin}
            disabled={isLoading || !price || !cost}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh validation"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {showOverride && (
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allowOverride}
                onChange={(e) => setAllowOverride(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Allow margin override</span>
            </label>
          </div>
        )}
      </div>

      {/* Validation Results */}
      {validation && (
        <div className="p-6">
          {/* Validation Status */}
          <div className={`mb-4 p-4 rounded-lg border ${
            validation.isValid 
              ? validation.warning 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {validation.isValid ? (
                validation.warning ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={`font-medium ${
                  validation.isValid 
                    ? validation.warning 
                      ? 'text-yellow-800' 
                      : 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {validation.isValid 
                    ? validation.warning 
                      ? 'Warning: Margin below recommended' 
                      : 'Margin validation passed'
                    : 'Margin validation failed'
                  }
                </p>
                <p className={`text-sm ${
                  validation.isValid 
                    ? validation.warning 
                      ? 'text-yellow-700' 
                      : 'text-green-700'
                    : 'text-red-700'
                }`}>
                  Current margin: {formatPercentage(validation.margin)} | 
                  Minimum required: {formatPercentage(validation.minMargin)}
                </p>
              </div>
            </div>
            {validation.error && (
              <p className="mt-2 text-sm text-red-700">{validation.error}</p>
            )}
            {validation.warning && (
              <p className="mt-2 text-sm text-yellow-700">{validation.warning}</p>
            )}
            {validation.suggestion && (
              <p className="mt-2 text-sm text-blue-700">{validation.suggestion}</p>
            )}
          </div>

          {/* Detailed Analysis */}
          {analysis && (
            <div className="space-y-4">
              {/* Margin Health */}
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getMarginHealthColor(analysis.analysis.marginHealth)}`}>
                {getMarginHealthIcon(analysis.analysis.marginHealth)}
                <span>Margin Health: {analysis.analysis.marginHealth.charAt(0).toUpperCase() + analysis.analysis.marginHealth.slice(1)}</span>
              </div>

              {/* Current Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Profit</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(analysis.current.profit)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Margin</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage(analysis.current.marginPercent)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">ROI</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage((analysis.current.profit / analysis.current.cost) * 100)}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {analysis.analysis.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Recommendations</h4>
                  </div>
                  <div className="space-y-2">
                    {analysis.analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Minimum Price</h4>
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {formatCurrency(analysis.minRequired.price)}
                  </div>
                  <p className="text-sm text-green-700">
                    To meet minimum margin requirement
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Recommended Price</h4>
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {formatCurrency(analysis.recommended.price)}
                  </div>
                  <p className="text-sm text-blue-700">
                    For optimal profitability
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Validation Error</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Validating margin...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarginValidationWidget; 