import type { LabelTemplate, LabelField } from '../types/label-templates';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'shipping' | 'product' | 'barcode' | 'general';
  thumbnail: string;
  width: number; // mm
  height: number; // mm
  template: Omit<LabelTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
}

// Common field generators
const createTextField = (id: string, content: string, x: number, y: number, width: number, height: number, options: Partial<LabelField> = {}): LabelField => ({
  id,
  type: 'text',
  content,
  x,
  y,
  width,
  height,
  fontSize: 12,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#000000',
  alignment: 'left',
  ...options
});

const createBarcodeField = (id: string, x: number, y: number, width: number, height: number, dataSource: string = 'barcode'): LabelField => ({
  id,
  type: 'barcode',
  content: '{{barcode}}',
  x,
  y,
  width,
  height,
  dataSource,
  format: 'CODE128'
});

const createQRField = (id: string, x: number, y: number, size: number, dataSource: string = 'qrCode'): LabelField => ({
  id,
  type: 'qr',
  content: '{{qrCode}}',
  x,
  y,
  width: size,
  height: size,
  dataSource
});

const createRectangleField = (id: string, x: number, y: number, width: number, height: number, options: Partial<LabelField> = {}): LabelField => ({
  id,
  type: 'rectangle',
  content: '',
  x,
  y,
  width,
  height,
  backgroundColor: '#f0f0f0',
  borderColor: '#000000',
  borderWidth: 1,
  ...options
});

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  // SHIPPING LABELS
  {
    id: 'shipping-4x6-standard',
    name: '4"×6" Shipping Label',
    description: 'Standard shipping label with customer address, return address, and tracking barcode',
    category: 'shipping',
    thumbnail: '/templates/shipping-4x6.png',
    width: 101.6, // 4 inches
    height: 152.4, // 6 inches
    template: {
      name: '4×6 Shipping Label',
      description: 'Standard shipping label for packages',
      width: 101.6,
      height: 152.4,
      fields: [
        // Return Address Section
        createTextField('return-label', 'FROM:', 5, 5, 20, 6, { fontSize: 8, fontWeight: 'bold' }),
        createTextField('return-name', '{{vendor.businessName}}', 5, 12, 90, 8, { fontSize: 10, fontWeight: 'bold' }),
        createTextField('return-address1', '{{vendor.address}}', 5, 20, 90, 6, { fontSize: 9 }),
        createTextField('return-address2', '{{vendor.city}}, {{vendor.state}} {{vendor.zipCode}}', 5, 26, 90, 6, { fontSize: 9 }),
        
        // Shipping Address Section
        createTextField('ship-label', 'SHIP TO:', 5, 40, 30, 8, { fontSize: 10, fontWeight: 'bold' }),
        createTextField('ship-name', '{{customer.name}}', 5, 50, 90, 10, { fontSize: 14, fontWeight: 'bold' }),
        createTextField('ship-address1', '{{customer.address}}', 5, 62, 90, 8, { fontSize: 11 }),
        createTextField('ship-address2', '{{customer.city}}, {{customer.state}} {{customer.zipCode}}', 5, 70, 90, 8, { fontSize: 11 }),
        
        // Order Information
        createTextField('order-label', 'ORDER #:', 5, 85, 25, 6, { fontSize: 8, fontWeight: 'bold' }),
        createTextField('order-number', '{{order.number}}', 30, 85, 40, 6, { fontSize: 8 }),
        createTextField('date-label', 'DATE:', 5, 92, 15, 6, { fontSize: 8, fontWeight: 'bold' }),
        createTextField('date', '{{order.date}}', 20, 92, 30, 6, { fontSize: 8 }),
        
        // Tracking Barcode
        createBarcodeField('tracking-barcode', 5, 105, 90, 20, 'trackingNumber'),
        createTextField('tracking-text', '{{trackingNumber}}', 5, 127, 90, 8, { fontSize: 10, alignment: 'center', fontFamily: 'Courier New' })
      ],
      isDefault: false
    }
  },

  {
    id: 'shipping-2x1-simple',
    name: '2"×1" Simple Shipping',
    description: 'Compact shipping label for small packages',
    category: 'shipping',
    thumbnail: '/templates/shipping-2x1.png',
    width: 50.8, // 2 inches
    height: 25.4, // 1 inch
    template: {
      name: '2×1 Simple Shipping',
      description: 'Compact shipping label for small packages',
      width: 50.8,
      height: 25.4,
      fields: [
        createTextField('customer-name', '{{customer.name}}', 2, 2, 46, 6, { fontSize: 8, fontWeight: 'bold' }),
        createTextField('customer-address', '{{customer.fullAddress}}', 2, 8, 46, 4, { fontSize: 6 }),
        createBarcodeField('order-barcode', 2, 14, 46, 8, 'order.number')
      ],
      isDefault: false
    }
  },

  // PRODUCT LABELS
  {
    id: 'product-3x2-detailed',
    name: '3"×2" Product Label',
    description: 'Detailed product label with name, price, ingredients, and barcode',
    category: 'product',
    thumbnail: '/templates/product-3x2.png',
    width: 76.2, // 3 inches
    height: 50.8, // 2 inches
    template: {
      name: '3×2 Product Label',
      description: 'Detailed product label for retail display',
      width: 76.2,
      height: 50.8,
      fields: [
        // Header background
        createRectangleField('header-bg', 0, 0, 76.2, 12, { backgroundColor: '#2c3e50', borderWidth: 0 }),
        
        // Product Name
        createTextField('product-name', '{{product.name}}', 2, 2, 60, 8, { 
          fontSize: 12, 
          fontWeight: 'bold', 
          color: '#ffffff' 
        }),
        
        // Price
        createTextField('price', '{{product.price}}', 64, 2, 10, 8, { 
          fontSize: 12, 
          fontWeight: 'bold', 
          color: '#ffffff',
          alignment: 'right'
        }),
        
        // Description/Ingredients
        createTextField('description', '{{product.description}}', 2, 14, 50, 12, { 
          fontSize: 8,
          color: '#333333'
        }),
        
        // Barcode
        createBarcodeField('product-barcode', 2, 30, 40, 12, 'product.sku'),
        
        // SKU
        createTextField('sku', 'SKU: {{product.sku}}', 2, 44, 35, 4, { 
          fontSize: 7,
          color: '#666666'
        }),
        
        // Best By Date
        createTextField('best-by', 'Best By: {{product.bestBy}}', 45, 44, 29, 4, { 
          fontSize: 7,
          color: '#666666',
          alignment: 'right'
        })
      ],
      isDefault: false
    }
  },

  {
    id: 'product-2x1-simple',
    name: '2"×1" Simple Product',
    description: 'Basic product label with name and price',
    category: 'product',
    thumbnail: '/templates/product-2x1.png',
    width: 50.8, // 2 inches
    height: 25.4, // 1 inch
    template: {
      name: '2×1 Simple Product',
      description: 'Basic product label for simple items',
      width: 50.8,
      height: 25.4,
      fields: [
        createTextField('product-name', '{{product.name}}', 2, 2, 46, 8, { 
          fontSize: 10, 
          fontWeight: 'bold'
        }),
        createTextField('price', '{{product.price}}', 2, 12, 20, 6, { 
          fontSize: 12, 
          fontWeight: 'bold',
          color: '#2c3e50'
        }),
        createBarcodeField('sku-barcode', 25, 10, 23, 8, 'product.sku')
      ],
      isDefault: false
    }
  },

  // BARCODE LABELS
  {
    id: 'barcode-1x1-standard',
    name: '1"×1" Barcode Label',
    description: 'Simple barcode label with SKU',
    category: 'barcode',
    thumbnail: '/templates/barcode-1x1.png',
    width: 25.4, // 1 inch
    height: 25.4, // 1 inch
    template: {
      name: '1×1 Barcode Label',
      description: 'Simple square barcode label',
      width: 25.4,
      height: 25.4,
      fields: [
        createBarcodeField('sku-barcode', 2, 5, 21.4, 12, 'product.sku'),
        createTextField('sku-text', '{{product.sku}}', 2, 18, 21.4, 5, { 
          fontSize: 6,
          alignment: 'center',
          fontFamily: 'Courier New'
        })
      ],
      isDefault: false
    }
  },

  {
    id: 'barcode-2x1-inventory',
    name: '2"×1" Inventory Barcode',
    description: 'Inventory barcode with product name and SKU',
    category: 'barcode',
    thumbnail: '/templates/barcode-2x1-inv.png',
    width: 50.8, // 2 inches
    height: 25.4, // 1 inch
    template: {
      name: '2×1 Inventory Barcode',
      description: 'Inventory tracking barcode label',
      width: 50.8,
      height: 25.4,
      fields: [
        createTextField('product-name', '{{product.name}}', 2, 2, 46, 5, { 
          fontSize: 7,
          fontWeight: 'bold'
        }),
        createBarcodeField('sku-barcode', 2, 8, 46, 10, 'product.sku'),
        createTextField('sku-text', '{{product.sku}}', 2, 19, 46, 4, { 
          fontSize: 6,
          alignment: 'center',
          fontFamily: 'Courier New'
        })
      ],
      isDefault: false
    }
  },

  // GENERAL PURPOSE LABELS
  {
    id: 'address-4x1-mailing',
    name: '4"×1" Address Label',
    description: 'Standard mailing address label',
    category: 'general',
    thumbnail: '/templates/address-4x1.png',
    width: 101.6, // 4 inches
    height: 25.4, // 1 inch
    template: {
      name: '4×1 Address Label',
      description: 'Standard mailing address label',
      width: 101.6,
      height: 25.4,
      fields: [
        createTextField('name', '{{customer.name}}', 3, 2, 95, 6, { 
          fontSize: 11,
          fontWeight: 'bold'
        }),
        createTextField('address1', '{{customer.address}}', 3, 8, 95, 5, { fontSize: 10 }),
        createTextField('address2', '{{customer.city}}, {{customer.state}} {{customer.zipCode}}', 3, 14, 95, 5, { fontSize: 10 })
      ],
      isDefault: false
    }
  },

  {
    id: 'qr-2x2-contact',
    name: '2"×2" QR Contact Card',
    description: 'QR code label with contact information',
    category: 'general',
    thumbnail: '/templates/qr-2x2.png',
    width: 50.8, // 2 inches
    height: 50.8, // 2 inches
    template: {
      name: '2×2 QR Contact Card',
      description: 'QR code with business contact info',
      width: 50.8,
      height: 50.8,
      fields: [
        createTextField('business-name', '{{vendor.businessName}}', 2, 2, 46, 6, { 
          fontSize: 10,
          fontWeight: 'bold',
          alignment: 'center'
        }),
        createQRField('contact-qr', 12.7, 10, 25.4, 'vendor.contactCard'),
        createTextField('website', '{{vendor.website}}', 2, 40, 46, 4, { 
          fontSize: 8,
          alignment: 'center',
          color: '#2c3e50'
        }),
        createTextField('phone', '{{vendor.phone}}', 2, 45, 46, 3.8, { 
          fontSize: 7,
          alignment: 'center',
          color: '#666666'
        })
      ],
      isDefault: false
    }
  }
];

/**
 * Get all available template presets
 */
export const getTemplatePresets = (): TemplatePreset[] => {
  return TEMPLATE_PRESETS;
};

/**
 * Get template presets by category
 */
export const getPresetsByCategory = (category: TemplatePreset['category']): TemplatePreset[] => {
  return TEMPLATE_PRESETS.filter(preset => preset.category === category);
};

/**
 * Get a specific template preset by ID
 */
export const getPresetById = (id: string): TemplatePreset | undefined => {
  return TEMPLATE_PRESETS.find(preset => preset.id === id);
};

/**
 * Convert a preset to a full LabelTemplate
 */
export const presetToTemplate = (preset: TemplatePreset, createdBy: string): LabelTemplate => {
  const timestamp = new Date().toISOString();
  return {
    ...preset.template,
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy
  };
};

/**
 * Get template categories with counts
 */
export const getCategories = (): Array<{ category: string; count: number; description: string }> => {
  const categories = {
    shipping: { count: 0, description: 'Shipping and mailing labels' },
    product: { count: 0, description: 'Product and retail labels' },
    barcode: { count: 0, description: 'Barcode and inventory labels' },
    general: { count: 0, description: 'General purpose labels' }
  };

  TEMPLATE_PRESETS.forEach(preset => {
    categories[preset.category].count++;
  });

  return Object.entries(categories).map(([category, data]) => ({
    category,
    count: data.count,
    description: data.description
  }));
};
