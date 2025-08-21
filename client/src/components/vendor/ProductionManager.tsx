import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Calculator,
  BarChart3,
  Users,
  Warehouse,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Local interfaces to avoid import issues
interface Product {
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
  category: 'bread' | 'pastry' | 'dessert' | 'beverage' | 'other';
  unit: 'loaf' | 'piece' | 'dozen' | 'kg' | 'lb' | 'unit';
  minStockLevel: number;
  maxStockLevel: number;
  reorderQuantity: number;
  productionLeadTime: number;
  currentCost: number;
  costBreakdown: {
    rawMaterials: number;
    labor: number;
    overhead: number;
    packaging: number;
  };
  batchSize: number;
  productionFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'on-demand';
  lastProductionDate?: string;
  nextProductionDate?: string;
  allergens: string[];
  dietaryRestrictions: string[];
  certifications: string[];
  expirationDays: number;
  storageRequirements: string;
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isSeasonal: boolean;
  seasonalStartDate?: string;
  seasonalEndDate?: string;
}

interface ProductionBatch {
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

interface BatchMaterialUsage {
  rawMaterialId: string;
  rawMaterialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  cost: number;
  inventoryDeducted: boolean;
}

interface BatchLaborUsage {
  laborCostId: string;
  role: string;
  plannedHours: number;
  actualHours: number;
  cost: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  version: string;
  yield: number;
  yieldUnit: string;
  ingredients: RecipeIngredient[];
  laborSteps: LaborStep[];
  totalCost: number;
  costPerUnit: number;
  lastUpdated: string;
  isActive: boolean;
}

interface RecipeIngredient {
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface LaborStep {
  laborCostId: string;
  role: string;
  hours: number;
  cost: number;
}

interface RawMaterial {
  id: string;
  name: string;
  category: 'grain' | 'dairy' | 'produce' | 'spice' | 'other';
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'oz' | 'lb';
  costPerUnit: number;
  supplier: string;
  currentStock: number;
  reorderPoint: number;
  leadTime: number;
  isActive: boolean;
}

interface ProductionPlan {
  id: string;
  date: string;
  products: ProductionPlanItem[];
  totalCost: number;
  status: 'draft' | 'confirmed' | 'in-progress' | 'completed';
  notes?: string;
}

interface ProductionPlanItem {
  productId: string;
  productName: string;
  plannedQuantity: number;
  recipeId: string;
  estimatedCost: number;
  priority: 'high' | 'medium' | 'low';
}

interface ProductionManagerProps {
  products: Product[];
  onProductionUpdate: () => void;
}

const ProductionManager: React.FC<ProductionManagerProps> = ({ products, onProductionUpdate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'batches' | 'planning' | 'costs'>('dashboard');
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);
  
  // Mock data - in real app, this would come from API
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [laborCosts, setLaborCosts] = useState<any[]>([]); // Changed to any[] to avoid import issue

  // Form states
  const [batchForm, setBatchForm] = useState({
    productId: '',
    recipeId: '',
    plannedQuantity: 0,
    startDate: '',
    notes: ''
  });

  const [planForm, setPlanForm] = useState({
    date: '',
    products: [] as Array<{
      productId: string;
      plannedQuantity: number;
      priority: 'high' | 'medium' | 'low';
    }>,
    notes: ''
  });

  useEffect(() => {
    // Load mock data
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock recipes
    setRecipes([
      {
        id: 'recipe-1',
        name: 'Classic Sourdough Recipe',
        description: 'Traditional sourdough bread recipe',
        version: '1.0',
        yield: 12,
        yieldUnit: 'loaves',
        ingredients: [
          { rawMaterialId: 'flour-1', rawMaterialName: 'Organic Flour', quantity: 5, unit: 'kg', cost: 15.00 },
          { rawMaterialId: 'water-1', rawMaterialName: 'Filtered Water', quantity: 3.5, unit: 'l', cost: 0.50 },
          { rawMaterialId: 'salt-1', rawMaterialName: 'Sea Salt', quantity: 0.1, unit: 'kg', cost: 2.00 },
          { rawMaterialId: 'starter-1', rawMaterialName: 'Sourdough Starter', quantity: 0.5, unit: 'kg', cost: 5.00 }
        ],
        laborSteps: [
          { laborCostId: 'baker-1', role: 'baker', hours: 8, cost: 120.00 },
          { laborCostId: 'assistant-1', role: 'assistant', hours: 4, cost: 60.00 }
        ],
        totalCost: 202.50,
        costPerUnit: 16.88,
        lastUpdated: new Date().toISOString(),
        isActive: true
      }
    ]);

    // Mock raw materials
    setRawMaterials([
      {
        id: 'flour-1',
        name: 'Organic Flour',
        category: 'grain',
        unit: 'kg',
        costPerUnit: 3.00,
        supplier: 'Local Mill Co.',
        currentStock: 50,
        reorderPoint: 10,
        leadTime: 3,
        isActive: true
      },
      {
        id: 'water-1',
        name: 'Filtered Water',
        category: 'other',
        unit: 'l',
        costPerUnit: 0.15,
        supplier: 'City Water',
        currentStock: 1000,
        reorderPoint: 100,
        leadTime: 0,
        isActive: true
      }
    ]);

    // Mock labor costs
    setLaborCosts([
      {
        id: 'baker-1',
        role: 'baker',
        hourlyRate: 25.00,
        hoursPerBatch: 8,
        isActive: true
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        hourlyRate: 18.00,
        hoursPerBatch: 4,
        isActive: true
      }
    ]);

    // Mock production batches
    setProductionBatches([
      {
        id: 'batch-1',
        productId: 'product-1',
        productName: 'Classic Sourdough',
        recipeId: 'recipe-1',
        batchNumber: 'SB-2024-001',
        plannedQuantity: 12,
        actualQuantity: 12,
        startDate: new Date().toISOString(),
        completionDate: new Date().toISOString(),
        status: 'completed',
        rawMaterialsUsed: [
          {
            rawMaterialId: 'flour-1',
            rawMaterialName: 'Organic Flour',
            plannedQuantity: 5,
            actualQuantity: 5,
            unit: 'kg',
            cost: 15.00,
            inventoryDeducted: true
          }
        ],
        laborUsed: [
          {
            laborCostId: 'baker-1',
            role: 'baker',
            plannedHours: 8,
            actualHours: 8,
            cost: 200.00
          }
        ],
        totalCost: 215.00,
        costPerUnit: 17.92,
        notes: 'Perfect batch, all loaves sold'
      }
    ]);
  };

  const handleCreateBatch = () => {
    if (!batchForm.productId || !batchForm.recipeId || batchForm.plannedQuantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = products.find(p => p.id === batchForm.productId);
    const recipe = recipes.find(r => r.id === batchForm.recipeId);
    
    if (!product || !recipe) {
      toast.error('Invalid product or recipe selection');
      return;
    }

    const newBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      productId: batchForm.productId,
      productName: product.name,
      recipeId: batchForm.recipeId,
      batchNumber: `SB-${new Date().getFullYear()}-${String(productionBatches.length + 1).padStart(3, '0')}`,
      plannedQuantity: batchForm.plannedQuantity,
      actualQuantity: 0,
      startDate: batchForm.startDate,
      status: 'planned',
      rawMaterialsUsed: [],
      laborUsed: [],
      totalCost: 0,
      costPerUnit: 0,
      notes: batchForm.notes
    };

    setProductionBatches([...productionBatches, newBatch]);
    setShowBatchForm(false);
    setBatchForm({
      productId: '',
      recipeId: '',
      plannedQuantity: 0,
      startDate: '',
      notes: ''
    });
    
    toast.success('Production batch created successfully!');
    onProductionUpdate();
  };

  const handleStartBatch = (batchId: string) => {
    setProductionBatches(prev => 
      prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'in-progress' as const }
          : batch
      )
    );
    toast.success('Production batch started!');
  };

  const handleCompleteBatch = (batchId: string) => {
    setProductionBatches(prev => 
      prev.map(batch => 
        batch.id === batchId 
          ? { 
              ...batch, 
              status: 'completed' as const,
              completionDate: new Date().toISOString(),
              actualQuantity: batch.plannedQuantity // In real app, this would be input
            }
          : batch
      )
    );
    toast.success('Production batch completed!');
  };

  const calculateBatchCost = (batch: ProductionBatch): number => {
    const recipe = recipes.find(r => r.id === batch.recipeId);
    if (!recipe) return 0;
    
    const materialCost = recipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0);
    const laborCost = recipe.laborSteps.reduce((sum, step) => sum + step.cost, 0);
    
    return materialCost + laborCost;
  };

  const getProductionMetrics = () => {
    const today = new Date().toDateString();
    const todayBatches = productionBatches.filter(batch => 
      new Date(batch.startDate).toDateString() === today
    );
    
    const totalBatchesToday = todayBatches.length;
    const totalUnitsProduced = todayBatches
      .filter(batch => batch.status === 'completed')
      .reduce((sum, batch) => sum + batch.actualQuantity, 0);
    const totalCost = todayBatches.reduce((sum, batch) => sum + calculateBatchCost(batch), 0);
    
    return {
      totalBatchesToday,
      totalUnitsProduced,
      totalCost,
      averageEfficiency: totalBatchesToday > 0 ? (totalUnitsProduced / totalBatchesToday) : 0
    };
  };

  const getInventoryAlerts = () => {
    const lowStock = products.filter(p => p.stock <= p.minStockLevel).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const expiringSoon = 0; // Would calculate based on expiration dates
    
    return { lowStock, outOfStock, expiringSoon };
  };

  const metrics = getProductionMetrics();
  const alerts = getInventoryAlerts();

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Production Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBatchForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Batch
            </button>
            <button
              onClick={() => setShowPlanForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Production Plan
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'batches', label: 'Production Batches', icon: Package },
          { id: 'planning', label: 'Planning', icon: Calendar },
          { id: 'costs', label: 'Cost Analysis', icon: Calculator }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Production Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Today's Batches</p>
                    <p className="text-2xl font-bold text-blue-900">{metrics.totalBatchesToday}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Units Produced</p>
                    <p className="text-2xl font-bold text-green-900">{metrics.totalUnitsProduced}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-900">${metrics.totalCost.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Efficiency</p>
                    <p className="text-2xl font-bold text-orange-900">{metrics.averageEfficiency.toFixed(1)}</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-900 mb-3">Inventory Alerts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{alerts.lowStock} products low on stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{alerts.outOfStock} products out of stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{alerts.expiringSoon} products expiring soon</span>
                </div>
              </div>
            </div>

            {/* Recent Production */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Production</h3>
              <div className="space-y-2">
                {productionBatches.slice(0, 5).map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{batch.productName}</p>
                      <p className="text-sm text-gray-600">Batch {batch.batchNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                        batch.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {batch.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {batch.actualQuantity}/{batch.plannedQuantity} units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Production Batches</h3>
              <span className="text-sm text-gray-600">{productionBatches.length} total batches</span>
            </div>
            
            <div className="space-y-3">
              {productionBatches.map((batch) => (
                <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{batch.productName}</h4>
                      <p className="text-sm text-gray-600">Batch {batch.batchNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                        batch.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        batch.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Planned:</span>
                      <span className="ml-2 font-medium">{batch.plannedQuantity} units</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Actual:</span>
                      <span className="ml-2 font-medium">{batch.actualQuantity} units</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span>
                      <span className="ml-2 font-medium">${batch.totalCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <span className="ml-2 font-medium">
                        {new Date(batch.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {batch.status === 'planned' && (
                      <button
                        onClick={() => handleStartBatch(batch.id)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Start Production
                      </button>
                    )}
                    {batch.status === 'in-progress' && (
                      <button
                        onClick={() => handleCompleteBatch(batch.id)}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Complete Batch
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedBatch(batch)}
                      className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      title="View batch details"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Production Planning</h3>
            <p className="text-gray-600">Plan your production schedule and manage batch planning.</p>
            
            {/* Production Plans would go here */}
            <div className="text-center py-8 text-gray-500">
              Production planning features coming soon...
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Cost Analysis</h3>
            <p className="text-gray-600">Analyze production costs and margins for your products.</p>
            
            {/* Cost analysis would go here */}
            <div className="text-center py-8 text-gray-500">
              Cost analysis features coming soon...
            </div>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Production Batch</h3>
              <button
                onClick={() => setShowBatchForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateBatch(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={batchForm.productId}
                  onChange={(e) => setBatchForm({ ...batchForm, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  title="Select product for production batch"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe *
                </label>
                <select
                  value={batchForm.recipeId}
                  onChange={(e) => setBatchForm({ ...batchForm, recipeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  title="Select recipe for production batch"
                >
                  <option value="">Select a recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Quantity *
                </label>
                <input
                  type="number"
                  value={batchForm.plannedQuantity}
                  onChange={(e) => setBatchForm({ ...batchForm, plannedQuantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={batchForm.startDate}
                  onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={batchForm.notes}
                  onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Batch
                </button>
                <button
                  type="button"
                  onClick={() => setShowBatchForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionManager;
