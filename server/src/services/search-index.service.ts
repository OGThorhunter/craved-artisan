import { prisma } from '../db';
import { logger } from '../logger';

export interface SearchIndexStats {
  totalDocuments: number;
  productCount: number;
  vendorCount: number;
  lastBuildTime: Date | null;
  indexHealth: 'OK' | 'WARN' | 'CRIT';
}

class SearchIndexService {
  /**
   * Get search index statistics
   */
  async getIndexStats(): Promise<SearchIndexStats> {
    try {
      const [productCount, vendorCount] = await Promise.all([
        prisma.product.count({ where: { active: true } }),
        prisma.vendorProfile.count()
      ]);

      const totalDocuments = productCount + vendorCount;

      // TODO: Get actual last build time from search index metadata
      const lastBuildTime = new Date(); // Placeholder

      const indexHealth = totalDocuments > 0 ? 'OK' : 'WARN';

      return {
        totalDocuments,
        productCount,
        vendorCount,
        lastBuildTime,
        indexHealth
      };
    } catch (error) {
      logger.error('Failed to get search index stats:', error);
      throw error;
    }
  }

  /**
   * Trigger full search index rebuild
   */
  async rebuildIndex(): Promise<{ success: boolean; message: string; documentsIndexed: number }> {
    const start = Date.now();

    try {
      logger.info('Starting full search index rebuild');

      // Get all active products and vendors
      const [products, vendors] = await Promise.all([
        prisma.product.findMany({
          where: { active: true },
          include: {
            vendor: true,
            category: true
          }
        }),
        prisma.vendorProfile.findMany({
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        })
      ]);

      // TODO: Implement actual search index building
      // For now, just update searchVec fields
      let indexed = 0;

      for (const product of products) {
        const searchText = [
          product.name,
          product.description || '',
          product.tags || '',
          product.vendor.storeName
        ].join(' ').toLowerCase();

        await prisma.product.update({
          where: { id: product.id },
          data: {
            searchVec: searchText
          }
        });

        indexed++;
      }

      for (const vendor of vendors) {
        // Mock search vector update
        indexed++;
      }

      const duration = Date.now() - start;

      logger.info({ indexed, duration }, 'Search index rebuild completed');

      return {
        success: true,
        message: `Indexed ${indexed} documents in ${duration}ms`,
        documentsIndexed: indexed
      };
    } catch (error) {
      logger.error('Failed to rebuild search index:', error);
      return {
        success: false,
        message: String(error),
        documentsIndexed: 0
      };
    }
  }

  /**
   * Trigger partial index refresh (new/updated documents only)
   */
  async refreshIndex(since?: Date): Promise<{ success: boolean; message: string; documentsRefreshed: number }> {
    const start = Date.now();

    try {
      const sinceDate = since || new Date(Date.now() - 60 * 60 * 1000); // Last hour by default

      logger.info({ since: sinceDate }, 'Starting partial search index refresh');

      // Get recently updated products and vendors
      const [products, vendors] = await Promise.all([
        prisma.product.findMany({
          where: {
            active: true,
            updatedAt: { gte: sinceDate }
          },
          include: {
            vendor: true
          }
        }),
        prisma.vendorProfile.findMany({
          where: {
            updatedAt: { gte: sinceDate }
          }
        })
      ]);

      // TODO: Implement actual partial index update
      let refreshed = 0;

      for (const product of products) {
        const searchText = [
          product.name,
          product.description || '',
          product.tags || '',
          product.vendor.storeName
        ].join(' ').toLowerCase();

        await prisma.product.update({
          where: { id: product.id },
          data: {
            searchVec: searchText
          }
        });

        refreshed++;
      }

      refreshed += vendors.length;

      const duration = Date.now() - start;

      logger.info({ refreshed, duration }, 'Search index refresh completed');

      return {
        success: true,
        message: `Refreshed ${refreshed} documents in ${duration}ms`,
        documentsRefreshed: refreshed
      };
    } catch (error) {
      logger.error('Failed to refresh search index:', error);
      return {
        success: false,
        message: String(error),
        documentsRefreshed: 0
      };
    }
  }

  /**
   * Monitor search index health
   */
  async monitorHealth(): Promise<{
    status: 'OK' | 'WARN' | 'CRIT';
    issues: string[];
  }> {
    try {
      const issues: string[] = [];
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';

      // Check if products have search vectors
      const productsWithoutVec = await prisma.product.count({
        where: {
          active: true,
          searchVec: null
        }
      });

      if (productsWithoutVec > 0) {
        issues.push(`${productsWithoutVec} products missing search vectors`);
        status = 'WARN';
      }

      // Check index freshness
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentUpdates = await prisma.product.count({
        where: {
          active: true,
          updatedAt: { gte: oneHourAgo }
        }
      });

      if (recentUpdates > 100) {
        issues.push(`${recentUpdates} products updated recently - consider index refresh`);
        status = 'WARN';
      }

      return {
        status,
        issues
      };
    } catch (error) {
      logger.error('Failed to monitor search index health:', error);
      return {
        status: 'CRIT',
        issues: ['Failed to check index health']
      };
    }
  }
}

export const searchIndexService = new SearchIndexService();

