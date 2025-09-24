import React, { useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  Share2,
  Send,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Calendar,
  FileText,
  Image,
  Link,
  Settings,
  MoreHorizontal,
  BarChart3,
  TrendingUp,
  X
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  type: 'email' | 'social';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  createdAt: string;
  scheduledFor?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  type: 'email' | 'social';
  category: string;
  isPopular: boolean;
}

interface EmailSocialTabProps {
  campaigns: Campaign[];
  templates: Template[];
  onCampaignCreate: (campaign: Partial<Campaign>) => void;
  onCampaignUpdate: (campaign: Campaign) => void;
  onCampaignDelete: (id: string) => void;
  onCampaignSend: (id: string) => void;
  onTemplateCreate: (template: Partial<Template>) => void;
  onSocialShare: (content: string) => void;
  isLoading: boolean;
}

const EmailSocialTab: React.FC<EmailSocialTabProps> = ({
  campaigns,
  templates,
  onCampaignCreate,
  onCampaignUpdate,
  onCampaignDelete,
  onCampaignSend,
  onTemplateCreate,
  onSocialShare,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'email' | 'social'>('email');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showComposer, setShowComposer] = useState(false);
  const [composerType, setComposerType] = useState<'email' | 'social'>('email');

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = activeSubTab === 'all' || campaign.type === activeSubTab;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sending': return <Send className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Email & Social</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('email')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'email' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setActiveSubTab('social')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'social' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Share2 className="h-4 w-4 inline mr-2" />
              Social
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
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
            aria-label="Filter campaigns by status"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
          </select>
          
          <button
            onClick={() => {
              setComposerType(activeSubTab);
              setShowComposer(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create {activeSubTab === 'email' ? 'Email' : 'Social'} Campaign
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'sent').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0 ? 
                  formatPercentage(
                    campaigns.reduce((sum, c) => sum + c.opened, 0),
                    campaigns.reduce((sum, c) => sum + c.sent, 0)
                  ) : '0%'
                }
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.recipients, 0).toLocaleString()}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              style={{ backgroundColor: '#F7F2EC' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {campaign.type === 'email' ? 
                      <Mail className="h-6 w-6 text-blue-600" /> : 
                      <Share2 className="h-6 w-6 text-blue-600" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      {getStatusIcon(campaign.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Recipients: {campaign.recipients.toLocaleString()}</span>
                      <span>Sent: {campaign.sent.toLocaleString()}</span>
                      <span>Opened: {campaign.opened.toLocaleString()}</span>
                      <span>Clicked: {campaign.clicked.toLocaleString()}</span>
                    </div>
                    {campaign.scheduledFor && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>Scheduled for {formatDate(campaign.scheduledFor)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCampaignSend(campaign.id)}
                    className="p-2 text-green-600 hover:text-green-700 transition-colors"
                    title="Send Campaign"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onCampaignUpdate(campaign)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit Campaign"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onCampaignDelete(campaign.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create {composerType === 'email' ? 'Email' : 'Social'} Campaign
                </h2>
                <button
                  onClick={() => setShowComposer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {composerType === 'email' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter campaign name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subject line"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                    <textarea
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your email content here..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onCampaignCreate({})}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      Send Now
                    </button>
                    <button
                      onClick={() => onCampaignCreate({})}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      Schedule
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
                    <textarea
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your social media post here..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onSocialShare('')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Now
                    </button>
                    <button
                      onClick={() => onSocialShare('')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSocialTab;
