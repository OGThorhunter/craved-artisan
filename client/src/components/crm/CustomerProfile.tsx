import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Tag, 
  Edit, 
  Save, 
  X, 
  Plus,
  Trash2,
  Eye,
  Activity,
  DollarSign,
  ShoppingBag,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  avatar?: string;
  status: 'lead' | 'prospect' | 'customer' | 'vip' | 'inactive';
  source: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lifetimeValue: number;
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp';
  timezone?: string;
  language: string;
  notes?: string;
  assignedTo?: string;
  leadScore: number;
  isVip: boolean;
  isBlacklisted: boolean;
}

interface CustomerProfileProps {
  customerId: string;
  onClose: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Partial<Customer>>({});
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  // Fetch customer data
  const { data: customerData, isLoading } = useQuery({
    queryKey: ['crm-customer', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/crm/customers/${customerId}`);
      if (!response.ok) throw new Error('Failed to fetch customer');
      return response.json();
    },
  });

  const customer = customerData?.customer;

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (updatedData: Partial<Customer>) => {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update customer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['crm-customers'] });
      setIsEditing(false);
    },
  });

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      const updatedTags = [...(customer?.tags || []), tag];
      return updateCustomerMutation.mutateAsync({ tags: updatedTags });
    },
    onSuccess: () => {
      setNewTag('');
    },
  });

  // Remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: async (tagToRemove: string) => {
      const updatedTags = customer?.tags?.filter(tag => tag !== tagToRemove) || [];
      return updateCustomerMutation.mutateAsync({ tags: updatedTags });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const updatedNotes = customer?.notes ? `${customer.notes}\n\n${note}` : note;
      return updateCustomerMutation.mutateAsync({ notes: updatedNotes });
    },
    onSuccess: () => {
      setNewNote('');
    },
  });

  useEffect(() => {
    if (customer) {
      setEditedCustomer(customer);
    }
  }, [customer]);

  const handleSave = () => {
    updateCustomerMutation.mutate(editedCustomer);
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      addTagMutation.mutate(newTag.trim());
    }
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-red-600">Customer not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {customer.avatar ? (
                <img src={customer.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {customer.firstName[0]}{customer.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="text-gray-600">{customer.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  customer.status === 'vip' ? 'bg-purple-100 text-purple-800' :
                  customer.status === 'customer' ? 'bg-green-100 text-green-800' :
                  customer.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status}
                </span>
                {customer.isVip && <Star className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm text-gray-500">Score: {customer.leadScore}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedCustomer.email || ''}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{customer.email}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedCustomer.phone || ''}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{customer.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCustomer.company || ''}
                      onChange={(e) => setEditedCustomer({ ...editedCustomer, company: e.target.value })}
                      placeholder="Company"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{customer.company || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-semibold">{customer.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Spent:</span>
                  <span className="font-semibold text-green-600">${customer.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Order Value:</span>
                  <span className="font-semibold">${customer.averageOrderValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lifetime Value:</span>
                  <span className="font-semibold text-blue-600">${customer.lifetimeValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lead Score:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${customer.leadScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{customer.leadScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {customer.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => removeTagMutation.mutate(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <form onSubmit={handleTagSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            {customer.notes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
            <form onSubmit={handleNoteSubmit} className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this customer..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Note
              </button>
            </form>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {customerData?.contacts?.slice(0, 5).map((contact: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{contact.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{contact.type}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateCustomerMutation.isPending}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;


