import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Star,
  Clock,
  Target,
  PieChart
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'lead' | 'prospect' | 'customer' | 'vip' | 'inactive';
  source: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  leadScore: number;
  isVip: boolean;
  createdAt: string;
  lastContactAt?: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: {
    status?: string[];
    source?: string[];
    tags?: string[];
    minSpent?: number;
    maxSpent?: number;
    minOrders?: number;
    maxOrders?: number;
    minLeadScore?: number;
    maxLeadScore?: number;
    createdAfter?: string;
    createdBefore?: string;
    lastContactAfter?: string;
    lastContactBefore?: string;
  };
  customerCount: number;
  totalValue: number;
  averageValue: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomerSegmentationProps {
  customers: Customer[];
  onSegmentSelect: (segment: Segment) => void;
}

const CustomerSegmentation: React.FC<CustomerSegmentationProps> = ({ 
  customers, 
  onSegmentSelect 
}) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [newSegment, setNewSegment] = useState<Partial<Segment>>({
    name: '',
    description: '',
    criteria: {},
  });
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const queryClient = useQueryClient();

  // Load segments from localStorage (in production, this would be an API call)
  useEffect(() => {
    const savedSegments = localStorage.getItem('crm-segments');
    if (savedSegments) {
      setSegments(JSON.parse(savedSegments));
    }
  }, []);

  // Save segments to localStorage
  const saveSegments = (newSegments: Segment[]) => {
    setSegments(newSegments);
    localStorage.setItem('crm-segments', JSON.stringify(newSegments));
  };

  // Apply segment criteria to customers
  const applySegmentCriteria = (criteria: Segment['criteria']): Customer[] => {
    return customers.filter(customer => {
      // Status filter
      if (criteria.status && criteria.status.length > 0) {
        if (!criteria.status.includes(customer.status)) return false;
      }

      // Source filter
      if (criteria.source && criteria.source.length > 0) {
        if (!criteria.source.includes(customer.source)) return false;
      }

      // Tags filter
      if (criteria.tags && criteria.tags.length > 0) {
        if (!criteria.tags.some(tag => customer.tags.includes(tag))) return false;
      }

      // Spending filters
      if (criteria.minSpent !== undefined && customer.totalSpent < criteria.minSpent) return false;
      if (criteria.maxSpent !== undefined && customer.totalSpent > criteria.maxSpent) return false;

      // Order count filters
      if (criteria.minOrders !== undefined && customer.totalOrders < criteria.minOrders) return false;
      if (criteria.maxOrders !== undefined && customer.totalOrders > criteria.maxOrders) return false;

      // Lead score filters
      if (criteria.minLeadScore !== undefined && customer.leadScore < criteria.minLeadScore) return false;
      if (criteria.maxLeadScore !== undefined && customer.leadScore > criteria.maxLeadScore) return false;

      // Date filters
      if (criteria.createdAfter && new Date(customer.createdAt) < new Date(criteria.createdAfter)) return false;
      if (criteria.createdBefore && new Date(customer.createdAt) > new Date(criteria.createdBefore)) return false;

      if (criteria.lastContactAfter && customer.lastContactAt) {
        if (new Date(customer.lastContactAt) < new Date(criteria.lastContactAfter)) return false;
      }
      if (criteria.lastContactBefore && customer.lastContactAt) {
        if (new Date(customer.lastContactAt) > new Date(criteria.lastContactBefore)) return false;
      }

      return true;
    });
  };

  // Update segment statistics
  const updateSegmentStats = (segment: Segment): Segment => {
    const segmentCustomers = applySegmentCriteria(segment.criteria);
    const totalValue = segmentCustomers.reduce((sum, customer) => sum + customer.lifetimeValue, 0);
    const averageValue = segmentCustomers.length > 0 ? totalValue / segmentCustomers.length : 0;

    return {
      ...segment,
      customerCount: segmentCustomers.length,
      totalValue,
      averageValue,
    };
  };

  // Create new segment
  const handleCreateSegment = () => {
    if (!newSegment.name) return;

    const segment: Segment = {
      id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newSegment.name,
      description: newSegment.description || '',
      criteria: newSegment.criteria || {},
      customerCount: 0,
      totalValue: 0,
      averageValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSegment = updateSegmentStats(segment);
    const newSegments = [...segments, updatedSegment];
    saveSegments(newSegments);
    setNewSegment({ name: '', description: '', criteria: {} });
    setIsCreatingSegment(false);
  };

  // Update existing segment
  const handleUpdateSegment = () => {
    if (!editingSegment) return;

    const updatedSegment = {
      ...editingSegment,
      updatedAt: new Date().toISOString(),
    };

    const segmentWithStats = updateSegmentStats(updatedSegment);
    const newSegments = segments.map(segment => 
      segment.id === editingSegment.id ? segmentWithStats : segment
    );
    saveSegments(newSegments);
    setEditingSegment(null);
  };

  // Delete segment
  const handleDeleteSegment = (segmentId: string) => {
    const newSegments = segments.filter(segment => segment.id !== segmentId);
    saveSegments(newSegments);
    if (selectedSegment?.id === segmentId) {
      setSelectedSegment(null);
    }
  };

  // Select segment
  const handleSelectSegment = (segment: Segment) => {
    setSelectedSegment(segment);
    onSegmentSelect(segment);
  };

  // Predefined segments
  const predefinedSegments = [
    {
      name: 'High Value Customers',
      description: 'Customers with lifetime value over $10,000',
      criteria: { minSpent: 10000 },
    },
    {
      name: 'VIP Customers',
      description: 'Customers marked as VIP',
      criteria: { status: ['vip'] },
    },
    {
      name: 'Recent Customers',
      description: 'Customers created in the last 30 days',
      criteria: { 
        createdAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
      },
    },
    {
      name: 'At Risk Customers',
      description: 'Customers with high lead score but no recent contact',
      criteria: { 
        minLeadScore: 70,
        lastContactBefore: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
    },
    {
      name: 'Frequent Buyers',
      description: 'Customers with 5+ orders',
      criteria: { minOrders: 5 },
    },
  ];

  const segmentCustomers = selectedSegment ? applySegmentCriteria(selectedSegment.criteria) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Segmentation</h2>
          <p className="text-gray-600">Create and manage customer segments for targeted marketing</p>
        </div>
        <button
          onClick={() => setIsCreatingSegment(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Segment</span>
        </button>
      </div>

      {/* Predefined Segments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedSegments.map((segment, index) => {
            const segmentCustomers = applySegmentCriteria(segment.criteria);
            const totalValue = segmentCustomers.reduce((sum, customer) => sum + customer.lifetimeValue, 0);
            
            return (
              <div
                key={index}
                onClick={() => {
                  const newSegment: Segment = {
                    id: `predefined_${index}`,
                    name: segment.name,
                    description: segment.description,
                    criteria: segment.criteria,
                    customerCount: segmentCustomers.length,
                    totalValue,
                    averageValue: segmentCustomers.length > 0 ? totalValue / segmentCustomers.length : 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  handleSelectSegment(newSegment);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{segmentCustomers.length} customers</span>
                  <span className="font-semibold text-green-600">${totalValue.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Segments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedSegment?.id === segment.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelectSegment(segment)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSegment(segment);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSegment(segment.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{segment.customerCount} customers</span>
                <span className="font-semibold text-green-600">${segment.totalValue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Segment Details */}
      {selectedSegment && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{selectedSegment.name}</h3>
            <button
              onClick={() => setSelectedSegment(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">{selectedSegment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{segmentCustomers.length}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${selectedSegment.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${selectedSegment.averageValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Avg Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {segmentCustomers.length > 0 ? Math.round((selectedSegment.totalValue / customers.reduce((sum, c) => sum + c.lifetimeValue, 0)) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Market Share</div>
            </div>
          </div>

          {/* Segment Customers List */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Customers in this segment</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {segmentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${customer.lifetimeValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Segment Modal */}
      {(isCreatingSegment || editingSegment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreatingSegment ? 'Create New Segment' : 'Edit Segment'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segment Name</label>
                <input
                  type="text"
                  value={isCreatingSegment ? newSegment.name : editingSegment?.name || ''}
                  onChange={(e) => {
                    if (isCreatingSegment) {
                      setNewSegment({ ...newSegment, name: e.target.value });
                    } else if (editingSegment) {
                      setEditingSegment({ ...editingSegment, name: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter segment name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={isCreatingSegment ? newSegment.description : editingSegment?.description || ''}
                  onChange={(e) => {
                    if (isCreatingSegment) {
                      setNewSegment({ ...newSegment, description: e.target.value });
                    } else if (editingSegment) {
                      setEditingSegment({ ...editingSegment, description: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter segment description"
                />
              </div>

              {/* Criteria Builder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Criteria</label>
                <div className="space-y-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Status</label>
                    <select
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="lead">Lead</option>
                      <option value="prospect">Prospect</option>
                      <option value="customer">Customer</option>
                      <option value="vip">VIP</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Spending Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Min Spending</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Max Spending</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="No limit"
                      />
                    </div>
                  </div>

                  {/* Lead Score Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Min Lead Score</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Max Lead Score</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsCreatingSegment(false);
                  setEditingSegment(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreatingSegment ? handleCreateSegment : handleUpdateSegment}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>{isCreatingSegment ? 'Create' : 'Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSegmentation;



