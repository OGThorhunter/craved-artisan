import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Tag,
  Star,
  Edit,
  Trash2,
  Eye,
  User,
  Building,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  List,
  X
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'vip' | 'inactive';
  source: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  lastContactAt?: string;
  createdAt: string;
  assignedTo?: string;
  leadScore: number;
  isVip: boolean;
}

interface Customer360Props {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  onCustomerUpdate: (customer: Customer) => void;
  onCustomerDelete: (id: string) => void;
  onTagUpdate: (customerId: string, tags: string[]) => void;
  onNoteAdd: (customerId: string, note: string) => void;
  onMessageSend: (customerId: string, message: string) => void;
  onTaskCreate: (customerId: string, task: any) => void;
  isLoading: boolean;
}

const Customer360: React.FC<Customer360Props> = ({
  customers,
  onCustomerSelect,
  onCustomerUpdate,
  onCustomerDelete,
  onTagUpdate,
  onNoteAdd,
  onMessageSend,
  onTaskCreate,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (leadScore: number) => {
    if (leadScore >= 80) return 'text-red-600';
    if (leadScore >= 60) return 'text-orange-600';
    if (leadScore >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Customer 360</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grid View"
              aria-label="Switch to grid view"
            >
              <Users className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="List View"
              aria-label="Switch to list view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by status"
            aria-label="Filter customers by status"
          >
            <option value="">All Status</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="vip">VIP</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">VIP Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.filter(c => c.isVip).length}</p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{customers.filter(c => c.leadScore >= 80).length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg LTV</p>
              <p className="text-2xl font-bold text-gray-900">
                ${Math.round(customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Customer Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className={`rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer ${
                viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center justify-between'
              }`}
              style={{ backgroundColor: '#F7F2EC' }}
              onClick={() => {
                setSelectedCustomer(customer);
                setShowProfile(true);
              }}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid View */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        {customer.company && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {customer.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.isVip && <Star className="h-4 w-4 text-yellow-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lead Score</span>
                      <span className={`font-semibold ${getPriorityColor(customer.leadScore)}`}>
                        {customer.leadScore}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lifetime Value</span>
                      <span className="font-semibold text-gray-900">
                        ${customer.lifetimeValue.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Orders</span>
                      <span className="font-semibold text-gray-900">{customer.totalOrders}</span>
                    </div>
                    
                    {customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {customer.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{customer.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessageSend(customer.id, '');
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskCreate(customer.id, {});
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Create Task"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCustomerSelect(customer);
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {customer.lastContactAt ? new Date(customer.lastContactAt).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        {customer.isVip && <Star className="h-4 w-4 text-yellow-500" />}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      {customer.company && (
                        <p className="text-sm text-gray-500">{customer.company}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Lead Score</p>
                      <p className={`font-semibold ${getPriorityColor(customer.leadScore)}`}>
                        {customer.leadScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">LTV</p>
                      <p className="font-semibold text-gray-900">
                        ${customer.lifetimeValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Orders</p>
                      <p className="font-semibold text-gray-900">{customer.totalOrders}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessageSend(customer.id, '');
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskCreate(customer.id, {});
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Create Task"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCustomerSelect(customer);
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Customer Profile Modal */}
      {showProfile && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                    {selectedCustomer.company && (
                      <p><span className="font-medium">Company:</span> {selectedCustomer.company}</p>
                    )}
                    <p><span className="font-medium">Source:</span> {selectedCustomer.source}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                        {selectedCustomer.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Metrics</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Lead Score:</span> 
                      <span className={`ml-2 font-semibold ${getPriorityColor(selectedCustomer.leadScore)}`}>
                        {selectedCustomer.leadScore}
                      </span>
                    </p>
                    <p><span className="font-medium">Lifetime Value:</span> 
                      <span className="ml-2 font-semibold">${selectedCustomer.lifetimeValue.toLocaleString()}</span>
                    </p>
                    <p><span className="font-medium">Total Orders:</span> 
                      <span className="ml-2 font-semibold">{selectedCustomer.totalOrders}</span>
                    </p>
                    <p><span className="font-medium">Total Spent:</span> 
                      <span className="ml-2 font-semibold">${selectedCustomer.totalSpent.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onMessageSend(selectedCustomer.id, '')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </button>
                  <button
                    onClick={() => onTaskCreate(selectedCustomer.id, {})}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Create Task
                  </button>
                  <button
                    onClick={() => onCustomerUpdate(selectedCustomer)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer360;
