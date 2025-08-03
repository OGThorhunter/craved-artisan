import prisma from '../lib/prisma';

export interface MarginValidationResult {
  isValid: boolean;
  margin: number;
  minMargin: number;
  error?: string;
  warning?: string;
  suggestion?: string;
}

export interface MarginCalculation {
  margin: number;
  marginPercent: number;
  profit: number;
  cost: number;
  price: number;
}

/**
 * Calculate margin and profit for a product
 */
export function calculateMargin(price: number, cost: number): MarginCalculation {
  const profit = price - cost;
  const marginPercent = cost > 0 ? ((price - cost) / price) * 100 : 0;
  
  return {
    margin: profit,
    marginPercent,
    profit,
    cost,
    price
  };
}

/**
 * Validate if a product meets minimum margin requirements
 */
export async function validateMinimumMargin(
  vendorId: string,
  price: number,
  cost: number,
  allowOverride: boolean = false
): Promise<MarginValidationResult> {
  try {
    // Get vendor profile with margin settings
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        minMarginPercent: true,
        marginOverrideEnabled: true
      }
    });

    if (!vendor) {
      return {
        isValid: false,
        margin: 0,
        minMargin: 0,
        error: 'Vendor not found'
      };
    }

    // Calculate margin
    const marginCalc = calculateMargin(price, cost);
    const margin = marginCalc.marginPercent;

    // Get system default minimum margin if vendor doesn't have one set
    let minMargin = vendor.minMarginPercent;
    if (!minMargin) {
      const systemSetting = await prisma.systemSettings.findFirst({
        where: {
          key: 'DEFAULT_MIN_MARGIN_PERCENT',
          isActive: true
        }
      });
      minMargin = systemSetting ? parseFloat(systemSetting.value) : 30.0; // Default 30%
    }

    // Check if margin meets minimum requirement
    const isValid = margin >= minMargin;

    // Check if override is allowed
    const canOverride = allowOverride && vendor.marginOverrideEnabled;

    if (!isValid && !canOverride) {
      return {
        isValid: false,
        margin,
        minMargin,
        error: `Margin too low. Minimum allowed is ${minMargin.toFixed(1)}%. Current margin: ${margin.toFixed(1)}%`,
        suggestion: `Increase price to at least $${calculateMinimumPrice(cost, minMargin).toFixed(2)} to meet minimum margin requirement`
      };
    }

    if (!isValid && canOverride) {
      return {
        isValid: true, // Allow override
        margin,
        minMargin,
        warning: `Margin (${margin.toFixed(1)}%) is below recommended minimum (${minMargin.toFixed(1)}%), but override is enabled`,
        suggestion: `Consider increasing price to $${calculateMinimumPrice(cost, minMargin).toFixed(2)} for better profitability`
      };
    }

    return {
      isValid: true,
      margin,
      minMargin
    };
  } catch (error) {
    console.error('Error validating minimum margin:', error);
    return {
      isValid: false,
      margin: 0,
      minMargin: 0,
      error: 'Failed to validate margin requirements'
    };
  }
}

/**
 * Calculate minimum price needed to achieve target margin
 */
export function calculateMinimumPrice(cost: number, targetMarginPercent: number): number {
  if (targetMarginPercent >= 100) {
    throw new Error('Target margin cannot be 100% or greater');
  }
  return cost / (1 - targetMarginPercent / 100);
}

/**
 * Calculate recommended price based on target margin
 */
export function calculateRecommendedPrice(cost: number, targetMarginPercent: number): number {
  return calculateMinimumPrice(cost, targetMarginPercent);
}

/**
 * Get margin analysis for a product
 */
export async function getMarginAnalysis(
  vendorId: string,
  price: number,
  cost: number
): Promise<{
  current: MarginCalculation;
  recommended: MarginCalculation;
  minRequired: MarginCalculation;
  analysis: {
    isProfitable: boolean;
    meetsMinimum: boolean;
    marginHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    recommendations: string[];
  };
}> {
  const current = calculateMargin(price, cost);
  
  // Get vendor's minimum margin requirement
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    select: { minMarginPercent: true }
  });

  const minMarginPercent = vendor?.minMarginPercent || 30.0; // Default 30%
  const recommendedMarginPercent = Math.max(minMarginPercent + 10, 40); // 10% above minimum, but at least 40%

  const minRequired = {
    ...calculateMargin(calculateMinimumPrice(cost, minMarginPercent), cost),
    price: calculateMinimumPrice(cost, minMarginPercent)
  };

  const recommended = {
    ...calculateMargin(calculateMinimumPrice(cost, recommendedMarginPercent), cost),
    price: calculateMinimumPrice(cost, recommendedMarginPercent)
  };

  // Analyze margin health
  let marginHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  if (current.marginPercent >= 50) marginHealth = 'excellent';
  else if (current.marginPercent >= 40) marginHealth = 'good';
  else if (current.marginPercent >= 30) marginHealth = 'fair';
  else if (current.marginPercent >= 20) marginHealth = 'poor';
  else marginHealth = 'critical';

  const recommendations: string[] = [];
  
  if (current.marginPercent < minMarginPercent) {
    recommendations.push(`Increase price to at least $${minRequired.price.toFixed(2)} to meet minimum margin requirement`);
  }
  
  if (current.marginPercent < recommendedMarginPercent) {
    recommendations.push(`Consider increasing price to $${recommended.price.toFixed(2)} for better profitability`);
  }
  
  if (current.marginPercent < 20) {
    recommendations.push('Margin is critically low. Consider reviewing cost structure or increasing price significantly');
  }
  
  if (current.marginPercent > 60) {
    recommendations.push('High margin detected. Consider competitive pricing analysis');
  }

  return {
    current,
    recommended,
    minRequired,
    analysis: {
      isProfitable: current.margin > 0,
      meetsMinimum: current.marginPercent >= minMarginPercent,
      marginHealth,
      recommendations
    }
  };
}

/**
 * Initialize system settings with default values
 */
export async function initializeSystemSettings(): Promise<void> {
  const defaultSettings = [
    {
      key: 'DEFAULT_MIN_MARGIN_PERCENT',
      value: '30.0',
      description: 'Default minimum margin percentage for vendors'
    },
    {
      key: 'MARGIN_OVERRIDE_ENABLED',
      value: 'true',
      description: 'Whether vendors can override minimum margin requirements'
    },
    {
      key: 'MARGIN_ALERT_THRESHOLD',
      value: '25.0',
      description: 'Margin percentage threshold for generating alerts'
    }
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description
      }
    });
  }
}

/**
 * Get system margin settings
 */
export async function getSystemMarginSettings(): Promise<{
  defaultMinMargin: number;
  overrideEnabled: boolean;
  alertThreshold: number;
}> {
  const settings = await prisma.systemSettings.findMany({
    where: {
      key: { in: ['DEFAULT_MIN_MARGIN_PERCENT', 'MARGIN_OVERRIDE_ENABLED', 'MARGIN_ALERT_THRESHOLD'] },
      isActive: true
    }
  });

  const defaultMinMargin = parseFloat(
    settings.find(s => s.key === 'DEFAULT_MIN_MARGIN_PERCENT')?.value || '30.0'
  );
  
  const overrideEnabled = settings.find(s => s.key === 'MARGIN_OVERRIDE_ENABLED')?.value === 'true';
  
  const alertThreshold = parseFloat(
    settings.find(s => s.key === 'MARGIN_ALERT_THRESHOLD')?.value || '25.0'
  );

  return {
    defaultMinMargin,
    overrideEnabled,
    alertThreshold
  };
} 