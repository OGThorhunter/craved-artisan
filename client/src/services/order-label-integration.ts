// Order-specific integration with Phase 4 Label System
// This connects order processing workflow with advanced label features

export interface OrderLabelContext {
  // Order Information
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    phone?: string;
    total: number;
    status: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    dueAt?: string;
    notes?: string;
    shippingAddress?: string;
    deliveryDate?: string;
  };

  // Product/Item Information
  product: {
    id: string;
    name: string;
    sku?: string;
    price: number;
    category?: string;
    description?: string;
    imageUrl?: string;
    allergens?: string;
    ingredients?: string;
    nutritionInfo?: Record<string, any>;
  };

  // Business Context
  vendor: {
    id: string;
    businessName: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
  };

  // System Context
  system: {
    currentDate: string;
    currentTime: string;
    timezone: string;
    printDate: string;
    printTime: string;
    batchNumber?: string;
    operatorName?: string;
  };

  // Custom Fields
  customFields?: Record<string, any>;
}

export interface OrderLabelRule {
  id: string;
  name: string;
  description: string;
  category: 'priority' | 'shipping' | 'product' | 'customer' | 'business';
  
  // Conditions based on order data
  conditions: {
    field: string; // e.g., "order.priority", "product.category", "order.total"
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_array';
    value: any;
  }[];
  
  operator: 'AND' | 'OR';
  
  // Actions to apply to labels
  actions: {
    type: 'show_element' | 'hide_element' | 'set_text' | 'set_style' | 'add_element';
    target: string; // Element ID
    value?: any;
    style?: Record<string, any>;
  }[];
  
  enabled: boolean;
  priority: number;
}

// Pre-built rules for common order scenarios
export const orderLabelRules: OrderLabelRule[] = [
  {
    id: 'high-priority-indicator',
    name: 'High Priority Orders',
    description: 'Show priority indicator for urgent orders',
    category: 'priority',
    conditions: [
      { field: 'order.priority', operator: 'equals', value: 'URGENT' }
    ],
    operator: 'AND',
    actions: [
      { 
        type: 'show_element', 
        target: 'priority-badge',
        value: '🚨 URGENT'
      },
      {
        type: 'set_style',
        target: 'order-title',
        style: { color: '#dc2626', fontWeight: 'bold' }
      }
    ],
    enabled: true,
    priority: 10
  },

  {
    id: 'rush-delivery',
    name: 'Rush Delivery Indicator',
    description: 'Show rush indicator for same-day delivery',
    category: 'shipping',
    conditions: [
      { field: 'order.deliveryDate', operator: 'equals', value: '{{system.currentDate}}' }
    ],
    operator: 'AND',
    actions: [
      { 
        type: 'show_element', 
        target: 'rush-badge',
        value: '⚡ RUSH DELIVERY'
      }
    ],
    enabled: true,
    priority: 9
  },

  {
    id: 'large-order-handling',
    name: 'Large Order Special Handling',
    description: 'Special labeling for orders over $100',
    category: 'business',
    conditions: [
      { field: 'order.total', operator: 'greater_than', value: 100 }
    ],
    operator: 'AND',
    actions: [
      { 
        type: 'show_element', 
        target: 'special-handling',
        value: '📦 LARGE ORDER - Handle with Care'
      },
      {
        type: 'set_text',
        target: 'order-notes',
        value: 'Large order: ${{order.total}} - Special attention required'
      }
    ],
    enabled: true,
    priority: 7
  },

  {
    id: 'allergen-warnings',
    name: 'Allergen Warnings',
    description: 'Show allergen warnings on product labels',
    category: 'product',
    conditions: [
      { field: 'product.allergens', operator: 'not_equals', value: null }
    ],
    operator: 'AND',
    actions: [
      { 
        type: 'show_element', 
        target: 'allergen-warning',
        value: '⚠️ ALLERGENS: {{product.allergens}}'
      },
      {
        type: 'set_style',
        target: 'allergen-warning',
        style: { color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }
      }
    ],
    enabled: true,
    priority: 8
  },

  {
    id: 'expiration-date-bakery',
    name: 'Bakery Expiration Dates',
    description: 'Add expiration date for bakery products',
    category: 'product',
    conditions: [
      { field: 'product.category', operator: 'in_array', value: ['Breads', 'Pastries', 'Baked Goods'] }
    ],
    operator: 'AND',
    actions: [
      {
        type: 'show_element',
        target: 'expiration-date',
        value: 'Best By: {{system.printDate + 3 days}}'
      }
    ],
    enabled: true,
    priority: 6
  },

  {
    id: 'customer-name-formatting',
    name: 'Customer Name Formatting',
    description: 'Format customer names consistently',
    category: 'customer',
    conditions: [
      { field: 'order.customerName', operator: 'not_equals', value: null }
    ],
    operator: 'AND',
    actions: [
      {
        type: 'set_text',
        target: 'customer-name',
        value: 'FOR: {{order.customerName | uppercase}}'
      }
    ],
    enabled: true,
    priority: 5
  }
];

export class OrderLabelIntegration {
  /**
   * Create label context from order data for rules engine
   */
  static createLabelContext(
    order: any,
    orderItem?: any,
    vendorInfo?: any
  ): OrderLabelContext {
    const now = new Date();
    
    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        phone: order.phone,
        total: order.total,
        status: order.status,
        priority: order.priority || 'MEDIUM',
        createdAt: order.createdAt,
        dueAt: order.dueAt,
        notes: order.notes,
        shippingAddress: order.shippingAddress,
        deliveryDate: order.expectedAt
      },
      
      product: orderItem ? {
        id: orderItem.productId,
        name: orderItem.productName,
        sku: orderItem.product?.sku,
        price: orderItem.unitPrice,
        category: orderItem.product?.category?.name,
        description: orderItem.product?.description,
        imageUrl: orderItem.product?.imageUrl,
        allergens: orderItem.product?.allergens,
        ingredients: orderItem.product?.ingredients,
        nutritionInfo: orderItem.product?.nutritionInfo
      } : {
        id: 'unknown',
        name: 'Unknown Product',
        price: 0
      },
      
      vendor: {
        id: vendorInfo?.id || 'vendor-1',
        businessName: vendorInfo?.businessName || 'Your Business',
        address: vendorInfo?.address || '',
        phone: vendorInfo?.phone,
        email: vendorInfo?.email,
        website: vendorInfo?.website,
        logo: vendorInfo?.logo
      },
      
      system: {
        currentDate: now.toLocaleDateString(),
        currentTime: now.toLocaleTimeString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        printDate: now.toLocaleDateString(),
        printTime: now.toLocaleTimeString(),
        batchNumber: `BATCH-${now.getTime()}`,
        operatorName: 'System'
      },
      
      customFields: order.customFields || {}
    };
  }

  /**
   * Get applicable rules for an order
   */
  static getApplicableRules(
    context: OrderLabelContext,
    availableRules: OrderLabelRule[] = orderLabelRules
  ): OrderLabelRule[] {
    return availableRules
      .filter(rule => rule.enabled)
      .filter(rule => this.evaluateRuleConditions(rule, context))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Evaluate if rule conditions match the order context
   */
  private static evaluateRuleConditions(
    rule: OrderLabelRule,
    context: OrderLabelContext
  ): boolean {
    if (rule.conditions.length === 0) return true;

    const results = rule.conditions.map(condition => {
      const actualValue = this.getValueFromContext(condition.field, context);
      return this.compareValues(actualValue, condition.value, condition.operator);
    });

    return rule.operator === 'AND' 
      ? results.every(result => result)
      : results.some(result => result);
  }

  /**
   * Get value from context using dot notation
   */
  private static getValueFromContext(path: string, context: OrderLabelContext): any {
    const parts = path.split('.');
    let current: any = context;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Compare values based on operator
   */
  private static compareValues(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      
      case 'not_equals':
        return actual !== expected;
      
      case 'greater_than':
        return parseFloat(actual) > parseFloat(expected);
      
      case 'less_than':
        return parseFloat(actual) < parseFloat(expected);
      
      case 'contains':
        return actual && actual.toString().toLowerCase().includes(expected.toString().toLowerCase());
      
      case 'in_array':
        return Array.isArray(expected) && expected.includes(actual);
      
      default:
        return false;
    }
  }

  /**
   * Generate dynamic label content with rules applied
   */
  static generateLabelContent(
    template: any,
    context: OrderLabelContext,
    applicableRules: OrderLabelRule[]
  ): any {
    let modifiedTemplate = JSON.parse(JSON.stringify(template)); // Deep clone
    
    // Apply data binding first
    modifiedTemplate = this.applyDataBinding(modifiedTemplate, context);
    
    // Apply rules
    for (const rule of applicableRules) {
      modifiedTemplate = this.applyRuleActions(modifiedTemplate, rule.actions, context);
    }
    
    return modifiedTemplate;
  }

  /**
   * Apply data binding placeholders to template
   */
  private static applyDataBinding(template: any, context: OrderLabelContext): any {
    const templateStr = JSON.stringify(template);
    
    // Replace placeholders like {{order.customerName}}
    const boundTemplate = templateStr.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getValueFromContext(path.trim(), context);
      return value != null ? value.toString() : match;
    });
    
    return JSON.parse(boundTemplate);
  }

  /**
   * Apply rule actions to template
   */
  private static applyRuleActions(
    template: any,
    actions: OrderLabelRule['actions'],
    context: OrderLabelContext
  ): any {
    for (const action of actions) {
      switch (action.type) {
        case 'show_element':
          // Add element or set visibility
          if (template.elements) {
            const element = template.elements.find((e: any) => e.id === action.target);
            if (element) {
              element.visible = true;
              if (action.value) {
                element.content = action.value;
              }
            }
          }
          break;
        
        case 'hide_element':
          if (template.elements) {
            const element = template.elements.find((e: any) => e.id === action.target);
            if (element) {
              element.visible = false;
            }
          }
          break;
        
        case 'set_text':
          if (template.elements) {
            const element = template.elements.find((e: any) => e.id === action.target);
            if (element) {
              element.content = this.resolveActionValue(action.value, context);
            }
          }
          break;
        
        case 'set_style':
          if (template.elements) {
            const element = template.elements.find((e: any) => e.id === action.target);
            if (element && action.style) {
              element.style = { ...element.style, ...action.style };
            }
          }
          break;
      }
    }
    
    return template;
  }

  /**
   * Resolve action values with context substitution
   */
  private static resolveActionValue(value: any, context: OrderLabelContext): any {
    if (typeof value === 'string' && value.includes('{{')) {
      return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const resolvedValue = this.getValueFromContext(path.trim(), context);
        return resolvedValue != null ? resolvedValue.toString() : match;
      });
    }
    return value;
  }

  /**
   * Get recommended templates based on order characteristics
   */
  static getRecommendedTemplates(
    context: OrderLabelContext,
    availableTemplates: any[]
  ): {
    template: any;
    reason: string;
    confidence: number;
  }[] {
    const recommendations: { template: any; reason: string; confidence: number }[] = [];

    for (const template of availableTemplates) {
      let confidence = 0.5; // Base confidence
      let reasons: string[] = [];

      // Analyze order characteristics
      if (context.order.priority === 'URGENT' || context.order.priority === 'HIGH') {
        if (template.name.toLowerCase().includes('priority') || 
            template.name.toLowerCase().includes('urgent')) {
          confidence += 0.3;
          reasons.push('Priority order needs priority template');
        }
      }

      // Check product category matching
      if (context.product.category && template.category) {
        if (template.category.toLowerCase() === context.product.category.toLowerCase()) {
          confidence += 0.2;
          reasons.push('Template matches product category');
        }
      }

      // Check label type based on order total
      if (context.order.total > 50) {
        if (template.name.toLowerCase().includes('premium') || 
            template.dimensions.width >= 4) {
          confidence += 0.15;
          reasons.push('Large order uses premium label');
        }
      }

      // Shipping vs product labels
      if (template.name.toLowerCase().includes('shipping')) {
        confidence += 0.1;
        reasons.push('Shipping label for order fulfillment');
      } else if (template.name.toLowerCase().includes('product')) {
        confidence += 0.2;
        reasons.push('Product label for individual items');
      }

      if (confidence > 0.6) {
        recommendations.push({
          template,
          reason: reasons.join('; '),
          confidence: Math.min(confidence, 1.0)
        });
      }
    }

    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Top 3 recommendations
  }

  /**
   * Calculate estimated label count for an order
   */
  static calculateLabelCount(
    order: any,
    template: any,
    options: {
      includeShippingLabel?: boolean;
      labelsPerProduct?: number;
      customLabelCounts?: Record<string, number>; // productId -> count
    } = {}
  ): {
    productLabels: number;
    shippingLabels: number;
    totalLabels: number;
    breakdown: { productId: string; productName: string; labelCount: number }[];
  } {
    const labelsPerProduct = options.labelsPerProduct || 1;
    let productLabels = 0;
    const breakdown: { productId: string; productName: string; labelCount: number }[] = [];

    // Calculate product labels
    if (order.orderItems) {
      for (const item of order.orderItems) {
        const customCount = options.customLabelCounts?.[item.productId];
        const labelCount = customCount || (item.quantity * labelsPerProduct);
        
        productLabels += labelCount;
        breakdown.push({
          productId: item.productId,
          productName: item.productName,
          labelCount
        });
      }
    }

    // Calculate shipping labels
    const shippingLabels = options.includeShippingLabel ? 1 : 0;

    return {
      productLabels,
      shippingLabels,
      totalLabels: productLabels + shippingLabels,
      breakdown
    };
  }

  /**
   * Estimate label generation time and cost
   */
  static estimateLabelJob(
    labelCount: number,
    template: any,
    printer: any
  ): {
    estimatedTimeSeconds: number;
    estimatedCost: number;
    complexity: 'simple' | 'medium' | 'complex';
    warnings: string[];
  } {
    const baseTimePerLabel = 2; // seconds
    const baseCostPerLabel = 0.05; // $0.05

    // Calculate complexity
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    let complexityMultiplier = 1;
    
    if (template.elements) {
      const elementCount = template.elements.length;
      if (elementCount > 5) {
        complexity = 'medium';
        complexityMultiplier = 1.5;
      }
      if (elementCount > 10) {
        complexity = 'complex';
        complexityMultiplier = 2;
      }

      // Check for complex elements
      const hasBarcode = template.elements.some((e: any) => e.type === 'barcode');
      const hasQR = template.elements.some((e: any) => e.type === 'qr_code');
      const hasImage = template.elements.some((e: any) => e.type === 'image');
      
      if (hasBarcode || hasQR) complexityMultiplier *= 1.2;
      if (hasImage) complexityMultiplier *= 1.5;
    }

    const estimatedTimeSeconds = Math.ceil(labelCount * baseTimePerLabel * complexityMultiplier);
    const estimatedCost = labelCount * baseCostPerLabel * complexityMultiplier;

    const warnings: string[] = [];
    
    if (labelCount > 100) {
      warnings.push('Large batch - consider splitting for better performance');
    }
    
    if (complexity === 'complex') {
      warnings.push('Complex template may increase processing time');
    }

    return {
      estimatedTimeSeconds,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      complexity,
      warnings
    };
  }

  /**
   * Generate print job configuration for orders
   */
  static createPrintJobConfig(
    orders: any[],
    template: any,
    options: {
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      printerId?: string;
      copies?: number;
      applyRules?: boolean;
    } = {}
  ): {
    jobId: string;
    orders: any[];
    template: any;
    labelCount: number;
    estimatedTime: number;
    estimatedCost: number;
    priority: string;
    configuration: Record<string, any>;
  } {
    const totalLabelCount = orders.reduce((total, order) => {
      const orderLabelCount = this.calculateLabelCount(order, template);
      return total + orderLabelCount.totalLabels;
    }, 0);

    const estimation = this.estimateLabelJob(totalLabelCount, template, null);

    return {
      jobId: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orders,
      template,
      labelCount: totalLabelCount,
      estimatedTime: estimation.estimatedTimeSeconds,
      estimatedCost: estimation.estimatedCost,
      priority: options.priority || 'NORMAL',
      configuration: {
        printerId: options.printerId,
        copies: options.copies || 1,
        applyRules: options.applyRules !== false,
        complexity: estimation.complexity,
        warnings: estimation.warnings
      }
    };
  }
}
