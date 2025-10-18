import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

interface TaxNexusState {
  state: string;
  hasNexus: boolean;
  registrationNumber?: string;
  effectiveDate?: Date;
}

interface W9Status {
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

interface Tax1099Eligibility {
  eligible: boolean;
  year: number;
  totalPayments: number;
  threshold: number; // $600 for 1099-NEC
}

/**
 * Tax administration service with TaxJar integration (stub for development)
 */
export class TaxAdminService {
  
  /**
   * Determine tax nexus states for a vendor
   * In production, this would integrate with TaxJar or Avalara
   */
  async determineNexusStates(userId: string): Promise<TaxNexusState[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendorProfile: true,
          orders: {
            select: {
              shippingAddress: true
            }
          }
        }
      });
      
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Stub implementation: Determine nexus based on vendor location and order destinations
      const nexusStates: TaxNexusState[] = [];
      
      // Vendor's home state always has nexus
      if (user.vendorProfile?.state) {
        nexusStates.push({
          state: user.vendorProfile.state,
          hasNexus: true,
          effectiveDate: user.created_at
        });
      }
      
      // Stub: In production, would check economic nexus thresholds by state
      // For now, just track states where orders have been shipped
      const shippedStates = new Set(
        user.orders
          .map(o => this.parseShippingState(o.shippingAddress))
          .filter(Boolean)
      );
      
      for (const state of shippedStates) {
        if (!nexusStates.find(n => n.state === state)) {
          // Stub: Would check if sales threshold met for economic nexus
          const hasEconomicNexus = false; // TODO: Implement threshold check
          
          if (hasEconomicNexus) {
            nexusStates.push({
              state: state!,
              hasNexus: true
            });
          }
        }
      }
      
      logger.info(`Determined tax nexus for user ${userId}`, {
        userId,
        nexusStateCount: nexusStates.length,
        states: nexusStates.map(n => n.state)
      });
      
      return nexusStates;
    } catch (error) {
      logger.error(`Failed to determine nexus for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update tax profile with nexus information
   */
  async updateTaxProfile(userId: string): Promise<void> {
    try {
      const nexusStates = await this.determineNexusStates(userId);
      
      await prisma.taxProfile.upsert({
        where: { userId },
        update: {
          nexusStates: JSON.stringify(nexusStates),
          updatedAt: new Date()
        },
        create: {
          userId,
          nexusStates: JSON.stringify(nexusStates)
        }
      });
      
      logger.info(`Updated tax profile for user ${userId}`);
    } catch (error) {
      logger.error(`Failed to update tax profile for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get W-9 status for a vendor
   */
  async getW9Status(userId: string): Promise<W9Status> {
    try {
      const taxProfile = await prisma.taxProfile.findUnique({
        where: { userId }
      });
      
      if (!taxProfile || !taxProfile.w9Status) {
        return { status: 'NOT_SUBMITTED' };
      }
      
      // Parse W-9 status from stored JSON or string
      if (typeof taxProfile.w9Status === 'string') {
        const status = taxProfile.w9Status as W9Status['status'];
        return { status };
      }
      
      return JSON.parse(taxProfile.w9Status) as W9Status;
    } catch (error) {
      logger.error(`Failed to get W-9 status for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update W-9 status
   */
  async updateW9Status(userId: string, status: W9Status['status'], adminId?: string): Promise<void> {
    try {
      const w9Status: W9Status = {
        status,
        ...(status === 'PENDING' && { submittedAt: new Date() }),
        ...(status === 'APPROVED' && { approvedAt: new Date() }),
        ...(status === 'REJECTED' && { rejectedAt: new Date() })
      };
      
      await prisma.taxProfile.upsert({
        where: { userId },
        update: {
          w9Status: JSON.stringify(w9Status),
          updatedAt: new Date()
        },
        create: {
          userId,
          w9Status: JSON.stringify(w9Status)
        }
      });
      
      if (adminId) {
        await prisma.adminAudit.create({
          data: {
            adminId,
            action: 'W9_STATUS_UPDATE',
            target: `User:${userId}`,
            payload: { newStatus: status }
          }
        });
      }
      
      logger.info(`Updated W-9 status for user ${userId} to ${status}`);
    } catch (error) {
      logger.error(`Failed to update W-9 status for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Check 1099 eligibility for a vendor
   */
  async check1099Eligibility(userId: string, year: number): Promise<Tax1099Eligibility> {
    try {
      // Get total payments to vendor for the year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const payments = await prisma.order.aggregate({
        where: {
          vendorId: userId,
          status: 'COMPLETED',
          completedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          totalAmount: true
        }
      });
      
      const totalPayments = payments._sum.totalAmount || 0;
      const threshold = 600; // $600 threshold for 1099-NEC
      
      const eligibility: Tax1099Eligibility = {
        eligible: totalPayments >= threshold,
        year,
        totalPayments,
        threshold
      };
      
      logger.info(`Checked 1099 eligibility for user ${userId}`, {
        userId,
        year,
        eligible: eligibility.eligible,
        totalPayments
      });
      
      return eligibility;
    } catch (error) {
      logger.error(`Failed to check 1099 eligibility for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Sync tax information with TaxJar (stub)
   * In production, this would call TaxJar API
   */
  async syncWithTaxJar(userId: string): Promise<void> {
    try {
      // Stub: In production, would call TaxJar API to:
      // 1. Create/update customer/vendor
      // 2. Sync nexus addresses
      // 3. Get tax registration requirements
      
      logger.info(`[STUB] Synced tax info with TaxJar for user ${userId}`);
      
      // Update TaxJar ID in profile
      const taxJarId = `tj_${userId.slice(0, 8)}`; // Stub ID
      
      await prisma.taxProfile.upsert({
        where: { userId },
        update: {
          taxJarId,
          updatedAt: new Date()
        },
        create: {
          userId,
          taxJarId
        }
      });
    } catch (error) {
      logger.error(`Failed to sync with TaxJar for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get tax documents for a user
   */
  async getTaxDocuments(userId: string): Promise<Array<{
    id: string;
    type: string;
    year: number;
    uploadedAt: Date;
    url: string;
  }>> {
    try {
      const taxProfile = await prisma.taxProfile.findUnique({
        where: { userId }
      });
      
      if (!taxProfile || !taxProfile.documents) {
        return [];
      }
      
      const documents = JSON.parse(taxProfile.documents);
      return Array.isArray(documents) ? documents : [];
    } catch (error) {
      logger.error(`Failed to get tax documents for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add tax document
   */
  async addTaxDocument(
    userId: string, 
    document: { type: string; year: number; url: string },
    adminId?: string
  ): Promise<void> {
    try {
      const existing = await this.getTaxDocuments(userId);
      
      const newDocument = {
        id: `doc_${Date.now()}`,
        ...document,
        uploadedAt: new Date()
      };
      
      const updated = [...existing, newDocument];
      
      await prisma.taxProfile.upsert({
        where: { userId },
        update: {
          documents: JSON.stringify(updated),
          updatedAt: new Date()
        },
        create: {
          userId,
          documents: JSON.stringify(updated)
        }
      });
      
      if (adminId) {
        await prisma.adminAudit.create({
          data: {
            adminId,
            action: 'TAX_DOCUMENT_ADDED',
            target: `User:${userId}`,
            payload: { documentType: document.type, year: document.year }
          }
        });
      }
      
      logger.info(`Added tax document for user ${userId}`, {
        userId,
        documentType: document.type,
        year: document.year
      });
    } catch (error) {
      logger.error(`Failed to add tax document for user ${userId}:`, { error, userId });
      throw error;
    }
  }
  
  /**
   * Batch sync tax profiles for all vendors
   */
  async syncAllVendorTaxProfiles(): Promise<{ success: number; failed: number }> {
    try {
      const vendors = await prisma.vendorProfile.findMany({
        select: { userId: true }
      });
      
      let success = 0;
      let failed = 0;
      
      for (const vendor of vendors) {
        try {
          await this.updateTaxProfile(vendor.userId);
          success++;
        } catch (error) {
          logger.error(`Failed to sync tax profile for vendor ${vendor.userId}:`, { error, userId: vendor.userId });
          failed++;
        }
      }
      
      logger.info(`Tax profile batch sync completed`, {
        total: vendors.length,
        success,
        failed
      });
      
      return { success, failed };
    } catch (error) {
      logger.error('Tax profile batch sync error:', { error });
      throw error;
    }
  }
  
  /**
   * Parse shipping state from address string
   */
  private parseShippingState(address: string | null): string | null {
    if (!address) return null;
    
    // Stub: Basic state extraction
    // In production, would use proper address parsing
    const stateMatch = address.match(/,\s*([A-Z]{2})\s*\d{5}/);
    return stateMatch ? stateMatch[1] : null;
  }
}

export const taxAdminService = new TaxAdminService();

