import React, { useState } from 'react';
import { 
  Plug, 
  CheckCircle, 
  XCircle, 
  Settings, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Zap,
  Mail,
  Calendar,
  MessageSquare,
  CreditCard,
  Database,
  Cloud,
  Smartphone
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'payment' | 'analytics' | 'productivity' | 'marketing' | 'storage';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: React.ComponentType<any>;
  lastSync?: string;
  syncStatus?: 'success' | 'error' | 'in_progress';
  features: string[];
  setupUrl?: string;
}

interface IntegrationsHubProps {
  integrations: Integration[];
  onIntegrationConnect: (integrationId: string) => void;
  onIntegrationDisconnect: (integrationId: string) => void;
  onIntegrationSync: (integrationId: string) => void;
  onIntegrationConfigure: (integrationId: string) => void;
}

const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  integrations,
  onIntegrationConnect,
  onIntegrationDisconnect,
  onIntegrationSync,
  onIntegrationConfigure
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Integrations', icon: Plug },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'analytics', name: 'Analytics', icon: Database },
    { id: 'productivity', name: 'Productivity', icon: Zap },
    { id: 'marketing', name: 'Marketing', icon: Mail },
    { id: 'storage', name: 'Storage', icon: Cloud }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'disconnected': return XCircle;
      case 'error': return AlertCircle;
      case 'pending': return RefreshCw;
      default: return XCircle;
    }
  };

  const getSyncStatusIcon = (syncStatus?: string) => {
    switch (syncStatus) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'in_progress': return RefreshCw;
      default: return null;
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations Hub</h2>
          <p className="text-gray-600">Connect your CRM with external tools and services</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {connectedCount} of {totalCount} connected
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Connected</p>
              <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Disconnected</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'disconnected').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Errors</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'error').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const StatusIcon = getStatusIcon(integration.status);
          const SyncStatusIcon = getSyncStatusIcon(integration.syncStatus);
          const IntegrationIcon = integration.icon;
          
          return (
            <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IntegrationIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {integration.status}
                    </span>
                  </div>
                </div>
                {SyncStatusIcon && (
                  <div className="flex items-center text-sm text-gray-500">
                    <SyncStatusIcon className={`h-4 w-4 mr-1 ${
                      integration.syncStatus === 'success' ? 'text-green-600' :
                      integration.syncStatus === 'error' ? 'text-red-600' :
                      'text-yellow-600 animate-spin'
                    }`} />
                    {integration.syncStatus === 'in_progress' ? 'Syncing...' : 'Synced'}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
              
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                  {integration.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{integration.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {integration.lastSync && (
                <p className="text-xs text-gray-500 mb-4">
                  Last sync: {new Date(integration.lastSync).toLocaleString()}
                </p>
              )}

              <div className="flex space-x-2">
                {integration.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => onIntegrationSync(integration.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Sync</span>
                    </button>
                    <button
                      onClick={() => onIntegrationConfigure(integration.id)}
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onIntegrationDisconnect(integration.id)}
                      className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onIntegrationConnect(integration.id)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plug className="h-4 w-4" />
                    <span>Connect</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Integrations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Integrations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Mailchimp', icon: Mail, category: 'marketing' },
            { name: 'Stripe', icon: CreditCard, category: 'payment' },
            { name: 'Google Calendar', icon: Calendar, category: 'productivity' },
            { name: 'Slack', icon: MessageSquare, category: 'communication' }
          ].map((integration, index) => {
            const Icon = integration.icon;
            return (
              <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Icon className="h-6 w-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{integration.name}</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsHub;







