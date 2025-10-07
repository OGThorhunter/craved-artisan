import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Store,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Filter,
  Search,
  Plus,
  Eye,
  MessageSquare,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Calendar,
  DollarSign,
  ShoppingCart,
  Tag,
  Mail,
  Settings,
  Trash2,
  Edit,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

interface VendorProfile {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  shipsNational: boolean;
  ratingAvg: number;
  ratingCount: number;
  marketplaceTags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  productCount: number;
  activeProducts: number;
  salesWindowCount: number;
  activeSalesWindows: number;
}

interface VendorSegment {
  id: string;
  name: string;
  description: string;
  criteria: VendorCriteria;
  vendorCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface VendorCriteria {
  tags?: string[];
  rating?: { min?: number; max?: number };
  orderCount?: { min?: number; max?: number };
  revenue?: { min?: number; max?: number };
  lastLoginDays?: number;
  location?: { city?: string; state?: string; country?: string };
  isActive?: boolean;
  hasActiveProducts?: boolean;
  hasActiveSalesWindows?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

interface VendorAnalytics {
  totalVendors: number;
  activeVendors: number;
  newVendorsThisMonth: number;
  topVendorsByRevenue: Array<{
    id: string;
    businessName: string;
    revenue: number;
    orderCount: number;
  }>;
  vendorDistribution: {
    byLocation: Array<{ location: string; count: number }>;
    byRating: Array<{ rating: string; count: number }>;
    byActivity: Array<{ status: string; count: number }>;
  };
  growthMetrics: {
    monthlyGrowth: number;
    retentionRate: number;
    churnRate: number;
  };
}

interface VendorSearchFilters {
  search?: string;
  tags?: string[];
  location?: string;
  rating?: { min?: number; max?: number };
  isActive?: boolean;
  hasActiveProducts?: boolean;
  sortBy?: 'name' | 'rating' | 'revenue' | 'orders' | 'created';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export default function MarketplaceDashboard() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'segments' | 'analytics'>('vendors');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [searchFilters, setSearchFilters] = useState<VendorSearchFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<VendorSegment | null>(null);
  const queryClient = useQueryClient();

  // Fetch vendor analytics
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['admin', 'marketplace', 'analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/marketplace/analytics');
      if (!response.ok) throw new Error('Failed to fetch vendor analytics');
      const result = await response.json();
      return result.data as VendorAnalytics;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch vendors
  const { data: vendorsData, isLoading: vendorsLoading, refetch: refetchVendors } = useQuery({
    queryKey: ['admin', 'marketplace', 'vendors', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const response = await fetch(`/api/admin/marketplace/vendors?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch vendor segments
  const { data: segments, isLoading: segmentsLoading, refetch: refetchSegments } = useQuery({
    queryKey: ['admin', 'marketplace', 'segments'],
    queryFn: async () => {
      const response = await fetch('/api/admin/marketplace/segments');
      if (!response.ok) throw new Error('Failed to fetch vendor segments');
      const result = await response.json();
      return result.data as VendorSegment[];
    },
  });

  // Fetch selected vendor details
  const { data: vendorDetails } = useQuery({
    queryKey: ['admin', 'marketplace', 'vendors', selectedVendor?.id],
    queryFn: async () => {
      if (!selectedVendor) return null;
      const response = await fetch(`/api/admin/marketplace/vendors/${selectedVendor.id}`);
      if (!response.ok) throw new Error('Failed to fetch vendor details');
      const result = await response.json();
      return result.data as VendorProfile;
    },
    enabled: !!selectedVendor,
  });

  // Broadcast message mutation
  const broadcastMutation = useMutation({
    mutationFn: async ({ segmentId, message }: { segmentId: string; message: any }) => {
      const response = await fetch(`/api/admin/marketplace/segments/${segmentId}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentId, ...message }),
      });
      if (!response.ok) throw new Error('Failed to broadcast message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      setShowBroadcastModal(false);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'secondary';
  };

  const renderVendorsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b4b4b]" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchFilters.search || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={searchFilters.sortBy || 'name'}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="revenue">Revenue</option>
              <option value="orders">Orders</option>
              <option value="created">Created</option>
            </select>
            
            <select
              value={searchFilters.sortOrder || 'asc'}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
              className="px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Vendor List */}
      {vendorsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor Cards */}
          <div className="lg:col-span-2 space-y-4">
            {vendorsData.vendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedVendor?.id === vendor.id ? 'ring-2 ring-[#7F232E]' : ''
                  }`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E8CBAE] flex items-center justify-center text-[#7F232E] font-semibold">
                      {vendor.businessName.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-[#2b2b2b]">{vendor.businessName}</h3>
                        <Badge variant={getStatusColor(vendor.isActive) as any}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-[#4b4b4b] mb-2">{vendor.contactName} • {vendor.email}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-[#4b4b4b] mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vendor.city}, {vendor.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {vendor.ratingAvg.toFixed(1)} ({vendor.ratingCount})
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-[#4b4b4b]">Orders:</span>
                          <span className="font-medium ml-1">{vendor.totalOrders}</span>
                        </div>
                        <div>
                          <span className="text-[#4b4b4b]">Revenue:</span>
                          <span className="font-medium ml-1">{formatCurrency(vendor.totalRevenue)}</span>
                        </div>
                        <div>
                          <span className="text-[#4b4b4b]">Products:</span>
                          <span className="font-medium ml-1">{vendor.activeProducts}/{vendor.productCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {/* Pagination */}
            {vendorsData.pageCount > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setSearchFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  disabled={vendorsData.page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#4b4b4b]">
                  Page {vendorsData.page} of {vendorsData.pageCount}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setSearchFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  disabled={vendorsData.page >= vendorsData.pageCount}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Vendor Details */}
          <div>
            {selectedVendor && vendorDetails ? (
              <Card className="p-6 sticky top-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2b2b2b]">Vendor Details</h3>
                    <Button variant="ghost" onClick={() => setSelectedVendor(null)}>
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-[#2b2b2b]">{vendorDetails.businessName}</h4>
                      <p className="text-sm text-[#4b4b4b]">{vendorDetails.contactName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[#4b4b4b]">Total Orders:</span>
                        <p className="font-medium">{vendorDetails.totalOrders}</p>
                      </div>
                      <div>
                        <span className="text-[#4b4b4b]">Total Revenue:</span>
                        <p className="font-medium">{formatCurrency(vendorDetails.totalRevenue)}</p>
                      </div>
                      <div>
                        <span className="text-[#4b4b4b]">Avg Order Value:</span>
                        <p className="font-medium">{formatCurrency(vendorDetails.averageOrderValue)}</p>
                      </div>
                      <div>
                        <span className="text-[#4b4b4b]">Active Products:</span>
                        <p className="font-medium">{vendorDetails.activeProducts}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-[#4b4b4b] text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vendorDetails.marketplaceTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm text-[#4b4b4b]">
                        <span>Created:</span>
                        <span>{formatDate(vendorDetails.createdAt)}</span>
                      </div>
                      {vendorDetails.lastLoginAt && (
                        <div className="flex items-center justify-between text-sm text-[#4b4b4b]">
                          <span>Last Login:</span>
                          <span>{formatDate(vendorDetails.lastLoginAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center text-[#4b4b4b]">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a vendor to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderSegmentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2b2b2b]">Vendor Segments</h3>
        <Button
          variant="primary"
          onClick={() => setShowCreateSegment(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Segment
        </Button>
      </div>

      {segments && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-[#2b2b2b]">{segment.name}</h4>
                    <p className="text-sm text-[#4b4b4b] mt-1">{segment.description}</p>
                  </div>
                  <Badge variant={segment.isActive ? 'success' : 'secondary'}>
                    {segment.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#4b4b4b]">Vendors:</span>
                    <span className="font-medium">{segment.vendorCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#4b4b4b]">Created:</span>
                    <span className="font-medium">{formatDate(segment.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedSegment(segment);
                      setShowBroadcastModal(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Broadcast
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#2b2b2b]">{analytics.totalVendors}</p>
                <p className="text-sm text-[#4b4b4b]">Total Vendors</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.activeVendors}</p>
                <p className="text-sm text-[#4b4b4b]">Active Vendors</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.newVendorsThisMonth}</p>
                <p className="text-sm text-[#4b4b4b]">New This Month</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.growthMetrics.monthlyGrowth.toFixed(1)}%</p>
                <p className="text-sm text-[#4b4b4b]">Growth Rate</p>
              </div>
            </Card>
          </div>

          {/* Top Vendors */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Top Vendors by Revenue</h3>
            <div className="space-y-3">
              {analytics.topVendorsByRevenue.map((vendor, index) => (
                <div key={vendor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E8CBAE] flex items-center justify-center text-[#7F232E] font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-[#2b2b2b]">{vendor.businessName}</p>
                      <p className="text-sm text-[#4b4b4b]">{vendor.orderCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#2b2b2b]">{formatCurrency(vendor.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Vendors by Location</h3>
              <div className="space-y-2">
                {analytics.vendorDistribution.byLocation.map((item, index) => (
                  <div key={item.location} className="flex items-center justify-between">
                    <span className="text-sm text-[#4b4b4b]">{item.location}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#7F232E] h-2 rounded-full"
                          style={{ width: `${(item.count / analytics.totalVendors) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Vendors by Rating</h3>
              <div className="space-y-2">
                {analytics.vendorDistribution.byRating.map((item, index) => (
                  <div key={item.rating} className="flex items-center justify-between">
                    <span className="text-sm text-[#4b4b4b]">{item.rating}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#7F232E] h-2 rounded-full"
                          style={{ width: `${(item.count / analytics.totalVendors) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  if (vendorsLoading || analyticsLoading || segmentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Marketplace</h2>
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Marketplace</h2>
          <p className="text-[#4b4b4b] mt-1">Vendor management, segmentation, and analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
            {(['vendors', 'segments', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#7F232E] text-white'
                    : 'text-[#4b4b4b] hover:text-[#7F232E]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <Button
            variant="secondary"
            onClick={() => {
              refetchVendors();
              refetchAnalytics();
              refetchSegments();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'vendors' && renderVendorsTab()}
      {activeTab === 'segments' && renderSegmentsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Broadcast Modal */}
      {showBroadcastModal && selectedSegment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">
              Broadcast to {selectedSegment.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2b2b2b] mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  placeholder="Message title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2b2b2b] mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  placeholder="Message content"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  // Implement broadcast logic
                  setShowBroadcastModal(false);
                }}
                disabled={broadcastMutation.isPending}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send to {selectedSegment.vendorCount} vendors
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowBroadcastModal(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}






