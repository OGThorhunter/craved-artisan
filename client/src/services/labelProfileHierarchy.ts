/**
 * Label Profile Inheritance Hierarchy System
 * 
 * Priority Order (highest to lowest):
 * 1. Order Override (order line item specific)
 * 2. Variant Override (product variant specific)
 * 3. Product Default (product specific)
 * 4. System Default (global fallback)
 */

import type { ProductVariant, Product } from '../types/products';

export interface LabelProfileReference {
  id: string;
  name: string;
  description?: string;
  engine: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
  source: 'system' | 'product' | 'variant' | 'order';
}

export interface SystemSettings {
  defaultLabelProfileId?: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  labelProfileId?: string; // Order-level override
}

export interface LabelProfileResolution {
  profileId: string | null;
  profile?: LabelProfileReference;
  source: 'system' | 'product' | 'variant' | 'order' | 'none';
  hierarchy: Array<{
    level: 'system' | 'product' | 'variant' | 'order';
    profileId: string | null;
    isActive: boolean;
  }>;
  fallbackChain: string[];
}

class LabelProfileHierarchyService {
  private systemSettings: SystemSettings = {};
  private labelProfiles: Map<string, LabelProfileReference> = new Map();

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    // Mock system settings
    this.systemSettings = {
      defaultLabelProfileId: 'system-default-1'
    };

    // Mock label profiles
    const mockProfiles: LabelProfileReference[] = [
      {
        id: 'system-default-1',
        name: 'System Default Label',
        description: 'Default label profile for all products',
        engine: 'PDF',
        source: 'system'
      },
      {
        id: 'product-1',
        name: '2×1 Product Label',
        description: 'Standard product label',
        engine: 'ZPL',
        source: 'product'
      },
      {
        id: 'variant-1',
        name: '1×1 Barcode Label',
        description: 'Small barcode for variants',
        engine: 'ZPL',
        source: 'variant'
      },
      {
        id: 'order-1',
        name: '4×6 Shipping Label',
        description: 'Custom shipping label for this order',
        engine: 'ZPL',
        source: 'order'
      }
    ];

    mockProfiles.forEach(profile => {
      this.labelProfiles.set(profile.id, profile);
    });
  }

  /**
   * Resolve the label profile for a given context using the hierarchy
   */
  public resolveLabelProfile(
    product?: Product,
    variant?: ProductVariant,
    orderLineItem?: OrderLineItem
  ): LabelProfileResolution {
    const hierarchy = this.buildHierarchy(product, variant, orderLineItem);
    
    // Find the first non-null profile ID in hierarchy order
    let activeProfileId: string | null = null;
    let source: LabelProfileResolution['source'] = 'none';

    // Check in priority order
    const orderLevel = hierarchy.find(h => h.level === 'order');
    const variantLevel = hierarchy.find(h => h.level === 'variant');
    const productLevel = hierarchy.find(h => h.level === 'product');
    const systemLevel = hierarchy.find(h => h.level === 'system');

    if (orderLevel?.profileId) {
      activeProfileId = orderLevel.profileId;
      source = 'order';
    } else if (variantLevel?.profileId) {
      activeProfileId = variantLevel.profileId;
      source = 'variant';
    } else if (productLevel?.profileId) {
      activeProfileId = productLevel.profileId;
      source = 'product';
    } else if (systemLevel?.profileId) {
      activeProfileId = systemLevel.profileId;
      source = 'system';
    }

    // Mark which level is active
    const updatedHierarchy = hierarchy.map(level => ({
      ...level,
      isActive: level.profileId === activeProfileId
    }));

    // Build fallback chain
    const fallbackChain = hierarchy
      .filter(h => h.profileId)
      .map(h => h.profileId!);

    // Get the resolved profile
    const profile = activeProfileId ? this.labelProfiles.get(activeProfileId) : undefined;

    return {
      profileId: activeProfileId,
      profile,
      source,
      hierarchy: updatedHierarchy,
      fallbackChain
    };
  }

  /**
   * Build the complete hierarchy with all levels
   */
  private buildHierarchy(
    product?: Product,
    variant?: ProductVariant,
    orderLineItem?: OrderLineItem
  ): LabelProfileResolution['hierarchy'] {
    return [
      {
        level: 'order',
        profileId: orderLineItem?.labelProfileId || null,
        isActive: false
      },
      {
        level: 'variant',
        profileId: variant?.labelProfileId || null,
        isActive: false
      },
      {
        level: 'product',
        profileId: product?.labelProfileId || null,
        isActive: false
      },
      {
        level: 'system',
        profileId: this.systemSettings.defaultLabelProfileId || null,
        isActive: false
      }
    ];
  }

  /**
   * Get inheritance explanation for UI display
   */
  public getInheritanceExplanation(resolution: LabelProfileResolution): string {
    switch (resolution.source) {
      case 'order':
        return 'Using order-specific label profile (highest priority)';
      case 'variant':
        return 'Using variant-specific label profile';
      case 'product':
        return 'Using product default label profile';
      case 'system':
        return 'Using system default label profile';
      case 'none':
        return 'No label profile configured (system will use built-in default)';
      default:
        return 'Unknown label profile source';
    }
  }

  /**
   * Check if a profile can be overridden at a given level
   */
  public canOverrideAt(
    level: 'product' | 'variant' | 'order',
    product?: Product,
    variant?: ProductVariant
  ): boolean {
    switch (level) {
      case 'product':
        return true; // Products can always override system default
      case 'variant':
        return !!product && !!variant; // Need both product and variant
      case 'order':
        return true; // Orders can override anything
      default:
        return false;
    }
  }

  /**
   * Get available profiles for a given level
   */
  public getAvailableProfilesForLevel(level: 'system' | 'product' | 'variant' | 'order'): LabelProfileReference[] {
    return Array.from(this.labelProfiles.values()).filter(profile => {
      switch (level) {
        case 'system':
          return profile.source === 'system';
        case 'product':
          return ['system', 'product'].includes(profile.source);
        case 'variant':
          return ['system', 'product', 'variant'].includes(profile.source);
        case 'order':
          return true; // Orders can use any profile
        default:
          return false;
      }
    });
  }

  /**
   * Simulate setting system default
   */
  public setSystemDefault(profileId: string | null): void {
    this.systemSettings.defaultLabelProfileId = profileId || undefined;
  }

  /**
   * Get current system settings
   */
  public getSystemSettings(): SystemSettings {
    return { ...this.systemSettings };
  }

  /**
   * Add or update a label profile
   */
  public addProfile(profile: LabelProfileReference): void {
    this.labelProfiles.set(profile.id, profile);
  }

  /**
   * Get all available profiles
   */
  public getAllProfiles(): LabelProfileReference[] {
    return Array.from(this.labelProfiles.values());
  }

  /**
   * Validate hierarchy integrity
   */
  public validateHierarchy(): Array<{ level: string; issue: string }> {
    const issues: Array<{ level: string; issue: string }> = [];

    // Check if system default exists
    if (!this.systemSettings.defaultLabelProfileId) {
      issues.push({
        level: 'system',
        issue: 'No system default label profile configured'
      });
    } else if (!this.labelProfiles.has(this.systemSettings.defaultLabelProfileId)) {
      issues.push({
        level: 'system',
        issue: 'System default label profile not found'
      });
    }

    // Additional validation can be added here

    return issues;
  }
}

// Export singleton instance
export const labelProfileHierarchy = new LabelProfileHierarchyService();

// Export utility functions
export const resolveLabelProfile = (
  product?: Product,
  variant?: ProductVariant,
  orderLineItem?: OrderLineItem
): LabelProfileResolution => {
  return labelProfileHierarchy.resolveLabelProfile(product, variant, orderLineItem);
};

export const getInheritanceExplanation = (resolution: LabelProfileResolution): string => {
  return labelProfileHierarchy.getInheritanceExplanation(resolution);
};

export const validateLabelHierarchy = (): Array<{ level: string; issue: string }> => {
  return labelProfileHierarchy.validateHierarchy();
};
