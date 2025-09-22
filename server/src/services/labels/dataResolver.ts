import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ResolvedData {
  // Order fields
  orderId?: string;
  orderNumber?: string;
  orderDate?: string;
  customerName?: string;
  customerEmail?: string;
  
  // Product fields
  productName?: string;
  productSku?: string;
  productDescription?: string;
  productPrice?: string;
  productWeight?: string;
  
  // Vendor fields
  vendorName?: string;
  vendorLogo?: string;
  
  // QR/Links
  qrLink?: string;
  orderUrl?: string;
  productUrl?: string;
  
  // Batch/Lot info
  lot?: string;
  batch?: string;
  expirationDate?: string;
  
  // Allergens
  allergens?: string;
  
  // Nutrition
  nutrition?: string;
  nutritionUrl?: string;
}

export interface DataResolverConfig {
  source: 'order' | 'product' | 'manual';
  sourceId: string;
  vendorProfileId: string;
}

/**
 * Resolve data for label generation based on source type
 */
export async function resolveLabelData(config: DataResolverConfig): Promise<ResolvedData> {
  const { source, sourceId, vendorProfileId } = config;
  
  switch (source) {
    case 'order':
      return await resolveOrderData(sourceId, vendorProfileId);
    case 'product':
      return await resolveProductData(sourceId, vendorProfileId);
    case 'manual':
      return await resolveManualData(sourceId);
    default:
      throw new Error(`Unsupported source type: ${source}`);
  }
}

/**
 * Resolve data from an order
 */
async function resolveOrderData(orderId: string, vendorProfileId: string): Promise<ResolvedData> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      },
      orderItems: {
        include: {
          product: {
            include: {
              vendor: {
                select: { storeName: true, imageUrl: true }
              }
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Get first item (for single-product labels)
  const firstItem = order.orderItems[0];
  if (!firstItem) {
    throw new Error(`No items found in order: ${orderId}`);
  }

  const product = firstItem.product;
  const vendor = product.vendor;

  // Generate batch/lot from order date and ID
  const orderDate = new Date(order.created_at);
  const batchId = `${orderDate.getFullYear()}${(orderDate.getMonth() + 1).toString().padStart(2, '0')}${orderDate.getDate().toString().padStart(2, '0')}`;
  const lotNumber = `${batchId}-${orderId.slice(-4).toUpperCase()}`;

  // Calculate expiration date (default 5 days from order date)
  const expirationDate = new Date(orderDate);
  expirationDate.setDate(expirationDate.getDate() + 5);

  // Parse allergens from product tags
  const allergens = parseAllergensFromTags(product.tags);

  // Generate URLs
  const baseUrl = process.env.APP_URL || 'https://craved.app';
  const orderUrl = `${baseUrl}/orders/${order.id}`;
  const productUrl = `${baseUrl}/products/${product.id}`;

  return {
    // Order fields
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderDate: orderDate.toLocaleDateString(),
    customerName: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
    customerEmail: order.user.email,
    
    // Product fields
    productName: product.name,
    productSku: product.sku || `PROD-${product.id.slice(-6).toUpperCase()}`,
    productDescription: product.description || '',
    productPrice: `$${product.price.toFixed(2)}`,
    productWeight: formatWeight(firstItem.quantity, product.name), // Estimate based on product type
    
    // Vendor fields
    vendorName: vendor.storeName,
    vendorLogo: vendor.imageUrl || '',
    
    // QR/Links
    qrLink: orderUrl,
    orderUrl,
    productUrl,
    
    // Batch/Lot info
    lot: lotNumber,
    batch: batchId,
    expirationDate: expirationDate.toLocaleDateString(),
    
    // Allergens
    allergens,
    
    // Nutrition
    nutrition: 'Nutrition information available online',
    nutritionUrl: productUrl
  };
}

/**
 * Resolve data from a product (for product labels)
 */
async function resolveProductData(productId: string, vendorProfileId: string): Promise<ResolvedData> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: {
        select: { storeName: true, imageUrl: true }
      }
    }
  });

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  // Generate batch from current date
  const currentDate = new Date();
  const batchId = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  const lotNumber = `${batchId}-${productId.slice(-4).toUpperCase()}`;

  // Calculate expiration date (default 30 days from now)
  const expirationDate = new Date(currentDate);
  expirationDate.setDate(expirationDate.getDate() + 30);

  // Parse allergens from product tags
  const allergens = parseAllergensFromTags(product.tags);

  // Generate URLs
  const baseUrl = process.env.APP_URL || 'https://craved.app';
  const productUrl = `${baseUrl}/products/${product.id}`;

  return {
    // Product fields
    productName: product.name,
    productSku: product.sku || `PROD-${product.id.slice(-6).toUpperCase()}`,
    productDescription: product.description || '',
    productPrice: `$${product.price.toFixed(2)}`,
    productWeight: formatWeight(1, product.name), // Default quantity 1
    
    // Vendor fields
    vendorName: product.vendor.storeName,
    vendorLogo: product.vendor.imageUrl || '',
    
    // QR/Links
    qrLink: productUrl,
    productUrl,
    
    // Batch/Lot info
    lot: lotNumber,
    batch: batchId,
    expirationDate: expirationDate.toLocaleDateString(),
    
    // Allergens
    allergens,
    
    // Nutrition
    nutrition: 'Nutrition information available online',
    nutritionUrl: productUrl
  };
}

/**
 * Resolve manual data (for custom labels)
 */
async function resolveManualData(sourceId: string): Promise<ResolvedData> {
  // For manual labels, we'll use the sourceId as a reference
  // In a real implementation, this might fetch from a custom data source
  
  const currentDate = new Date();
  const batchId = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  
  return {
    productName: 'Custom Product',
    productSku: `CUSTOM-${sourceId.slice(-6).toUpperCase()}`,
    productDescription: 'Custom label data',
    productPrice: '$0.00',
    vendorName: 'Custom Vendor',
    lot: `${batchId}-${sourceId.slice(-4).toUpperCase()}`,
    batch: batchId,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    allergens: '',
    qrLink: `https://example.com/custom/${sourceId}`
  };
}

/**
 * Parse allergens from product tags
 */
function parseAllergensFromTags(tags: string | null): string {
  if (!tags) return '';
  
  const allergenPrefix = 'allergen:';
  const allergenTags = tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.toLowerCase().startsWith(allergenPrefix))
    .map(tag => tag.substring(allergenPrefix.length).toUpperCase());
  
  return allergenTags.join(', ');
}

/**
 * Format weight based on product type and quantity
 */
function formatWeight(quantity: number, productName: string): string {
  const name = productName.toLowerCase();
  
  // Estimate weight based on product type
  let estimatedWeight = 1; // Default 1 lb
  
  if (name.includes('bread') || name.includes('loaf')) {
    estimatedWeight = 1.5;
  } else if (name.includes('muffin') || name.includes('roll')) {
    estimatedWeight = 0.25;
  } else if (name.includes('cake') || name.includes('pie')) {
    estimatedWeight = 2;
  } else if (name.includes('cookie') || name.includes('biscuit')) {
    estimatedWeight = 0.125;
  } else if (name.includes('dozen') || name.includes('12')) {
    estimatedWeight = 1;
  } else if (name.includes('6-pack') || name.includes('6 pack')) {
    estimatedWeight = 0.75;
  }
  
  const totalWeight = estimatedWeight * quantity;
  
  if (totalWeight >= 1) {
    return `${totalWeight.toFixed(1)} lbs`;
  } else {
    return `${(totalWeight * 16).toFixed(0)} oz`;
  }
}

/**
 * Get available data fields for a given source type
 */
export function getAvailableFields(source: 'order' | 'product' | 'manual'): string[] {
  const commonFields = [
    'productName',
    'productSku',
    'productPrice',
    'vendorName',
    'lot',
    'batch',
    'expirationDate',
    'allergens',
    'qrLink'
  ];
  
  switch (source) {
    case 'order':
      return [
        ...commonFields,
        'orderId',
        'orderNumber',
        'orderDate',
        'customerName',
        'customerEmail',
        'orderUrl'
      ];
    case 'product':
      return [
        ...commonFields,
        'productDescription',
        'productUrl'
      ];
    case 'manual':
      return commonFields;
    default:
      return commonFields;
  }
}
