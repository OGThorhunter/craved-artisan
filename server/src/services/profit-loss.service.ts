import { prisma } from '../db';
import { logger } from '../logger';
import { costTrackingService } from './cost-tracking.service';
import { staffManagementService } from './staff-management.service';

interface MonthlyPLData {
  id: string;
  month: Date;
  totalRevenueCents: number;
  hostingCostCents: number;
  redisCostCents: number;
  databaseCostCents: number;
  emailCostCents: number;
  storageCostCents: number;
  paymentProcessingCostCents: number;
  otherCostsCents: number;
  staffCostCents: number;
  staffCount: number;
  totalCostCents: number;
  grossProfitCents: number;
  netProfitCents: number;
  profitMarginPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

class ProfitLossService {
  /**
   * Generate monthly P&L snapshot
   */
  async generateMonthlyPL(month: Date): Promise<MonthlyPLData> {
    try {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

      // 1. Get revenue for the month
      const revenueSnapshots = await prisma.revenueSnapshot.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const totalRevenueCents = revenueSnapshots.reduce(
        (sum, snapshot) => sum + snapshot.platformRevenueCents,
        0
      );

      // 2. Get costs for the month
      const costs = await costTrackingService.getCostsForMonth(startOfMonth);

      // 3. Get staff costs for the month
      const staffCosts = await staffManagementService.calculateStaffCostsForPeriod(
        startOfMonth,
        endOfMonth
      );

      // 4. Calculate totals
      const totalCostCents = costs.totalCostCents + staffCosts.totalCostCents;
      const grossProfitCents = totalRevenueCents - costs.totalCostCents;
      const netProfitCents = totalRevenueCents - totalCostCents;
      const profitMarginPercent = totalRevenueCents > 0 
        ? (netProfitCents / totalRevenueCents) * 100 
        : 0;

      // 5. Save or update the snapshot
      const plSnapshot = await prisma.profitLossSnapshot.upsert({
        where: { month: startOfMonth },
        create: {
          month: startOfMonth,
          totalRevenueCents,
          hostingCostCents: costs.hostingCostCents,
          redisCostCents: costs.redisCostCents,
          databaseCostCents: costs.databaseCostCents,
          emailCostCents: costs.emailCostCents,
          storageCostCents: costs.storageCostCents,
          paymentProcessingCostCents: costs.paymentProcessingCostCents,
          otherCostsCents: costs.otherCostsCents,
          staffCostCents: staffCosts.totalCostCents,
          staffCount: staffCosts.staffCount,
          totalCostCents,
          grossProfitCents,
          netProfitCents,
          profitMarginPercent,
        },
        update: {
          totalRevenueCents,
          hostingCostCents: costs.hostingCostCents,
          redisCostCents: costs.redisCostCents,
          databaseCostCents: costs.databaseCostCents,
          emailCostCents: costs.emailCostCents,
          storageCostCents: costs.storageCostCents,
          paymentProcessingCostCents: costs.paymentProcessingCostCents,
          otherCostsCents: costs.otherCostsCents,
          staffCostCents: staffCosts.totalCostCents,
          staffCount: staffCosts.staffCount,
          totalCostCents,
          grossProfitCents,
          netProfitCents,
          profitMarginPercent,
          updatedAt: new Date(),
        },
      });

      logger.info(
        {
          month: startOfMonth,
          totalRevenueCents,
          totalCostCents,
          netProfitCents,
          profitMarginPercent,
        },
        'Generated monthly P&L snapshot'
      );

      return plSnapshot;
    } catch (error) {
      logger.error({ error, month }, 'Failed to generate monthly P&L');
      throw error;
    }
  }

  /**
   * Get monthly P&L snapshot
   */
  async getMonthlyPL(month: Date): Promise<MonthlyPLData | null> {
    try {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);

      const snapshot = await prisma.profitLossSnapshot.findUnique({
        where: { month: startOfMonth },
      });

      return snapshot;
    } catch (error) {
      logger.error({ error, month }, 'Failed to get monthly P&L');
      throw error;
    }
  }

  /**
   * Get yearly P&L (aggregate 12 months)
   */
  async getYearlyPL(year: number): Promise<{
    year: number;
    totalRevenueCents: number;
    totalCostCents: number;
    staffCostCents: number;
    netProfitCents: number;
    profitMarginPercent: number;
    monthlyBreakdown: MonthlyPLData[];
  }> {
    try {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

      const snapshots = await prisma.profitLossSnapshot.findMany({
        where: {
          month: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        orderBy: { month: 'asc' },
      });

      const totalRevenueCents = snapshots.reduce((sum, s) => sum + s.totalRevenueCents, 0);
      const totalCostCents = snapshots.reduce((sum, s) => sum + s.totalCostCents, 0);
      const staffCostCents = snapshots.reduce((sum, s) => sum + s.staffCostCents, 0);
      const netProfitCents = totalRevenueCents - totalCostCents;
      const profitMarginPercent = totalRevenueCents > 0 
        ? (netProfitCents / totalRevenueCents) * 100 
        : 0;

      logger.info(
        {
          year,
          monthCount: snapshots.length,
          totalRevenueCents,
          netProfitCents,
        },
        'Retrieved yearly P&L'
      );

      return {
        year,
        totalRevenueCents,
        totalCostCents,
        staffCostCents,
        netProfitCents,
        profitMarginPercent,
        monthlyBreakdown: snapshots,
      };
    } catch (error) {
      logger.error({ error, year }, 'Failed to get yearly P&L');
      throw error;
    }
  }

  /**
   * Get P&L trend over a date range
   */
  async getPLTrend(startMonth: Date, endMonth: Date): Promise<MonthlyPLData[]> {
    try {
      const snapshots = await prisma.profitLossSnapshot.findMany({
        where: {
          month: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        orderBy: { month: 'asc' },
      });

      return snapshots;
    } catch (error) {
      logger.error({ error, startMonth, endMonth }, 'Failed to get P&L trend');
      throw error;
    }
  }

  /**
   * Get latest P&L snapshot
   */
  async getLatestPL(): Promise<MonthlyPLData | null> {
    try {
      const snapshot = await prisma.profitLossSnapshot.findFirst({
        orderBy: { month: 'desc' },
      });

      return snapshot;
    } catch (error) {
      logger.error({ error }, 'Failed to get latest P&L');
      throw error;
    }
  }
}

export const profitLossService = new ProfitLossService();

