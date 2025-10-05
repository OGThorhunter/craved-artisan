import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LabelSuggestion {
  id: string;
  type: 'order_item' | 'batch' | 'inventory' | 'shelf_life';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  orderId?: string;
  orderItemId?: string;
  productId?: string;
  labelProfileId: string;
  templateId: string;
  copies: number;
  tokens: Record<string, any>;
  reason: string;
  missingFields?: string[];
}

export class LabelSuggestor {
  private vendorId: string;

  constructor(vendorId: string) {
    this.vendorId = vendorId;
  }

  async getSuggestions(): Promise<LabelSuggestion[]> {
    const suggestions: LabelSuggestion[] = [];

    // Get today's orders that need labels
    const orderSuggestions = await this.getOrderItemSuggestions();
    suggestions.push(...orderSuggestions);

    // Get batch suggestions
    const batchSuggestions = await this.getBatchSuggestions();
    suggestions.push(...batchSuggestions);

    // Get inventory suggestions
    const inventorySuggestions = await this.getInventorySuggestions();
    suggestions.push(...inventorySuggestions);

    // Get shelf-life suggestions
    const shelfLifeSuggestions = await this.getShelfLifeSuggestions();
    suggestions.push(...shelfLifeSuggestions);

    return suggestions.sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a));
  }

  private async getOrderItemSuggestions(): Promise<LabelSuggestion[]> {
    const suggestions: LabelSuggestion[] = [];

    // Get orders in production or ready status
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PAID'], // Assuming PAID means in production
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    for (const order of orders) {
      for (const orderItem of order.orderItems) {
        // Check if order item already has labels
        const existingLabels = await prisma.labelJob.findFirst({
          where: {
            vendorProfileId: this.vendorId,
            orderItemId: orderItem.id,
            status: {
              not: 'CANCELLED',
            },
          },
        });

        if (!existingLabels) {
          // Get default label profile for this product
          const labelProfile = await this.getDefaultLabelProfile(orderItem.product);
          
          if (labelProfile) {
            const suggestion: LabelSuggestion = {
              id: `order-item-${orderItem.id}`,
              type: 'order_item',
              priority: this.getOrderItemPriority(order, orderItem),
              title: `Order #${order.orderNumber} - ${orderItem.product.name}`,
              description: `${orderItem.quantity} labels needed for ${orderItem.product.name}`,
              orderId: order.id,
              orderItemId: orderItem.id,
              productId: orderItem.product.id,
              labelProfileId: labelProfile.id,
              templateId: labelProfile.templateId || '',
              copies: orderItem.quantity,
              tokens: {
                order: order,
                orderItem: orderItem,
                product: orderItem.product,
              },
              reason: 'Order item needs labels for production',
              missingFields: this.checkMissingFields(orderItem.product),
            };

            suggestions.push(suggestion);
          }
        }
      }
    }

    return suggestions;
  }

  private async getBatchSuggestions(): Promise<LabelSuggestion[]> {
    const suggestions: LabelSuggestion[] = [];

    // Mock batch suggestions - in real implementation, this would come from batching logic
    const batchProducts = await prisma.product.findMany({
      where: {
        vendorProfileId: this.vendorId,
        active: true,
      },
      take: 3, // Mock: suggest 3 products for batching
    });

    for (const product of batchProducts) {
      const labelProfile = await this.getDefaultLabelProfile(product);
      
      if (labelProfile) {
        const suggestion: LabelSuggestion = {
          id: `batch-${product.id}`,
          type: 'batch',
          priority: 'medium',
          title: `Batch Labels - ${product.name}`,
          description: `Batch labels for ${product.name} production`,
          productId: product.id,
          labelProfileId: labelProfile.id,
          templateId: labelProfile.templateId || '',
          copies: 10, // Mock batch size
          tokens: {
            product: product,
            batch: {
              lot: this.generateLotNumber(new Date()),
              quantity: 10,
            },
          },
          reason: 'Batch production requires labels',
          missingFields: this.checkMissingFields(product),
        };

        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  private async getInventorySuggestions(): Promise<LabelSuggestion[]> {
    const suggestions: LabelSuggestion[] = [];

    // Get inventory items that need labels
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        vendorProfileId: this.vendorId,
        current_qty: {
          gt: 0,
        },
      },
      take: 5, // Mock: suggest 5 inventory items
    });

    for (const item of inventoryItems) {
      // Mock: create a simple product-like object for inventory items
      const mockProduct = {
        id: item.id,
        name: item.name,
        sku: item.name,
        price: item.avg_cost || 0,
        category: { name: 'Inventory' },
      };

      const labelProfile = await this.getDefaultLabelProfile(mockProduct);
      
      if (labelProfile) {
        const suggestion: LabelSuggestion = {
          id: `inventory-${item.id}`,
          type: 'inventory',
          priority: 'low',
          title: `Inventory Label - ${item.name}`,
          description: `Label for ${item.name} inventory item`,
          productId: item.id,
          labelProfileId: labelProfile.id,
          templateId: labelProfile.templateId || '',
          copies: 1,
          tokens: {
            product: mockProduct,
            inventory: item,
          },
          reason: 'Inventory item needs labeling',
          missingFields: [],
        };

        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  private async getShelfLifeSuggestions(): Promise<LabelSuggestion[]> {
    const suggestions: LabelSuggestion[] = [];

    // Get products that need shelf-life labels
    const products = await prisma.product.findMany({
      where: {
        vendorProfileId: this.vendorId,
        active: true,
        type: 'FOOD', // Only food products need shelf-life labels
      },
      include: {
        category: true,
      },
    });

    for (const product of products) {
      const missingFields = this.checkMissingFields(product);
      
      if (missingFields.length > 0) {
        const labelProfile = await this.getDefaultLabelProfile(product);
        
        if (labelProfile) {
          const suggestion: LabelSuggestion = {
            id: `shelf-life-${product.id}`,
            type: 'shelf_life',
            priority: 'high',
            title: `Shelf-Life Label - ${product.name}`,
            description: `Shelf-life label for ${product.name} (missing: ${missingFields.join(', ')})`,
            productId: product.id,
            labelProfileId: labelProfile.id,
            templateId: labelProfile.templateId || '',
            copies: 1,
            tokens: {
              product: product,
            },
            reason: 'Product missing required shelf-life information',
            missingFields,
          };

          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  private async getDefaultLabelProfile(product: any): Promise<any> {
    // Get the first available label profile for this vendor
    const labelProfile = await prisma.labelProfile.findFirst({
      where: {
        vendorProfileId: this.vendorId,
        status: 'ACTIVE',
      },
    });

    return labelProfile;
  }

  private getOrderItemPriority(order: any, orderItem: any): 'low' | 'medium' | 'high' | 'urgent' {
    // Determine priority based on order due date and priority
    const now = new Date();
    const dueDate = order.dueAt ? new Date(order.dueAt) : null;
    
    if (order.priority === 'RUSH') {
      return 'urgent';
    }
    
    if (dueDate && dueDate < now) {
      return 'urgent';
    }
    
    if (dueDate && dueDate < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return 'high';
    }
    
    if (order.priority === 'HIGH') {
      return 'high';
    }
    
    if (order.priority === 'MEDIUM') {
      return 'medium';
    }
    
    return 'low';
  }

  private checkMissingFields(product: any): string[] {
    const missing: string[] = [];
    
    // Check for required fields for food products
    if (product.type === 'FOOD') {
      if (!product.sku) missing.push('SKU');
      if (!product.nutritionNotes) missing.push('Nutrition Information');
      if (!product.allergenFlags) missing.push('Allergen Information');
    }
    
    return missing;
  }

  private generateLotNumber(date: Date): string {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${dateStr}-${random}`;
  }

  private getPriorityScore(suggestion: LabelSuggestion): number {
    const scores = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    
    return scores[suggestion.priority];
  }
}

// Utility function to get suggestions for a vendor
export async function getLabelSuggestions(vendorId: string): Promise<LabelSuggestion[]> {
  const suggestor = new LabelSuggestor(vendorId);
  return await suggestor.getSuggestions();
}
