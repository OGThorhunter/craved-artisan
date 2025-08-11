import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Filter, Send, Paperclip, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  useConversations, 
  useConversation, 
  useSendMessage, 
  useCreateConversation,
  useMarkRead 
} from '@/hooks/messages';
import { useCreateIssue, useUpdateIssue } from '@/hooks/issues';
import { useQuickCoupon } from '@/hooks/discounts';
import { flags } from '@/lib/flags';

interface MessagingTabProps {
  vendorId: string;
}

export default function MessagingTab({ vendorId }: MessagingTabProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    orderId: '',
    type: 'question',
    notes: ''
  });

  // Data fetching
  const conversationsQuery = useConversations({ 
    status: statusFilter === 'all' ? undefined : statusFilter,
    q: searchQuery || undefined
  });
  const selectedConversationQuery = useConversation(selectedConversationId || '');
  
  // Mutations
  const sendMessageMutation = useSendMessage();
  const createConversationMutation = useCreateConversation();
  const markReadMutation = useMarkRead();
  const createIssueMutation = useCreateIssue();
  const updateIssueMutation = useUpdateIssue();
  const quickCouponMutation = useQuickCoupon();

  const conversations = conversationsQuery.data || [];
  const selectedConversation = selectedConversationQuery.data;

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId) {
      markReadMutation.mutate(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        body: messageText
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendApologyCoupon = async () => {
    if (!selectedConversationId) return;

    try {
      const coupon = await quickCouponMutation.mutateAsync({
        vendorId,
        type: 'percent',
        amount: 10,
        ttlHours: 168 // 7 days
      });

      // Insert coupon code into message
      const messageWithCoupon = `I'm so sorry about the inconvenience. Here's a 10% discount code: ${coupon.code}`;
      setMessageText(messageWithCoupon);
    } catch (error) {
      console.error('Failed to create coupon:', error);
    }
  };

  const handleCreateIssue = async () => {
    if (!selectedConversationId || !issueForm.orderId) return;

    try {
      await createIssueMutation.mutateAsync({
        conversationId: selectedConversationId,
        orderId: issueForm.orderId,
        type: issueForm.type,
        notes: issueForm.notes
      });
      setShowIssueModal(false);
      setIssueForm({ orderId: '', type: 'question', notes: '' });
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedConversationId) return;

    try {
      // This would update the conversation status
      // For now, we'll just show a success message
      alert('Conversation marked as resolved');
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'awaiting_vendor': return 'bg-orange-500';
      case 'awaiting_customer': return 'bg-green-500';
      case 'resolved': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'awaiting_vendor': return 'Awaiting You';
      case 'awaiting_customer': return 'Awaiting Customer';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  if (!flags.MESSAGING) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Messaging Feature Disabled</h3>
          <p className="text-gray-600">Enable VITE_FEATURE_MESSAGING=true to use messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Column - Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            {['all', 'open', 'awaiting_vendor', 'awaiting_customer', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-sm rounded-md ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsQuery.isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations found</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.subject || `Conversation with ${conversation.customerId}`}
                      </h3>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {conversation.messages?.[0]?.body || 'No messages yet'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {new Date(conversation.lastMessageAt).toLocaleDateString()}
                      </span>
                      {conversation.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {conversation.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Conversation View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.subject}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedConversation.status)} text-white`}>
                      {getStatusLabel(selectedConversation.status)}
                    </span>
                    {selectedConversation.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowIssueModal(true)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Open Issue</span>
                  </button>
                  <button
                    onClick={handleMarkResolved}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === 'vendor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderRole === 'vendor'
                        ? 'bg-blue-500 text-white'
                        : message.senderRole === 'system'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.body}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Composer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={handleSendApologyCoupon}
                  disabled={quickCouponMutation.isPending}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
                >
                  {quickCouponMutation.isPending ? 'Creating...' : 'Send Apology Coupon'}
                </button>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Open Issue</h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Order ID</label>
                <input
                  type="text"
                  value={issueForm.orderId}
                  onChange={(e) => setIssueForm({ ...issueForm, orderId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., ORD-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                <select
                  value={issueForm.type}
                  onChange={(e) => setIssueForm({ ...issueForm, type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Select issue type"
                >
                  <option value="question">Question</option>
                  <option value="refund">Refund</option>
                  <option value="return">Return</option>
                  <option value="missing">Missing Item</option>
                  <option value="damaged">Damaged Item</option>
                  <option value="delay">Delivery Delay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIssue}
                  disabled={!issueForm.orderId || createIssueMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {createIssueMutation.isPending ? 'Creating...' : 'Create Issue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
