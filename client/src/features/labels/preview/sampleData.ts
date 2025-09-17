import type { SampleData } from './types';

export const defaultSampleData: SampleData = {
  customer: {
    firstName: 'Ava',
    lastName: 'Reed'
  },
  order: {
    id: 'ORD-1234',
    pickupTime: '2025-09-15T15:00:00Z'
  },
  product: {
    title: 'Cinnamon Bun (6-pack)',
    sku: 'CB-6',
    allergens: ['WHEAT', 'EGG', 'MILK']
  },
  vendor: {
    name: 'Rose Creek Bakery'
  },
  nutritionUrl: 'https://example.com/nutrition/cb-6',
  qrPayload: 'https://craved.app/o/ORD-1234'
};

/**
 * Resolve binding key from sample data
 * Supports nested properties and simple formatters
 */
export function resolveBinding(bindingKey: string, sample: SampleData): string {
  if (!bindingKey || !bindingKey.startsWith('{{') || !bindingKey.endsWith('}}')) {
    return bindingKey;
  }

  const key = bindingKey.slice(2, -2).trim();
  const [path, formatter] = key.split('|').map(s => s.trim());

  let value: any = sample;
  const parts = path.split('.');
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return `{{${key}}}`; // Return original if not found
    }
  }

  if (value === null || value === undefined) {
    return `{{${key}}}`;
  }

  // Apply formatter if specified
  if (formatter) {
    switch (formatter.toLowerCase()) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return String(value);
        }
      case 'time':
        try {
          return new Date(value).toLocaleTimeString();
        } catch {
          return String(value);
        }
      case 'datetime':
        try {
          return new Date(value).toLocaleString();
        } catch {
          return String(value);
        }
      case 'allergens':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);
      default:
        return String(value);
    }
  }

  return String(value);
}

/**
 * Get all available binding keys from sample data
 */
export function getAvailableBindings(sample: SampleData): string[] {
  const bindings: string[] = [];
  
  function extractBindings(obj: any, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        extractBindings(value, fullKey);
      } else {
        bindings.push(`{{${fullKey}}}`);
      }
    }
  }
  
  extractBindings(sample);
  return bindings;
}

/**
 * Validate sample data JSON
 */
export function validateSampleData(json: string): { valid: boolean; data?: SampleData; error?: string } {
  try {
    const parsed = JSON.parse(json);
    
    // Basic structure validation
    if (!parsed.customer || !parsed.order || !parsed.product || !parsed.vendor) {
      return {
        valid: false,
        error: 'Missing required sections: customer, order, product, vendor'
      };
    }
    
    return {
      valid: true,
      data: parsed as SampleData
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}

/**
 * Create sample data for different scenarios
 */
export const sampleDataVariants = {
  bakery: defaultSampleData,
  
  restaurant: {
    customer: {
      firstName: 'Marcus',
      lastName: 'Chen'
    },
    order: {
      id: 'ORD-5678',
      pickupTime: '2025-09-15T18:30:00Z'
    },
    product: {
      title: 'Grilled Salmon (Gluten-Free)',
      sku: 'GS-GF',
      allergens: ['FISH']
    },
    vendor: {
      name: 'Ocean Breeze Restaurant'
    },
    nutritionUrl: 'https://example.com/nutrition/gs-gf',
    qrPayload: 'https://craved.app/o/ORD-5678'
  } as SampleData,
  
  cafe: {
    customer: {
      firstName: 'Sophie',
      lastName: 'Williams'
    },
    order: {
      id: 'ORD-9012',
      pickupTime: '2025-09-15T10:15:00Z'
    },
    product: {
      title: 'Oat Milk Latte (Vegan)',
      sku: 'OML-V',
      allergens: []
    },
    vendor: {
      name: 'Green Bean Cafe'
    },
    nutritionUrl: 'https://example.com/nutrition/oml-v',
    qrPayload: 'https://craved.app/o/ORD-9012'
  } as SampleData
};
