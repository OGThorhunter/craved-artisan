import { Router, Request, Response } from 'express';
import { profitLossService } from '../services/profit-loss.service';
import { staffManagementService } from '../services/staff-management.service';
import { costTrackingService } from '../services/cost-tracking.service';
import { requireAdmin } from '../middleware/auth';
import { logger } from '../logger';

const router = Router();

// All routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/pl/monthly?month=YYYY-MM
 * Get monthly P&L snapshot
 */
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;

    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'Month parameter required (YYYY-MM format)' });
    }

    const [year, monthNum] = month.split('-').map(Number);
    const targetMonth = new Date(year, monthNum - 1, 1);

    const snapshot = await profitLossService.getMonthlyPL(targetMonth);

    if (!snapshot) {
      return res.status(404).json({ error: 'P&L snapshot not found for this month' });
    }

    res.json({ data: snapshot });
  } catch (error) {
    logger.error({ error }, 'Failed to get monthly P&L');
    res.status(500).json({ error: 'Failed to retrieve monthly P&L' });
  }
});

/**
 * GET /api/admin/pl/yearly?year=YYYY
 * Get yearly P&L aggregate
 */
router.get('/yearly', async (req: Request, res: Response) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ error: 'Year parameter required' });
    }

    const targetYear = parseInt(year as string, 10);
    const yearlyPL = await profitLossService.getYearlyPL(targetYear);

    res.json({ data: yearlyPL });
  } catch (error) {
    logger.error({ error }, 'Failed to get yearly P&L');
    res.status(500).json({ error: 'Failed to retrieve yearly P&L' });
  }
});

/**
 * POST /api/admin/pl/generate?month=YYYY-MM
 * Manually trigger P&L calculation for a month
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;

    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'Month parameter required (YYYY-MM format)' });
    }

    const [year, monthNum] = month.split('-').map(Number);
    const targetMonth = new Date(year, monthNum - 1, 1);

    const snapshot = await profitLossService.generateMonthlyPL(targetMonth);

    res.json({ 
      data: snapshot,
      message: 'P&L snapshot generated successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate P&L');
    res.status(500).json({ error: 'Failed to generate P&L' });
  }
});

/**
 * GET /api/admin/pl/trend?start=YYYY-MM&end=YYYY-MM
 * Get P&L trend over time
 */
router.get('/trend', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end parameters required (YYYY-MM format)' });
    }

    const [startYear, startMonth] = (start as string).split('-').map(Number);
    const [endYear, endMonth] = (end as string).split('-').map(Number);

    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth - 1, 1);

    const trend = await profitLossService.getPLTrend(startDate, endDate);

    res.json({ data: trend });
  } catch (error) {
    logger.error({ error }, 'Failed to get P&L trend');
    res.status(500).json({ error: 'Failed to retrieve P&L trend' });
  }
});

/**
 * GET /api/admin/pl/latest
 * Get the most recent P&L snapshot
 */
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const snapshot = await profitLossService.getLatestPL();

    if (!snapshot) {
      return res.status(404).json({ error: 'No P&L snapshots found' });
    }

    res.json({ data: snapshot });
  } catch (error) {
    logger.error({ error }, 'Failed to get latest P&L');
    res.status(500).json({ error: 'Failed to retrieve latest P&L' });
  }
});

/**
 * GET /api/admin/staff
 * List all staff members
 */
router.get('/staff', async (req: Request, res: Response) => {
  try {
    const { activeOnly } = req.query;

    const staff = activeOnly === 'true'
      ? await staffManagementService.getActiveStaff()
      : await staffManagementService.getAllStaff();

    res.json({ data: staff });
  } catch (error) {
    logger.error({ error }, 'Failed to get staff');
    res.status(500).json({ error: 'Failed to retrieve staff members' });
  }
});

/**
 * GET /api/admin/staff/:id
 * Get single staff member
 */
router.get('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const staffMember = await staffManagementService.getStaffMember(id);

    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ data: staffMember });
  } catch (error) {
    logger.error({ error }, 'Failed to get staff member');
    res.status(500).json({ error: 'Failed to retrieve staff member' });
  }
});

/**
 * POST /api/admin/staff
 * Create staff member
 */
router.post('/staff', async (req: Request, res: Response) => {
  try {
    const { role, salaryCents, startDate, endDate, notes } = req.body;

    if (!role || !salaryCents || !startDate) {
      return res.status(400).json({ 
        error: 'Role, salary, and start date are required' 
      });
    }

    const staffMember = await staffManagementService.createStaffMember({
      role,
      salaryCents: parseInt(salaryCents, 10),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes,
    });

    res.status(201).json({ 
      data: staffMember,
      message: 'Staff member created successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to create staff member');
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

/**
 * PATCH /api/admin/staff/:id
 * Update staff member
 */
router.patch('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, salaryCents, startDate, endDate, notes } = req.body;

    const updates: any = {};
    if (role !== undefined) updates.role = role;
    if (salaryCents !== undefined) updates.salaryCents = parseInt(salaryCents, 10);
    if (startDate !== undefined) updates.startDate = new Date(startDate);
    if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) updates.notes = notes;

    const staffMember = await staffManagementService.updateStaffMember(id, updates);

    res.json({ 
      data: staffMember,
      message: 'Staff member updated successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to update staff member');
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

/**
 * DELETE /api/admin/staff/:id
 * Deactivate staff member
 */
router.delete('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;

    if (!endDate) {
      return res.status(400).json({ error: 'End date is required to deactivate staff' });
    }

    const staffMember = await staffManagementService.deactivateStaffMember(
      id,
      new Date(endDate)
    );

    res.json({ 
      data: staffMember,
      message: 'Staff member deactivated successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to deactivate staff member');
    res.status(500).json({ error: 'Failed to deactivate staff member' });
  }
});

/**
 * PATCH /api/admin/costs/:date
 * Update manual cost overrides
 */
router.patch('/costs/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { 
      manualRenderCostCents,
      manualRedisCostCents,
      manualDatabaseCostCents,
      manualSendGridCostCents,
      manualStorageCostCents,
      otherCostsCents,
      otherCostsNote,
    } = req.body;

    const targetDate = new Date(date);
    const adminId = req.user?.id || 'unknown';

    const updates: any = {};
    if (manualRenderCostCents !== undefined) updates.manualRenderCostCents = manualRenderCostCents;
    if (manualRedisCostCents !== undefined) updates.manualRedisCostCents = manualRedisCostCents;
    if (manualDatabaseCostCents !== undefined) updates.manualDatabaseCostCents = manualDatabaseCostCents;
    if (manualSendGridCostCents !== undefined) updates.manualSendGridCostCents = manualSendGridCostCents;
    if (manualStorageCostCents !== undefined) updates.manualStorageCostCents = manualStorageCostCents;
    if (otherCostsCents !== undefined) updates.otherCostsCents = otherCostsCents;
    if (otherCostsNote !== undefined) updates.otherCostsNote = otherCostsNote;

    await costTrackingService.updateManualCosts(targetDate, updates, adminId);

    res.json({ message: 'Manual cost overrides updated successfully' });
  } catch (error) {
    logger.error({ error }, 'Failed to update manual costs');
    res.status(500).json({ error: 'Failed to update manual costs' });
  }
});

/**
 * GET /api/admin/costs/:date
 * Get costs for a specific date
 */
router.get('/costs/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);

    const costs = await costTrackingService.getEffectiveCosts(targetDate);

    res.json({ data: costs });
  } catch (error) {
    logger.error({ error }, 'Failed to get costs');
    res.status(500).json({ error: 'Failed to retrieve costs' });
  }
});

export default router;

