import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Building2,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  AlertTriangle,
  Truck,
  Search,
  Filter,
  Plus,
  Eye,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Shield,
  Leaf,
  Factory,
  Store,
  Home,
  Wrench,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  type: 'wholesale' | 'manufacturer' | 'distributor' | 'local_farm' | 'specialty';
  category: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  rating: number;
  totalOrders: number;
  avgDeliveryTime: number;
  minOrderValue: number;
  isVerified: boolean;
  specialties: string[];
  certifications: string[];
  createdAt: string;
  lastOrderDate?: string;
}

interface B2BProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  inStock: boolean;
  stockQuantity?: number;
  leadTime: number;
  bulkDiscounts: Array<{
    minQuantity: number;
    discountPercent: number;
  }>;
  specifications: Record<string, string>;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SourcingRequest {
  id: string;
  itemId: string;
  itemName: string;
  requestedQuantity: number;
  maxPrice?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'quoted' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  quotes: Array<{
    supplierId: string;
    supplierName: string;
    price: number;
    leadTime: number;
    totalCost: number;
    isSelected: boolean;
    quotedAt: string;
  }>;
  selectedQuote?: {
    supplierId: string;
    supplierName: string;
    price: number;
    leadTime: number;
    totalCost: number;
    orderId: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface B2BOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface B2BNetworkDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function B2BNetworkDashboard({ isOpen, onClose }: B2BNetworkDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'products' | 'sourcing' | 'orders' | 'analytics'>('overview');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedSourcingRequest, setSelectedSourcingRequest] = useState<SourcingRequest | null>(null);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [showSourcingDetails, setShowSourcingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch suppliers
  const { data: suppliersData, isLoading: suppliersLoading } = useQuery({
    queryKey: ['b2b-suppliers', filterType, filterCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`/api/b2b/suppliers?${params.toString()}`);
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch B2B products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['b2b-products', filterCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`/api/b2b/products?${params.toString()}`);
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch sourcing requests
  const { data: sourcingData, isLoading: sourcingLoading } = useQuery({
    queryKey: ['b2b-sourcing-requests'],
    queryFn: async () => {
      const response = await axios.get('/api/b2b/sourcing-requests');
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch B2B orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['b2b-orders'],
    queryFn: async () => {
      const response = await axios.get('/api/b2b/orders');
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch B2B analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['b2b-analytics'],
    queryFn: async () => {
      const response = await axios.get('/api/b2b/analytics');
      return response.data;
    },
    enabled: isOpen,
  });

  // Auto-source mutation
  const autoSourceMutation = useMutation({
    mutationFn: async (data: { itemId: string; itemName: string; currentStock: number; reorderPoint: number; urgency?: string }) => {
      const response = await axios.post('/api/b2b/auto-source', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Automatic sourcing initiated! Quotes will be generated shortly.');
      queryClient.invalidateQueries({ queryKey: ['b2b-sourcing-requests'] });
    },
    onError: () => {
      toast.error('Failed to initiate automatic sourcing');
    },
  });

  // Select quote mutation
  const selectQuoteMutation = useMutation({
    mutationFn: async ({ requestId, quoteIndex }: { requestId: string; quoteIndex: number }) => {
      const response = await axios.post(`/api/b2b/sourcing-requests/${requestId}/select-quote`, { quoteIndex });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Quote selected and order created!');
      queryClient.invalidateQueries({ queryKey: ['b2b-sourcing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-orders'] });
    },
    onError: () => {
      toast.error('Failed to select quote');
    },
  });

  const getSupplierTypeIcon = (type: string) => {
    switch (type) {
      case 'wholesale': return <Store className="w-4 h-4" />;
      case 'manufacturer': return <Factory className="w-4 h-4" />;
      case 'distributor': return <Truck className="w-4 h-4" />;
      case 'local_farm': return <Home className="w-4 h-4" />;
      case 'specialty': return <Wrench className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'wholesale': return 'bg-blue-100 text-blue-700';
      case 'manufacturer': return 'bg-green-100 text-green-700';
      case 'distributor': return 'bg-purple-100 text-purple-700';
      case 'local_farm': return 'bg-orange-100 text-orange-700';
      case 'specialty': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'quoted': return 'bg-blue-100 text-blue-700';
      case 'ordered': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">B2B Network Dashboard</h2>
                <p className="text-sm text-gray-600">Connect with suppliers and automate sourcing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => autoSourceMutation.mutate({
                  itemId: 'inv-1',
                  itemName: 'All-Purpose Flour',
                  currentStock: 50,
                  reorderPoint: 100,
                  urgency: 'high'
                })}
                disabled={autoSourceMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {autoSourceMutation.isPending ? 'Sourcing...' : 'Auto-Source'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                title="Close dashboard"
                aria-label="Close dashboard"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'suppliers', label: 'Suppliers', icon: Building2 },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'sourcing', label: 'Sourcing', icon: Target },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search suppliers, products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="wholesale">Wholesale</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="local_farm">Local Farm</option>
              <option value="specialty">Specialty</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="food_grade">Food Grade</option>
              <option value="raw_materials">Raw Materials</option>
              <option value="packaging">Packaging</option>
              <option value="used_goods">Used Goods</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && analyticsData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.overview.totalSuppliers}</p>
                      <p className="text-sm text-blue-600">Active Suppliers</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{analyticsData.overview.totalProducts}</p>
                      <p className="text-sm text-green-600">Available Products</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{analyticsData.overview.totalOrders}</p>
                      <p className="text-sm text-purple-600">Total Orders</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">${analyticsData.overview.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-orange-600">Total Value</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Plus className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.recentActivity.newOrders}</p>
                        <p className="text-sm text-gray-600">New Orders (7 days)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.recentActivity.newSourcingRequests}</p>
                        <p className="text-sm text-gray-600">Sourcing Requests</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Truck className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.recentActivity.deliveredOrders}</p>
                        <p className="text-sm text-gray-600">Delivered Orders</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Suppliers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers</h3>
                <div className="space-y-3">
                  {analyticsData.supplierStats.slice(0, 5).map((supplier: any) => (
                    <div key={supplier.supplierId} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            {getSupplierTypeIcon('wholesale')}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{supplier.supplierName}</h4>
                            <p className="text-sm text-gray-600">{supplier.totalOrders} orders • ${supplier.totalValue.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{supplier.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">{supplier.avgDeliveryTime} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && suppliersData && (
            <div className="space-y-4">
              {suppliersData.suppliers.map((supplier: Supplier) => (
                <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        {getSupplierTypeIcon(supplier.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                          {supplier.isVerified && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {supplier.location.city}, {supplier.location.state} • {supplier.totalOrders} orders
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSupplierTypeColor(supplier.type)}`}>
                        {supplier.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{supplier.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Specialties</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {supplier.specialties.slice(0, 3).map((specialty, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Certifications</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {supplier.certifications.slice(0, 2).map((cert, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Performance</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {supplier.avgDeliveryTime} days avg • ${supplier.minOrderValue} min order
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {supplier.contact.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {supplier.contact.phone}
                      </div>
                      {supplier.contact.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a href={supplier.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowSupplierDetails(true);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && productsData && (
            <div className="space-y-4">
              {productsData.products.map((product: B2BProduct) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.supplierName} • {product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">per {product.unit}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{product.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Min Order</p>
                      <p className="font-medium text-gray-900">{product.minOrderQuantity} {product.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lead Time</p>
                      <p className="font-medium text-gray-900">{product.leadTime} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="font-medium text-gray-900">
                        {product.inStock ? `${product.stockQuantity} available` : 'Out of stock'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bulk Discounts</p>
                      <p className="font-medium text-gray-900">
                        Up to {Math.max(...product.bulkDiscounts.map(d => d.discountPercent))}% off
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {product.category}
                      </span>
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sourcing Tab */}
          {activeTab === 'sourcing' && sourcingData && (
            <div className="space-y-4">
              {sourcingData.requests.map((request: SourcingRequest) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.itemName}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {request.requestedQuantity} • {request.quotes.length} quotes received
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  
                  {request.quotes.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="font-medium text-gray-900">Received Quotes</h4>
                      {request.quotes.map((quote, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          quote.isSelected ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{quote.supplierName}</p>
                              <p className="text-sm text-gray-600">
                                ${quote.price.toFixed(2)} per unit • {quote.leadTime} days lead time
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">${quote.totalCost.toFixed(2)}</p>
                              {!quote.isSelected && request.status === 'quoted' && (
                                <button
                                  onClick={() => selectQuoteMutation.mutate({ requestId: request.id, quoteIndex: index })}
                                  disabled={selectQuoteMutation.isPending}
                                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Select
                                </button>
                              )}
                              {quote.isSelected && (
                                <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                                  <CheckCircle className="w-3 h-3" />
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => {
                        setSelectedSourcingRequest(request);
                        setShowSourcingDetails(true);
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && ordersData && (
            <div className="space-y-4">
              {ordersData.orders.map((order: B2BOrder) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ShoppingCart className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.supplierName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} • ${item.unitPrice.toFixed(2)} each</p>
                        </div>
                        <p className="font-medium text-gray-900">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expected Delivery</p>
                      <p className="font-medium text-gray-900">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tracking</p>
                      <p className="font-medium text-gray-900">
                        {order.trackingNumber ? (
                          <a href="#" className="text-blue-600 hover:underline">
                            {order.trackingNumber}
                          </a>
                        ) : (
                          'Not available'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance</h3>
                  <div className="space-y-3">
                    {analyticsData.supplierStats.slice(0, 5).map((supplier: any) => (
                      <div key={supplier.supplierId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{supplier.supplierName}</p>
                          <p className="text-sm text-gray-600">{supplier.totalOrders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${supplier.totalValue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{supplier.avgDeliveryTime} days avg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.categoryStats).map(([category, stats]: [string, any]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{category.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">{stats.count} products</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${stats.totalValue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              B2B Network • {suppliersData?.total || 0} suppliers • {productsData?.total || 0} products
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Network Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
