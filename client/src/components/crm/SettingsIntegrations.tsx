import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bot,
  Brain,
  Sparkles,
  Users,
  Key,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  X,
  Zap,
  Database,
  Workflow,
  Target,
  DollarSign,
  Calendar,
  User,
  Building,
  Send
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'email' | 'calendar' | 'payment' | 'crm' | 'analytics' | 'communication';
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  icon: string;
  lastSync?: string;
  settings?: Record<string, any>;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface AIInsight {
  id: string;
  type: 'churn_risk' | 'win_probability' | 'next_best_action' | 'draft_generator';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  createdAt: string;
  dismissed?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface SettingsIntegrationsProps {
  integrations: Integration[];
  users: User[];
  roles: Role[];
  permissions: string[];
  aiInsights: AIInsight[];
  onIntegrationConnect: (id: string) => void;
  onIntegrationDisconnect: (id: string) => void;
  onIntegrationSync: (id: string) => void;
  onUserCreate: (user: Partial<User>) => void;
  onUserUpdate: (user: User) => void;
  onUserDelete: (id: string) => void;
  onRoleCreate: (role: Partial<Role>) => void;
  onRoleUpdate: (role: Role) => void;
  onRoleDelete: (id: string) => void;
  onPermissionUpdate: (userId: string, permissions: string[]) => void;
  onInsightDismiss: (id: string) => void;
  onInsightAction: (id: string, action: string) => void;
  onAIChatMessage: (message: string) => Promise<ChatMessage>;
  onGenerateReport: (type: string) => void;
  onGenerateInsights: () => void;
}

const SettingsIntegrations: React.FC<SettingsIntegrationsProps> = ({
  integrations,
  users,
  roles,
  permissions,
  aiInsights,
  onIntegrationConnect,
  onIntegrationDisconnect,
  onIntegrationSync,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
  onRoleCreate,
  onRoleUpdate,
  onRoleDelete,
  onPermissionUpdate,
  onInsightDismiss,
  onInsightAction,
  onAIChatMessage,
  onGenerateReport,
  onGenerateInsights
}) => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'security' | 'ai-insights'>('integrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'calendar': return Calendar;
      case 'payment': return DollarSign;
      case 'crm': return Users;
      case 'analytics': return BarChart3;
      case 'communication': return MessageSquare;
      default: return Settings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsLoadingChat(true);

    try {
      const aiResponse = await onAIChatMessage(chatMessage);
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings & Integrations</h2>
          <p className="text-gray-600">Manage integrations, security, and AI insights</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'integrations', label: 'Integrations', icon: Settings, count: integrations.length },
            { id: 'security', label: 'Security & Users', icon: Shield, count: users.length },
            { id: 'ai-insights', label: 'AI Insights', icon: Brain, count: aiInsights.length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Available Integrations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => {
                const Icon = getIntegrationIcon(integration.type);
                return (
                  <div
                    key={integration.id}
                    className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                    style={{ backgroundColor: '#F7F2EC' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {integration.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {integration.lastSync && (
                          <span>Last sync: {new Date(integration.lastSync).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === 'connected' ? (
                          <>
                            <button
                              onClick={() => onIntegrationSync(integration.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                              title="Sync"
                            >
                              <Zap className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onIntegrationDisconnect(integration.id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                              title="Disconnect"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onIntegrationConnect(integration.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Users Management */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Users & Permissions</h3>
              <button
                onClick={() => onUserCreate({})}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
            </div>
            
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                  style={{ backgroundColor: '#F7F2EC' }}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Role: {user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUserUpdate(user);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          {/* AI Chat Assistant */}
          <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            </div>
            
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-white">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Brain className="h-8 w-8 mx-auto mb-2" />
                    <p>Start a conversation with the AI assistant</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask the AI assistant anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoadingChat}
              />
              <button
                type="submit"
                disabled={!chatMessage.trim() || isLoadingChat}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* AI Insights */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              <button
                onClick={onGenerateInsights}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Generate Insights
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                  style={{ backgroundColor: '#F7F2EC' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                      <button
                        onClick={() => onInsightDismiss(insight.id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Dismiss"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Confidence: {insight.confidence}%
                    </div>
                    {insight.actionable && (
                      <button
                        onClick={() => onInsightAction(insight.id, 'apply')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                    <p><span className="font-medium">Role:</span> {selectedUser.role}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 
                        selectedUser.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </p>
                    {selectedUser.lastLogin && (
                      <p><span className="font-medium">Last Login:</span> {new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                  <div className="space-y-2">
                    {selectedUser.permissions.map((permission, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded mr-2">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onUserUpdate(selectedUser)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit User
                  </button>
                  <button
                    onClick={() => {
                      onUserDelete(selectedUser.id);
                      setShowUserDetails(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
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

export default SettingsIntegrations;
