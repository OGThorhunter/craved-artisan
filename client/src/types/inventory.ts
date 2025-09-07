import { z } from 'zod';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'used_goods';
  unit: string;
  currentStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier?: string;
  isAvailable: boolean;
  expirationDate?: string;
  batchNumber?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemData {
  name: string;
  description?: string;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'used_goods';
  unit: string;
  currentStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier?: string;
  expirationDate?: string;
  batchNumber?: string;
  location?: string;
}

export interface StockAdjustment {
  id: string;
  itemId: string;
  adjustment: number;
  reason: string;
  notes?: string;
  timestamp: string;
  previousStock: number;
  newStock: number;
}

export interface InventoryAnalytics {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  expiredCount: number;
  categoryBreakdown: Record<string, number>;
  valueByCategory: Record<string, number>;
  lowStockItems: Array<{
    id: string;
    name: string;
    currentStock: number;
    reorderPoint: number;
    category: string;
  }>;
  expiredItems: Array<{
    id: string;
    name: string;
    expirationDate: string;
    category: string;
  }>;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  estimatedCost: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  totalEstimatedCost: number;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

// Zod schema for runtime validation
export const AIInsightSchema = z.object({
  id: z.string(),
  itemId: z.string().optional(),
  type: z.enum(['reorder_suggestion', 'price_alert', 'demand_forecast', 'supplier_alert', 'seasonal_trend']),
  title: z.string(),
  message: z.string(),
  confidence: z.number().min(0).max(100),
  actionable: z.boolean(),
  priority: z.enum(['high', 'medium', 'low']),
  createdAt: z.string(), // ISO string
  expiresAt: z.string().optional(), // ISO string
});

// TypeScript type inferred from Zod schema
export type AIInsight = z.infer<typeof AIInsightSchema>;

// Runtime type guard
export function isAIInsight(x: unknown): x is AIInsight {
  return AIInsightSchema.safeParse(x).success;
}

