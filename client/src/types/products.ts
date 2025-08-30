// Enhanced Product Management Types
export interface RawMaterial {
  id: string;
  name: string;
  category: 'grain' | 'dairy' | 'produce' | 'spice' | 'other';
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'oz' | 'lb';
  costPerUnit: number;
  supplier: string;
  currentStock: number;
  reorderPoint: number;
  leadTime: number; // days
  isActive: boolean;
}

export interface LaborCost {
  id: string;
  role: 'baker' | 'assistant' | 'packager' | 'delivery' | 'other';
  hourlyRate: number;
  hoursPerBatch: number;
  isActive: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  version: string;
  yield: number; // units produced
  yieldUnit: string;
  ingredients: RecipeIngredient[];
  laborSteps: LaborStep[];
  totalCost: number;
  costPerUnit: number;
  lastUpdated: string;
  isActive: boolean;
}

export interface RecipeIngredient {
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface LaborStep {
  laborCostId: string;
  role: string;
  hours: number;
  cost: number;
}

export interface ProductionBatch {
  id: string;
  productId: string;
  productName: string;
  recipeId: string;
  batchNumber: string;
  plannedQuantity: number;
  actualQuantity: number;
  startDate: string;
  completionDate?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  rawMaterialsUsed: BatchMaterialUsage[];
  laborUsed: BatchLaborUsage[];
  totalCost: number;
  costPerUnit: number;
  notes?: string;
}

export interface BatchMaterialUsage {
  rawMaterialId: string;
  rawMaterialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  cost: number;
  inventoryDeducted: boolean;
}

export interface BatchLaborUsage {
  laborCostId: string;
  role: string;
  plannedHours: number;
  actualHours: number;
  cost: number;
}

// Ensure Product is exported at the top level
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
  stock: number;
  isAvailable: boolean;
  targetMargin?: number;
  recipeId?: string;
  onWatchlist: boolean;
  lastAiSuggestion?: number;
  aiSuggestionNote?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  profitMargin?: number;
  costPrice?: number;
  supplier?: string;
  reorderPoint?: number;
  leadTime?: number;
  seasonality?: 'year-round' | 'seasonal' | 'limited';
  status?: 'active' | 'draft' | 'archived' | 'discontinued';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  variants?: ProductVariant[];
  relatedProducts?: string[];
  customFields?: Record<string, any>;
  
  // Enhanced Production Fields
  unit?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderQuantity?: number;
  productionLeadTime?: number;
  batchSize?: number;
  productionFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'on-demand';
  allergens?: string[];
  dietaryRestrictions?: string[];
  certifications?: string[];
  expirationDays?: number;
  storageRequirements?: string;
  isFeatured?: boolean;
  isSeasonal?: boolean;
  hasAllergens?: boolean;
  requiresRefrigeration?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface CreateProductForm {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags: string;
  stock: number;
  isAvailable: boolean;
  targetMargin?: number;
  recipeId?: string;
  onWatchlist: boolean;
  lastAiSuggestion?: number;
  aiSuggestionNote?: string;
  category: string;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderQuantity: number;
  productionLeadTime: number;
  batchSize: number;
  productionFrequency: string;
  allergens: string[];
  dietaryRestrictions: string[];
  certifications: string[];
  expirationDays: number;
  storageRequirements: string;
  isFeatured: boolean;
  isSeasonal: boolean;
  hasAllergens: boolean;
  requiresRefrigeration: boolean;
  status?: string;
}

export interface ProductionPlan {
  id: string;
  date: string;
  products: ProductionPlanItem[];
  totalCost: number;
  status: 'draft' | 'confirmed' | 'in-progress' | 'completed';
  notes?: string;
}

export interface ProductionPlanItem {
  productId: string;
  productName: string;
  plannedQuantity: number;
  recipeId: string;
  estimatedCost: number;
  priority: 'high' | 'medium' | 'low';
}

export interface InventoryTransaction {
  id: string;
  type: 'production' | 'sale' | 'adjustment' | 'transfer' | 'waste';
  productId?: string;
  rawMaterialId?: string;
  quantity: number;
  unit: string;
  cost: number;
  date: string;
  reference: string; // batch number, order number, etc.
  notes?: string;
}

export interface CostAnalysis {
  productId: string;
  totalCost: number;
  ingredientCosts: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    totalCost: number;
  }[];
  overheadCosts: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  profitMargin: number;
  suggestedPrice: number;
}

export interface MarginAnalysis {
  productId: string;
  productName: string;
  currentPrice: number;
  costPrice: number;
  currentMargin: number;
  targetMargin: number;
  marginDifference: number;
  recommendations: string[];
  costBreakdown: {
    ingredient: string;
    cost: number;
    percentage: number;
  }[];
}

export interface AiSuggestionResponse {
  productId: string;
  suggestions: {
    type: 'pricing' | 'inventory' | 'production' | 'marketing';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    implementation: string[];
  }[];
}

export interface ProductsResponse {
  products: Product[];
  count: number;
}

// Production Dashboard Types
export interface ProductionDashboard {
  todayProduction: ProductionBatch[];
  upcomingProduction: ProductionBatch[];
  lowStockProducts: Product[];
  productionMetrics: {
    totalBatchesToday: number;
    totalUnitsProduced: number;
    totalCost: number;
    averageEfficiency: number;
  };
  inventoryAlerts: {
    lowStock: number;
    outOfStock: number;
    expiringSoon: number;
  };
}

// Search and Filter Types
export interface ProductFilters {
  category?: string;
  availability?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  hasRecipe?: boolean;
  productionStatus?: 'active' | 'seasonal' | 'discontinued';
  search?: string;
}

export interface ProductionFilters {
  status?: 'all' | 'planned' | 'in-progress' | 'completed' | 'cancelled';
  dateRange?: {
    start: string;
    end: string;
  };
  productId?: string;
  recipeId?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  yield: number;
  yieldUnit: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  isActive: boolean;
  vendorProfileId: string;
  productId?: string;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  notes?: string;
  costPerUnit: number;
  totalCost: number;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  stockQty: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  vendorProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionBatch {
  id: string;
  productId: string;
  productName: string;
  batchSize: number;
  startDate: string;
  completionDate?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  ingredientsUsed: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    cost: number;
  }[];
  totalCost: number;
  notes?: string;
}

export interface ProductionSchedule {
  id: string;
  productId: string;
  productName: string;
  plannedDate: string;
  batchSize: number;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  dependencies?: string[];
  estimatedDuration: number;
  actualDuration?: number;
  notes?: string;
}
