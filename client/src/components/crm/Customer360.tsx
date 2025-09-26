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
  X,
  Shield
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  phone?: string;
  website?: string;
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
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
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
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    email: '',
    phone: '',
    website: '',
    firstName: '',
    lastName: '',
    company: '',
    status: 'lead' as const,
    source: 'manual',
    tags: [] as string[],
    assignedTo: '',
    leadScore: 50
  });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCustomerForMessage, setSelectedCustomerForMessage] = useState<Customer | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<'email' | 'sms' | 'in-app'>('email');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedCustomerForTask, setSelectedCustomerForTask] = useState<Customer | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'follow_up' as const,
    priority: 'medium' as const,
    dueDate: '',
    status: 'pending' as const
  });
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateCustomer, setDuplicateCustomer] = useState<Customer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [customerToBlock, setCustomerToBlock] = useState<Customer | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // Check for duplicate customer by email
  const checkForDuplicate = (email: string, phone?: string) => {
    return customers.find(customer => 
      customer.email.toLowerCase() === email.toLowerCase() ||
      (phone && customer.phone && customer.phone === phone)
    );
  };

  const checkForDuplicateCustomerId = (customerId: string) => {
    return customers.find(customer => 
      customer.id === customerId
    );
  };

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (customer: Customer) => {
    if (customer.isBlocked) {
      return 'bg-red-100 text-red-800';
    }
    switch (customer.status) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (customer: Customer) => {
    if (customer.isBlocked) {
      return 'BLOCKED';
    }
    return customer.status.toUpperCase();
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
          
                <button
                  onClick={() => {
                    setNewCustomer({
                      email: '',
                      firstName: '',
                      lastName: '',
                      company: '',
                      status: 'lead',
                      source: 'manual',
                      tags: [],
                      assignedTo: '',
                      leadScore: 50
                    });
                    setShowAddCustomer(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Add new customer"
                  aria-label="Add new customer to CRM"
                >
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer)}`}>
                        {getStatusText(customer)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Lead Score</span>
                        <div className="group relative">
                          <div className="w-3 h-3 bg-gray-200 rounded-full flex items-center justify-center cursor-help">
                            <span className="text-gray-600 text-xs font-bold">?</span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                            <div className="font-semibold mb-1">Lead Score Guide:</div>
                            <div className="space-y-1">
                              <div><span className="text-red-300">76-100:</span> Sales-ready</div>
                              <div><span className="text-orange-300">51-75:</span> Hot lead</div>
                              <div><span className="text-yellow-300">26-50:</span> Warm lead</div>
                              <div><span className="text-green-300">0-25:</span> Cold lead</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
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
                          setSelectedCustomerForMessage(customer);
                          setShowMessageModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerForTask(customer);
                          setNewTask({
                            title: `Follow up with ${customer.firstName} ${customer.lastName}`,
                            description: '',
                            type: 'follow_up',
                            priority: 'medium',
                            dueDate: '',
                            status: 'pending'
                          });
                          setShowTaskModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Create Task"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                          setShowProfile(true);
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (customer.isBlocked) {
                            // Unblock customer
                            const updatedCustomer = { ...customer, isBlocked: false, blockedReason: undefined, blockedAt: undefined };
                            onCustomerUpdate(updatedCustomer);
                          } else {
                            // Block customer
                            setCustomerToBlock(customer);
                            setShowBlockModal(true);
                          }
                        }}
                        className={`p-2 transition-colors ${
                          customer.isBlocked 
                            ? 'text-green-500 hover:text-green-600' 
                            : 'text-red-500 hover:text-red-600'
                        }`}
                        title={customer.isBlocked ? "Unblock Customer" : "Block Customer"}
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerToDelete(customer);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-4 w-4" />
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer)}`}>
                          {getStatusText(customer)}
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
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-sm text-gray-600">Lead Score</p>
                        <div className="group relative">
                          <div className="w-3 h-3 bg-gray-200 rounded-full flex items-center justify-center cursor-help">
                            <span className="text-gray-600 text-xs font-bold">?</span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                            <div className="font-semibold mb-1">Lead Score Guide:</div>
                            <div className="space-y-1">
                              <div><span className="text-red-300">76-100:</span> Sales-ready</div>
                              <div><span className="text-orange-300">51-75:</span> Hot lead</div>
                              <div><span className="text-yellow-300">26-50:</span> Warm lead</div>
                              <div><span className="text-green-300">0-25:</span> Cold lead</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
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
                          setSelectedCustomerForMessage(customer);
                          setShowMessageModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerForTask(customer);
                          setNewTask({
                            title: `Follow up with ${customer.firstName} ${customer.lastName}`,
                            description: '',
                            type: 'follow_up',
                            priority: 'medium',
                            dueDate: '',
                            status: 'pending'
                          });
                          setShowTaskModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Create Task"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                          setShowProfile(true);
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (customer.isBlocked) {
                            // Unblock customer
                            const updatedCustomer = { ...customer, isBlocked: false, blockedReason: undefined, blockedAt: undefined };
                            onCustomerUpdate(updatedCustomer);
                          } else {
                            // Block customer
                            setCustomerToBlock(customer);
                            setShowBlockModal(true);
                          }
                        }}
                        className={`p-2 transition-colors ${
                          customer.isBlocked 
                            ? 'text-green-500 hover:text-green-600' 
                            : 'text-red-500 hover:text-red-600'
                        }`}
                        title={customer.isBlocked ? "Unblock Customer" : "Block Customer"}
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerToDelete(customer);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-4 w-4" />
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
                  title="Close customer profile"
                  aria-label="Close customer profile modal"
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
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer)}`}>
                        {getStatusText(selectedCustomer)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Lead Score:</span> 
                      <span className={`font-semibold ${getPriorityColor(selectedCustomer.leadScore)}`}>
                        {selectedCustomer.leadScore}
                      </span>
                      <div className="group relative">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                          <span className="text-blue-600 text-xs font-bold">?</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                          <div className="max-w-xs">
                            <div className="font-semibold mb-1">Lead Score Guide:</div>
                            <div className="text-xs space-y-1">
                              <div><span className="text-red-300">76-100:</span> Sales-ready (immediate follow-up)</div>
                              <div><span className="text-orange-300">51-75:</span> Hot lead (strong interest)</div>
                              <div><span className="text-yellow-300">26-50:</span> Warm lead (some interest)</div>
                              <div><span className="text-green-300">0-25:</span> Cold lead (needs nurturing)</div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
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
                    onClick={() => {
                      setSelectedCustomerForMessage(selectedCustomer);
                      setShowMessageModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomerForTask(selectedCustomer);
                      setNewTask({
                        title: `Follow up with ${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
                        description: '',
                        type: 'follow_up',
                        priority: 'medium',
                        dueDate: '',
                        status: 'pending'
                      });
                      setShowTaskModal(true);
                    }}
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

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Customer</h2>
                <button
                  onClick={() => {
                    setShowAddCustomer(false);
                    setNewCustomer({
                      email: '',
                      firstName: '',
                      lastName: '',
                      company: '',
                      status: 'lead',
                      source: 'manual',
                      tags: [],
                      assignedTo: '',
                      leadScore: 50
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close add customer modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        newCustomer.email && checkForDuplicate(newCustomer.email)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {newCustomer.email && checkForDuplicate(newCustomer.email) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {newCustomer.email && checkForDuplicate(newCustomer.email) && (
                    <p className="mt-1 text-sm text-red-600">
                      A customer with this email already exists
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        newCustomer.phone && checkForDuplicate('', newCustomer.phone)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {newCustomer.phone && checkForDuplicate('', newCustomer.phone) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {newCustomer.phone && checkForDuplicate('', newCustomer.phone) && (
                    <p className="mt-1 text-sm text-red-600">
                      A customer with this phone number already exists
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={newCustomer.website}
                    onChange={(e) => setNewCustomer({...newCustomer, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter website URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({...newCustomer, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select customer status"
                    aria-label="Select customer status"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                    <option value="vip">VIP</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Lead Score
                    </label>
                    <div className="group relative">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-blue-600 text-xs font-bold">?</span>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                        <div className="max-w-xs">
                          <div className="font-semibold mb-1">Lead Score Guide:</div>
                          <div className="text-xs space-y-1">
                            <div><span className="text-red-300">76-100:</span> Sales-ready (immediate follow-up)</div>
                            <div><span className="text-orange-300">51-75:</span> Hot lead (strong interest)</div>
                            <div><span className="text-yellow-300">26-50:</span> Warm lead (some interest)</div>
                            <div><span className="text-green-300">0-25:</span> Cold lead (needs nurturing)</div>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCustomer.leadScore}
                    onChange={(e) => setNewCustomer({...newCustomer, leadScore: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Enter lead score from 0 to 100"
                    aria-label="Enter lead score from 0 to 100"
                    placeholder="50"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddCustomer(false);
                    setNewCustomer({
                      email: '',
                      firstName: '',
                      lastName: '',
                      company: '',
                      status: 'lead',
                      source: 'manual',
                      tags: [],
                      assignedTo: '',
                      leadScore: 50
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Check for duplicate customer by email
                    const duplicate = checkForDuplicate(newCustomer.email, newCustomer.phone);
                    if (duplicate) {
                      setDuplicateCustomer(duplicate);
                      setShowDuplicateWarning(true);
                      return;
                    }

                    // Create new customer object
                    const customer: Customer = {
                      id: Date.now().toString(), // Simple ID generation
                      ...newCustomer,
                      phone: newCustomer.phone || undefined,
                      website: newCustomer.website || undefined,
                      totalOrders: 0,
                      totalSpent: 0,
                      lifetimeValue: 0,
                      createdAt: new Date().toISOString(),
                      isVip: newCustomer.status === 'vip'
                    };
                    
                    // Call the update function (this would typically be an add function)
                    onCustomerUpdate(customer);
                    
                    // Reset form and close modal
                    setShowAddCustomer(false);
                    setNewCustomer({
                      email: '',
                      firstName: '',
                      lastName: '',
                      company: '',
                      status: 'lead',
                      source: 'manual',
                      tags: [],
                      assignedTo: '',
                      leadScore: 50
                    });
                  }}
                  disabled={!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || checkForDuplicate(newCustomer.email) || checkForDuplicate('', newCustomer.phone)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && selectedCustomerForMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Send Message to {selectedCustomerForMessage.firstName} {selectedCustomerForMessage.lastName}
                </h2>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedCustomerForMessage(null);
                    setMessageContent('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close send message modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type
                </label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select message type"
                  aria-label="Select message type"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="in-app">In-App Message</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedCustomerForMessage.firstName} {selectedCustomerForMessage.lastName}</p>
                  <p className="text-sm text-gray-600">{selectedCustomerForMessage.email}</p>
                  {selectedCustomerForMessage.company && (
                    <p className="text-sm text-gray-500">{selectedCustomerForMessage.company}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message here..."
                  title="Enter message content"
                  aria-label="Enter message content"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedCustomerForMessage(null);
                    setMessageContent('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onMessageSend(selectedCustomerForMessage.id, messageContent);
                    setShowMessageModal(false);
                    setSelectedCustomerForMessage(null);
                    setMessageContent('');
                  }}
                  disabled={!messageContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && selectedCustomerForTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Task for {selectedCustomerForTask.firstName} {selectedCustomerForTask.lastName}
                </h2>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setSelectedCustomerForTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      type: 'follow_up',
                      priority: 'medium',
                      dueDate: '',
                      status: 'pending'
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close create task modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task type"
                    aria-label="Select task type"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="proposal">Proposal</option>
                    <option value="demo">Demo</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task priority"
                    aria-label="Select task priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select due date"
                    aria-label="Select due date"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description..."
                  title="Enter task description"
                  aria-label="Enter task description"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setSelectedCustomerForTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      type: 'follow_up',
                      priority: 'medium',
                      dueDate: '',
                      status: 'pending'
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onTaskCreate(selectedCustomerForTask.id, newTask);
                    setShowTaskModal(false);
                    setSelectedCustomerForTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      type: 'follow_up',
                      priority: 'medium',
                      dueDate: '',
                      status: 'pending'
                    });
                  }}
                  disabled={!newTask.title.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Customer Warning Modal */}
      {showDuplicateWarning && duplicateCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Duplicate Customer Detected</h2>
                <button
                  onClick={() => {
                    setShowDuplicateWarning(false);
                    setDuplicateCustomer(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close duplicate warning modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Customer already exists</p>
                  <p className="text-sm text-gray-600">
                    A customer with this email address is already in your CRM.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Existing Customer:</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {duplicateCustomer.firstName} {duplicateCustomer.lastName}</p>
                  <p><span className="font-medium">Email:</span> {duplicateCustomer.email}</p>
                  {duplicateCustomer.company && (
                    <p><span className="font-medium">Company:</span> {duplicateCustomer.company}</p>
                  )}
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(duplicateCustomer.status)}`}>
                      {duplicateCustomer.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Lead Score:</span> 
                    <span className={`ml-2 font-semibold ${getPriorityColor(duplicateCustomer.leadScore)}`}>
                      {duplicateCustomer.leadScore}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateWarning(false);
                    setDuplicateCustomer(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDuplicateWarning(false);
                    setDuplicateCustomer(null);
                    setShowAddCustomer(false);
                    // Reset the form
                    setNewCustomer({
                      email: '',
                      firstName: '',
                      lastName: '',
                      company: '',
                      status: 'lead',
                      source: 'manual',
                      tags: [],
                      assignedTo: '',
                      leadScore: 50
                    });
                  }}
                  className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Use Different Email
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomer(duplicateCustomer);
                    setShowProfile(true);
                    setShowDuplicateWarning(false);
                    setDuplicateCustomer(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Existing Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Delete Customer</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCustomerToDelete(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close delete confirmation modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Are you sure you want to delete this customer?</p>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. All customer data will be permanently removed.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Customer to be deleted:</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {customerToDelete.firstName} {customerToDelete.lastName}</p>
                  <p><span className="font-medium">Email:</span> {customerToDelete.email}</p>
                  {customerToDelete.company && (
                    <p><span className="font-medium">Company:</span> {customerToDelete.company}</p>
                  )}
                  <p><span className="font-medium">Orders:</span> {customerToDelete.totalOrders}</p>
                  <p><span className="font-medium">Total Spent:</span> ${customerToDelete.totalSpent.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCustomerToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onCustomerDelete(customerToDelete.id);
                    setShowDeleteModal(false);
                    setCustomerToDelete(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Customer Modal */}
      {showBlockModal && customerToBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Block Customer</h2>
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setCustomerToBlock(null);
                    setBlockReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close block customer modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Block {customerToBlock.firstName} {customerToBlock.lastName}</p>
                  <p className="text-sm text-gray-600">
                    This will prevent the customer from making purchases and accessing your services.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Customer Information:</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Email:</span> {customerToBlock.email}</p>
                  {customerToBlock.company && (
                    <p><span className="font-medium">Company:</span> {customerToBlock.company}</p>
                  )}
                  <p><span className="font-medium">Current Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customerToBlock)}`}>
                      {getStatusText(customerToBlock)}
                    </span>
                  </p>
                  <p><span className="font-medium">Total Orders:</span> {customerToBlock.totalOrders}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Blocking (Optional)
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter reason for blocking this customer..."
                  title="Enter reason for blocking"
                  aria-label="Enter reason for blocking customer"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setCustomerToBlock(null);
                    setBlockReason('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const updatedCustomer = {
                      ...customerToBlock,
                      isBlocked: true,
                      blockedReason: blockReason,
                      blockedAt: new Date().toISOString()
                    };
                    onCustomerUpdate(updatedCustomer);
                    setShowBlockModal(false);
                    setCustomerToBlock(null);
                    setBlockReason('');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Block Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer360;
