import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  validateMinimumMargin,
  getMarginAnalysis,
  calculateMargin,
  calculateMinimumPrice,
  getSystemMarginSettings,
  initializeSystemSettings,
  MarginValidationResult
} from '../utils/marginValidator';

/**
 * Validate product margin before creation/update
 */
export const validateProductMargin = async (req: Request, res: Response) => {
  try {
    const { vendorId, price, cost, allowOverride = false } = req.body;

    if (!vendorId || !price || cost === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'vendorId, price, and cost are required'
      });
    }

    const validation = await validateMinimumMargin(vendorId, price, cost, allowOverride);

    res.json({
      success: true,
      validation,
      marginCalculation: calculateMargin(price, cost)
    });
  } catch (error) {
    console.error('Error validating product margin:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate product margin'
    });
  }
};

/**
 * Get comprehensive margin analysis for a product
 */
export const getProductMarginAnalysis = async (req: Request, res: Response) => {
  try {
    const { vendorId, price, cost } = req.body;

    if (!vendorId || !price || cost === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'vendorId, price, and cost are required'
      });
    }

    const analysis = await getMarginAnalysis(vendorId, price, cost);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error getting margin analysis:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get margin analysis'
    });
  }
};

/**
 * Calculate minimum price for target margin
 */
export const calculateMinimumPriceForMargin = async (req: Request, res: Response) => {
  try {
    const { cost, targetMarginPercent } = req.body;

    if (!cost || targetMarginPercent === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'cost and targetMarginPercent are required'
      });
    }

    if (targetMarginPercent >= 100) {
      return res.status(400).json({
        error: 'Invalid margin percentage',
        message: 'Target margin cannot be 100% or greater'
      });
    }

    const minimumPrice = calculateMinimumPrice(cost, targetMarginPercent);
    const marginCalculation = calculateMargin(minimumPrice, cost);

    res.json({
      success: true,
      minimumPrice,
      marginCalculation,
      recommendation: `Set price to at least $${minimumPrice.toFixed(2)} to achieve ${targetMarginPercent}% margin`
    });
  } catch (error) {
    console.error('Error calculating minimum price:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate minimum price'
    });
  }
};

/**
 * Get vendor margin settings
 */
export const getVendorMarginSettings = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        storeName: true,
        minMarginPercent: true,
        marginOverrideEnabled: true
      }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const systemSettings = await getSystemMarginSettings();

    res.json({
      success: true,
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
        minMarginPercent: vendor.minMarginPercent || systemSettings.defaultMinMargin,
        marginOverrideEnabled: vendor.marginOverrideEnabled
      },
      system: {
        defaultMinMargin: systemSettings.defaultMinMargin,
        overrideEnabled: systemSettings.overrideEnabled,
        alertThreshold: systemSettings.alertThreshold
      }
    });
  } catch (error) {
    console.error('Error getting vendor margin settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get vendor margin settings'
    });
  }
};

/**
 * Update vendor margin settings
 */
export const updateVendorMarginSettings = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { minMarginPercent, marginOverrideEnabled } = req.body;

    // Validate input
    if (minMarginPercent !== undefined && (minMarginPercent < 0 || minMarginPercent > 100)) {
      return res.status(400).json({
        error: 'Invalid margin percentage',
        message: 'Margin percentage must be between 0 and 100'
      });
    }

    const vendor = await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: {
        minMarginPercent: minMarginPercent !== undefined ? minMarginPercent : undefined,
        marginOverrideEnabled: marginOverrideEnabled !== undefined ? marginOverrideEnabled : undefined
      },
      select: {
        id: true,
        storeName: true,
        minMarginPercent: true,
        marginOverrideEnabled: true
      }
    });

    res.json({
      success: true,
      message: 'Vendor margin settings updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Error updating vendor margin settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update vendor margin settings'
    });
  }
};

/**
 * Get system margin settings
 */
export const getSystemMarginSettingsController = async (req: Request, res: Response) => {
  try {
    const settings = await getSystemMarginSettings();

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error getting system margin settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get system margin settings'
    });
  }
};

/**
 * Update system margin settings
 */
export const updateSystemMarginSettings = async (req: Request, res: Response) => {
  try {
    const { defaultMinMargin, overrideEnabled, alertThreshold } = req.body;

    // Validate inputs
    if (defaultMinMargin !== undefined && (defaultMinMargin < 0 || defaultMinMargin > 100)) {
      return res.status(400).json({
        error: 'Invalid default margin percentage',
        message: 'Default margin percentage must be between 0 and 100'
      });
    }

    if (alertThreshold !== undefined && (alertThreshold < 0 || alertThreshold > 100)) {
      return res.status(400).json({
        error: 'Invalid alert threshold',
        message: 'Alert threshold must be between 0 and 100'
      });
    }

    const updates = [];

    if (defaultMinMargin !== undefined) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key: 'DEFAULT_MIN_MARGIN_PERCENT' },
          update: { value: defaultMinMargin.toString() },
          create: {
            key: 'DEFAULT_MIN_MARGIN_PERCENT',
            value: defaultMinMargin.toString(),
            description: 'Default minimum margin percentage for vendors'
          }
        })
      );
    }

    if (overrideEnabled !== undefined) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key: 'MARGIN_OVERRIDE_ENABLED' },
          update: { value: overrideEnabled.toString() },
          create: {
            key: 'MARGIN_OVERRIDE_ENABLED',
            value: overrideEnabled.toString(),
            description: 'Whether vendors can override minimum margin requirements'
          }
        })
      );
    }

    if (alertThreshold !== undefined) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key: 'MARGIN_ALERT_THRESHOLD' },
          update: { value: alertThreshold.toString() },
          create: {
            key: 'MARGIN_ALERT_THRESHOLD',
            value: alertThreshold.toString(),
            description: 'Margin percentage threshold for generating alerts'
          }
        })
      );
    }

    await Promise.all(updates);

    const updatedSettings = await getSystemMarginSettings();

    res.json({
      success: true,
      message: 'System margin settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating system margin settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update system margin settings'
    });
  }
};

/**
 * Initialize system settings (admin only)
 */
export const initializeSystemSettingsController = async (req: Request, res: Response) => {
  try {
    await initializeSystemSettings();

    res.json({
      success: true,
      message: 'System settings initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing system settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to initialize system settings'
    });
  }
};

/**
 * Get products with low margins for a vendor
 */
export const getLowMarginProducts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { threshold } = req.query;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { minMarginPercent: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const marginThreshold = threshold ? parseFloat(threshold as string) : (vendor.minMarginPercent || 30.0);

    const products = await prisma.product.findMany({
      where: {
        vendorProfileId: vendorId,
        cost: { not: null },
        price: { not: null }
      },
      select: {
        id: true,
        name: true,
        price: true,
        cost: true,
        marginAlert: true,
        alertNote: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Calculate margins and filter low margin products
    const lowMarginProducts = products
      .map(product => {
        const marginCalc = calculateMargin(Number(product.price), product.cost || 0);
        return {
          ...product,
          margin: marginCalc.marginPercent,
          profit: marginCalc.profit,
          meetsMinimum: marginCalc.marginPercent >= marginThreshold
        };
      })
      .filter(product => product.margin < marginThreshold)
      .sort((a, b) => a.margin - b.margin);

    res.json({
      success: true,
      threshold: marginThreshold,
      totalProducts: products.length,
      lowMarginCount: lowMarginProducts.length,
      products: lowMarginProducts
    });
  } catch (error) {
    console.error('Error getting low margin products:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get low margin products'
    });
  }
};

/**
 * Bulk validate margins for vendor products
 */
export const bulkValidateMargins = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { allowOverride = false } = req.query;

    const products = await prisma.product.findMany({
      where: {
        vendorProfileId: vendorId,
        cost: { not: null },
        price: { not: null }
      },
      select: {
        id: true,
        name: true,
        price: true,
        cost: true
      }
    });

    const validations = await Promise.all(
      products.map(async (product) => {
        const validation = await validateMinimumMargin(
          vendorId,
          Number(product.price),
          product.cost || 0,
          allowOverride === 'true'
        );

        return {
          productId: product.id,
          productName: product.name,
          price: Number(product.price),
          cost: product.cost || 0,
          validation
        };
      })
    );

    const summary = {
      total: validations.length,
      valid: validations.filter(v => v.validation.isValid).length,
      invalid: validations.filter(v => !v.validation.isValid).length,
      warnings: validations.filter(v => v.validation.warning).length
    };

    res.json({
      success: true,
      summary,
      validations
    });
  } catch (error) {
    console.error('Error bulk validating margins:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to bulk validate margins'
    });
  }
}; 