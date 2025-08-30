import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'vip' | 'prospect';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  averageOrderValue: number;
  tags: string[];
  notes: string;
  customerSince: string;
  preferredContact: 'email' | 'phone' | 'sms';
  lifetimeValue: number;
  churnRisk: 'low' | 'medium' | 'high';
}

const AdvancedCRM: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');

  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1-555-0123',
      address: '123 Main St, City, State 12345',
      status: 'vip',
      totalOrders: 15,
      totalSpent: 899.99,
      lastOrderDate: '2025-08-25',
      averageOrderValue: 59.99,
      tags: ['repeat-customer', 'high-value', 'organic-preference'],
      notes: 'Prefers afternoon delivery, loves sourdough bread',
      customerSince: '2024-01-15',
      preferredContact: 'email',
      lifetimeValue: 899.99,
      churnRisk: 'low'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-555-0124',
      address: '456 Oak Ave, City, State 12345',
      status: 'active',
      totalOrders: 8,
      totalSpent: 445.50,
      lastOrderDate: '2025-08-20',
      averageOrderValue: 55.69,
      tags: ['regular-customer', 'healthy-options'],
      notes: 'Interested in gluten-free options',
      customerSince: '2024-06-20',
      preferredContact: 'phone',
      lifetimeValue: 445.50,
      churnRisk: 'low'
    }
  ];

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [mockCustomers, searchTerm, statusFilter]);

  const totalCustomers = mockCustomers.length;
  const activeCustomers = mockCustomers.filter(c => c.status === 'active' || c.status === 'vip').length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'vip': 'bg-purple-100 text-purple-800',
      'prospect': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getChurnRiskColor = (risk: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Relationship Management</h1>
          <p className="text-gray-600">Manage customer relationships, track engagement, and drive growth</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </button>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg LTV</p>
              <p className="text-2xl font-bold text-gray-900">${averageLTV.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vip">VIP</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="Grid view"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="List view"
            >
              <PieChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`p-2 rounded ${viewMode === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="Analytics view"
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status.toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChurnRiskColor(customer.churnRisk)}`}>
                      {customer.churnRisk} risk
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{customer.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {customer.address}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="text-lg font-semibold text-gray-900">{customer.totalOrders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-lg font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Avg Order</p>
                    <p className="text-lg font-semibold text-gray-900">${customer.averageOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">LTV</p>
                    <p className="text-lg font-semibold text-green-600">${customer.lifetimeValue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 btn btn-sm btn-outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <button className="flex-1 btn btn-sm btn-primary">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LTV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        ${customer.lifetimeValue.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChurnRiskColor(customer.churnRisk)}`}>
                        {customer.churnRisk}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" aria-label="View customer">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" aria-label="Edit customer">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900" aria-label="Contact customer">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCRM;
