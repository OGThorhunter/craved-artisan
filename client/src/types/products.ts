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
  
  // Enhanced production fields
  category: 'bread' | 'pastry' | 'dessert' | 'beverage' | 'other';
  unit: 'loaf' | 'piece' | 'dozen' | 'kg' | 'lb' | 'unit';
  minStockLevel: number;
  maxStockLevel: number;
  reorderQuantity: number;
  productionLeadTime: number; // days
  
  // Cost tracking
  currentCost: number;
  costBreakdown: {
    rawMaterials: number;
    labor: number;
    overhead: number;
    packaging: number;
  };
  
  // Production settings
  batchSize: number;
  productionFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'on-demand';
  lastProductionDate?: string;
  nextProductionDate?: string;
  
  // Quality and compliance
  allergens: string[];
  dietaryRestrictions: string[];
  certifications: string[];
  expirationDays: number;
  storageRequirements: string;
  
  // Sales and performance
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isSeasonal: boolean;
  seasonalStartDate?: string;
  seasonalEndDate?: string;
}

export interface CreateProductForm {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: string;
  stock: number;
  isAvailable: boolean;
  targetMargin: number;
  recipeId: string;
  onWatchlist: boolean;
  lastAiSuggestion: number;
  aiSuggestionNote: string;
  
  // Enhanced fields
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
  product: {
    id: string;
    name: string;
    currentPrice: number;
    targetMargin: number | null;
  };
  costAnalysis: {
    unitCost: number;
    recipeYield: number;
    hasRecipe: boolean;
    rawMaterialCost: number;
    laborCost: number;
    overheadCost: number;
    packagingCost: number;
  };
  marginAnalysis: {
    currentMargin: number;
    status: 'danger' | 'warning' | 'safe';
    suggestedPrice: number | null;
    breakEvenPrice: number;
  };
  productionMetrics: {
    averageBatchSize: number;
    averageYield: number;
    productionEfficiency: number;
    lastProductionDate?: string;
  };
}

export interface MarginAnalysis {
  product: {
    id: string;
    name: string;
    currentPrice: number;
    targetMargin: number | null;
  };
  costAnalysis: {
    unitCost: number;
    recipeYield: number;
    hasRecipe: boolean;
  };
  marginAnalysis: {
    currentMargin: number;
    status: 'danger' | 'warning' | 'safe';
    suggestedPrice: number | null;
  };
}

export interface AiSuggestionResponse {
  message: string;
  product: {
    id: string;
    name: string;
    currentPrice: number;
    targetMargin: number;
    onWatchlist: boolean;
  };
  costAnalysis: {
    unitCost: number;
    hasRecipe: boolean;
  };
  aiSuggestion: {
    suggestedPrice: number;
    note: string;
    volatilityDetected: boolean;
    confidence: number;
    priceDifference: number;
    percentageChange: number;
  };
  watchlistUpdate: {
    addedToWatchlist: boolean;
    reason: string;
  };
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
