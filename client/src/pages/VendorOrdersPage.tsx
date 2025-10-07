import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, 
  Search, 
  Download, 
  Bell, 
  Eye, 
  Edit, 
  Clock,
  CheckCircle,
  Package,
  Truck,
  Calendar,
  List,
  ChefHat,
  Layers,
  BookOpen,
  AlertCircle,
  CheckSquare,
  Printer
} from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import SystemMessagesDrawer from '../components/inventory/SystemMessagesDrawer';
import AIInsightsDrawer from '../components/inventory/AIInsightsDrawer';
import SimpleLabelPrintModal from '../components/labels/SimpleLabelPrintModal';

// Types
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  phone?: string;
  status: string;
  priority: string;
  source?: string;
  salesWindowId?: string;
  createdAt: string;
  expectedAt?: string;
  dueAt?: string;
  paymentStatus?: string;
  notes?: string;
  customFields?: Record<string, unknown>;
  station?: string;
  tags?: string[];
  total: number;
  orderItems: OrderItem[];
  salesWindow?: {
    id: string;
    name: string;
  };
  timeline?: OrderTimeline[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
  status: string;
  madeQty: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    recipeId?: string;
    recipe?: {
      id: string;
      name: string;
      ingredients: Array<{
        name: string;
        quantity: number;
        unit: string;
      }>;
      steps: Array<{
        stepNumber: number;
        instruction: string;
        duration: number;
      }>;
      yieldAmount: number;
    };
  };
}

interface OrderTimeline {
  id: string;
  type: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-1001',
    customerName: 'Suzy Johnson',
    customerEmail: 'suzy@example.com',
    phone: '(555) 123-4567',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 20.97,
    orderItems: [
      {
        id: 'item-1',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 3,
        unitPrice: 6.99,
        total: 20.97,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475�F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-1002',
    customerName: 'Mike Stevens',
    customerEmail: 'mike@example.com',
    phone: '(555) 987-6543',
    status: 'CONFIRMED',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 41.94,
    orderItems: [
      {
        id: 'item-2',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 6,
        unitPrice: 6.99,
        total: 41.94,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475�F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-1003',
    customerName: 'Emily Chen',
    customerEmail: 'emily@example.com',
    phone: '(555) 246-8135',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 37.96,
    orderItems: [
      {
        id: 'item-3',
        productId: 'prod-croissant',
        productName: 'Butter Croissant',
        quantity: 12,
        unitPrice: 3.99,
        total: 47.88,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-croissant',
          name: 'Butter Croissant',
          imageUrl: '/images/croissant.jpg',
          recipeId: 'recipe-croissant',
          recipe: {
            id: 'recipe-croissant',
            name: 'Classic Butter Croissants',
            ingredients: [
              { name: 'All-Purpose Flour', quantity: 500, unit: 'g' },
              { name: 'European Butter', quantity: 280, unit: 'g' },
              { name: 'Whole Milk', quantity: 240, unit: 'ml' },
              { name: 'Sugar', quantity: 50, unit: 'g' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Make dough and refrigerate for 1 hour.', duration: 60 },
              { stepNumber: 2, instruction: 'Laminate with butter using 3 letter folds. Chill 30 mins between folds.', duration: 240 },
              { stepNumber: 3, instruction: 'Roll out and cut into triangles. Shape and proof for 2-3 hours until doubled.', duration: 150 },
              { stepNumber: 4, instruction: 'Egg wash and bake at 400�F for 15-18 minutes until golden.', duration: 18 }
            ],
            yieldAmount: 12
          }
        }
      }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-1004',
    customerName: 'David Martinez',
    customerEmail: 'david@example.com',
    phone: '(555) 369-2580',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'PAID',
    total: 27.96,
    orderItems: [
      {
        id: 'item-4a',
        productId: 'prod-sourdough',
        productName: 'Sourdough Bread',
        quantity: 2,
        unitPrice: 6.99,
        total: 13.98,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-sourdough',
          name: 'Sourdough Bread',
          imageUrl: '/images/sourdough.jpg',
          recipeId: 'recipe-sourdough',
          recipe: {
            id: 'recipe-sourdough',
            name: 'Classic Sourdough Bread',
            ingredients: [
              { name: 'Bread Flour', quantity: 500, unit: 'g' },
              { name: 'Sourdough Starter', quantity: 100, unit: 'g' },
              { name: 'Water', quantity: 350, unit: 'ml' },
              { name: 'Salt', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Mix flour, water, and starter. Let autolyse for 30 minutes.', duration: 30 },
              { stepNumber: 2, instruction: 'Add salt and perform stretch and folds every 30 minutes for 3 hours.', duration: 180 },
              { stepNumber: 3, instruction: 'Shape and place in banneton. Cold proof overnight (12-16 hours).', duration: 720 },
              { stepNumber: 4, instruction: 'Preheat oven to 475�F. Score and bake covered for 20 mins, then uncovered for 25 mins.', duration: 45 }
            ],
            yieldAmount: 1
          }
        }
      },
      {
        id: 'item-4b',
        productId: 'prod-croissant',
        productName: 'Butter Croissant',
        quantity: 6,
        unitPrice: 3.99,
        total: 23.94,
        status: 'PENDING',
        madeQty: 0,
        product: {
          id: 'prod-croissant',
          name: 'Butter Croissant',
          imageUrl: '/images/croissant.jpg',
          recipeId: 'recipe-croissant',
          recipe: {
            id: 'recipe-croissant',
            name: 'Classic Butter Croissants',
            ingredients: [
              { name: 'All-Purpose Flour', quantity: 500, unit: 'g' },
              { name: 'European Butter', quantity: 280, unit: 'g' },
              { name: 'Whole Milk', quantity: 240, unit: 'ml' },
              { name: 'Sugar', quantity: 50, unit: 'g' },
              { name: 'Salt', quantity: 10, unit: 'g' },
              { name: 'Instant Yeast', quantity: 10, unit: 'g' }
            ],
            steps: [
              { stepNumber: 1, instruction: 'Make dough and refrigerate for 1 hour.', duration: 60 },
              { stepNumber: 2, instruction: 'Laminate with butter using 3 letter folds. Chill 30 mins between folds.', duration: 240 },
              { stepNumber: 3, instruction: 'Roll out and cut into triangles. Shape and proof for 2-3 hours until doubled.', duration: 150 },
              { stepNumber: 4, instruction: 'Egg wash and bake at 400�F for 15-18 minutes until golden.', duration: 18 }
            ],
            yieldAmount: 12
          }
        }
      }
    ]
  }
];


type ViewMode = 'list' | 'calendar' | 'batching' | 'fulfillment';

const VendorOrdersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('batching'); // Default to batching for demo
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [completedBatches, setCompletedBatches] = useState<Set<string>>(new Set());
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);

  // Use mock data for now
  const orders = mockOrders;
  const isLoadingOrders = false;
  const aiInsights = null;
  const isLoadingInsights = false;

  // Calculate summary stats
  const summaryStats = {
    total: orders.length,
    dueToday: orders.filter(order => {
      if (!order.dueAt) return false;
      const today = new Date().toDateString();
      return new Date(order.dueAt).toDateString() === today;
    }).length,
    delivered: 0,
    finished: 0,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
  };

  // Aggregate orders by product for batching
  const aggregateProductionBatch = () => {
    const batches: Record<string, {
      productId: string;
      productName: string;
      totalQuantity: number;
      orders: Array<{ orderNumber: string; customerName: string; quantity: number; }>;
      recipe?: typeof mockOrders[0]['orderItems'][0]['product']['recipe'];
      ingredients: Record<string, { quantity: number; unit: string }>;
    }> = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!batches[item.productId]) {
          batches[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            orders: [],
            recipe: item.product.recipe,
            ingredients: {}
          };
        }

        batches[item.productId].totalQuantity += item.quantity;
        batches[item.productId].orders.push({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          quantity: item.quantity
        });

        // Aggregate ingredients
        if (item.product.recipe) {
          const batchMultiplier = item.quantity / item.product.recipe.yieldAmount;
          item.product.recipe.ingredients.forEach(ing => {
            const key = `${ing.name}-${ing.unit}`;
            if (!batches[item.productId].ingredients[key]) {
              batches[item.productId].ingredients[key] = {
                quantity: 0,
                unit: ing.unit
              };
            }
            batches[item.productId].ingredients[key].quantity += ing.quantity * batchMultiplier;
          });
        }
      });
    });

    return Object.values(batches);
  };

  const productionBatches = aggregateProductionBatch();

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PRODUCTION: 'bg-orange-100 text-orange-800',
      READY: 'bg-green-100 text-green-800',
      OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
      PICKED_UP: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      RUSH: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }
    toast.success(`Updated ${selectedOrders.length} orders to ${status}`);
    setSelectedOrders([]);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const toggleBatchComplete = (productId: string) => {
    setCompletedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handlePrintLabel = (order: Order) => {
    setSelectedOrderForLabel(order);
    setShowLabelModal(true);
  };

  const handlePrintLabelSuccess = () => {
    toast.success(`Label printed successfully for ${selectedOrderForLabel?.orderNumber}!`);
    setShowLabelModal(false);
    setSelectedOrderForLabel(null);
  };

    return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {summaryStats.total} Total
                </Badge>
                {viewMode === 'batching' && (
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    Production Mode
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowSystemMessages(true)}
                  className="relative text-xs px-2 py-1"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowAIInsights(true)}
                  className="text-xs px-2 py-1"
                >
                  <Eye className="h-4 w-4" />
                  AI Insights
                </Button>
                
                <Button className="text-xs px-2 py-1">
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* KPI Tiles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
                </div>
              <Package className="h-8 w-8 text-blue-600" />
              </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.dueToday}</p>
                </div>
              <Clock className="h-8 w-8 text-orange-600" />
                </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.delivered}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finished</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.finished}</p>
                </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
                </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${summaryStats.revenue.toFixed(2)}</p>
                </div>
              <Package className="h-8 w-8 text-green-600" />
                </div>
          </Card>
          </div>

        {/* Toolbar */}
        <div className="bg-offwhite rounded-lg shadow-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                title="Filter by status"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="READY">Ready</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                title="Filter by priority"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="RUSH">Rush</option>
              </select>
                      </div>
                      
              <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('list')}
                  className="text-xs px-2 py-1"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('calendar')}
                  className="text-xs px-2 py-1"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'batching' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('batching')}
                  className="text-xs px-2 py-1"
                  title="Production Batching"
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'fulfillment' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('fulfillment')}
                  className="text-xs px-2 py-1"
                  title="Fulfillment Center"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="secondary" className="text-xs px-2 py-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && viewMode !== 'batching' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                  className="text-xs px-2 py-1"
                >
                  Confirm
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('IN_PRODUCTION')}
                  className="text-xs px-2 py-1"
                >
                  Start Production
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('READY')}
                  className="text-xs px-2 py-1"
                >
                  Mark Ready
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedOrders([])}
                  className="text-xs px-2 py-1"
                >
                  Clear
                </Button>
              </div>
            </div>
              </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {viewMode === 'list' && (
              <div className="bg-offwhite rounded-lg shadow-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedOrders.length === orders.length && orders.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300"
                                title="Select all orders"
                              />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingOrders ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            Loading orders...
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        orders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                                 <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                                className="rounded border-gray-300"
                                title="Select order"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.orderNumber}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.customerName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.customerEmail}
                                </div>
                              </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.dueAt ? new Date(order.dueAt).toLocaleDateString() : 'N/A'}
                              </div>
                              {order.dueAt && new Date(order.dueAt) < new Date() && (
                                <div className="text-xs text-red-600">Overdue</div>
                              )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.orderItems.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${order.total.toFixed(2)}
                      </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button variant="secondary" className="text-xs px-2 py-1">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" className="text-xs px-2 py-1">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                      </td>
                    </tr>
                        ))
                      )}
              </tbody>
            </table>
            </div>
              </div>
            )}


            {viewMode === 'calendar' && (
              <div className="space-y-6">
                {/* Calendar Header */}
                <Card className="p-6 bg-offwhite shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Orders Calendar</h2>
                    <div className="text-sm text-gray-600">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </Card>

                {/* Group orders by date */}
                {(() => {
                  const ordersByDate: Record<string, Order[]> = {};
                  orders.forEach(order => {
                    if (order.dueAt) {
                      const dateKey = new Date(order.dueAt).toDateString();
                      if (!ordersByDate[dateKey]) {
                        ordersByDate[dateKey] = [];
                      }
                      ordersByDate[dateKey].push(order);
                    }
                  });

                  const sortedDates = Object.keys(ordersByDate).sort((a, b) => 
                    new Date(a).getTime() - new Date(b).getTime()
                  );

                  return sortedDates.map(dateKey => (
                    <Card key={dateKey} className="p-6 bg-offwhite shadow-lg border border-gray-200">
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-6 w-6 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">
                            {new Date(dateKey).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            {ordersByDate[dateKey].length} orders
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {ordersByDate[dateKey].map(order => (
                          <div key={order.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-bold text-gray-900">{order.orderNumber}</span>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                  <Badge className={getPriorityColor(order.priority)}>
                                    {order.priority}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {order.customerName} • {order.orderItems.length} items
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600 text-lg">${order.total.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                Due: {new Date(order.dueAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ));
                })()}

                {Object.keys(orders.reduce((acc: Record<string, Order[]>, order) => {
                  if (order.dueAt) {
                    const dateKey = new Date(order.dueAt).toDateString();
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(order);
                  }
                  return acc;
                }, {})).length === 0 && (
                  <Card className="p-12 text-center bg-offwhite shadow-lg border border-gray-200">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders scheduled</p>
                  </Card>
                )}
              </div>
            )}


            {viewMode === 'batching' && (
              <div className="space-y-6">
                {/* Production Kitchen Header */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Production Kitchen</h2>
                    <p className="text-white/90">
                      Aggregate all orders by product for efficient batch production
                    </p>
                  </div>
                </div>

                {/* PRODUCTION MODE */}
                <div className="space-y-6">
                    {/* Production Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 bg-offwhite shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-900">Total Items to Produce</p>
                            <p className="text-3xl font-bold text-orange-600">
                              {productionBatches.reduce((sum, batch) => sum + batch.totalQuantity, 0)}
                            </p>
                          </div>
                          <ChefHat className="h-12 w-12 text-orange-400" />
                        </div>
                      </Card>

                      <Card className="p-4 bg-offwhite shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Product Types</p>
                            <p className="text-3xl font-bold text-blue-600">{productionBatches.length}</p>
                          </div>
                          <Layers className="h-12 w-12 text-blue-400" />
                        </div>
                      </Card>

                      <Card className="p-4 bg-offwhite shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">Completed Batches</p>
                            <p className="text-3xl font-bold text-green-600">
                              {completedBatches.size}/{productionBatches.length}
                            </p>
                          </div>
                          <CheckSquare className="h-12 w-12 text-green-400" />
                        </div>
                      </Card>
                    </div>

                    {/* Production Batches */}
                    {productionBatches.map((batch) => (
                      <Card key={batch.productId} className={`p-6 ${completedBatches.has(batch.productId) ? 'bg-green-50 border-green-300' : 'bg-offwhite shadow-lg border border-gray-200'}`}>
                        <div className="space-y-4">
                          {/* Batch Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{batch.productName}</h3>
                                {completedBatches.has(batch.productId) && (
                                  <Badge className="bg-green-100 text-green-800 border-green-300">
                                    ? Complete
                                  </Badge>
                                )}
                              </div>
                              <p className="text-3xl font-bold text-blue-600 mb-2">
                                {batch.totalQuantity} units to produce
                              </p>
                              <p className="text-sm text-gray-600">
                                For {batch.orders.length} customer{batch.orders.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {batch.recipe && (
                                <Button
                                  variant="secondary"
                                  onClick={() => setExpandedRecipe(expandedRecipe === batch.productId ? null : batch.productId)}
                                  className="text-sm"
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  {expandedRecipe === batch.productId ? 'Hide' : 'View'} Recipe
                                </Button>
                              )}
                              <Button
                                onClick={() => toggleBatchComplete(batch.productId)}
                                className={completedBatches.has(batch.productId) 
                                  ? 'bg-gray-400 hover:bg-gray-500' 
                                  : 'bg-green-500 hover:bg-green-600'}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {completedBatches.has(batch.productId) ? 'Mark Incomplete' : 'Mark Complete'}
                              </Button>
                            </div>
                          </div>

                          {/* Ingredient Breakdown */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                              <Package className="h-5 w-5" />
                              Total Ingredients Needed
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(batch.ingredients).map(([key, value]) => {
                                const ingredientName = key.split('-')[0];
                                return (
                                  <div key={key} className="bg-white rounded-lg p-3 border border-blue-200">
                                    <div className="text-sm text-gray-600">{ingredientName}</div>
                                    <div className="text-lg font-bold text-gray-900">
                                      {value.quantity.toFixed(1)} {value.unit}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Recipe/SOP */}
                          {batch.recipe && expandedRecipe === batch.productId && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Production Guide - {batch.recipe.name}
                              </h4>
                              <div className="space-y-3">
                                {batch.recipe.steps.map((step) => (
                                  <div key={step.stepNumber} className="bg-white rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                                        {step.stepNumber}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-gray-900">{step.instruction}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Duration: {step.duration} minutes
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Breakdown */}
                          <details className="bg-gray-50 border border-gray-200 rounded-lg">
                            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
                              View Order Breakdown ({batch.orders.length} orders)
                            </summary>
                            <div className="p-4 border-t border-gray-200 space-y-2">
                              {batch.orders.map((order, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                  <div>
                                    <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                    <span className="text-gray-600 ml-2">- {order.customerName}</span>
                                  </div>
                                  <div className="font-bold text-blue-600">{order.quantity} units</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      </Card>
                    ))}
                  </div>
              </div>
            )}

            {/* Fulfillment Center View */}
            {viewMode === 'fulfillment' && (
              <div className="space-y-6">
                {/* Fulfillment Center Header */}
                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg p-6 text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Fulfillment Center</h2>
                    <p className="text-white/90">
                      Package individual orders, print labels, and mark complete
                    </p>
                  </div>
                </div>

                {/* Fulfillment Instructions */}
                <Card className="p-6 bg-[#F7F2EC] shadow-md border border-gray-200">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Fulfillment Instructions</h3>
                      <p className="text-blue-800">
                        Package each order individually, print customer labels, 
                        and mark orders as ready for pickup/delivery. Check off each order as you complete it.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Individual Orders for Fulfillment */}
                {orders.map((order) => (
                  <Card key={order.id} className="p-6 bg-[#F7F2EC] shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Order Header */}
                      <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Customer:</span>
                              <span className="ml-2 font-medium text-gray-900">{order.customerName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <span className="ml-2 font-medium text-gray-900">{order.phone}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {order.dueAt ? new Date(order.dueAt).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Total:</span>
                              <span className="ml-2 font-bold text-green-600">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            className="text-sm"
                            onClick={() => handlePrintLabel(order)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Label
                          </Button>
                          <Button className="bg-green-500 hover:bg-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">Items to Package:</h4>
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-500" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{item.productName}</div>
                                <div className="text-sm text-gray-600">
                                  Quantity: <span className="font-bold text-blue-600">{item.quantity}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Unit Price</div>
                                <div className="font-medium text-gray-900">${item.unitPrice.toFixed(2)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Total</div>
                                <div className="font-bold text-gray-900">${item.total.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-900 mb-2">Special Instructions:</h4>
                          <p className="text-yellow-800">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
            
        {/* System Messages Drawer */}
        <SystemMessagesDrawer
          isOpen={showSystemMessages}
          onClose={() => setShowSystemMessages(false)}
          scope="orders"
        />

        {/* AI Insights Drawer */}
        <AIInsightsDrawer
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
          insights={aiInsights || { rush: [], batching: [], shortages: [], prepPlan: [] }}
          isLoading={isLoadingInsights}
        />

        {/* View Order Modal */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Details - {viewingOrder.orderNumber}</h3>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Customer Info */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{viewingOrder.customerName}</span>
                    </div>
                    {viewingOrder.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{viewingOrder.customerEmail}</span>
                      </div>
                    )}
                    {viewingOrder.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-900">{viewingOrder.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Status</span>
                      <div className="mt-1">
                        <Badge className={getStatusColor(viewingOrder.status)}>
                          {viewingOrder.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Priority</span>
                      <div className="mt-1">
                        <Badge className={getPriorityColor(viewingOrder.priority)}>
                          {viewingOrder.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Payment Status</span>
                      <p className="font-medium text-gray-900 mt-1">{viewingOrder.paymentStatus}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-600">Due Date</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {viewingOrder.dueAt ? new Date(viewingOrder.dueAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {viewingOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-600">Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">${item.total.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">${viewingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setViewingOrder(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewingOrder(null);
                  setEditingOrder(viewingOrder);
                }}>
                  Edit Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Order - {editingOrder.orderNumber}</h3>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 text-sm">
                    💡 <strong>Quick Edit:</strong> Update order status, priority, or customer information below.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      defaultValue={editingOrder.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select order status"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="IN_PRODUCTION">In Production</option>
                      <option value="READY">Ready</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="PICKED_UP">Picked Up</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select 
                      defaultValue={editingOrder.priority}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select order priority"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      defaultValue={editingOrder.customerName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Customer name"
                      title="Customer name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={editingOrder.customerEmail}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="customer@email.com"
                        title="Customer email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        defaultValue={editingOrder.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                        title="Customer phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="datetime-local"
                      defaultValue={editingOrder.dueAt ? new Date(editingOrder.dueAt).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Order due date"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setEditingOrder(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success(`Order ${editingOrder.orderNumber} updated successfully!`);
                  setEditingOrder(null);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Label Print Modal */}
        {showLabelModal && selectedOrderForLabel && (
          <SimpleLabelPrintModal
            isOpen={showLabelModal}
            onClose={() => {
              setShowLabelModal(false);
              setSelectedOrderForLabel(null);
              handlePrintLabelSuccess();
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            orders={[selectedOrderForLabel as any]} // Type mismatch between Order types
          />
        )}
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorOrdersPage;
