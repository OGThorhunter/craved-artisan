import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Factory, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Square,
  Eye,
  BarChart3,
  Zap
} from 'lucide-react';
import type { Product, ProductionBatch, ProductionSchedule } from '../../types/products';

interface ProductionManagerProps {
  products: Product[];
  onProductionUpdate: () => void;
}

const ProductionManager: React.FC<ProductionManagerProps> = ({ products, onProductionUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'schedule' | 'analytics'>('overview');
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ProductionSchedule | null>(null);

  // Mock data for demonstration
  const mockBatches: ProductionBatch[] = [
    {
      id: '1',
      productId: '1',
      productName: 'Handcrafted Wooden Bowl',
      batchSize: 12,
      startDate: '2025-08-27T08:00:00Z',
      completionDate: '2025-08-27T16:00:00Z',
      status: 'completed',
      ingredientsUsed: [
        { ingredientId: '1', ingredientName: 'Oak Wood', quantity: 24, unit: 'board feet', cost: 48.00 },
        { ingredientId: '2', ingredientName: 'Wood Finish', quantity: 2, unit: 'quarts', cost: 15.00 }
      ],
      totalCost: 63.00,
      notes: 'High quality batch, excellent grain patterns'
    },
    {
      id: '2',
      productId: '2',
      productName: 'Ceramic Coffee Mug',
      batchSize: 24,
      startDate: '2025-08-28T09:00:00Z',
      status: 'in-progress',
      ingredientsUsed: [
        { ingredientId: '3', ingredientName: 'Clay', quantity: 50, unit: 'pounds', cost: 25.00 },
        { ingredientId: '4', ingredientName: 'Glaze', quantity: 1, unit: 'gallons', cost: 18.00 }
      ],
      totalCost: 43.00,
      notes: 'Standard production run'
    }
  ];

  const mockSchedule: ProductionSchedule[] = [
    {
      id: '1',
      productId: '1',
      productName: 'Handcrafted Wooden Bowl',
      plannedDate: '2025-08-29T08:00:00Z',
      batchSize: 15,
      priority: 'high',
      status: 'scheduled',
      estimatedDuration: 8,
      notes: 'Customer order batch'
    },
    {
      id: '2',
      productId: '3',
      productName: 'Low Margin Test Product',
      plannedDate: '2025-08-30T10:00:00Z',
      batchSize: 50,
      priority: 'medium',
      status: 'scheduled',
      estimatedDuration: 4,
      notes: 'Regular inventory replenishment'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Production Management</h2>
          <p className="text-gray-600">Manage production batches, schedules, and track efficiency</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBatchForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Batch
          </button>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule Production
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'batches', label: 'Production Batches', icon: Factory },
          { id: 'schedule', label: 'Production Schedule', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Production Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockBatches.filter(b => b.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Factory className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockSchedule.filter(s => 
                    new Date(s.plannedDate).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockBatches.filter(b => 
                    b.completionDate && 
                    new Date(b.completionDate).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-orange-600">87%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'batches' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Production Batches</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockBatches.map((batch) => (
              <div key={batch.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{batch.productName}</h4>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(batch.status)}`}>
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">Batch #{batch.id}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Batch Size:</span>
                        <span className="ml-2 font-medium">{batch.batchSize} units</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Start Date:</span>
                        <span className="ml-2 font-medium">{formatDate(batch.startDate)}</span>
                      </div>
                      {batch.completionDate && (
                        <div>
                          <span className="text-sm text-gray-600">Completion:</span>
                          <span className="ml-2 font-medium">{formatDate(batch.completionDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Total Cost:</span>
                        <span className="ml-2 font-medium text-green-600">${batch.totalCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Cost per Unit:</span>
                        <span className="ml-2 font-medium">
                          ${(batch.totalCost / batch.batchSize).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Ingredients Used */}
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Ingredients Used:</h5>
                      <div className="space-y-1">
                        {batch.ingredientsUsed.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {ingredient.ingredientName} ({ingredient.quantity} {ingredient.unit})
                            </span>
                            <span className="font-medium">${ingredient.cost.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {batch.notes && (
                      <div className="text-sm text-gray-600 italic">"{batch.notes}"</div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {batch.status === 'in-progress' && (
                      <>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded" title="Complete batch">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded" title="Pause batch">
                          <Pause className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded" title="Edit batch">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Production Schedule</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockSchedule.map((schedule) => (
              <div key={schedule.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{schedule.productName}</h4>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(schedule.priority)}`}>
                        {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                        {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Planned Date:</span>
                        <span className="ml-2 font-medium">{formatDate(schedule.plannedDate)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Batch Size:</span>
                        <span className="ml-2 font-medium">{schedule.batchSize} units</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{formatDuration(schedule.estimatedDuration)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Dependencies:</span>
                        <span className="ml-2 font-medium">
                          {schedule.dependencies?.length || 0}
                        </span>
                      </div>
                    </div>

                    {schedule.notes && (
                      <div className="text-sm text-gray-600 italic">"{schedule.notes}"</div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {schedule.status === 'scheduled' && (
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Start production">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded" title="Edit schedule">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete schedule">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Production Efficiency Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Efficiency</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Production efficiency charts coming soon...</p>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">$2.45</div>
                <div className="text-sm text-gray-600">Average Cost per Unit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">$8.75</div>
                <div className="text-sm text-gray-600">Average Selling Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">72%</div>
                <div className="text-sm text-gray-600">Average Profit Margin</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Batch Form Modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBatch ? 'Edit Production Batch' : 'New Production Batch'}
              </h2>
              <button
                onClick={() => {
                  setShowBatchForm(false);
                  setEditingBatch(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter batch size"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special instructions or notes..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchForm(false);
                    setEditingBatch(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBatch ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSchedule ? 'Edit Production Schedule' : 'Schedule Production'}
              </h2>
              <button
                onClick={() => {
                  setShowScheduleForm(false);
                  setEditingSchedule(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned Date</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter batch size"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (hours)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special instructions or notes..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setEditingSchedule(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingSchedule ? 'Update Schedule' : 'Schedule Production'}
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
