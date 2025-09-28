import React, { useState } from 'react';
import { Plus, Send, Clock, Eye, MousePointer, Users, MessageSquare, FileText } from 'lucide-react';
import type { BroadcastMessage, MessageTemplate, MessageType, TargetAudience, MessageStatus } from '@/lib/api/analytics-communications';
import { 
  formatDate,
  getMessageStatusColor,
  getMessageStatusText,
  getMessageTypeIcon,
  getTargetAudienceIcon,
  MESSAGE_STATUS_COLORS,
  MESSAGE_TYPE_ICONS,
  TARGET_AUDIENCE_ICONS
} from '@/lib/api/analytics-communications';

interface CommunicationsManagerProps {
  messages: BroadcastMessage[];
  templates: MessageTemplate[];
  loading?: boolean;
  onCreateMessage: (message: any) => void;
  onSendMessage: (messageId: string) => void;
  onScheduleMessage: (messageId: string, scheduledFor: string) => void;
  onCreateTemplate: (template: any) => void;
  onEditTemplate: (templateId: string, updates: any) => void;
}

export function CommunicationsManager({
  messages,
  templates,
  loading = false,
  onCreateMessage,
  onSendMessage,
  onScheduleMessage,
  onCreateTemplate,
  onEditTemplate
}: CommunicationsManagerProps) {
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'scheduled'>('messages');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredMessages = messages.filter(message => {
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesType = typeFilter === 'all' || message.messageType === typeFilter;
    return matchesStatus && matchesType;
  });

  const scheduledMessages = messages.filter(m => m.status === 'SCHEDULED');
  const sentMessages = messages.filter(m => m.status === 'SENT');

  const getStatusBadge = (status: MessageStatus) => {
    return (
      <span
        className="inline-block px-2 py-1 text-xs rounded-full font-medium"
        style={{ 
          backgroundColor: MESSAGE_STATUS_COLORS[status] + '20',
          color: MESSAGE_STATUS_COLORS[status]
        }}
      >
        {getMessageStatusText(status)}
      </span>
    );
  };

  const handleCreateMessage = () => {
    setShowCreateMessage(true);
  };

  const handleCreateTemplate = () => {
    setShowCreateTemplate(true);
  };

  const handleSendMessage = (message: BroadcastMessage) => {
    if (confirm(`Are you sure you want to send this message to ${message.recipientCount} recipients?`)) {
      onSendMessage(message.id);
    }
  };

  const handleScheduleMessage = (message: BroadcastMessage) => {
    const scheduledFor = prompt('Enter scheduled date and time (YYYY-MM-DDTHH:MM):');
    if (scheduledFor) {
      onScheduleMessage(message.id, scheduledFor);
    }
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Communications Manager</h2>
          <p className="text-gray-600">Send messages, manage templates, and track engagement</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateTemplate}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            New Template
          </button>
          <button
            onClick={handleCreateMessage}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Messages', count: messages.length, color: 'gray' },
          { label: 'Sent', count: sentMessages.length, color: 'green' },
          { label: 'Scheduled', count: scheduledMessages.length, color: 'yellow' },
          { label: 'Templates', count: templates.length, color: 'blue' },
          { label: 'Total Recipients', count: messages.reduce((sum, m) => sum + m.recipientCount, 0), color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`text-2xl font-bold ${
              stat.color === 'green' ? 'text-green-600' :
              stat.color === 'yellow' ? 'text-yellow-600' :
              stat.color === 'blue' ? 'text-blue-600' :
              stat.color === 'purple' ? 'text-purple-600' :
              'text-gray-600'
            }`}>
              {stat.count}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'scheduled', label: 'Scheduled', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-brand-green text-brand-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'messages' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="SENDING">Sending</option>
                    <option value="SENT">Sent</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Type:</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    aria-label="Filter by type"
                  >
                    <option value="all">All Types</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">Push</option>
                    <option value="IN_APP">In-App</option>
                  </select>
                </div>
              </div>

              {/* Messages List */}
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
                  <p className="text-gray-600">
                    {messages.length === 0 
                      ? 'No messages have been created yet'
                      : 'Try adjusting your filters to see more messages'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getMessageTypeIcon(message.messageType)}
                            </span>
                            <h3 className="font-semibold text-gray-900">
                              {message.subject || 'No Subject'}
                            </h3>
                            {getStatusBadge(message.status)}
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              {getTargetAudienceIcon(message.targetAudience)} {message.targetAudience.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-4 line-clamp-2">{message.content}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-700">Recipients</div>
                              <div className="text-sm text-gray-900">{message.recipientCount}</div>
                            </div>
                            
                            {message.sentAt && (
                              <div>
                                <div className="text-sm font-medium text-gray-700">Sent</div>
                                <div className="text-sm text-gray-900">{formatDate(message.sentAt)}</div>
                              </div>
                            )}
                            
                            {message.scheduledFor && (
                              <div>
                                <div className="text-sm font-medium text-gray-700">Scheduled</div>
                                <div className="text-sm text-gray-900">{formatDate(message.scheduledFor)}</div>
                              </div>
                            )}
                            
                            <div>
                              <div className="text-sm font-medium text-gray-700">Delivered</div>
                              <div className="text-sm text-gray-900">{message.deliveredCount}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-gray-700">Opened</div>
                              <div className="text-sm text-gray-900">{message.openedCount}</div>
                            </div>
                          </div>

                          {/* Engagement Stats */}
                          {message.status === 'SENT' && (
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span>{message.openedCount} opened</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MousePointer className="w-4 h-4 text-gray-400" />
                                <span>{message.clickedCount} clicked</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{message.deliveredCount} delivered</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {message.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => handleSendMessage(message)}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                title="Send message"
                              >
                                <Send className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleScheduleMessage(message)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Schedule message"
                              >
                                <Clock className="w-4 h-4 text-blue-600" />
                              </button>
                            </>
                          )}
                          
                          {message.status === 'SCHEDULED' && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-xs text-yellow-600">Scheduled</span>
                            </div>
                          )}
                          
                          {message.status === 'SENT' && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Sent</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Templates List */}
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600">Create your first message template to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getMessageTypeIcon(template.templateType)}
                            </span>
                            <h3 className="font-semibold text-gray-900">{template.templateName}</h3>
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                              {template.templateType}
                            </span>
                            {!template.isActive && (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          {template.subject && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Subject:</strong> {template.subject}
                            </p>
                          )}
                          
                          <p className="text-gray-700 mb-4 line-clamp-3">{template.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Used {template.usageCount} times</span>
                            {template.lastUsedAt && (
                              <span>Last used: {formatDate(template.lastUsedAt)}</span>
                            )}
                            {template.variables.length > 0 && (
                              <span>{template.variables.length} variables</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit template"
                          >
                            <FileText className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-6">
              {/* Scheduled Messages */}
              {scheduledMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No scheduled messages</h3>
                  <p className="text-gray-600">Schedule messages to be sent at specific times</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledMessages.map((message) => (
                    <div key={message.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getMessageTypeIcon(message.messageType)}
                            </span>
                            <h3 className="font-semibold text-gray-900">
                              {message.subject || 'No Subject'}
                            </h3>
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Scheduled
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{message.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Scheduled for:</span>
                              <span className="ml-1 font-medium">{formatDate(message.scheduledFor!)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Recipients:</span>
                              <span className="ml-1 font-medium">{message.recipientCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Target:</span>
                              <span className="ml-1 font-medium">{message.targetAudience.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs text-yellow-600">
                            {new Date(message.scheduledFor!).getTime() > Date.now() ? 'Upcoming' : 'Overdue'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Message Modal */}
      {showCreateMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Message</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const messageData = {
                eventId: 'evt_1', // TODO: Get from context
                messageType: formData.get('messageType'),
                subject: formData.get('subject'),
                content: formData.get('content'),
                targetAudience: formData.get('targetAudience'),
                scheduledFor: formData.get('scheduledFor'),
              };
              onCreateMessage(messageData);
              setShowCreateMessage(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    name="messageType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select message type"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">Push Notification</option>
                    <option value="IN_APP">In-App Message</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (for emails)
                  </label>
                  <input
                    type="text"
                    name="subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter message subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    name="content"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter your message content"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    name="targetAudience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select target audience"
                  >
                    <option value="ALL_ATTENDEES">All Attendees</option>
                    <option value="VENDORS_ONLY">Vendors Only</option>
                    <option value="CUSTOMERS_ONLY">Customers Only</option>
                    <option value="SPECIFIC_GROUP">Specific Group</option>
                    <option value="CUSTOM_CRITERIA">Custom Criteria</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledFor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    aria-label="Schedule message date and time"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateMessage(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Create Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Template</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const templateData = {
                eventId: 'evt_1', // TODO: Get from context
                templateName: formData.get('templateName'),
                templateType: formData.get('templateType'),
                subject: formData.get('subject'),
                content: formData.get('content'),
              };
              onCreateTemplate(templateData);
              setShowCreateTemplate(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    name="templateName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="e.g., Welcome Email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type
                  </label>
                  <select
                    name="templateType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select template type"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">Push Notification</option>
                    <option value="IN_APP">In-App Message</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (for emails)
                  </label>
                  <input
                    type="text"
                    name="subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter template subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Content
                  </label>
                  <textarea
                    name="content"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Enter template content (use {{variableName}} for variables)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use variables like {{customerName}}, {{eventName}}, {{eventDate}}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateTemplate(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
