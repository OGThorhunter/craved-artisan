import { PrismaClient, LabelProfile, Order, OrderItem, Product, ProductVariant } from '@prisma/client';
import { logger } from '../../logger';

export interface OrderWithItems extends Order {
  orderItems: (OrderItem & {
    product: Product & {
      variants: ProductVariant[];
      labelProfile?: LabelProfile;
    };
    variant?: ProductVariant & {
      labelProfile?: LabelProfile;
    };
  })[];
}

export interface LabelResolutionResult {
  orderId: string;
  items: ResolvedLabelItem[];
  summary: {
    totalLabels: number;
    uniqueProfiles: number;
    profileBreakdown: Record<string, number>;
  };
}

export interface ResolvedLabelItem {
  orderItemId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  labelProfile: LabelProfile;
  labelData: {
    text: string;
    barcode?: string;
    qrCode?: string;
    customFields: Record<string, any>;
  };
  resolutionSource: 'order_override' | 'variant' | 'product' | 'system_default';
  labelsPerItem: number;
}

export interface LabelResolutionOptions {
  includeShippingLabels?: boolean;
  customLabelsPerItem?: Record<string, number>; // orderItemId -> label count
  overrideLabelProfiles?: Record<string, string>; // orderItemId -> labelProfileId
  groupByProfile?: boolean;
}

export class OrderLabelResolver {
  private prisma: PrismaClient;
  private systemDefaultProfile?: LabelProfile;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Resolve label requirements for multiple orders
   */
  async resolveOrdersLabels(
    orderIds: string[], 
    options: LabelResolutionOptions = {}
  ): Promise<LabelResolutionResult[]> {
    logger.info('Starting label resolution for orders', { 
      orderCount: orderIds.length,
      options 
    });

    try {
      // Load system default profile
      await this.loadSystemDefaultProfile();

      // Fetch orders with full relationship data
      const orders = await this.fetchOrdersWithRelations(orderIds);
      
      // Resolve labels for each order
      const results: LabelResolutionResult[] = [];
      
      for (const order of orders) {
        const result = await this.resolveOrderLabels(order, options);
        results.push(result);
      }

      logger.info('Label resolution completed', {
        orderCount: results.length,
        totalLabels: results.reduce((sum, r) => sum + r.summary.totalLabels, 0)
      });

      return results;

    } catch (error) {
      logger.error('Label resolution failed', { error: error.message });
      throw new Error(`Label resolution failed: ${error.message}`);
    }
  }

  /**
   * Resolve label requirements for a single order
   */
  async resolveOrderLabels(
    order: OrderWithItems, 
    options: LabelResolutionOptions = {}
  ): Promise<LabelResolutionResult> {
    const resolvedItems: ResolvedLabelItem[] = [];
    const profileCounts: Record<string, number> = {};

    // Process each order item
    for (const orderItem of order.orderItems) {
      const resolved = await this.resolveOrderItemLabels(orderItem, options);
      
      for (const item of resolved) {
        resolvedItems.push(item);
        
        // Count profile usage
        const profileId = item.labelProfile.id;
        profileCounts[profileId] = (profileCounts[profileId] || 0) + item.labelsPerItem;
      }
    }

    // Add shipping labels if requested
    if (options.includeShippingLabels) {
      const shippingLabels = await this.resolveShippingLabels(order);
      resolvedItems.push(...shippingLabels);
      
      // Update profile counts for shipping labels
      for (const shippingLabel of shippingLabels) {
        const profileId = shippingLabel.labelProfile.id;
        profileCounts[profileId] = (profileCounts[profileId] || 0) + shippingLabel.labelsPerItem;
      }
    }

    return {
      orderId: order.id,
      items: resolvedItems,
      summary: {
        totalLabels: resolvedItems.reduce((sum, item) => sum + item.labelsPerItem, 0),
        uniqueProfiles: Object.keys(profileCounts).length,
        profileBreakdown: profileCounts
      }
    };
  }

  /**
   * Resolve labels for a single order item using hierarchy
   */
  private async resolveOrderItemLabels(
    orderItem: OrderWithItems['orderItems'][0],
    options: LabelResolutionOptions
  ): Promise<ResolvedLabelItem[]> {
    const results: ResolvedLabelItem[] = [];
    
    // Determine number of labels per item
    const labelsPerItem = options.customLabelsPerItem?.[orderItem.id] || 1;
    
    // Resolve label profile using hierarchy
    const { profile, source } = this.resolveLabelProfileHierarchy(orderItem, options);
    
    if (!profile) {
      logger.warn('No label profile found for order item', {
        orderItemId: orderItem.id,
        productId: orderItem.product.id
      });
      return results;
    }

    // Generate label data
    const labelData = this.generateLabelData(orderItem, profile);
    
    results.push({
      orderItemId: orderItem.id,
      productId: orderItem.product.id,
      variantId: orderItem.variant?.id,
      quantity: orderItem.quantity,
      labelProfile: profile,
      labelData,
      resolutionSource: source,
      labelsPerItem
    });

    return results;
  }

  /**
   * Resolve label profile using 4-level hierarchy
   */
  private resolveLabelProfileHierarchy(
    orderItem: OrderWithItems['orderItems'][0],
    options: LabelResolutionOptions
  ): { profile?: LabelProfile; source: ResolvedLabelItem['resolutionSource'] } {
    // Level 1: Order-level override (highest priority)
    const orderOverride = options.overrideLabelProfiles?.[orderItem.id];
    if (orderOverride) {
      // Note: In a full implementation, we'd fetch this profile from database
      logger.debug('Using order-level label profile override', {
        orderItemId: orderItem.id,
        profileId: orderOverride
      });
      // For now, return undefined since we need to fetch from DB
      // return { profile: fetchedProfile, source: 'order_override' };
    }

    // Level 2: Variant-specific profile  
    if (orderItem.variant?.labelProfile) {
      logger.debug('Using variant label profile', {
        orderItemId: orderItem.id,
        variantId: orderItem.variant.id,
        profileId: orderItem.variant.labelProfile.id
      });
      return { 
        profile: orderItem.variant.labelProfile, 
        source: 'variant' 
      };
    }

    // Level 3: Product-level profile
    if (orderItem.product.labelProfile) {
      logger.debug('Using product label profile', {
        orderItemId: orderItem.id,
        productId: orderItem.product.id,
        profileId: orderItem.product.labelProfile.id
      });
      return { 
        profile: orderItem.product.labelProfile, 
        source: 'product' 
      };
    }

    // Level 4: System default profile (lowest priority)
    if (this.systemDefaultProfile) {
      logger.debug('Using system default label profile', {
        orderItemId: orderItem.id,
        profileId: this.systemDefaultProfile.id
      });
      return { 
        profile: this.systemDefaultProfile, 
        source: 'system_default' 
      };
    }

    // No profile found
    return { profile: undefined, source: 'system_default' };
  }

  /**
   * Generate label data from order item and product information
   */
  private generateLabelData(
    orderItem: OrderWithItems['orderItems'][0],
    profile: LabelProfile
  ): ResolvedLabelItem['labelData'] {
    const product = orderItem.product;
    const variant = orderItem.variant;

    // Build primary text
    let primaryText = product.name;
    if (variant) {
      primaryText += ` - ${variant.name || variant.sku}`;
    }

    // Generate barcode (use SKU or product ID)
    const barcode = variant?.sku || product.sku || product.id;

    // Generate QR code data (could be product URL, detailed info, etc.)
    const qrCode = JSON.stringify({
      productId: product.id,
      variantId: variant?.id,
      orderItemId: orderItem.id,
      sku: barcode
    });

    // Build custom fields from product and order data
    const customFields: Record<string, any> = {
      productName: product.name,
      productSku: product.sku,
      productPrice: product.price,
      orderItemId: orderItem.id,
      quantity: orderItem.quantity,
      totalPrice: product.price * orderItem.quantity,
      category: product.category?.name || 'Uncategorized'
    };

    // Add variant-specific fields
    if (variant) {
      customFields.variantName = variant.name;
      customFields.variantSku = variant.sku;
      customFields.variantPrice = variant.price;
    }

    // Add date/time fields
    customFields.printDate = new Date().toLocaleDateString();
    customFields.printTime = new Date().toLocaleTimeString();

    return {
      text: primaryText,
      barcode,
      qrCode,
      customFields
    };
  }

  /**
   * Resolve shipping labels for an order
   */
  private async resolveShippingLabels(order: OrderWithItems): Promise<ResolvedLabelItem[]> {
    const shippingLabels: ResolvedLabelItem[] = [];

    // Find shipping label profile
    const shippingProfile = await this.findShippingLabelProfile();
    
    if (!shippingProfile) {
      logger.warn('No shipping label profile found', { orderId: order.id });
      return shippingLabels;
    }

    // Generate shipping label data
    const shippingLabelData = {
      text: `Order #${order.orderNumber}`,
      barcode: order.orderNumber,
      qrCode: JSON.stringify({
        orderId: order.id,
        orderNumber: order.orderNumber,
        type: 'shipping'
      }),
      customFields: {
        orderNumber: order.orderNumber,
        customerName: order.customerName || 'Unknown Customer',
        customerEmail: order.customerEmail || '',
        totalAmount: order.total,
        itemCount: order.orderItems.length,
        shippingAddress: order.shippingAddress || '',
        orderDate: order.createdAt.toLocaleDateString(),
        expectedDelivery: order.expectedAt?.toLocaleDateString() || 'TBD'
      }
    };

    shippingLabels.push({
      orderItemId: `shipping-${order.id}`,
      productId: 'shipping-label',
      quantity: 1,
      labelProfile: shippingProfile,
      labelData: shippingLabelData,
      resolutionSource: 'system_default',
      labelsPerItem: 1
    });

    return shippingLabels;
  }

  /**
   * Fetch orders with all necessary relations
   */
  private async fetchOrdersWithRelations(orderIds: string[]): Promise<OrderWithItems[]> {
    return this.prisma.order.findMany({
      where: {
        id: { in: orderIds }
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
                labelProfile: true,
                variants: {
                  include: {
                    labelProfile: true
                  }
                }
              }
            }
          }
        },
        shippingAddress: true
      }
    }) as Promise<OrderWithItems[]>;
  }

  /**
   * Load system default label profile
   */
  private async loadSystemDefaultProfile(): Promise<void> {
    try {
      this.systemDefaultProfile = await this.prisma.labelProfile.findFirst({
        where: {
          isSystemDefault: true,
          isActive: true
        }
      }) || undefined;

      if (!this.systemDefaultProfile) {
        logger.warn('No system default label profile found');
      }
    } catch (error) {
      logger.error('Failed to load system default label profile', { error: error.message });
    }
  }

  /**
   * Find shipping label profile
   */
  private async findShippingLabelProfile(): Promise<LabelProfile | null> {
    try {
      return await this.prisma.labelProfile.findFirst({
        where: {
          name: { contains: 'shipping', mode: 'insensitive' },
          isActive: true
        }
      });
    } catch (error) {
      logger.error('Failed to find shipping label profile', { error: error.message });
      return null;
    }
  }

  /**
   * Validate label resolution configuration
   */
  static validateResolutionOptions(options: LabelResolutionOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate custom labels per item
    if (options.customLabelsPerItem) {
      for (const [orderItemId, labelCount] of Object.entries(options.customLabelsPerItem)) {
        if (labelCount <= 0 || labelCount > 100) {
          errors.push(`Invalid label count for item ${orderItemId}: must be between 1 and 100`);
        }
      }
    }

    // Validate override label profiles
    if (options.overrideLabelProfiles) {
      for (const [orderItemId, profileId] of Object.entries(options.overrideLabelProfiles)) {
        if (!profileId || typeof profileId !== 'string') {
          errors.push(`Invalid label profile ID for item ${orderItemId}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get resolution statistics for analysis
   */
  static analyzeResolutionResults(results: LabelResolutionResult[]): {
    totalOrders: number;
    totalLabels: number;
    averageLabelsPerOrder: number;
    profileUsage: Record<string, { count: number; percentage: number }>;
    resolutionSourceBreakdown: Record<string, number>;
  } {
    const totalOrders = results.length;
    const totalLabels = results.reduce((sum, r) => sum + r.summary.totalLabels, 0);
    
    // Profile usage statistics
    const profileUsage: Record<string, number> = {};
    const sourceBreakdown: Record<string, number> = {};
    
    for (const result of results) {
      for (const item of result.items) {
        // Count profile usage
        const profileName = item.labelProfile.name;
        profileUsage[profileName] = (profileUsage[profileName] || 0) + item.labelsPerItem;
        
        // Count resolution source
        sourceBreakdown[item.resolutionSource] = (sourceBreakdown[item.resolutionSource] || 0) + 1;
      }
    }

    // Convert counts to percentages for profile usage
    const profileUsageStats: Record<string, { count: number; percentage: number }> = {};
    for (const [profile, count] of Object.entries(profileUsage)) {
      profileUsageStats[profile] = {
        count,
        percentage: (count / totalLabels) * 100
      };
    }

    return {
      totalOrders,
      totalLabels,
      averageLabelsPerOrder: totalLabels / totalOrders,
      profileUsage: profileUsageStats,
      resolutionSourceBreakdown: sourceBreakdown
    };
  }
}
