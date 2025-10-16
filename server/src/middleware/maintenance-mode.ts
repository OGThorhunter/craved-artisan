import { Request, Response, NextFunction } from 'express';
import { maintenanceModeService } from '../services/maintenance-mode.service';
import { logger } from '../logger';

/**
 * Middleware to check for global maintenance mode
 * Blocks all requests except admin requests with bypass header
 */
export async function checkMaintenanceMode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Allow admin bypass with special header
    const bypassHeader = req.headers['x-admin-bypass-maintenance'];
    if (bypassHeader === process.env.MAINTENANCE_BYPASS_SECRET) {
      return next();
    }

    // Allow health checks
    if (req.path === '/api/health') {
      return next();
    }

    // Check if in maintenance mode
    const status = await maintenanceModeService.getStatus();

    if (status.globalReadonly) {
      // Allow GET requests, block mutations
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        logger.warn({ path: req.path, method: req.method }, 'Request blocked by global maintenance mode');
        
        return res.status(503).json({
          success: false,
          message: 'System is currently in maintenance mode. Only read operations are allowed.',
          maintenanceMode: true,
          expectedEnd: status.activeWindows[0]?.scheduledEnd
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error checking maintenance mode:', error);
    // On error, allow request through to avoid blocking system
    next();
  }
}

/**
 * Middleware to check vendor-specific maintenance mode
 */
export async function checkVendorMaintenanceMode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Allow admin bypass
    const bypassHeader = req.headers['x-admin-bypass-maintenance'];
    if (bypassHeader === process.env.MAINTENANCE_BYPASS_SECRET) {
      return next();
    }

    const status = await maintenanceModeService.getStatus();

    if (status.vendorReadonly) {
      // Check if this is a vendor mutation request
      const isVendorRequest = req.path.startsWith('/api/vendor');
      
      if (isVendorRequest && req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        logger.warn({ path: req.path, method: req.method }, 'Vendor request blocked by maintenance mode');
        
        return res.status(503).json({
          success: false,
          message: 'Vendor features are currently in maintenance mode. Only read operations are allowed.',
          maintenanceMode: true,
          expectedEnd: status.activeWindows.find(w => w.type === 'VENDOR_READONLY')?.scheduledEnd
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error checking vendor maintenance mode:', error);
    next();
  }
}

/**
 * Get maintenance banner info for frontend
 */
export async function getMaintenanceBanner(
  req: Request,
  res: Response
) {
  try {
    const status = await maintenanceModeService.getStatus();

    const banners = [];

    if (status.globalReadonly) {
      const window = status.activeWindows.find(w => w.type === 'GLOBAL_READONLY');
      banners.push({
        type: 'GLOBAL_READONLY',
        message: 'System is in maintenance mode. Only viewing is available.',
        reason: window?.reason,
        expectedEnd: window?.scheduledEnd
      });
    }

    if (status.vendorReadonly) {
      const window = status.activeWindows.find(w => w.type === 'VENDOR_READONLY');
      banners.push({
        type: 'VENDOR_READONLY',
        message: 'Vendor features are in maintenance mode.',
        reason: window?.reason,
        expectedEnd: window?.scheduledEnd
      });
    }

    if (status.queueDrain) {
      const window = status.activeWindows.find(w => w.type === 'QUEUE_DRAIN');
      banners.push({
        type: 'QUEUE_DRAIN',
        message: 'Background jobs are being drained for maintenance.',
        reason: window?.reason,
        expectedEnd: window?.scheduledEnd
      });
    }

    res.json({
      success: true,
      data: {
        hasMaintenance: banners.length > 0,
        banners
      }
    });
  } catch (error) {
    logger.error('Error getting maintenance banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance status'
    });
  }
}

