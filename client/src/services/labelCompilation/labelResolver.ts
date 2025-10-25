/**
 * Label Resolution Service
 * Resolves order data to printable labels using the hierarchy system
 */

import type { Product, ProductVariant } from '../../types/products';
import type { LabelTemplate } from '../../types/label-templates';
import type { PrintJob, PrintElement } from '../printEngines/basePrintEngine';
import { 
  resolveLabelProfile, 
  labelProfileHierarchy,
  type LabelProfileResolution 
} from '../labelProfileHierarchy';

// Order data interfaces
export interface OrderCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OrderVendor {
  id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  website?: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku: string;
  
  // Label-specific overrides
  labelProfileId?: string;
  labelQuantity?: number; // Override quantity for labeling
  
  // Product metadata for labeling
  weight?: number;
  dimensions?: string;
  ingredients?: string;
  allergens?: string[];
  nutritionInfo?: Record<string, any>;
  expirationDate?: string;
  lotNumber?: string;
  
  // References
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  
  customer: OrderCustomer;
  vendor: OrderVendor;
  lineItems: OrderLineItem[];
  
  // Order metadata
  createdAt: string;
  expectedDelivery?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  
  // Totals
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  
  // Label-specific data
  priority?: 'standard' | 'expedited' | 'rush';
  specialInstructions?: string;
  customFields?: Record<string, any>;
}

export interface LabelResolutionRequest {
  order: Order;
  lineItemId?: string; // If specified, generate label for specific item
  labelType?: 'product' | 'shipping' | 'both';
  printerProfile?: {
    id: string;
    engine: 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL';
    dpi: number;
  };
  options?: {
    includeCustomer?: boolean;
    includeVendor?: boolean;
    includePricing?: boolean;
    includeNutrition?: boolean;
    customData?: Record<string, any>;
  };
}

export interface LabelResolutionResult {
  success: boolean;
  printJobs: PrintJob[];
  errors: Array<{
    lineItemId?: string;
    error: string;
    suggestion?: string;
  }>;
  warnings: Array<{
    lineItemId?: string;
    message: string;
  }>;
  resolution: LabelProfileResolution;
  template?: LabelTemplate;
}

export class LabelResolver {
  /**
   * Resolve order to printable labels
   */
  async resolveOrderToLabels(request: LabelResolutionRequest): Promise<LabelResolutionResult> {
    try {
      const { order, lineItemId, labelType = 'product', printerProfile, options = {} } = request;
      
      const result: LabelResolutionResult = {
        success: false,
        printJobs: [],
        errors: [],
        warnings: [],
        resolution: {} as LabelProfileResolution
      };

      // Determine which line items to process
      const targetLineItems = lineItemId 
        ? order.lineItems.filter(item => item.id === lineItemId)
        : order.lineItems;

      if (targetLineItems.length === 0) {
        result.errors.push({
          lineItemId,
          error: 'No line items found to process',
          suggestion: 'Verify the order contains valid line items'
        });
        return result;
      }

      // Process each line item
      for (const lineItem of targetLineItems) {
        try {
          const itemResult = await this.resolveLineItemToLabel(
            order, 
            lineItem, 
            labelType, 
            printerProfile,
            options
          );

          if (itemResult.printJob) {
            result.printJobs.push(itemResult.printJob);
          }

          if (itemResult.resolution) {
            result.resolution = itemResult.resolution;
            result.template = itemResult.template;
          }

          result.errors.push(...itemResult.errors);
          result.warnings.push(...itemResult.warnings);

        } catch (error) {
          result.errors.push({
            lineItemId: lineItem.id,
            error: `Failed to process line item: ${error instanceof Error ? error.message : 'Unknown error'}`,
            suggestion: 'Check line item data and label configuration'
          });
        }
      }

      result.success = result.printJobs.length > 0 && result.errors.length === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        printJobs: [],
        errors: [{
          error: `Label resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: 'Check order data and label configuration'
        }],
        warnings: [],
        resolution: {} as LabelProfileResolution
      };
    }
  }

  /**
   * Resolve a single line item to a label
   */
  private async resolveLineItemToLabel(
    order: Order,
    lineItem: OrderLineItem,
    labelType: 'product' | 'shipping' | 'both',
    printerProfile?: LabelResolutionRequest['printerProfile'],
    options: LabelResolutionRequest['options'] = {}
  ): Promise<{
    printJob?: PrintJob;
    resolution?: LabelProfileResolution;
    template?: LabelTemplate;
    errors: Array<{ lineItemId: string; error: string; suggestion?: string }>;
    warnings: Array<{ lineItemId: string; message: string }>;
  }> {
    const errors: Array<{ lineItemId: string; error: string; suggestion?: string }> = [];
    const warnings: Array<{ lineItemId: string; message: string }> = [];

    // Resolve label profile using hierarchy
    const resolution = resolveLabelProfile(
      lineItem.product,
      lineItem.variant,
      lineItem // Order line item can override
    );

    if (!resolution.profileId) {
      errors.push({
        lineItemId: lineItem.id,
        error: 'No label profile could be resolved',
        suggestion: 'Assign a label profile to the product, variant, or order'
      });
      return { errors, warnings };
    }

    // Get template for the resolved profile
    const template = await this.getTemplateForProfile(resolution.profileId);
    if (!template) {
      errors.push({
        lineItemId: lineItem.id,
        error: `Template not found for profile: ${resolution.profileId}`,
        suggestion: 'Verify the label profile has a valid template assigned'
      });
      return { errors, warnings, resolution };
    }

    // Create data context for template compilation
    const dataContext = this.createDataContext(order, lineItem, options);
    
    // Compile template with data
    const compiledElements = this.compileTemplateElements(template, dataContext);
    
    // Validate compiled elements
    const validation = this.validateCompiledElements(compiledElements, lineItem.id);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);

    if (errors.length > 0) {
      return { errors, warnings, resolution, template };
    }

    // Create print job
    const printJob: PrintJob = {
      id: `label-${order.id}-${lineItem.id}-${Date.now()}`,
      templateId: template.id,
      elements: compiledElements,
      dimensions: {
        widthInches: template.width / 25.4, // Convert mm to inches
        heightInches: template.height / 25.4,
        dpi: printerProfile?.dpi || 203,
        widthPoints: (template.width / 25.4) * 72,
        heightPoints: (template.height / 25.4) * 72,
        widthPixels: (template.width / 25.4) * (printerProfile?.dpi || 203),
        heightPixels: (template.height / 25.4) * (printerProfile?.dpi || 203)
      },
      copies: lineItem.labelQuantity || lineItem.quantity,
      metadata: {
        orderNumber: order.orderNumber,
        productName: lineItem.productName,
        customerName: order.customer.name,
        createdAt: new Date().toISOString(),
        vendorId: order.vendor.id
      }
    };

    return {
      printJob,
      resolution,
      template,
      errors,
      warnings
    };
  }

  /**
   * Get template for label profile
   */
  private async getTemplateForProfile(profileId: string): Promise<LabelTemplate | null> {
    // In a real implementation, this would fetch from the database
    // For now, we'll use a mock template
    
    // Try to get from label service first
    try {
      // This would be the actual service call:
      // return await labelService.getTemplateByProfileId(profileId);
      
      // Mock implementation
      return this.getMockTemplate(profileId);
    } catch (error) {
      console.error('Failed to fetch template for profile:', profileId, error);
      return null;
    }
  }

  /**
   * Create data context for template compilation
   */
  private createDataContext(
    order: Order, 
    lineItem: OrderLineItem, 
    options: LabelResolutionRequest['options'] = {}
  ): Record<string, any> {
    const context: Record<string, any> = {
      // Order information
      order: {
        id: order.id,
        number: order.orderNumber,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString(),
        priority: order.priority || 'standard',
        trackingNumber: order.trackingNumber,
        expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : ''
      },
      
      // Product information
      product: {
        id: lineItem.productId,
        name: lineItem.productName,
        sku: lineItem.sku,
        price: options.includePricing ? `$${lineItem.unitPrice.toFixed(2)}` : '',
        quantity: lineItem.quantity.toString(),
        weight: lineItem.weight || '',
        dimensions: lineItem.dimensions || '',
        ingredients: lineItem.ingredients || '',
        allergens: lineItem.allergens?.join(', ') || '',
        expirationDate: lineItem.expirationDate || '',
        lotNumber: lineItem.lotNumber || '',
        bestBy: lineItem.expirationDate || ''
      },

      // Variant information
      variant: lineItem.variant ? {
        id: lineItem.variantId,
        name: lineItem.variantName,
        attributes: Object.entries(lineItem.variant.attributes || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      } : {},

      // Customer information
      customer: options.includeCustomer ? {
        name: order.customer.name,
        email: order.customer.email || '',
        phone: order.customer.phone || '',
        address: order.customer.address.street,
        city: order.customer.address.city,
        state: order.customer.address.state,
        zipCode: order.customer.address.zipCode,
        fullAddress: `${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.state} ${order.customer.address.zipCode}`
      } : {},

      // Vendor information
      vendor: options.includeVendor ? {
        businessName: order.vendor.businessName,
        contactName: order.vendor.contactName || '',
        email: order.vendor.email || '',
        phone: order.vendor.phone || '',
        address: order.vendor.address.street,
        city: order.vendor.address.city,
        state: order.vendor.address.state,
        zipCode: order.vendor.address.zipCode,
        website: order.vendor.website || '',
        contactCard: JSON.stringify({
          name: order.vendor.businessName,
          phone: order.vendor.phone,
          website: order.vendor.website
        })
      } : {},

      // Barcodes and QR codes
      barcode: lineItem.sku, // Use SKU as barcode data
      qrCode: JSON.stringify({
        order: order.orderNumber,
        product: lineItem.sku,
        customer: order.customer.name
      }),
      trackingNumber: order.trackingNumber || '',

      // Custom data
      ...(options.customData || {})
    };

    return context;
  }

  /**
   * Compile template elements with data
   */
  private compileTemplateElements(template: LabelTemplate, dataContext: Record<string, any>): PrintElement[] {
    return template.fields.map(field => {
      const element: PrintElement = {
        id: field.id,
        type: field.type as PrintElement['type'],
        x: field.x / 25.4, // Convert mm to inches
        y: field.y / 25.4,
        width: field.width / 25.4,
        height: field.height / 25.4,
        fontSize: field.fontSize,
        fontFamily: field.fontFamily,
        fontWeight: field.fontWeight,
        color: field.color,
        backgroundColor: field.backgroundColor,
        borderColor: field.borderColor,
        borderWidth: field.borderWidth,
        alignment: field.alignment,
        rotation: field.rotation,
        showText: true, // Default for barcodes
        barcodeFormat: 'CODE128' // Default barcode format
      };

      // Compile content with data
      if (field.content) {
        element.content = this.compileTemplate(field.content, dataContext);
      }

      // Set barcode/QR specific data
      if (field.dataSource) {
        const sourceData = this.resolveDataSource(field.dataSource, dataContext);
        if (sourceData) {
          element.content = sourceData;
        }
      }

      return element;
    });
  }

  /**
   * Compile template string with data context
   */
  private compileTemplate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? String(value) : '';
    });
  }

  /**
   * Resolve data source to actual value
   */
  private resolveDataSource(dataSource: string, context: Record<string, any>): string | undefined {
    return this.getNestedValue(context, dataSource);
  }

  /**
   * Get nested object value by dot notation path
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Validate compiled elements
   */
  private validateCompiledElements(
    elements: PrintElement[], 
    lineItemId: string
  ): {
    errors: Array<{ lineItemId: string; error: string; suggestion?: string }>;
    warnings: Array<{ lineItemId: string; message: string }>;
  } {
    const errors: Array<{ lineItemId: string; error: string; suggestion?: string }> = [];
    const warnings: Array<{ lineItemId: string; message: string }> = [];

    elements.forEach(element => {
      // Check for missing content
      if (['text', 'barcode', 'qr'].includes(element.type) && !element.content) {
        warnings.push({
          lineItemId,
          message: `Element ${element.id} has no content - will render as empty`
        });
      }

      // Check for invalid coordinates
      if (element.x < 0 || element.y < 0) {
        errors.push({
          lineItemId,
          error: `Element ${element.id} has negative coordinates`,
          suggestion: 'Check template design and data values'
        });
      }

      // Check for zero dimensions
      if (element.width <= 0 || element.height <= 0) {
        errors.push({
          lineItemId,
          error: `Element ${element.id} has zero or negative dimensions`,
          suggestion: 'Verify template element sizing'
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Mock template for development
   */
  private getMockTemplate(profileId: string): LabelTemplate {
    return {
      id: `template-${profileId}`,
      name: 'Product Label Template',
      description: 'Standard product label with barcode',
      width: 50.8, // 2 inches in mm
      height: 25.4, // 1 inch in mm
      fields: [
        {
          id: 'product-name',
          type: 'text',
          content: '{{product.name}}',
          x: 2,
          y: 2,
          width: 46,
          height: 6,
          fontSize: 10,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#000000',
          alignment: 'left'
        },
        {
          id: 'price',
          type: 'text',
          content: '{{product.price}}',
          x: 2,
          y: 9,
          width: 20,
          height: 4,
          fontSize: 8,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          color: '#000000',
          alignment: 'left'
        },
        {
          id: 'barcode',
          type: 'barcode',
          content: '{{barcode}}',
          dataSource: 'product.sku',
          x: 2,
          y: 14,
          width: 46,
          height: 8
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    };
  }
}

// Export singleton instance
export const labelResolver = new LabelResolver();
