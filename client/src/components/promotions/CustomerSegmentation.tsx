import React, { useState } from 'react';
import {
  Users,
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  Clock,
  MapPin,
  Filter,
  Search
} from 'lucide-react';

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customerCount: number;
  avgOrderValue: number;
  totalRevenue: number;
  lastOrderDays: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface SegmentCriteria {
  demographics?: {
    ageRange?: { min: number; max: number };
    gender?: string[];
    location?: string[];
  };
  behavior?: {
    minOrderCount?: number;
    maxOrderCount?: number;
    minOrderValue?: number;
    maxOrderValue?: number;
    lastOrderDays?: number;
    favoriteCategories?: string[];
    avgOrderFrequency?: number;
  };
  engagement?: {
    emailOpenRate?: number;
    emailClickRate?: number;
    socialEngagement?: number;
    loyaltyTier?: string;
  };
  customRules?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
    value: any;
  }[];
}

const CustomerSegmentation: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Mock data
  const segments: CustomerSegment[] = [
    {
      id: '1',
      name: 'VIP Customers',
      description: 'High-value customers with multiple orders and high lifetime value',
      criteria: {
        behavior: {
          minOrderCount: 5,
          minOrderValue: 100,
          lastOrderDays: 30
        },
        engagement: {
          loyaltyTier: 'gold'
        }
      },
      customerCount: 234,
      avgOrderValue: 185.50,
      totalRevenue: 43407,
      lastOrderDays: 12,
      tags: ['high-value', 'loyal', 'frequent'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
      isActive: true
    },
    {
      id: '2',
      name: 'New Customers',
      description: 'First-time customers who made their first purchase in the last 30 days',
      criteria: {
        behavior: {
          minOrderCount: 1,
          maxOrderCount: 1,
          lastOrderDays: 30
        }
      },
      customerCount: 456,
      avgOrderValue: 67.25,
      totalRevenue: 30666,
      lastOrderDays: 8,
      tags: ['new', 'acquisition', 'welcome'],
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
      isActive: true
    },
    {
      id: '3',
      name: 'At-Risk Customers',
      description: 'Customers who haven\'t ordered in 60+ days but have high lifetime value',
      criteria: {
        behavior: {
          minOrderCount: 3,
          minOrderValue: 50,
          lastOrderDays: 60
        }
      },
      customerCount: 89,
      avgOrderValue: 142.30,
      totalRevenue: 12665,
      lastOrderDays: 75,
      tags: ['at-risk', 'retention', 'win-back'],
      createdAt: '2025-01-08T00:00:00Z',
      updatedAt: '2025-01-12T00:00:00Z',
      isActive: true
    },
    {
      id: '4',
      name: 'Dessert Lovers',
      description: 'Customers who frequently purchase dessert items',
      criteria: {
        behavior: {
          favoriteCategories: ['desserts', 'cakes', 'pastries'],
          minOrderCount: 2
        }
      },
      customerCount: 178,
      avgOrderValue: 95.75,
      totalRevenue: 17044,
      lastOrderDays: 18,
      tags: ['dessert', 'sweet-tooth', 'category-specific'],
      createdAt: '2025-01-12T00:00:00Z',
      updatedAt: '2025-01-18T00:00:00Z',
      isActive: true
    },
    {
      id: '5',
      name: 'Bulk Buyers',
      description: 'Customers who purchase large quantities or high-value orders',
      criteria: {
        behavior: {
          minOrderValue: 200,
          minOrderCount: 2
        }
      },
      customerCount: 67,
      avgOrderValue: 312.40,
      totalRevenue: 20931,
      lastOrderDays: 22,
      tags: ['bulk', 'high-value', 'wholesale'],
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      isActive: false
    }
  ];

  const filteredSegments = segments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && segment.isActive) ||
                         (filterActive === 'inactive' && !segment.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const getSegmentIcon = (segment: CustomerSegment) => {
    if (segment.tags.includes('high-value') || segment.tags.includes('vip')) return <Star className="h-5 w-5 text-yellow-500" />;
    if (segment.tags.includes('new')) return <Plus className="h-5 w-5 text-green-500" />;
    if (segment.tags.includes('at-risk')) return <Clock className="h-5 w-5 text-red-500" />;
    if (segment.tags.includes('bulk')) return <ShoppingCart className="h-5 w-5 text-blue-500" />;
    return <Users className="h-5 w-5 text-gray-500" />;
  };

  const getSegmentColor = (segment: CustomerSegment) => {
    if (segment.tags.includes('high-value') || segment.tags.includes('vip')) return 'bg-yellow-100 text-yellow-800';
    if (segment.tags.includes('new')) return 'bg-green-100 text-green-800';
    if (segment.tags.includes('at-risk')) return 'bg-red-100 text-red-800';
    if (segment.tags.includes('bulk')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Segmentation</h2>
          <p className="text-gray-600 mt-1">Create and manage customer segments for targeted promotions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Create new segment"
        >
          <Plus className="h-4 w-4" />
          <span>New Segment</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Segments</p>
              <p className="text-2xl font-bold text-gray-900">{segments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Segments</p>
              <p className="text-2xl font-bold text-gray-900">
                {segments.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {segments.reduce((sum, s) => sum + s.customerCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(segments.reduce((sum, s) => sum + s.totalRevenue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search segments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by status"
            >
              <option value="all">All Segments</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSegments.map((segment) => (
          <div key={segment.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getSegmentIcon(segment)}
                  <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    segment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {segment.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">{segment.description}</p>

              {/* Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Customers</span>
                  <span className="text-sm font-semibold">{segment.customerCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Avg. Order Value</span>
                  <span className="text-sm font-semibold">{formatCurrency(segment.avgOrderValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Revenue</span>
                  <span className="text-sm font-semibold">{formatCurrency(segment.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Order</span>
                  <span className="text-sm font-semibold">{segment.lastOrderDays} days ago</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {segment.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-1 text-xs rounded-full ${getSegmentColor(segment)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedSegment(segment)}
                    className="text-gray-600 hover:text-blue-600"
                    title="View segment details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Edit segment', segment.id)}
                    className="text-gray-600 hover:text-green-600"
                    title="Edit segment"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Delete segment', segment.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete segment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Updated {formatDate(segment.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSegments.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No segments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterActive !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first customer segment.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSegmentation;



