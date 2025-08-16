import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import axios from 'axios';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  MessageSquare,
  Star,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
  customerSince: string;
  tags: string[];
  notes?: string;
  status: 'active' | 'inactive' | 'vip';
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  averageOrderValue: number;
  totalRevenue: number;
}

const VendorCRMPage = () => {
  const [, setLocation] = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch customers
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/customers');
        return response.data?.customers || [];
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    }
  });

  // Fetch customer statistics
  const { data: statsData } = useQuery({
    queryKey: ['customerStats'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/customers/stats');
        return response.data?.stats || {
          totalCustomers: 0,
          activeCustomers: 0,
          vipCustomers: 0,
          averageOrderValue: 0,
          totalRevenue: 0
        };
      } catch (error) {
        console.error('Error fetching customer stats:', error);
        return {
          totalCustomers: 0,
          activeCustomers: 0,
          vipCustomers: 0,
          averageOrderValue: 0,
          totalRevenue: 0
        };
      }
    }
  });

  const customers: Customer[] = customersData || [];
  const stats: CustomerStats = statsData || {
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    averageOrderValue: 0,
    totalRevenue: 0
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4" />;
      case 'vip':
        return <Star className="h-4 w-4" />;
      case 'inactive':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading customers...</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="responsive-heading text-gray-900">Customer Relationship Management</h1>
          <p className="text-gray-600 mt-2">Manage your customer relationships and track customer insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 p-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Total Customers</p>
                <p className="responsive-heading text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 p-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Active Customers</p>
                <p className="responsive-heading text-gray-900">{stats.activeCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 p-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">VIP Customers</p>
                <p className="responsive-heading text-gray-900">{stats.vipCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 p-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Avg Order Value</p>
                <p className="responsive-heading text-gray-900">${stats.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 p-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Total Revenue</p>
                <p className="responsive-heading text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4 p-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="responsive-button border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by customer status"
              >
                <option value="all">All Customers</option>
                <option value="active">Active</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => setLocation('/dashboard/vendor/messaging')}
                className="inline-flex items-center gap-2 responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="responsive-subheading text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">
                {customers.length === 0 
                  ? "You don't have any customers yet. Customers will appear here when they place orders."
                  : "No customers match your current filters."
                }
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div>
                  <div className="flex items-start justify-between mb-4 p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(customer.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(customer.status)}
                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                          </div>
                        </span>
                        {customer.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-6 responsive-text text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4" />
                          {customer.totalOrders} orders
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${customer.totalSpent.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        title="View customer details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setLocation(`/dashboard/vendor/messaging?customer=${customer.id}`)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        title="Send message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Since</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(customer.customerSince).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Last Order</h4>
                      <div className="text-sm text-gray-600">
                        {customer.lastOrderDate 
                          ? new Date(customer.lastOrderDate).toLocaleDateString()
                          : 'No orders yet'
                        }
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Average Order Value</h4>
                      <div className="text-sm text-gray-600">
                        ${customer.averageOrderValue.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between p-6">
                <h2 className="responsive-subheading text-gray-900">Customer Details</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Customer Info */}
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Email:</span>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    {selectedCustomer.phone && (
                      <div>
                        <span className="responsive-text font-medium text-gray-600">Phone:</span>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div>
                        <span className="responsive-text font-medium text-gray-600">Address:</span>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-900">{selectedCustomer.address}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedCustomer.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedCustomer.status)}
                            {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Statistics */}
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-4">Order Statistics</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Total Orders:</span>
                      <p className="text-gray-900">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Total Spent:</span>
                      <p className="text-gray-900">${selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Average Order Value:</span>
                      <p className="text-gray-900">${selectedCustomer.averageOrderValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Customer Since:</span>
                      <p className="text-gray-900">{new Date(selectedCustomer.customerSince).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Last Order:</span>
                      <p className="text-gray-900">
                        {selectedCustomer.lastOrderDate 
                          ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString()
                          : 'No orders yet'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCustomer.tags.length > 0 && (
                <div className="mt-8">
                  <h3 className="responsive-subheading text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 text-sm font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCustomer.notes && (
                <div className="mt-8">
                  <h3 className="responsive-subheading text-gray-900 mb-4">Notes</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3 p-6">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="responsive-button text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setLocation(`/dashboard/vendor/messaging?customer=${selectedCustomer.id}`);
                  }}
                  className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
};

export default VendorCRMPage;
