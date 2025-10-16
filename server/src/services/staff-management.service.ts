import { prisma } from '../db';
import { logger } from '../logger';

interface CreateStaffMemberData {
  role: string;
  salaryCents: number;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

interface UpdateStaffMemberData {
  role?: string;
  salaryCents?: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

class StaffManagementService {
  /**
   * Create a new staff member
   */
  async createStaffMember(data: CreateStaffMemberData) {
    try {
      const staffMember = await prisma.staffMember.create({
        data: {
          role: data.role,
          salaryCents: data.salaryCents,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes,
          isActive: !data.endDate, // If endDate provided, they're not active
        },
      });

      logger.info({
        staffMemberId: staffMember.id,
        role: staffMember.role,
        salaryCents: staffMember.salaryCents,
        startDate: staffMember.startDate,
      }, 'Staff member created');

      return staffMember;
    } catch (error) {
      logger.error({ error }, 'Failed to create staff member');
      throw error;
    }
  }

  /**
   * Update a staff member
   */
  async updateStaffMember(id: string, data: UpdateStaffMemberData) {
    try {
      const existing = await prisma.staffMember.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('Staff member not found');
      }

      const staffMember = await prisma.staffMember.update({
        where: { id },
        data: {
          ...data,
          isActive: data.endDate ? false : (data.endDate === null ? true : existing.isActive),
        },
      });

      logger.info({
        staffMemberId: staffMember.id,
        role: staffMember.role,
        changes: data,
        oldSalary: existing.salaryCents,
        newSalary: staffMember.salaryCents,
      }, 'Staff member updated');

      return staffMember;
    } catch (error) {
      logger.error({ error, staffMemberId: id }, 'Failed to update staff member');
      throw error;
    }
  }

  /**
   * Deactivate a staff member
   */
  async deactivateStaffMember(id: string, endDate: Date) {
    try {
      const staffMember = await prisma.staffMember.update({
        where: { id },
        data: {
          endDate,
          isActive: false,
        },
      });

      logger.info({
        staffMemberId: staffMember.id,
        role: staffMember.role,
        endDate,
      }, 'Staff member deactivated');

      return staffMember;
    } catch (error) {
      logger.error({ error, staffMemberId: id }, 'Failed to deactivate staff member');
      throw error;
    }
  }

  /**
   * Get all active staff members
   */
  async getActiveStaff() {
    try {
      return await prisma.staffMember.findMany({
        where: { isActive: true },
        orderBy: { startDate: 'desc' },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get active staff');
      throw error;
    }
  }

  /**
   * Get all staff members (including historical)
   */
  async getAllStaff() {
    try {
      return await prisma.staffMember.findMany({
        orderBy: { startDate: 'desc' },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get all staff');
      throw error;
    }
  }

  /**
   * Get a single staff member by ID
   */
  async getStaffMember(id: string) {
    try {
      return await prisma.staffMember.findUnique({ where: { id } });
    } catch (error) {
      logger.error({ error, staffMemberId: id }, 'Failed to get staff member');
      throw error;
    }
  }

  /**
   * Calculate total staff costs for a period (prorated)
   */
  async calculateStaffCostsForPeriod(startDate: Date, endDate: Date) {
    try {
      // Get all staff members who overlap with this period
      const staff = await prisma.staffMember.findMany({
        where: {
          OR: [
            {
              // Started before or during period, no end date (still active)
              startDate: { lte: endDate },
              endDate: null,
            },
            {
              // Started before or during period, ended during or after period
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });

      let totalCostCents = 0;
      const periodDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      for (const member of staff) {
        // Determine the effective start and end dates within the period
        const effectiveStart = member.startDate > startDate ? member.startDate : startDate;
        const effectiveEnd = member.endDate && member.endDate < endDate ? member.endDate : endDate;

        // Calculate days worked in this period
        const daysWorked = (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24);

        // Calculate prorated cost (annual salary / 365 * days worked)
        const proratedCost = Math.floor((member.salaryCents / 365) * daysWorked);
        totalCostCents += proratedCost;
      }

      logger.info({
        startDate,
        endDate,
        staffCount: staff.length,
        totalCostCents,
        periodDays,
      }, 'Calculated staff costs for period');

      return {
        totalCostCents,
        staffCount: staff.filter(s => 
          (!s.endDate || s.endDate >= endDate) && s.startDate <= endDate
        ).length, // Active staff count at end of period
      };
    } catch (error) {
      logger.error({ error, startDate, endDate }, 'Failed to calculate staff costs for period');
      throw error;
    }
  }
}

export const staffManagementService = new StaffManagementService();

