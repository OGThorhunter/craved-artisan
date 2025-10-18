import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface VendorProfile {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  baseLocation?: any; // PostGIS POINT
  city?: string;
  state?: string;
  country?: string;
  shipsNational: boolean;
  ratingAvg: number;
  ratingCount: number;
  marketplaceTags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  productCount: number;
  activeProducts: number;
  salesWindowCount: number;
  activeSalesWindows: number;
}

export interface VendorSegment {
  id: string;
  name: string;
  description: string;
  criteria: VendorCriteria;
  vendorCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorCriteria {
  tags?: string[];
  rating?: {
    min?: number;
    max?: number;
  };
  orderCount?: {
    min?: number;
    max?: number;
  };
  revenue?: {
    min?: number;
    max?: number;
  };
  lastLoginDays?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  isActive?: boolean;
  hasActiveProducts?: boolean;
  hasActiveSalesWindows?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface VendorAnalytics {
  totalVendors: number;
  activeVendors: number;
  newVendorsThisMonth: number;
  topVendorsByRevenue: Array<{
    id: string;
    businessName: string;
    revenue: number;
    orderCount: number;
  }>;
  vendorDistribution: {
    byLocation: Array<{ location: string; count: number }>;
    byRating: Array<{ rating: string; count: number }>;
    byActivity: Array<{ status: string; count: number }>;
  };
  growthMetrics: {
    monthlyGrowth: number;
    retentionRate: number;
    churnRate: number;
  };
}

export class VendorManagementService {
  private static instance: VendorManagementService;
  
  public static getInstance(): VendorManagementService {
    if (!VendorManagementService.instance) {
      VendorManagementService.instance = new VendorManagementService();
    }
    return VendorManagementService.instance;
  }

  // Get vendor profile with analytics
  async getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
    try {
      const vendor = await (prisma as any).vendorProfile.findUnique({
        where: { id: vendorId },
        include: {
          products: {
            select: {
              id: true,
              isActive: true,
            }
          },
          salesWindows: {
            select: {
              id: true,
              isActive: true,
            }
          },
          orders: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
            }
          }
        }
      });

      if (!vendor) return null;

      // Calculate analytics
      const totalOrders = vendor.orders.length;
      const totalRevenue = vendor.orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const productCount = vendor.products.length;
      const activeProducts = vendor.products.filter((p: any) => p.isActive).length;
      const salesWindowCount = vendor.salesWindows.length;
      const activeSalesWindows = vendor.salesWindows.filter((sw: any) => sw.isActive).length;

      return {
        id: vendor.id,
        businessName: vendor.businessName,
        contactName: vendor.contactName,
        email: vendor.email,
        phone: vendor.phone,
        avatarUrl: vendor.avatarUrl,
        coverUrl: vendor.coverUrl,
        baseLocation: vendor.baseLocation,
        city: vendor.city,
        state: vendor.state,
        country: vendor.country,
        shipsNational: vendor.shipsNational,
        ratingAvg: vendor.ratingAvg || 0,
        ratingCount: vendor.ratingCount || 0,
        marketplaceTags: vendor.marketplaceTags || [],
        isActive: vendor.isActive,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        lastLoginAt: vendor.lastLoginAt,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        productCount,
        activeProducts,
        salesWindowCount,
        activeSalesWindows
      };
    } catch (error) {
      logger.error(`Failed to get vendor profile ${vendorId}:`, error);
      return null;
    }
  }

  // Search vendors with filters
  async searchVendors(filters: {
    search?: string;
    tags?: string[];
    location?: string;
    rating?: { min?: number; max?: number };
    isActive?: boolean;
    hasActiveProducts?: boolean;
    sortBy?: 'name' | 'rating' | 'revenue' | 'orders' | 'created';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<{
    vendors: VendorProfile[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  }> {
    try {
      const {
        search,
        tags,
        location,
        rating,
        isActive,
        hasActiveProducts,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        pageSize = 20
      } = filters;

      const skip = (page - 1) * pageSize;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { businessName: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (tags && tags.length > 0) {
        where.marketplaceTags = { hasSome: tags };
      }

      if (location) {
        where.OR = [
          ...(where.OR || []),
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } },
          { country: { contains: location, mode: 'insensitive' } }
        ];
      }

      if (rating) {
        if (rating.min !== undefined) where.ratingAvg = { gte: rating.min };
        if (rating.max !== undefined) where.ratingAvg = { ...where.ratingAvg, lte: rating.max };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Build orderBy clause
      let orderBy: any = {};
      switch (sortBy) {
        case 'rating':
          orderBy = { ratingAvg: sortOrder };
          break;
        case 'created':
          orderBy = { createdAt: sortOrder };
          break;
        default:
          orderBy = { businessName: sortOrder };
      }

      const [vendors, total] = await Promise.all([
        (prisma as any).vendorProfile.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          include: {
            products: {
              select: { id: true, isActive: true }
            },
            orders: {
              select: { id: true, totalAmount: true }
            }
          }
        }),
        (prisma as any).vendorProfile.count({ where })
      ]);

      // Transform and filter results
      const transformedVendors = vendors
        .map((vendor: any) => {
          const totalOrders = vendor.orders.length;
          const totalRevenue = vendor.orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
          const activeProducts = vendor.products.filter((p: any) => p.isActive).length;

          return {
            id: vendor.id,
            businessName: vendor.businessName,
            contactName: vendor.contactName,
            email: vendor.email,
            phone: vendor.phone,
            avatarUrl: vendor.avatarUrl,
            coverUrl: vendor.coverUrl,
            city: vendor.city,
            state: vendor.state,
            country: vendor.country,
            shipsNational: vendor.shipsNational,
            ratingAvg: vendor.ratingAvg || 0,
            ratingCount: vendor.ratingCount || 0,
            marketplaceTags: vendor.marketplaceTags || [],
            isActive: vendor.isActive,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt,
            lastLoginAt: vendor.lastLoginAt,
            totalOrders,
            totalRevenue,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            productCount: vendor.products.length,
            activeProducts,
            salesWindowCount: 0, // Would need additional query
            activeSalesWindows: 0 // Would need additional query
          };
        })
        .filter((vendor: VendorProfile) => {
          if (hasActiveProducts !== undefined) {
            return hasActiveProducts ? vendor.activeProducts > 0 : vendor.activeProducts === 0;
          }
          return true;
        });

      // Apply additional sorting for computed fields
      if (sortBy === 'revenue' || sortBy === 'orders') {
        transformedVendors.sort((a, b) => {
          const aValue = sortBy === 'revenue' ? a.totalRevenue : a.totalOrders;
          const bValue = sortBy === 'revenue' ? b.totalRevenue : b.totalOrders;
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
      }

      return {
        vendors: transformedVendors,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Failed to search vendors:', error);
      return {
        vendors: [],
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0
      };
    }
  }

  // Get vendor analytics
  async getVendorAnalytics(): Promise<VendorAnalytics> {
    try {
      // Get basic counts
      const [totalVendors, activeVendors, newVendorsThisMonth] = await Promise.all([
        (prisma as any).vendorProfile.count(),
        (prisma as any).vendorProfile.count({ where: { isActive: true } }),
        (prisma as any).vendorProfile.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      ]);

      // Get top vendors by revenue (mock data for now)
      const topVendorsByRevenue = [
        { id: 'vendor-1', businessName: 'Artisan Bakery Co.', revenue: 45000, orderCount: 125 },
        { id: 'vendor-2', businessName: 'Farm Fresh Produce', revenue: 38000, orderCount: 89 },
        { id: 'vendor-3', businessName: 'Craft Coffee Roasters', revenue: 32000, orderCount: 156 },
        { id: 'vendor-4', businessName: 'Local Honey Co.', revenue: 28000, orderCount: 67 },
        { id: 'vendor-5', businessName: 'Organic Garden', revenue: 25000, orderCount: 93 }
      ];

      // Mock distribution data
      const vendorDistribution = {
        byLocation: [
          { location: 'California', count: 45 },
          { location: 'Texas', count: 32 },
          { location: 'New York', count: 28 },
          { location: 'Florida', count: 23 },
          { location: 'Other', count: 72 }
        ],
        byRating: [
          { rating: '4.5+ Stars', count: 156 },
          { rating: '4.0-4.5 Stars', count: 89 },
          { rating: '3.5-4.0 Stars', count: 45 },
          { rating: 'Below 3.5', count: 10 }
        ],
        byActivity: [
          { status: 'Active', count: activeVendors },
          { status: 'Inactive', count: totalVendors - activeVendors }
        ]
      };

      // Mock growth metrics
      const growthMetrics = {
        monthlyGrowth: 12.5,
        retentionRate: 85.3,
        churnRate: 8.2
      };

      return {
        totalVendors,
        activeVendors,
        newVendorsThisMonth,
        topVendorsByRevenue,
        vendorDistribution,
        growthMetrics
      };
    } catch (error) {
      logger.error('Failed to get vendor analytics:', error);
      return {
        totalVendors: 0,
        activeVendors: 0,
        newVendorsThisMonth: 0,
        topVendorsByRevenue: [],
        vendorDistribution: {
          byLocation: [],
          byRating: [],
          byActivity: []
        },
        growthMetrics: {
          monthlyGrowth: 0,
          retentionRate: 0,
          churnRate: 0
        }
      };
    }
  }

  // Create vendor segment
  async createVendorSegment(data: {
    name: string;
    description: string;
    criteria: VendorCriteria;
  }): Promise<VendorSegment> {
    try {
      const segment = await (prisma as any).vendorSegment.create({
        data: {
          name: data.name,
          description: data.description,
          criteria: JSON.stringify(data.criteria),
          vendorCount: 0, // Will be calculated
          isActive: true
        }
      });

      // Calculate initial vendor count
      const vendorCount = await this.getSegmentVendorCount(segment.id);
      await (prisma as any).vendorSegment.update({
        where: { id: segment.id },
        data: { vendorCount }
      });

      return {
        ...segment,
        criteria: JSON.parse(segment.criteria)
      };
    } catch (error) {
      logger.error('Failed to create vendor segment:', error);
      throw error;
    }
  }

  // Get vendor segments
  async getVendorSegments(): Promise<VendorSegment[]> {
    try {
      const segments = await (prisma as any).vendorSegment.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return segments.map((segment: any) => ({
        ...segment,
        criteria: JSON.parse(segment.criteria)
      }));
    } catch (error) {
      logger.error('Failed to get vendor segments:', error);
      return [];
    }
  }

  // Get vendors in segment
  async getSegmentVendors(segmentId: string): Promise<VendorProfile[]> {
    try {
      const segment = await (prisma as any).vendorSegment.findUnique({
        where: { id: segmentId }
      });

      if (!segment) return [];

      const criteria = JSON.parse(segment.criteria);
      const searchResult = await this.searchVendors(criteria);
      return searchResult.vendors;
    } catch (error) {
      logger.error(`Failed to get vendors for segment ${segmentId}:`, error);
      return [];
    }
  }

  // Get segment vendor count
  async getSegmentVendorCount(segmentId: string): Promise<number> {
    try {
      const vendors = await this.getSegmentVendors(segmentId);
      return vendors.length;
    } catch (error) {
      logger.error(`Failed to get vendor count for segment ${segmentId}:`, error);
      return 0;
    }
  }

  // Update vendor segment
  async updateVendorSegment(segmentId: string, data: {
    name?: string;
    description?: string;
    criteria?: VendorCriteria;
    isActive?: boolean;
  }): Promise<VendorSegment> {
    try {
      const updateData: any = { ...data };
      if (data.criteria) {
        updateData.criteria = JSON.stringify(data.criteria);
      }

      const segment = await (prisma as any).vendorSegment.update({
        where: { id: segmentId },
        data: updateData
      });

      // Recalculate vendor count if criteria changed
      if (data.criteria) {
        const vendorCount = await this.getSegmentVendorCount(segmentId);
        await (prisma as any).vendorSegment.update({
          where: { id: segmentId },
          data: { vendorCount }
        });
      }

      return {
        ...segment,
        criteria: JSON.parse(segment.criteria)
      };
    } catch (error) {
      logger.error(`Failed to update vendor segment ${segmentId}:`, error);
      throw error;
    }
  }

  // Delete vendor segment
  async deleteVendorSegment(segmentId: string): Promise<boolean> {
    try {
      await (prisma as any).vendorSegment.delete({
        where: { id: segmentId }
      });
      return true;
    } catch (error) {
      logger.error(`Failed to delete vendor segment ${segmentId}:`, error);
      return false;
    }
  }

  // Broadcast message to vendor segment
  async broadcastToSegment(segmentId: string, message: {
    scope: string;
    type: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<{ success: boolean; vendorCount: number }> {
    try {
      const vendors = await this.getSegmentVendors(segmentId);
      
      // Create system messages for each vendor
      const messagePromises = vendors.map(vendor => 
        (prisma as any).systemMessage.create({
          data: {
            vendorProfileId: vendor.id,
            scope: message.scope,
            type: message.type,
            title: message.title,
            body: message.body,
            data: message.data ? JSON.stringify(message.data) : null
          }
        })
      );

      await Promise.all(messagePromises);

      logger.info(`Broadcast message to ${vendors.length} vendors in segment ${segmentId}`);
      
      return {
        success: true,
        vendorCount: vendors.length
      };
    } catch (error) {
      logger.error(`Failed to broadcast to segment ${segmentId}:`, error);
      return {
        success: false,
        vendorCount: 0
      };
    }
  }
}

// Export singleton instance
export const vendorManagementService = VendorManagementService.getInstance();

























