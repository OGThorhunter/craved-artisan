import type { Product } from '../types/products';

export interface BulkUpdateRequest {
  productId: string;
  labelProfileId: string | undefined;
}

export interface BulkUpdateResult {
  success: boolean;
  updatedCount: number;
  errors: Array<{
    productId: string;
    productName: string;
    error: string;
  }>;
}

class BulkLabelProfileService {
  /**
   * Execute bulk label profile updates
   */
  async executeBulkUpdate(updates: BulkUpdateRequest[]): Promise<BulkUpdateResult> {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock implementation - in real app, this would be API calls
      const result: BulkUpdateResult = {
        success: true,
        updatedCount: updates.length,
        errors: []
      };

      // Simulate some failures for demonstration
      const failureRate = 0.05; // 5% failure rate
      updates.forEach((update, index) => {
        if (Math.random() < failureRate) {
          result.errors.push({
            productId: update.productId,
            productName: `Product ${index + 1}`,
            error: 'Network timeout - please retry'
          });
          result.updatedCount--;
        }
      });

      result.success = result.errors.length === 0;

      console.log(`Bulk update completed: ${result.updatedCount} updated, ${result.errors.length} failed`);
      
      return result;
    } catch (error) {
      console.error('Bulk update failed:', error);
      
      return {
        success: false,
        updatedCount: 0,
        errors: [{
          productId: 'bulk',
          productName: 'Bulk Update',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }]
      };
    }
  }

  /**
   * Validate bulk update request
   */
  validateBulkUpdate(updates: BulkUpdateRequest[]): Array<{ productId: string; issue: string }> {
    const issues: Array<{ productId: string; issue: string }> = [];

    if (updates.length === 0) {
      issues.push({
        productId: 'bulk',
        issue: 'No products selected for update'
      });
    }

    if (updates.length > 100) {
      issues.push({
        productId: 'bulk',
        issue: 'Too many products selected (maximum 100 per batch)'
      });
    }

    // Check for duplicate product IDs
    const productIds = new Set<string>();
    updates.forEach(update => {
      if (productIds.has(update.productId)) {
        issues.push({
          productId: update.productId,
          issue: 'Duplicate product in update batch'
        });
      }
      productIds.add(update.productId);
    });

    return issues;
  }

  /**
   * Get bulk update statistics
   */
  getBulkUpdateStats(products: Product[]): {
    totalProducts: number;
    withLabelProfiles: number;
    withoutLabelProfiles: number;
    byCategory: Record<string, number>;
  } {
    const stats = {
      totalProducts: products.length,
      withLabelProfiles: 0,
      withoutLabelProfiles: 0,
      byCategory: {} as Record<string, number>
    };

    products.forEach(product => {
      if (product.labelProfileId) {
        stats.withLabelProfiles++;
      } else {
        stats.withoutLabelProfiles++;
      }

      const category = product.category || 'Uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Generate bulk update recommendations
   */
  getBulkUpdateRecommendations(products: Product[]): Array<{
    type: 'suggestion' | 'warning' | 'info';
    title: string;
    description: string;
    affectedCount: number;
  }> {
    const recommendations = [];
    const stats = this.getBulkUpdateStats(products);

    // Recommendation: Products without label profiles
    if (stats.withoutLabelProfiles > 0) {
      recommendations.push({
        type: 'suggestion' as const,
        title: 'Assign Label Profiles',
        description: 'Some products don\'t have label profiles assigned. Consider setting a default profile for consistent labeling.',
        affectedCount: stats.withoutLabelProfiles
      });
    }

    // Recommendation: Category-based assignment
    const largestCategory = Object.entries(stats.byCategory)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (largestCategory && largestCategory[1] > 5) {
      recommendations.push({
        type: 'info' as const,
        title: 'Category-based Assignment',
        description: `You have ${largestCategory[1]} products in "${largestCategory[0]}". Consider using category-based bulk assignment.`,
        affectedCount: largestCategory[1]
      });
    }

    // Warning: Too many products
    if (stats.totalProducts > 50) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Large Product Count',
        description: 'You have many products. Consider updating in smaller batches for better performance.',
        affectedCount: stats.totalProducts
      });
    }

    return recommendations;
  }
}

// Export singleton instance
export const bulkLabelProfileService = new BulkLabelProfileService();

// Export convenience functions
export const executeBulkLabelUpdate = (updates: BulkUpdateRequest[]): Promise<BulkUpdateResult> => {
  return bulkLabelProfileService.executeBulkUpdate(updates);
};

export const validateBulkLabelUpdate = (updates: BulkUpdateRequest[]): Array<{ productId: string; issue: string }> => {
  return bulkLabelProfileService.validateBulkUpdate(updates);
};

export const getBulkLabelUpdateStats = (products: Product[]) => {
  return bulkLabelProfileService.getBulkUpdateStats(products);
};

export const getBulkLabelUpdateRecommendations = (products: Product[]) => {
  return bulkLabelProfileService.getBulkUpdateRecommendations(products);
};
