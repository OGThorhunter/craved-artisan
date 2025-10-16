import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { maintenanceModeService } from '../services/maintenance-mode.service';

const router = Router();
const prisma = new PrismaClient();

// Check maintenance mode status (public endpoint)
router.get('/status', async (req, res) => {
  try {
    // Use new maintenance mode service
    const status = await maintenanceModeService.getStatus();
    
    const isMaintenanceMode = status.globalReadonly || status.vendorReadonly || status.queueDrain;
    
    // Log the maintenance mode check
    logger.info('Maintenance mode status checked', {
      maintenanceMode: isMaintenanceMode,
      globalReadonly: status.globalReadonly,
      vendorReadonly: status.vendorReadonly,
      queueDrain: status.queueDrain,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      maintenanceMode: isMaintenanceMode,
      globalReadonly: status.globalReadonly,
      vendorReadonly: status.vendorReadonly,
      queueDrain: status.queueDrain,
      activeWindows: status.activeWindows
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to check maintenance mode status');
    res.status(500).json({ error: 'Failed to check maintenance mode status' });
  }
});

// Validate beta access (public endpoint with rate limiting)
router.post('/validate-access', async (req, res) => {
  try {
    const { betaKey, userId } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    
    let hasAccess = false;
    let accessType = null;
    
    // Check beta key against environment variable
    if (betaKey && process.env.BETA_ACCESS_KEY === betaKey) {
      hasAccess = true;
      accessType = 'beta_key';
    }
    
    // Check if user is a beta tester
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { betaTester: true, email: true }
      });
      
      if (user?.betaTester) {
        hasAccess = true;
        accessType = 'beta_user';
      }
    }
    
    // Log the access attempt
    logger.info({
      hasAccess,
      accessType,
      userId,
      betaKeyProvided: !!betaKey,
      ip,
      userAgent
    }, 'Beta access validation attempt');
    
    res.json({
      hasAccess,
      accessType
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to validate beta access');
    res.status(500).json({ error: 'Failed to validate access' });
  }
});

// Admin endpoints for managing maintenance mode
router.get('/admin/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const maintenanceFlag = await prisma.featureFlag.findUnique({
      where: { key: 'maintenance_mode' }
    });
    
    const envMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    
    // Get beta testers count
    const betaTestersCount = await prisma.user.count({
      where: { betaTester: true }
    });
    
    res.json({
      environmentMode: envMaintenanceMode,
      databaseMode: maintenanceFlag?.enabled ?? false,
      betaTestersCount,
      notes: maintenanceFlag?.notes
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get maintenance settings');
    res.status(500).json({ error: 'Failed to get maintenance settings' });
  }
});

// Toggle maintenance mode (admin only)
router.post('/admin/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { enabled, notes } = req.body;
    const userId = req.user?.id;
    
    const maintenanceFlag = await prisma.featureFlag.upsert({
      where: { key: 'maintenance_mode' },
      update: {
        enabled: Boolean(enabled),
        notes: notes || null,
        updatedAt: new Date()
      },
      create: {
        key: 'maintenance_mode',
        enabled: Boolean(enabled),
        notes: notes || null
      }
    });
    
    logger.info({
      adminUserId: userId,
      maintenanceMode: enabled,
      notes,
      ip: req.ip
    }, 'Maintenance mode toggled by admin');
    
    res.json({
      success: true,
      maintenanceMode: maintenanceFlag.enabled,
      notes: maintenanceFlag.notes
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to toggle maintenance mode');
    res.status(500).json({ error: 'Failed to toggle maintenance mode' });
  }
});

// Get beta testers list (admin only)
router.get('/admin/beta-testers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const betaTesters = await prisma.user.findMany({
      where: { betaTester: true },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ betaTesters });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get beta testers');
    res.status(500).json({ error: 'Failed to get beta testers' });
  }
});

// Add beta tester (admin only)
router.post('/admin/beta-testers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, userId } = req.body;
    const adminUserId = req.user?.id;
    
    let user;
    
    if (userId) {
      // Update existing user by ID
      user = await prisma.user.update({
        where: { id: userId },
        data: { betaTester: true },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true
        }
      });
    } else if (email) {
      // Find and update user by email
      user = await prisma.user.update({
        where: { email },
        data: { betaTester: true },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true
        }
      });
    } else {
      return res.status(400).json({ error: 'Email or userId required' });
    }
    
    logger.info({
      adminUserId,
      betaTesterId: user.id,
      betaTesterEmail: user.email,
      ip: req.ip
    }, 'Beta tester added by admin');
    
    res.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.error({ error }, 'Failed to add beta tester');
    res.status(500).json({ error: 'Failed to add beta tester' });
  }
});

// Remove beta tester (admin only)
router.delete('/admin/beta-testers/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = req.user?.id;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { betaTester: false },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true
      }
    });
    
    logger.info({
      adminUserId,
      betaTesterId: user.id,
      betaTesterEmail: user.email,
      ip: req.ip
    }, 'Beta tester removed by admin');
    
    res.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.error({ error }, 'Failed to remove beta tester');
    res.status(500).json({ error: 'Failed to remove beta tester' });
  }
});

export default router;

