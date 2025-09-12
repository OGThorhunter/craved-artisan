import React, { useState } from 'react';
import {
  Mail,
  Users,
  Send,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Settings,
  Image,
  Link,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Quote,
  Code,
  Palette,
  Type,
  Layout,
  Save,
  View,
  TestTube,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preview: string;
  content: string;
  type: 'promotional' | 'transactional' | 'newsletter' | 'welcome' | 'abandoned_cart';
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usage: {
    campaigns: number;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  recipients: {
    segments: string[];
    count: number;
    list: string[];
  };
  content: {
    html: string;
    text: string;
    preview: string;
  };
  schedule: {
    sendAt: string;
    timezone: string;
    recurring?: {
      type: 'daily' | 'weekly' | 'monthly';
      interval: number;
    };
  };
  settings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    trackOpens: boolean;
    trackClicks: boolean;
    unsubscribe: boolean;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    bounced: number;
    unsubscribed: number;
    revenue: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

const EmailCampaign: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

  // Mock data
  const emailTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Holiday Sale Promo',
      subject: '🎄 25% Off Everything - Holiday Sale!',
      preview: 'Don\'t miss our biggest sale of the year. Get 25% off all items with code HOLIDAY25.',
      content: '<div>Holiday Sale Content</div>',
      type: 'promotional',
      category: 'Sales',
      tags: ['holiday', 'sale', 'discount'],
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
      usage: {
        campaigns: 3,
        sent: 5000,
        opened: 2500,
        clicked: 375,
        converted: 94
      }
    },
    {
      id: '2',
      name: 'Welcome Series #1',
      subject: 'Welcome to Craved Artisan! 🎉',
      preview: 'Thanks for joining us! Get 15% off your first order.',
      content: '<div>Welcome Content</div>',
      type: 'welcome',
      category: 'Onboarding',
      tags: ['welcome', 'new-customer', 'discount'],
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
      usage: {
        campaigns: 1,
        sent: 500,
        opened: 350,
        clicked: 105,
        converted: 42
      }
    },
    {
      id: '3',
      name: 'Abandoned Cart Recovery',
      subject: 'You forgot something! 🛒',
      preview: 'Complete your purchase and get free shipping on your order.',
      content: '<div>Abandoned Cart Content</div>',
      type: 'abandoned_cart',
      category: 'Recovery',
      tags: ['cart', 'recovery', 'shipping'],
      isActive: true,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-12T00:00:00Z',
      usage: {
        campaigns: 2,
        sent: 1200,
        opened: 480,
        clicked: 120,
        converted: 36
      }
    }
  ];

  const emailCampaigns: EmailCampaign[] = [
    {
      id: '1',
      name: 'Holiday Sale 2025',
      subject: '🎄 25% Off Everything - Holiday Sale!',
      templateId: '1',
      status: 'sent',
      recipients: {
        segments: ['all-customers', 'vip-customers'],
        count: 2500,
        list: ['email1@example.com', 'email2@example.com']
      },
      content: {
        html: '<div>Holiday Sale HTML Content</div>',
        text: 'Holiday Sale Text Content',
        preview: 'Don\'t miss our biggest sale of the year. Get 25% off all items with code HOLIDAY25.'
      },
      schedule: {
        sendAt: '2025-01-20T10:00:00Z',
        timezone: 'America/New_York'
      },
      settings: {
        fromName: 'Craved Artisan',
        fromEmail: 'noreply@cravedartisan.com',
        replyTo: 'support@cravedartisan.com',
        trackOpens: true,
        trackClicks: true,
        unsubscribe: true
      },
      metrics: {
        sent: 2500,
        delivered: 2480,
        opened: 1240,
        clicked: 186,
        converted: 47,
        bounced: 20,
        unsubscribed: 5,
        revenue: 2350,
        openRate: 50.0,
        clickRate: 7.4,
        conversionRate: 25.3
      },
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z'
    },
    {
      id: '2',
      name: 'New Customer Welcome',
      subject: 'Welcome to Craved Artisan! 🎉',
      templateId: '2',
      status: 'scheduled',
      recipients: {
        segments: ['new-customers'],
        count: 500,
        list: []
      },
      content: {
        html: '<div>Welcome HTML Content</div>',
        text: 'Welcome Text Content',
        preview: 'Thanks for joining us! Get 15% off your first order with code WELCOME15.'
      },
      schedule: {
        sendAt: '2025-01-25T09:00:00Z',
        timezone: 'America/New_York'
      },
      settings: {
        fromName: 'Craved Artisan',
        fromEmail: 'noreply@cravedartisan.com',
        replyTo: 'support@cravedartisan.com',
        trackOpens: true,
        trackClicks: true,
        unsubscribe: true
      },
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
        revenue: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0
      },
      createdAt: '2025-01-20T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z'
    }
  ];

  const filteredCampaigns = emailCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sending': return <Send className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'paused': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
          <p className="text-gray-600 mt-1">Create and manage email marketing campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Browse templates"
          >
            <Layout className="h-4 w-4" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Create new email campaign"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{emailCampaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailCampaigns.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(emailCampaigns.reduce((sum, c) => sum + c.metrics.openRate, 0) / emailCampaigns.length)}
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
                {formatCurrency(emailCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0))}
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
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(campaign.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Subject: {campaign.subject}</p>
                    <p className="text-sm text-gray-600">{campaign.content.preview}</p>
                  </div>

                  {/* Campaign Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Recipients:</span>
                      <span className="ml-1 font-medium">{campaign.recipients.count.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sent:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.sent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Delivered:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.delivered.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Opened:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.opened.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Clicked:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.clicked.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Converted:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.converted}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Open Rate:</span>
                      <span className="ml-1 font-medium">{formatPercentage(campaign.metrics.openRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-1 font-medium">{formatCurrency(campaign.metrics.revenue)}</span>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="text-sm text-gray-500">
                    <span>Created: {formatDate(campaign.createdAt)}</span>
                    {campaign.status === 'scheduled' && (
                      <span className="ml-4">
                        Scheduled: {formatDate(campaign.schedule.sendAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="text-gray-600 hover:text-blue-600"
                    title="View campaign details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="text-gray-600 hover:text-green-600"
                    title="Edit campaign"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Preview campaign', campaign.id)}
                    className="text-gray-600 hover:text-purple-600"
                    title="Preview email"
                  >
                    <View className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Test campaign', campaign.id)}
                    className="text-gray-600 hover:text-yellow-600"
                    title="Send test email"
                  >
                    <TestTube className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Delete campaign', campaign.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No email campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first email campaign.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaign;
