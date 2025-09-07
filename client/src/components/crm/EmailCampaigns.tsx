import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  Users, 
  BarChart3, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Download,
  Copy,
  Play,
  Pause,
  SquareStop,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  Image,
  Link,
  Settings
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  type: 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'follow_up';
  audience: {
    segments: string[];
    totalRecipients: number;
  };
  schedule: {
    scheduledAt?: string;
    timezone: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
  };
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'follow_up';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailCampaignsProps {
  campaigns: EmailCampaign[];
  templates: EmailTemplate[];
  onCampaignCreate: (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => void;
  onCampaignUpdate: (campaign: EmailCampaign) => void;
  onCampaignDelete: (campaignId: string) => void;
  onCampaignSend: (campaignId: string) => void;
}

const EmailCampaigns: React.FC<EmailCampaignsProps> = ({
  campaigns,
  templates,
  onCampaignCreate,
  onCampaignUpdate,
  onCampaignDelete,
  onCampaignSend,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateRange: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [newCampaign, setNewCampaign] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    content: '',
    type: 'newsletter',
    status: 'draft',
    audience: {
      segments: [],
      totalRecipients: 0,
    },
    schedule: {
      timezone: 'UTC',
    },
  });

  const queryClient = useQueryClient();

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchTerm === '' || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === '' || campaign.status === filters.status;
    const matchesType = filters.type === '' || campaign.type === filters.type;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate overall metrics
  const overallMetrics = campaigns.reduce((acc, campaign) => {
    acc.sent += campaign.metrics.sent;
    acc.delivered += campaign.metrics.delivered;
    acc.opened += campaign.metrics.opened;
    acc.clicked += campaign.metrics.clicked;
    acc.unsubscribed += campaign.metrics.unsubscribed;
    acc.bounced += campaign.metrics.bounced;
    return acc;
  }, {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    bounced: 0,
  });

  const overallOpenRate = overallMetrics.sent > 0 ? (overallMetrics.opened / overallMetrics.sent) * 100 : 0;
  const overallClickRate = overallMetrics.sent > 0 ? (overallMetrics.clicked / overallMetrics.sent) * 100 : 0;

  // Handle create campaign
  const handleCreate = () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) return;

    const campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'> = {
      name: newCampaign.name,
      subject: newCampaign.subject,
      content: newCampaign.content,
      type: newCampaign.type || 'newsletter',
      status: newCampaign.status || 'draft',
      audience: newCampaign.audience || { segments: [], totalRecipients: 0 },
      schedule: newCampaign.schedule || { timezone: 'UTC' },
    };

    onCampaignCreate(campaign);
    setIsCreating(false);
    setNewCampaign({
      name: '',
      subject: '',
      content: '',
      type: 'newsletter',
      status: 'draft',
      audience: { segments: [], totalRecipients: 0 },
      schedule: { timezone: 'UTC' },
    });
  };

  // Handle update campaign
  const handleUpdate = () => {
    if (!editingCampaign) return;

    const updatedCampaign = {
      ...editingCampaign,
      updatedAt: new Date().toISOString(),
    };

    onCampaignUpdate(updatedCampaign);
    setEditingCampaign(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      newsletter: 'bg-blue-100 text-blue-800',
      promotional: 'bg-purple-100 text-purple-800',
      transactional: 'bg-green-100 text-green-800',
      welcome: 'bg-yellow-100 text-yellow-800',
      follow_up: 'bg-orange-100 text-orange-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
          <p className="text-gray-600">Create and manage email marketing campaigns</p>
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
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Mail className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.sent.toLocaleString()}</p>
            </div>
            <Send className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallOpenRate.toFixed(1)}%</p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallClickRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length}
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
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
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="newsletter">Newsletter</option>
              <option value="promotional">Promotional</option>
              <option value="transactional">Transactional</option>
              <option value="welcome">Welcome</option>
              <option value="follow_up">Follow Up</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(campaign.type)}`}>
                        {campaign.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.audience.totalRecipients.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.metrics.openRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.metrics.clickRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => onCampaignSend(campaign.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onCampaignDelete(campaign.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCampaign(campaign)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onCampaignDelete(campaign.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(campaign.type)}`}>
                    {campaign.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipients:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.audience.totalRecipients.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Open Rate:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.metrics.openRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Click Rate:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.metrics.clickRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => onCampaignSend(campaign.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send</span>
                  </button>
                )}
                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingCampaign) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create New Campaign' : 'Edit Campaign'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                  <input
                    type="text"
                    value={isCreating ? newCampaign.name : editingCampaign?.name || ''}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewCampaign({ ...newCampaign, name: e.target.value });
                      } else if (editingCampaign) {
                        setEditingCampaign({ ...editingCampaign, name: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={isCreating ? newCampaign.type : editingCampaign?.type || 'newsletter'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewCampaign({ ...newCampaign, type: e.target.value as any });
                      } else if (editingCampaign) {
                        setEditingCampaign({ ...editingCampaign, type: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newsletter">Newsletter</option>
                    <option value="promotional">Promotional</option>
                    <option value="transactional">Transactional</option>
                    <option value="welcome">Welcome</option>
                    <option value="follow_up">Follow Up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line *</label>
                <input
                  type="text"
                  value={isCreating ? newCampaign.subject : editingCampaign?.subject || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewCampaign({ ...newCampaign, subject: e.target.value });
                    } else if (editingCampaign) {
                      setEditingCampaign({ ...editingCampaign, subject: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Content *</label>
                <textarea
                  value={isCreating ? newCampaign.content : editingCampaign?.content || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewCampaign({ ...newCampaign, content: e.target.value });
                    } else if (editingCampaign) {
                      setEditingCampaign({ ...editingCampaign, content: e.target.value });
                    }
                  }}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email content (HTML supported)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audience Segments</label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Customers</option>
                    <option value="vip">VIP Customers</option>
                    <option value="new">New Customers</option>
                    <option value="inactive">Inactive Customers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingCampaign(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" />
                <span>{isCreating ? 'Create Campaign' : 'Update Campaign'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaigns;

