export interface MarginCalculation {
  cost: number;
  price: number;
  margin: number;
  marginPercentage: number;
  isAlertTriggered: boolean;
  alertReason: string | null;
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