export interface MarginCalculation {
  cost: number;
  price: number;
  margin: number;
  marginPercentage: number;
  isAlertTriggered: boolean;
  alertReason: string | null;
  aiValidation?: AIValidationResult;
}

export interface AIValidationResult {
  isValid: boolean;
  confidence: number; // 0-1 confidence score
  warnings: string[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  marketComparison?: {
    averageMargin: number;
    priceRange: { min: number; max: number };
    costEfficiency: number; // 0-1 score
  };
}

export interface MarginAlertConfig {
  minMarginPercentage: number; // Minimum acceptable margin (e.g., 15%)
  costThreshold: number; // Cost threshold that triggers alerts
  priceThreshold: number; // Price threshold that triggers alerts
}

const DEFAULT_ALERT_CONFIG: MarginAlertConfig = {
  minMarginPercentage: 15, // 15% minimum margin
  costThreshold: 0.7, // Alert if cost is >70% of price
  priceThreshold: 0.8, // Alert if price is <80% of target
};

export function calculateMargin(
  price: number,
  cost: number,
  targetMargin?: number,
  config: Partial<MarginAlertConfig> = {}
): MarginCalculation {
  const alertConfig = { ...DEFAULT_ALERT_CONFIG, ...config };
  
  if (cost <= 0 || price <= 0) {
    return {
      cost,
      price,
      margin: 0,
      marginPercentage: 0,
      isAlertTriggered: false,
      alertReason: null,
    };
  }

  const margin = price - cost;
  const marginPercentage = (margin / price) * 100;

  // Check for alert conditions
  const alerts: string[] = [];

  // Check if margin is below minimum
  if (marginPercentage < alertConfig.minMarginPercentage) {
    alerts.push(`Margin (${marginPercentage.toFixed(1)}%) below minimum (${alertConfig.minMarginPercentage}%)`);
  }

  // Check if cost is too high relative to price
  const costRatio = cost / price;
  if (costRatio > alertConfig.costThreshold) {
    alerts.push(`Cost ratio (${(costRatio * 100).toFixed(1)}%) too high (>${(alertConfig.costThreshold * 100).toFixed(0)}%)`);
  }

  // Check if price is too low relative to target margin
  if (targetMargin && marginPercentage < targetMargin * alertConfig.priceThreshold) {
    alerts.push(`Price too low relative to target margin (${targetMargin}%)`);
  }

  return {
    cost,
    price,
    margin,
    marginPercentage,
    isAlertTriggered: alerts.length > 0,
    alertReason: alerts.length > 0 ? alerts.join('; ') : null,
  };
}

export function shouldTriggerMarginAlert(
  price: number,
  cost: number,
  targetMargin?: number,
  config: Partial<MarginAlertConfig> = {}
): boolean {
  const calculation = calculateMargin(price, cost, targetMargin, config);
  return calculation.isAlertTriggered;
}

export function generateAlertNote(
  price: number,
  cost: number,
  targetMargin?: number,
  config: Partial<MarginAlertConfig> = {}
): string {
  const calculation = calculateMargin(price, cost, targetMargin, config);
  
  if (!calculation.isAlertTriggered) {
    return '';
  }

  const suggestions: string[] = [];
  
  if (calculation.marginPercentage < (config.minMarginPercentage || DEFAULT_ALERT_CONFIG.minMarginPercentage)) {
    suggestions.push('Consider increasing price or reducing costs');
  }
  
  if (cost / price > (config.costThreshold || DEFAULT_ALERT_CONFIG.costThreshold)) {
    suggestions.push('Review ingredient costs and supplier pricing');
  }
  
  if (targetMargin && calculation.marginPercentage < targetMargin * (config.priceThreshold || DEFAULT_ALERT_CONFIG.priceThreshold)) {
    suggestions.push('Adjust pricing to meet target margin goals');
  }

  return `⚠️ Margin Alert: ${calculation.alertReason}. Suggestions: ${suggestions.join('; ')}`;
}

// NEW: AI-powered cost-to-margin validation
export function validateCostToMargin(
  price: number,
  cost: number,
  targetMargin?: number,
  productCategory?: string,
  marketData?: any
): AIValidationResult {
  const marginPercentage = ((price - cost) / price) * 100;
  const costRatio = cost / price;
  
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let confidence = 0.8; // Base confidence
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Basic validation checks
  if (cost <= 0) {
    warnings.push('Cost must be greater than zero');
    confidence -= 0.3;
    riskLevel = 'high';
  }

  if (price <= cost) {
    warnings.push('Price must be greater than cost');
    confidence -= 0.4;
    riskLevel = 'high';
  }

  // Margin validation
  if (marginPercentage < 10) {
    warnings.push('Extremely low margin detected (< 10%)');
    suggestions.push('Consider significant price increase or cost reduction');
    confidence -= 0.2;
    riskLevel = 'high';
  } else if (marginPercentage < 20) {
    warnings.push('Low margin detected (< 20%)');
    suggestions.push('Review pricing strategy and cost structure');
    confidence -= 0.1;
    riskLevel = 'medium';
  }

  // Cost efficiency validation
  if (costRatio > 0.8) {
    warnings.push('Cost represents more than 80% of price');
    suggestions.push('Investigate cost optimization opportunities');
    confidence -= 0.15;
    riskLevel = 'medium';
  }

  // Target margin validation
  if (targetMargin && marginPercentage < targetMargin) {
    warnings.push(`Margin (${marginPercentage.toFixed(1)}%) below target (${targetMargin}%)`);
    suggestions.push('Adjust pricing to meet target margin goals');
    confidence -= 0.1;
    riskLevel = 'medium';
  }

  // Market comparison (if data available)
  let marketComparison;
  if (marketData && productCategory) {
    const categoryData = marketData[productCategory];
    if (categoryData) {
      const avgMargin = categoryData.averageMargin || 25;
      const priceRange = categoryData.priceRange || { min: price * 0.7, max: price * 1.3 };
      const costEfficiency = Math.max(0, 1 - (costRatio - 0.5)); // Higher efficiency for lower cost ratios

      marketComparison = {
        averageMargin: avgMargin,
        priceRange,
        costEfficiency
      };

      // Compare with market averages
      if (marginPercentage < avgMargin * 0.7) {
        warnings.push(`Margin significantly below market average (${avgMargin}%)`);
        suggestions.push('Research competitor pricing and market standards');
        confidence -= 0.1;
        riskLevel = 'medium';
      }

      if (price < priceRange.min) {
        warnings.push('Price below typical market range');
        suggestions.push('Consider price increase to align with market');
        confidence -= 0.05;
      } else if (price > priceRange.max) {
        warnings.push('Price above typical market range');
        suggestions.push('Ensure value proposition justifies premium pricing');
        confidence -= 0.05;
      }
    }
  }

  // Positive indicators
  if (marginPercentage > 30) {
    suggestions.push('Strong margin achieved - consider competitive pricing opportunities');
    confidence += 0.05;
  }

  if (costRatio < 0.5) {
    suggestions.push('Excellent cost efficiency - maintain competitive advantage');
    confidence += 0.05;
  }

  // Ensure confidence stays within bounds
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    isValid: warnings.length === 0,
    confidence,
    warnings,
    suggestions,
    riskLevel,
    marketComparison
  };
}

// Enhanced margin calculation with AI validation
export function calculateMarginWithAI(
  price: number,
  cost: number,
  targetMargin?: number,
  productCategory?: string,
  marketData?: any,
  config: Partial<MarginAlertConfig> = {}
): MarginCalculation {
  const baseCalculation = calculateMargin(price, cost, targetMargin, config);
  const aiValidation = validateCostToMargin(price, cost, targetMargin, productCategory, marketData);

  return {
    ...baseCalculation,
    aiValidation
  };
} 