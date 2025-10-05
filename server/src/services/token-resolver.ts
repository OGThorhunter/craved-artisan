import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TokenContext {
  order?: any;
  orderItem?: any;
  product?: any;
  recipe?: any;
  batch?: any;
  inventory?: any;
  vendor?: any;
}

export interface ResolvedTokens {
  // Product tokens
  'product.name'?: string;
  'product.variant'?: string;
  'product.sku'?: string;
  'product.price'?: number;
  'product.ingredientsList'?: string;
  'product.allergens'?: string;
  'product.netWeight'?: string;
  'product.servingSize'?: string;
  'product.servingsPerContainer'?: string;
  'product.nutrition.calories'?: number;
  'product.nutrition.panel'?: string;
  
  // Production & Legal tokens
  'bornOn'?: string;
  'expires'?: string;
  'shelfLife'?: number;
  'lot'?: string;
  'storage'?: string;
  'countryOfOrigin'?: string;
  'madeBy.name'?: string;
  'madeBy.address'?: string;
  
  // Codes
  'qr.purchaseUrl'?: string;
  'qr.orderPickup'?: string;
  'barcode.ean13'?: string;
  'barcode.code128'?: string;
  'gs1.datamatrix'?: string;
  
  // Operational
  'order.number'?: string;
  'order.customerName'?: string;
  'order.dueAt'?: string;
  'quantity'?: number;
  'notes'?: string;
}

export class TokenResolver {
  private context: TokenContext;

  constructor(context: TokenContext) {
    this.context = context;
  }

  async resolveTokens(): Promise<ResolvedTokens> {
    const tokens: ResolvedTokens = {};

    // Resolve product tokens
    if (this.context.product) {
      await this.resolveProductTokens(tokens);
    }

    // Resolve order tokens
    if (this.context.order) {
      await this.resolveOrderTokens(tokens);
    }

    // Resolve order item tokens
    if (this.context.orderItem) {
      await this.resolveOrderItemTokens(tokens);
    }

    // Resolve production tokens
    await this.resolveProductionTokens(tokens);

    // Resolve vendor tokens
    if (this.context.vendor) {
      await this.resolveVendorTokens(tokens);
    }

    return tokens;
  }

  private async resolveProductTokens(tokens: ResolvedTokens): Promise<void> {
    const product = this.context.product;
    
    tokens['product.name'] = product.name;
    tokens['product.variant'] = product.variantName || '';
    tokens['product.sku'] = product.sku || '';
    tokens['product.price'] = product.price;

    // Get recipe and ingredients if available
    if (product.recipeId) {
      const recipe = await prisma.recipe.findUnique({
        where: { id: product.recipeId },
        include: {
          recipeIngredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      if (recipe) {
        const ingredients = recipe.recipeIngredients.map((ri: any) => ri.ingredient.name).join(', ');
        tokens['product.ingredientsList'] = ingredients;
        
        // Extract allergens
        const allergens = recipe.recipeIngredients
          .filter((ri: any) => ri.ingredient.allergenFlags)
          .map((ri: any) => ri.ingredient.name);
        tokens['product.allergens'] = allergens.join(', ');
      }
    }

    // Nutrition information
    if (product.nutritionNotes) {
      tokens['product.nutrition.panel'] = product.nutritionNotes;
    }

    // Weight and serving information (mock for now)
    tokens['product.netWeight'] = '500g';
    tokens['product.servingSize'] = '1 piece';
    tokens['product.servingsPerContainer'] = '1';
    tokens['product.nutrition.calories'] = 250;
  }

  private async resolveOrderTokens(tokens: ResolvedTokens): Promise<void> {
    const order = this.context.order;
    
    tokens['order.number'] = order.orderNumber;
    tokens['order.customerName'] = order.customerName || '';
    tokens['order.dueAt'] = order.dueAt ? new Date(order.dueAt).toLocaleDateString() : '';
  }

  private async resolveOrderItemTokens(tokens: ResolvedTokens): Promise<void> {
    const orderItem = this.context.orderItem;
    
    tokens['quantity'] = orderItem.quantity;
    tokens['notes'] = orderItem.notes || '';

    // Generate QR codes
    if (orderItem.orderId) {
      tokens['qr.orderPickup'] = `${process.env.FRONTEND_URL}/orders/${orderItem.orderId}/pickup`;
    }
  }

  private async resolveProductionTokens(tokens: ResolvedTokens): Promise<void> {
    const now = new Date();
    
    // Born on date (now or order creation date)
    const bornOn = this.context.order?.createdAt ? new Date(this.context.order.createdAt) : now;
    tokens['bornOn'] = bornOn.toLocaleDateString();

    // Shelf life and expiry
    const shelfLife = this.getShelfLife();
    tokens['shelfLife'] = shelfLife;
    
    const expiry = new Date(bornOn);
    expiry.setDate(expiry.getDate() + shelfLife);
    tokens['expires'] = expiry.toLocaleDateString();

    // Lot number
    tokens['lot'] = this.generateLotNumber(bornOn);

    // Storage instructions
    tokens['storage'] = this.getStorageInstructions();

    // Country of origin
    tokens['countryOfOrigin'] = 'USA';
  }

  private async resolveVendorTokens(tokens: ResolvedTokens): Promise<void> {
    const vendor = this.context.vendor;
    
    tokens['madeBy.name'] = vendor.storeName;
    tokens['madeBy.address'] = vendor.address || '';

    // Generate purchase QR code
    if (this.context.product) {
      tokens['qr.purchaseUrl'] = `${process.env.FRONTEND_URL}/products/${this.context.product.slug}`;
    }
  }

  private getShelfLife(): number {
    // Default shelf life based on product type
    const product = this.context.product;
    if (!product) return 7; // Default 7 days

    // Mock logic - in real implementation, this would come from product category or recipe
    const category = product.category?.name?.toLowerCase() || '';
    
    if (category.includes('bread') || category.includes('pastry')) {
      return 3; // 3 days for bread/pastry
    } else if (category.includes('cake') || category.includes('dessert')) {
      return 5; // 5 days for cakes/desserts
    } else if (category.includes('cookie') || category.includes('cracker')) {
      return 14; // 14 days for cookies/crackers
    }
    
    return 7; // Default 7 days
  }

  private generateLotNumber(bornOn: Date): string {
    const dateStr = bornOn.toISOString().slice(0, 10).replace(/-/g, '');
    const orderNum = this.context.order?.orderNumber?.slice(-4) || '0001';
    return `${dateStr}-${orderNum}`;
  }

  private getStorageInstructions(): string {
    const product = this.context.product;
    if (!product) return 'Store in a cool, dry place';

    const category = product.category?.name?.toLowerCase() || '';
    
    if (category.includes('bread') || category.includes('pastry')) {
      return 'Store at room temperature. Refrigerate to extend freshness.';
    } else if (category.includes('cake') || category.includes('dessert')) {
      return 'Refrigerate immediately. Best consumed within 5 days.';
    } else if (category.includes('cookie') || category.includes('cracker')) {
      return 'Store in airtight container at room temperature.';
    }
    
    return 'Store in a cool, dry place';
  }

  // Generate barcodes
  generateBarcode(type: 'ean13' | 'code128' | 'gs1', data: string): string {
    // Mock implementation - in real app, use a barcode library
    switch (type) {
      case 'ean13':
        return data.padStart(13, '0');
      case 'code128':
        return data;
      case 'gs1':
        return `01${data}21${this.generateLotNumber(new Date())}`;
      default:
        return data;
    }
  }
}

// Utility function to resolve tokens for a given context
export async function resolveTokens(context: TokenContext): Promise<ResolvedTokens> {
  const resolver = new TokenResolver(context);
  return await resolver.resolveTokens();
}

// Utility function to replace tokens in a string
export function replaceTokens(template: string, tokens: ResolvedTokens): string {
  let result = template;
  
  for (const [key, value] of Object.entries(tokens)) {
    const tokenPattern = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(tokenPattern, String(value || ''));
  }
  
  return result;
}
