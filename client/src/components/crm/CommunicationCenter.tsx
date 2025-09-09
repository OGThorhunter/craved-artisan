import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Video, 
  Send, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Image,
  Link,
  Download,
  Search,
  Filter,
  MoreVertical,
  Reply,
  Forward,
  Archive,
  Star,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';

interface Communication {
  id: string;
  type: 'email' | 'phone' | 'sms' | 'video' | 'meeting' | 'note';
  direction: 'inbound' | 'outbound';
  customerId: string;
  customerName: string;
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  scheduledAt?: string;
  sentAt: string;
  readAt?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CommunicationCenterProps {
  communications: Communication[];
  onCommunicationCreate: (communication: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCommunicationUpdate: (communication: Communication) => void;
  onCommunicationDelete: (communicationId: string) => void;
  onCommunicationReply: (communicationId: string, reply: string) => void;
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  communications,
  onCommunicationCreate,
  onCommunicationUpdate,
  onCommunicationDelete,
  onCommunicationReply,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState<Communication | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    direction: '',
    status: '',
    priority: '',
    dateRange: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [replyText, setReplyText] = useState('');

  const [newCommunication, setNewCommunication] = useState<Partial<Communication>>({
    type: 'email',
    direction: 'outbound',
    customerId: '',
    customerName: '',
    subject: '',
    content: '',
    status: 'sent',
    priority: 'medium',
    tags: [],
    attachments: [],
  });

  const queryClient = useQueryClient();

  // Filter communications
  const filteredCommunications = communications.filter(communication => {
    const matchesSearch = searchTerm === '' || 
      communication.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      communication.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      communication.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filters.type === '' || communication.type === filters.type;
    const matchesDirection = filters.direction === '' || communication.direction === filters.direction;
    const matchesStatus = filters.status === '' || communication.status === filters.status;
    const matchesPriority = filters.priority === '' || communication.priority === filters.priority;

    return matchesSearch && matchesType && matchesDirection && matchesStatus && matchesPriority;
  });

  // Calculate metrics
  const metrics = {
    total: communications.length,
    sent: communications.filter(c => c.direction === 'outbound').length,
    received: communications.filter(c => c.direction === 'inbound').length,
    unread: communications.filter(c => c.status === 'sent' && c.direction === 'inbound').length,
    replied: communications.filter(c => c.status === 'replied').length,
    urgent: communications.filter(c => c.priority === 'urgent').length,
  };

  // Handle create communication
  const handleCreate = () => {
    if (!newCommunication.subject || !newCommunication.content || !newCommunication.customerId) return;

    const communication: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'> = {
      type: newCommunication.type || 'email',
      direction: newCommunication.direction || 'outbound',
      customerId: newCommunication.customerId,
      customerName: newCommunication.customerName || '',
      subject: newCommunication.subject,
      content: newCommunication.content,
      status: newCommunication.status || 'sent',
      priority: newCommunication.priority || 'medium',
      tags: newCommunication.tags || [],
      attachments: newCommunication.attachments || [],
      sentAt: new Date().toISOString(),
    };

    onCommunicationCreate(communication);
    setIsCreating(false);
    setNewCommunication({
      type: 'email',
      direction: 'outbound',
      customerId: '',
      customerName: '',
      subject: '',
      content: '',
      status: 'sent',
      priority: 'medium',
      tags: [],
      attachments: [],
    });
  };

  // Handle reply
  const handleReply = () => {
    if (!selectedCommunication || !replyText.trim()) return;

    onCommunicationReply(selectedCommunication.id, replyText);
    setReplyText('');
    setSelectedCommunication(null);
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      email: <Mail className="h-4 w-4" />,
      phone: <Phone className="h-4 w-4" />,
      sms: <MessageSquare className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      meeting: <Calendar className="h-4 w-4" />,
      note: <FileText className="h-4 w-4" />,
    };
    return iconMap[type] || <MessageSquare className="h-4 w-4" />;
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      email: 'bg-blue-100 text-blue-800',
      phone: 'bg-green-100 text-green-800',
      sms: 'bg-purple-100 text-purple-800',
      video: 'bg-red-100 text-red-800',
      meeting: 'bg-orange-100 text-orange-800',
      note: 'bg-gray-100 text-gray-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-purple-100 text-purple-800',
      replied: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Center</h2>
          <p className="text-gray-600">Manage all customer communications in one place</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Clock className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Communication</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.sent}</p>
            </div>
            <Send className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.received}</p>
            </div>
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.unread}</p>
            </div>
            <EyeOff className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.replied}</p>
            </div>
            <Reply className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.urgent}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="sms">SMS</option>
              <option value="video">Video</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
            <select
              value={filters.direction}
              onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Communications List/Timeline */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Communication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommunications.map((communication) => (
                  <tr key={communication.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getTypeColor(communication.type)}`}>
                          {getTypeIcon(communication.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{communication.subject}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {communication.content.substring(0, 100)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{communication.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(communication.type)}`}>
                        {communication.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(communication.status)}`}>
                        {communication.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(communication.priority)}`}>
                        {communication.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(communication.sentAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCommunication(communication)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingCommunication(communication)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onCommunicationDelete(communication.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCommunications.map((communication) => (
            <div key={communication.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getTypeColor(communication.type)}`}>
                    {getTypeIcon(communication.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{communication.subject}</h3>
                    <p className="text-sm text-gray-600">with {communication.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(communication.status)}`}>
                    {communication.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(communication.priority)}`}>
                    {communication.priority}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">{communication.content}</p>
              </div>

              {communication.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {communication.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{new Date(communication.sentAt).toLocaleString()}</span>
                  {communication.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {communication.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCommunication(communication)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Reply className="h-3 w-3" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    <Forward className="h-3 w-3" />
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Communication Detail Modal */}
      {selectedCommunication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedCommunication.subject}</h3>
                <button
                  onClick={() => setSelectedCommunication(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Communication Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-gray-900">{selectedCommunication.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(selectedCommunication.type)}`}>
                    {selectedCommunication.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedCommunication.status)}`}>
                    {selectedCommunication.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedCommunication.priority)}`}>
                    {selectedCommunication.priority}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedCommunication.content}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedCommunication.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="space-y-2">
                    {selectedCommunication.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{attachment.type} • {(attachment.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your reply..."
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Reply className="h-4 w-4" />
                  <span>Send Reply</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Forward className="h-4 w-4" />
                  <span>Forward</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingCommunication) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'New Communication' : 'Edit Communication'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={isCreating ? newCommunication.type : editingCommunication?.type || 'email'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewCommunication({ ...newCommunication, type: e.target.value as any });
                      } else if (editingCommunication) {
                        setEditingCommunication({ ...editingCommunication, type: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                    <option value="video">Video</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
                  <select
                    value={isCreating ? newCommunication.direction : editingCommunication?.direction || 'outbound'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewCommunication({ ...newCommunication, direction: e.target.value as any });
                      } else if (editingCommunication) {
                        setEditingCommunication({ ...editingCommunication, direction: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="outbound">Outbound</option>
                    <option value="inbound">Inbound</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <input
                  type="text"
                  value={isCreating ? newCommunication.customerName : editingCommunication?.customerName || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewCommunication({ ...newCommunication, customerName: e.target.value });
                    } else if (editingCommunication) {
                      setEditingCommunication({ ...editingCommunication, customerName: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={isCreating ? newCommunication.subject : editingCommunication?.subject || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewCommunication({ ...newCommunication, subject: e.target.value });
                    } else if (editingCommunication) {
                      setEditingCommunication({ ...editingCommunication, subject: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={isCreating ? newCommunication.content : editingCommunication?.content || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewCommunication({ ...newCommunication, content: e.target.value });
                    } else if (editingCommunication) {
                      setEditingCommunication({ ...editingCommunication, content: e.target.value });
                    }
                  }}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={isCreating ? newCommunication.priority : editingCommunication?.priority || 'medium'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewCommunication({ ...newCommunication, priority: e.target.value as any });
                      } else if (editingCommunication) {
                        setEditingCommunication({ ...editingCommunication, priority: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={isCreating ? newCommunication.status : editingCommunication?.status || 'sent'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewCommunication({ ...newCommunication, status: e.target.value as any });
                      } else if (editingCommunication) {
                        setEditingCommunication({ ...editingCommunication, status: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="failed">Failed</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingCommunication(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : () => {/* handle update */}}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                <span>{isCreating ? 'Create' : 'Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;



