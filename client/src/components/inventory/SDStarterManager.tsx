import React, { useState } from 'react';
import { FlaskConical, Clock, TrendingUp, AlertTriangle, Brain, Calendar, Users, Eye, Edit, X, Plus, BookOpen, Wheat, Thermometer, Star, Lightbulb } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PendingOrder {
  id: string;
  customerName: string;
  product: string;
  quantity: number;
  leadTime: number; // in days
  orderDate: string;
  dueDate: string;
}

interface FeedingSchedule {
  id: string;
  batchId: string;
  scheduledTime: string; // ISO date string
  isRecurring: boolean;
  intervalHours: number;
  lastFeeding?: string;
  nextFeeding: string;
  isActive: boolean;
}

interface FeedingRecord {
  id: string;
  batchId: string;
  feedingDate: string;
  flourAmount: number;
  waterAmount: number;
  temperature: number;
  notes?: string;
  growthObservation: 'excellent' | 'good' | 'slow' | 'concerning';
}

interface StarterBatch {
  id: string;
  name: string;
  quantity: number; // in grams
  startDate: string;
  maturityDate: string;
  status: 'feeding' | 'mature' | 'ready' | 'expired';
  growthRate: number; // percentage per day
  temperature: number;
  hydration: number; // percentage
  // Flour type and flavoring
  flourType: 'whole_wheat' | 'rye' | 'white_flour' | 'cake_flour' | 'spelt' | 'einkorn' | 'blend';
  flourBlend?: string; // for custom blends
  // Flavor profile tracking
  flavorProfile: {
    primary: 'buttery' | 'malty' | 'fruity' | 'tangy' | 'sharp' | 'earthy' | 'sweet_cereal';
    intensity: 'mild' | 'moderate' | 'strong';
    notes: string[];
  };
  // Feeding schedule and environment
  feedingFrequency: 'frequent' | 'regular' | 'infrequent'; // 8-12hrs, 12-24hrs, 24-48hrs
  storageTemp: number; // storage temperature
  waterSource: 'filtered' | 'tap' | 'spring' | 'distilled';
  // Flavor influence factors
  flavorFactors: {
    acidLevel: 'low' | 'medium' | 'high';
    yeastActivity: 'low' | 'medium' | 'high';
    bacterialBalance: 'lactic_dominant' | 'acetic_dominant' | 'balanced';
  };
}

interface StarterInsight {
  id: string;
  type: 'growth' | 'temperature' | 'hydration' | 'timing';
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_qty: number;
  reorder_point: number;
  avg_cost: number;
}

interface FeedingIngredient {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  currentStock: number;
  available: boolean;
}

const SDStarterManager: React.FC = () => {
  // Modal states
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showGrowthChartsModal, setShowGrowthChartsModal] = useState(false);
  const [showViewBatchModal, setShowViewBatchModal] = useState(false);
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StarterBatch | null>(null);
  const [selectedBatchForFeeding, setSelectedBatchForFeeding] = useState<StarterBatch | null>(null);

  // Mock inventory data for starter feeding ingredients
  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: 'flour-ww',
      name: 'Whole Wheat Flour',
      category: 'Flour',
      unit: 'grams',
      current_qty: 5000,
      reorder_point: 500,
      avg_cost: 0.02
    },
    {
      id: 'flour-white',
      name: 'White Bread Flour',
      category: 'Flour',
      unit: 'grams',
      current_qty: 8000,
      reorder_point: 1000,
      avg_cost: 0.015
    },
    {
      id: 'flour-rye',
      name: 'Rye Flour',
      category: 'Flour',
      unit: 'grams',
      current_qty: 2000,
      reorder_point: 300,
      avg_cost: 0.025
    },
    {
      id: 'water',
      name: 'Filtered Water',
      category: 'Liquid',
      unit: 'ml',
      current_qty: 10000,
      reorder_point: 1000,
      avg_cost: 0.001
    }
  ]);
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingSchedule[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  
  // Form states
  const [newBatchForm, setNewBatchForm] = useState({
    name: '',
    quantity: 0,
    temperature: 72,
    hydration: 75,
    flourType: 'white_flour' as StarterBatch['flourType'],
    flourBlend: '',
    flavorProfile: {
      primary: 'buttery' as StarterBatch['flavorProfile']['primary'],
      intensity: 'mild' as StarterBatch['flavorProfile']['intensity'],
      notes: [] as string[]
    },
    feedingFrequency: 'regular' as StarterBatch['feedingFrequency'],
    storageTemp: 72,
    waterSource: 'filtered' as StarterBatch['waterSource']
  });

  const [feedingForm, setFeedingForm] = useState({
    flourAmount: 0,
    waterAmount: 0,
    temperature: 72,
    notes: '',
    growthObservation: 'good' as FeedingRecord['growthObservation']
  });

  const [scheduleForm, setScheduleForm] = useState({
    scheduledTime: '',
    isRecurring: true,
    intervalHours: 12
  });

  const [activeOrders] = useState<PendingOrder[]>([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      product: 'Sourdough Bread (2 loaves)',
      quantity: 2,
      leadTime: 3,
      orderDate: '2024-01-15',
      dueDate: '2024-01-18'
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      product: 'Sourdough Rolls (12 pack)',
      quantity: 12,
      leadTime: 2,
      orderDate: '2024-01-16',
      dueDate: '2024-01-18'
    },
    {
      id: '3',
      customerName: 'Emily Rodriguez',
      product: 'Sourdough Baguettes (4 pack)',
      quantity: 4,
      leadTime: 4,
      orderDate: '2024-01-14',
      dueDate: '2024-01-18'
    }
  ]);

  const [starterBatches, setStarterBatches] = useState<StarterBatch[]>([
    {
      id: '1',
      name: 'Main Starter',
      quantity: 500,
      startDate: '2024-01-10',
      maturityDate: '2024-01-17',
      status: 'mature',
      growthRate: 2.5,
      temperature: 72,
      hydration: 75,
      flourType: 'whole_wheat',
      flavorProfile: {
        primary: 'malty',
        intensity: 'moderate',
        notes: ['nutty', 'warm', 'toasted grain']
      },
      feedingFrequency: 'regular',
      storageTemp: 72,
      waterSource: 'filtered',
      flavorFactors: {
        acidLevel: 'medium',
        yeastActivity: 'high',
        bacterialBalance: 'balanced'
      }
    },
    {
      id: '2',
      name: 'Backup Starter',
      quantity: 300,
      startDate: '2024-01-12',
      maturityDate: '2024-01-19',
      status: 'feeding',
      growthRate: 1.8,
      temperature: 68,
      hydration: 80,
      flourType: 'rye',
      flavorProfile: {
        primary: 'tangy',
        intensity: 'strong',
        notes: ['sharp', 'complex', 'earthy']
      },
      feedingFrequency: 'infrequent',
      storageTemp: 68,
      waterSource: 'spring',
      flavorFactors: {
        acidLevel: 'high',
        yeastActivity: 'medium',
        bacterialBalance: 'acetic_dominant'
      }
    },
    {
      id: '3',
      name: 'Emergency Starter',
      quantity: 200,
      startDate: '2024-01-14',
      maturityDate: '2024-01-21',
      status: 'feeding',
      growthRate: 3.2,
      temperature: 75,
      hydration: 70,
      flourType: 'white_flour',
      flavorProfile: {
        primary: 'buttery',
        intensity: 'mild',
        notes: ['sweet', 'clean', 'creamy']
      },
      feedingFrequency: 'frequent',
      storageTemp: 75,
      waterSource: 'filtered',
      flavorFactors: {
        acidLevel: 'low',
        yeastActivity: 'high',
        bacterialBalance: 'lactic_dominant'
      }
    }
  ]);

  const [starterInsights] = useState<StarterInsight[]>([
    {
      id: '1',
      type: 'growth',
      severity: 'medium',
      message: 'Backup Starter growing slower than expected',
      recommendation: 'Increase feeding frequency to twice daily and maintain 72-75°F temperature',
      icon: TrendingUp
    },
    {
      id: '2',
      type: 'temperature',
      severity: 'low',
      message: 'Emergency Starter temperature slightly high',
      recommendation: 'Move to cooler location or reduce ambient temperature by 2-3°F',
      icon: AlertTriangle
    },
    {
      id: '3',
      type: 'hydration',
      severity: 'low',
      message: 'Main Starter hydration optimal for bread making',
      recommendation: 'Continue current feeding schedule - hydration levels are perfect',
      icon: FlaskConical
    },
    {
      id: '4',
      type: 'timing',
      severity: 'high',
      message: 'Need to prepare additional starter for weekend orders',
      recommendation: 'Start feeding Main Starter more aggressively 2 days before weekend production',
      icon: Clock
    }
  ]);

  const calculateRequiredStarter = () => {
    // Calculate based on pending orders and their lead times
    const totalLoaves = activeOrders.reduce((sum, order) => {
      if (order.product.includes('Bread')) {
        return sum + order.quantity;
      } else if (order.product.includes('Rolls')) {
        return sum + Math.ceil(order.quantity / 6); // 6 rolls per loaf equivalent
      } else if (order.product.includes('Baguettes')) {
        return sum + Math.ceil(order.quantity / 2); // 2 baguettes per loaf equivalent
      }
      return sum;
    }, 0);

    // Estimate starter needed (roughly 20% of flour weight per loaf)
    const starterNeeded = totalLoaves * 150; // 150g starter per loaf
    return starterNeeded;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mature': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'feeding': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Handler functions
  const handleViewBatch = (batch: StarterBatch) => {
    setSelectedBatch(batch);
    setShowViewBatchModal(true);
  };

  const handleEditBatch = (batch: StarterBatch) => {
    setSelectedBatch(batch);
    setShowEditBatchModal(true);
  };

  const handleStartNewBatch = () => {
    setNewBatchForm({
      name: '',
      quantity: 0,
      temperature: 72,
      hydration: 75,
      flourType: 'white_flour',
      flourBlend: '',
      flavorProfile: {
        primary: 'buttery',
        intensity: 'mild',
        notes: []
      },
      feedingFrequency: 'regular',
      storageTemp: 72,
      waterSource: 'filtered'
    });
    setShowNewBatchModal(true);
  };

  const handleCreateNewBatch = () => {
    if (newBatchForm.name && newBatchForm.quantity > 0) {
      const newBatch: StarterBatch = {
        id: `batch-${Date.now()}`,
        name: newBatchForm.name,
        quantity: newBatchForm.quantity,
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        status: 'feeding',
        growthRate: Math.random() * 2 + 1, // Random growth rate between 1-3%
        temperature: newBatchForm.temperature,
        hydration: newBatchForm.hydration,
        flourType: newBatchForm.flourType,
        flourBlend: newBatchForm.flourBlend,
        flavorProfile: newBatchForm.flavorProfile,
        feedingFrequency: newBatchForm.feedingFrequency,
        storageTemp: newBatchForm.storageTemp,
        waterSource: newBatchForm.waterSource,
        flavorFactors: {
          acidLevel: 'medium',
          yeastActivity: 'high',
          bacterialBalance: 'balanced'
        }
      };
      
      setStarterBatches(prev => [...prev, newBatch]);
      setNewBatchForm({ 
        name: '', 
        quantity: 0, 
        temperature: 72, 
        hydration: 75,
        flourType: 'white_flour',
        flourBlend: '',
        flavorProfile: {
          primary: 'buttery',
          intensity: 'mild',
          notes: []
        },
        feedingFrequency: 'regular',
        storageTemp: 72,
        waterSource: 'filtered'
      });
      setShowNewBatchModal(false);
      alert('New starter batch created successfully!');
    }
  };

  const handleScheduleFeeding = (batch: StarterBatch) => {
    setSelectedBatchForFeeding(batch);
    setScheduleForm({
      scheduledTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
      isRecurring: true,
      intervalHours: batch.feedingFrequency === 'frequent' ? 8 : batch.feedingFrequency === 'regular' ? 12 : 24
    });
  };

  const handleSaveSchedule = () => {
    if (!selectedBatchForFeeding) return;
    
    const newSchedule: FeedingSchedule = {
      id: Date.now().toString(),
      batchId: selectedBatchForFeeding.id,
      scheduledTime: scheduleForm.scheduledTime,
      isRecurring: scheduleForm.isRecurring,
      intervalHours: scheduleForm.intervalHours,
      nextFeeding: scheduleForm.scheduledTime,
      isActive: true
    };
    
    setFeedingSchedules(prev => [...prev, newSchedule]);
    setShowScheduleModal(false);
    setSelectedBatchForFeeding(null);
  };

  const handleAddFeeding = (batch: StarterBatch) => {
    setSelectedBatchForFeeding(batch);
    setFeedingForm({
      flourAmount: batch.quantity * 0.5, // Default to 50% of current quantity
      waterAmount: (batch.quantity * 0.5) * (batch.hydration / 100),
      temperature: batch.temperature,
      notes: '',
      growthObservation: 'good'
    });
    setShowFeedingModal(true);
  };

  const handleSaveFeeding = () => {
    if (!selectedBatchForFeeding) return;
    
    const newFeeding: FeedingRecord = {
      id: Date.now().toString(),
      batchId: selectedBatchForFeeding.id,
      feedingDate: new Date().toISOString(),
      flourAmount: feedingForm.flourAmount,
      waterAmount: feedingForm.waterAmount,
      temperature: feedingForm.temperature,
      notes: feedingForm.notes,
      growthObservation: feedingForm.growthObservation
    };
    
    setFeedingRecords(prev => [...prev, newFeeding]);
    
    // Update the batch quantity
    setStarterBatches(prev => prev.map(batch => 
      batch.id === selectedBatchForFeeding.id 
        ? { ...batch, quantity: batch.quantity + feedingForm.flourAmount + feedingForm.waterAmount }
        : batch
    ));
    
    setShowFeedingModal(false);
    setSelectedBatchForFeeding(null);
  };

  const handleUpdateBatch = () => {
    if (selectedBatch) {
      setStarterBatches(prev => prev.map(batch => 
        batch.id === selectedBatch.id ? { ...selectedBatch } : batch
      ));
      setShowEditBatchModal(false);
      setSelectedBatch(null);
      alert('Starter batch updated successfully!');
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    if (confirm('Are you sure you want to delete this starter batch?')) {
      setStarterBatches(prev => prev.filter(batch => batch.id !== batchId));
      alert('Starter batch deleted successfully!');
    }
  };

  // Calculate feeding ingredients based on batch type and quantity
  const calculateFeedingIngredients = (batch: StarterBatch): FeedingIngredient[] => {
    const baseQuantity = Math.max(50, Math.floor(batch.quantity * 0.2)); // 20% of current quantity, minimum 50g
    
    const ingredients: FeedingIngredient[] = [];
    
    // Determine flour type and quantity based on batch flourType
    let flourItem: InventoryItem | undefined;
    const flourQuantity = baseQuantity;
    
    switch (batch.flourType) {
      case 'whole_wheat':
        flourItem = inventoryItems.find(item => item.id === 'flour-ww');
        break;
      case 'rye':
        flourItem = inventoryItems.find(item => item.id === 'flour-rye');
        break;
      case 'white_flour':
      case 'cake_flour':
        flourItem = inventoryItems.find(item => item.id === 'flour-white');
        break;
      default:
        flourItem = inventoryItems.find(item => item.id === 'flour-white');
    }
    
    if (flourItem) {
      ingredients.push({
        inventoryItemId: flourItem.id,
        name: flourItem.name,
        quantity: flourQuantity,
        unit: flourItem.unit,
        currentStock: flourItem.current_qty,
        available: flourItem.current_qty >= flourQuantity
      });
    }
    
    // Add water based on hydration percentage
    const waterItem = inventoryItems.find(item => item.id === 'water');
    if (waterItem) {
      const waterQuantity = Math.floor((baseQuantity * batch.hydration) / 100);
      ingredients.push({
        inventoryItemId: waterItem.id,
        name: waterItem.name,
        quantity: waterQuantity,
        unit: waterItem.unit,
        currentStock: waterItem.current_qty,
        available: waterItem.current_qty >= waterQuantity
      });
    }
    
    return ingredients;
  };

  // Execute feeding and deduct from inventory
  const handleExecuteFeeding = (batch: StarterBatch, ingredients: FeedingIngredient[]) => {
    // Check if all ingredients are available
    const unavailableIngredients = ingredients.filter(ing => !ing.available);
    if (unavailableIngredients.length > 0) {
      const names = unavailableIngredients.map(ing => ing.name).join(', ');
      alert(`Cannot feed starter. Insufficient inventory for: ${names}`);
      return;
    }
    
    // Update starter batch quantity (grows by ~25% after feeding)
    const updatedBatch = {
      ...batch,
      quantity: Math.floor(batch.quantity * 1.25)
    };
    
    // Update state (in a real app, this would be API calls)
    setStarterBatches(prev => prev.map(b => b.id === batch.id ? updatedBatch : b));
    
    // Record the feeding
    const feedingRecord: FeedingRecord = {
      id: `feeding-${Date.now()}`,
      batchId: batch.id,
      feedingDate: new Date().toISOString(),
      flourAmount: ingredients.find(ing => ing.name.includes('Flour'))?.quantity || 0,
      waterAmount: ingredients.find(ing => ing.name.includes('Water'))?.quantity || 0,
      temperature: batch.temperature,
      growthObservation: 'good',
      notes: `Feeding completed with ${ingredients.map(ing => `${ing.quantity}${ing.unit} ${ing.name}`).join(', ')}`
    };
    
    setFeedingRecords(prev => [...prev, feedingRecord]);
    
    alert(`Feeding completed successfully! ${batch.name} now has ${updatedBatch.quantity}g. Inventory updated.`);
    setShowFeedingModal(false);
  };


  const requiredStarter = calculateRequiredStarter();
  const availableStarter = starterBatches
    .filter(batch => batch.status === 'mature' || batch.status === 'ready')
    .reduce((sum, batch) => sum + batch.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            SD Starter Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage sourdough starters based on pending orders and AI-powered troubleshooting
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Required Starter</p>
              <p className="text-2xl font-bold text-purple-600">{requiredStarter}g</p>
            </div>
            <FlaskConical className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Starter</p>
              <p className="text-2xl font-bold text-green-600">{availableStarter}g</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-orange-600">{starterBatches.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Pending Orders */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pending Orders & Lead Times</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starter Needed</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeOrders.map((order) => {
                const starterNeeded = order.product.includes('Bread') ? order.quantity * 150 :
                                    order.product.includes('Rolls') ? Math.ceil(order.quantity / 6) * 150 :
                                    Math.ceil(order.quantity / 2) * 150;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.leadTime} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {starterNeeded}g
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Starter Batches */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Starter Batches</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flour Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flavor Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hydration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ready Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {starterBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {batch.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">{batch.flourType.replace('_', ' ')}</span>
                      {batch.flourBlend && (
                        <span className="text-xs text-gray-500">{batch.flourBlend}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">{batch.flavorProfile.primary}</span>
                      <span className="text-xs text-gray-500">{batch.flavorProfile.intensity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.quantity}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.growthRate}%/day
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.temperature}°F
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.hydration}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.maturityDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewBatch(batch)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View batch details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditBatch(batch)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit batch"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete batch"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          className="flex items-center gap-2"
          onClick={handleStartNewBatch}
        >
          <FlaskConical className="h-4 w-4" />
          Start New Batch
        </Button>
        <Button 
          variant="secondary" 
          className="flex items-center gap-2"
          onClick={() => setShowScheduleModal(true)}
        >
          <Clock className="h-4 w-4" />
          Schedule Feedings
        </Button>
        <Button 
          variant="secondary" 
          className="flex items-center gap-2"
          onClick={() => setShowGrowthChartsModal(true)}
        >
          <TrendingUp className="h-4 w-4" />
          View Growth Charts
        </Button>
      </div>

      {/* AI Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Starter Insights</h3>
        </div>
        <div className="space-y-3">
          {starterInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className={`p-4 border rounded-lg ${getSeverityColor(insight.severity)}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    insight.severity === 'high' ? 'text-red-600' :
                    insight.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                    <p className="text-sm text-gray-600 mt-1">{insight.recommendation}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                    insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {insight.severity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Flavor Influence Guidelines */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">Flavor Influence Guidelines</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flour Type Influence */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-600" />
              Flour Type Impact
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Whole Wheat:</span>
                <span className="text-amber-700 font-medium">Nutty, earthy, malty</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rye:</span>
                <span className="text-amber-700 font-medium">Sharp, tangy, complex</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">White Flour:</span>
                <span className="text-amber-700 font-medium">Mild, buttery, clean</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Spelt:</span>
                <span className="text-amber-700 font-medium">Sweet, nutty, fruity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Einkorn:</span>
                <span className="text-amber-700 font-medium">Rich, buttery, ancient</span>
              </div>
            </div>
          </div>

          {/* Environmental Factors */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-600" />
              Environmental Factors
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="text-blue-700 font-medium">Higher = more sour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hydration:</span>
                <span className="text-blue-700 font-medium">Higher = more tangy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Feeding:</span>
                <span className="text-blue-700 font-medium">Frequent = milder</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water Source:</span>
                <span className="text-blue-700 font-medium">Filtered = cleanest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flavor Family Classification */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Flavor Family Classification
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-amber-800 mb-2">Buttery Family</h5>
              <p className="text-amber-700">White flour, cake flour, einkorn</p>
              <p className="text-amber-600 text-xs mt-1">Mild, clean, versatile</p>
            </div>
            <div>
              <h5 className="font-medium text-amber-800 mb-2">Malty Family</h5>
              <p className="text-amber-700">Whole wheat, spelt</p>
              <p className="text-amber-600 text-xs mt-1">Nutty, warm, toasty</p>
            </div>
            <div>
              <h5 className="font-medium text-amber-800 mb-2">Tangy Family</h5>
              <p className="text-amber-700">Rye, high hydration</p>
              <p className="text-amber-600 text-xs mt-1">Sharp, complex, bold</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Flavor Development Tips
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use whole wheat for deeper, more complex flavors</li>
            <li>• Higher temperatures (75-80°F) develop more sourness</li>
            <li>• Lower hydration (60-70%) creates milder flavors</li>
            <li>• Frequent feeding (every 8-12 hours) keeps flavors clean</li>
            <li>• Filtered water provides the cleanest base flavor</li>
            <li>• Blend different flours for unique flavor profiles</li>
          </ul>
        </div>
      </Card>

      {/* Pending Orders */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pending Orders & Lead Times</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starter Needed</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeOrders.map((order) => {
                const starterNeeded = order.product.includes('Bread') ? order.quantity * 150 :
                                    order.product.includes('Rolls') ? Math.ceil(order.quantity / 6) * 150 :
                                    Math.ceil(order.quantity / 2) * 150;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.leadTime} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {starterNeeded}g
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>



      {/* Start New Batch Modal */}
      {showNewBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start New Starter Batch</h3>
              <button
                onClick={() => setShowNewBatchModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                <input
                  type="text"
                  value={newBatchForm.name}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Main Starter, Backup Starter"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Quantity (grams)</label>
                <input
                  type="number"
                  value={newBatchForm.quantity}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°F)</label>
                <input
                  type="number"
                  value={newBatchForm.temperature}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="72"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hydration (%)</label>
                <input
                  type="number"
                  value={newBatchForm.hydration}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, hydration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="75"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flour Type</label>
                <select
                  value={newBatchForm.flourType}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, flourType: e.target.value as StarterBatch['flourType'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Select flour type for the starter"
                >
                  <option value="whole_wheat">Whole Wheat</option>
                  <option value="rye">Rye</option>
                  <option value="white_flour">White Flour</option>
                  <option value="cake_flour">Cake Flour</option>
                  <option value="spelt">Spelt</option>
                  <option value="einkorn">Einkorn</option>
                  <option value="blend">Custom Blend</option>
                </select>
              </div>
              
              {newBatchForm.flourType === 'blend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flour Blend Description</label>
                  <input
                    type="text"
                    value={newBatchForm.flourBlend}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, flourBlend: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="50% whole wheat, 30% rye, 20% white"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Frequency</label>
                <select
                  value={newBatchForm.feedingFrequency}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, feedingFrequency: e.target.value as StarterBatch['feedingFrequency'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Select feeding frequency for the starter"
                >
                  <option value="frequent">Frequent (8-12 hours)</option>
                  <option value="regular">Regular (12-24 hours)</option>
                  <option value="infrequent">Infrequent (24-48 hours)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Temperature (°F)</label>
                <input
                  type="number"
                  value={newBatchForm.storageTemp}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, storageTemp: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="72"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Water Source</label>
                <select
                  value={newBatchForm.waterSource}
                  onChange={(e) => setNewBatchForm(prev => ({ ...prev, waterSource: e.target.value as StarterBatch['waterSource'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Select water source for the starter"
                >
                  <option value="filtered">Filtered</option>
                  <option value="tap">Tap Water</option>
                  <option value="spring">Spring Water</option>
                  <option value="distilled">Distilled</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowNewBatchModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNewBatch}
                disabled={!newBatchForm.name || newBatchForm.quantity <= 0}
              >
                Create Batch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Batch Modal */}
      {showViewBatchModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Batch Details</h3>
              <button
                onClick={() => setShowViewBatchModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{selectedBatch.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Flour Type:</span>
                <span className="capitalize">{selectedBatch.flourType.replace('_', ' ')}</span>
              </div>
              {selectedBatch.flourBlend && (
                <div className="flex justify-between">
                  <span className="font-medium">Flour Blend:</span>
                  <span>{selectedBatch.flourBlend}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Flavor Profile:</span>
                <span className="capitalize">{selectedBatch.flavorProfile.primary} ({selectedBatch.flavorProfile.intensity})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Quantity:</span>
                <span>{selectedBatch.quantity}g</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBatch.status)}`}>
                  {selectedBatch.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Growth Rate:</span>
                <span>{selectedBatch.growthRate}%/day</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Temperature:</span>
                <span>{selectedBatch.temperature}°F</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Hydration:</span>
                <span>{selectedBatch.hydration}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Feeding Frequency:</span>
                <span className="capitalize">{selectedBatch.feedingFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Storage Temperature:</span>
                <span>{selectedBatch.storageTemp}°F</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Water Source:</span>
                <span className="capitalize">{selectedBatch.waterSource}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Start Date:</span>
                <span>{selectedBatch.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ready Date:</span>
                <span>{selectedBatch.maturityDate}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowViewBatchModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewBatchModal(false);
                  handleEditBatch(selectedBatch);
                }}
              >
                Edit Batch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditBatchModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Starter Batch</h3>
              <button
                onClick={() => setShowEditBatchModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                <input
                  type="text"
                  value={selectedBatch.name}
                  onChange={(e) => setSelectedBatch(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Enter batch name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (grams)</label>
                <input
                  type="number"
                  value={selectedBatch.quantity}
                  onChange={(e) => setSelectedBatch(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Enter quantity in grams"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedBatch.status}
                  onChange={(e) => setSelectedBatch(prev => prev ? { ...prev, status: e.target.value as StarterBatch['status'] } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Select status for the starter batch"
                >
                  <option value="feeding">Feeding</option>
                  <option value="mature">Mature</option>
                  <option value="ready">Ready</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Growth Rate (%/day)</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedBatch.growthRate}
                  onChange={(e) => setSelectedBatch(prev => prev ? { ...prev, growthRate: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Enter growth rate percentage per day"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°F)</label>
                <input
                  type="number"
                  value={selectedBatch.temperature}
                  onChange={(e) => setSelectedBatch(prev => prev ? { ...prev, temperature: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Enter temperature in Fahrenheit"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hydration (%)</label>
                <input
                  type="number"
                  value={selectedBatch.hydration}
                  onChange={(e) => setSelectedBatch(prev => prev ? { ...prev, hydration: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Enter hydration percentage"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowEditBatchModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBatch}
              >
                Update Batch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Feedings Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Feedings</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">Set up feeding schedules for your starter batches:</p>
              
              {starterBatches.filter(batch => batch.status === 'feeding').map((batch) => {
                const feedingIngredients = calculateFeedingIngredients(batch);
                const allAvailable = feedingIngredients.every(ing => ing.available);
                
                return (
                  <div key={batch.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{batch.name}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Quantity: {batch.quantity}g | Temperature: {batch.temperature}°F | Hydration: {batch.hydration}%</p>
                      <p>Flour Type: {batch.flourType?.replace('_', ' ') || 'White Flour'} | Water Source: {batch.waterSource || 'Filtered'}</p>
                    </div>
                    
                    {/* Feeding Ingredients */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Feeding Ingredients Required:</h5>
                      <div className="space-y-2">
                        {feedingIngredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{ingredient.name}</span>
                              <span className="text-sm text-gray-600">
                                {ingredient.quantity}{ingredient.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                Stock: {ingredient.currentStock}{ingredient.unit}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                ingredient.available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {ingredient.available ? 'Available' : 'Low Stock'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {!allAvailable && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">
                            ⚠️ Some ingredients are not available. Cannot feed starter until inventory is restocked.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleScheduleFeeding(batch)}
                        className="flex items-center gap-1 text-sm"
                      >
                        <Clock className="h-3 w-3" />
                        Set Schedule
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedBatchForFeeding(batch);
                          setShowFeedingModal(true);
                        }}
                        variant="secondary" 
                        className="flex items-center gap-1 text-sm"
                        disabled={!allAvailable}
                      >
                        <Plus className="h-3 w-3" />
                        Feed Now
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {starterBatches.filter(batch => batch.status === 'feeding').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No starter batches are currently in feeding status</p>
                  <p className="text-sm">Start new batches to schedule feedings</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Growth Charts Modal */}
      {showGrowthChartsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Growth Charts</h3>
              <button
                onClick={() => setShowGrowthChartsModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {starterBatches.map((batch) => (
                <div key={batch.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{batch.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Growth Rate</h5>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">{batch.growthRate}%</span>
                        <span className="text-sm text-blue-600">/day</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(batch.growthRate * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">Temperature</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">{batch.temperature}°F</span>
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        {batch.temperature >= 70 && batch.temperature <= 75 ? 'Optimal' : 'Needs adjustment'}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-2">Hydration</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-purple-600">{batch.hydration}%</span>
                      </div>
                      <div className="text-sm text-purple-600 mt-1">
                        {batch.hydration >= 70 && batch.hydration <= 80 ? 'Optimal' : 'Needs adjustment'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Growth Timeline</h5>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Started: {batch.startDate}</span>
                      <span>→</span>
                      <span>Ready: {batch.maturityDate}</span>
                      <span>→</span>
                      <span>Current: {batch.quantity}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowGrowthChartsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Feeding Modal */}
      {showFeedingModal && selectedBatchForFeeding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Feeding Record</h3>
              <button
                onClick={() => setShowFeedingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <p className="text-sm text-gray-600">{selectedBatchForFeeding.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flour Amount (g)</label>
                <input
                  type="number"
                  value={feedingForm.flourAmount}
                  onChange={(e) => setFeedingForm(prev => ({ ...prev, flourAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Amount of flour to add"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Water Amount (g)</label>
                <input
                  type="number"
                  value={feedingForm.waterAmount}
                  onChange={(e) => setFeedingForm(prev => ({ ...prev, waterAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Amount of water to add"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  value={feedingForm.temperature}
                  onChange={(e) => setFeedingForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Temperature during feeding"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Observation</label>
                <select
                  value={feedingForm.growthObservation}
                  onChange={(e) => setFeedingForm(prev => ({ ...prev, growthObservation: e.target.value as FeedingRecord['growthObservation'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="How is the starter growing?"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="slow">Slow</option>
                  <option value="concerning">Concerning</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={feedingForm.notes}
                  onChange={(e) => setFeedingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any observations or notes..."
                  title="Additional notes about this feeding"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowFeedingModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveFeeding}>
                Save Feeding
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Feeding Modal */}
      {showScheduleModal && selectedBatchForFeeding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Feeding</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <p className="text-sm text-gray-600">{selectedBatchForFeeding.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="When should the feeding occur?"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleForm.isRecurring}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring Schedule</span>
                </label>
              </div>
              
              {scheduleForm.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interval (hours)</label>
                  <input
                    type="number"
                    value={scheduleForm.intervalHours}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, intervalHours: parseInt(e.target.value) || 12 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    title="How often should feedings occur?"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSchedule}>
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feeding Modal */}
      {showFeedingModal && selectedBatchForFeeding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Feed Starter: {selectedBatchForFeeding.name}</h3>
              <button
                onClick={() => setShowFeedingModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Batch Info</h4>
                <div className="text-sm text-blue-800">
                  <p>Quantity: {selectedBatchForFeeding.quantity}g</p>
                  <p>Hydration: {selectedBatchForFeeding.hydration}%</p>
                  <p>Temperature: {selectedBatchForFeeding.temperature}°F</p>
                  <p>Flour Type: {selectedBatchForFeeding.flourType?.replace('_', ' ') || 'White Flour'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ingredients to be used:</h4>
                {(() => {
                  const ingredients = calculateFeedingIngredients(selectedBatchForFeeding);
                  const allAvailable = ingredients.every(ing => ing.available);
                  
                  return (
                    <div className="space-y-3">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{ingredient.name}</div>
                            <div className="text-sm text-gray-600">
                              Required: {ingredient.quantity}{ingredient.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Available: {ingredient.currentStock}{ingredient.unit}
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              ingredient.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {ingredient.available ? '✓ Available' : '✗ Low Stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {!allAvailable && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            ⚠️ Cannot proceed with feeding due to insufficient inventory. Please restock ingredients first.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Expected Result</h4>
                <div className="text-sm text-green-800">
                  <p>New quantity: ~{Math.floor(selectedBatchForFeeding.quantity * 1.25)}g (25% growth)</p>
                  <p>Inventory will be automatically updated</p>
                  <p>Feeding record will be created</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowFeedingModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const ingredients = calculateFeedingIngredients(selectedBatchForFeeding);
                  handleExecuteFeeding(selectedBatchForFeeding, ingredients);
                }}
                disabled={!calculateFeedingIngredients(selectedBatchForFeeding).every(ing => ing.available)}
                className="flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                Execute Feeding
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SDStarterManager;
