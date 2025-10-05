import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  AlertTriangle,
  Info,
  MessageSquare,
  User,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import Button from './ui/Button';
import { Badge } from './ui/Badge';

// Removed unused colors object

interface SystemMessage {
  id: string;
  vendorProfileId: string;
  userId?: string;
  scope: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SystemMessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemMessagesDrawer({ isOpen, onClose }: SystemMessagesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  // Fetch system messages
  const { data: messagesData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'messages', { searchQuery, selectedScope, showUnreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedScope) params.append('scope', selectedScope);
      if (showUnreadOnly) params.append('read', 'false');
      params.append('limit', '50');

      const response = await fetch(`/api/admin/messages?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch system messages');
      const result = await response.json();
      return result.data;
    },
    enabled: isOpen,
  });

  // Fetch message statistics
  const { data: stats } = useQuery({
    queryKey: ['admin', 'messages', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/messages/stats');
      if (!response.ok) throw new Error('Failed to fetch message stats');
      const result = await response.json();
      return result.data;
    },
    enabled: isOpen,
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/admin/messages/${messageId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
  });

  // Mark multiple messages as read
  const markMultipleAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const response = await fetch('/api/admin/messages/read-multiple', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds }),
      });
      if (!response.ok) throw new Error('Failed to mark messages as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setSelectedMessages(new Set());
    },
  });

  // Delete message
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Removed unused getScopeColor function

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'success': return <Check className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleSelectMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messagesData?.messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messagesData?.messages.map((m: SystemMessage) => m.id) || []));
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedMessages.size > 0) {
      markMultipleAsReadMutation.mutate(Array.from(selectedMessages));
    }
  };

  const scopes = [
    { value: '', label: 'All Scopes' },
    { value: 'orders', label: 'Orders' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'labels', label: 'Labels' },
    { value: 'events', label: 'Events' },
    { value: 'support', label: 'Support' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-[#7F232E]" />
                <div>
                  <h2 className="text-xl font-semibold text-[#2b2b2b]">System Messages</h2>
                  {stats && (
                    <p className="text-sm text-[#4b4b4b]">
                      {stats.unread} unread of {stats.total} total
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => refetch()}
                  className="p-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#4b4b4b]" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  title="Filter by scope"
                >
                  {scopes.map(scope => (
                    <option key={scope.value} value={scope.value}>
                      {scope.label}
                    </option>
                  ))}
                </select>
                
                <Button
                  variant={showUnreadOnly ? 'primary' : 'secondary'}
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Unread Only
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedMessages.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[#7F232E]/10 rounded-lg">
                  <span className="text-sm text-[#7F232E] font-medium">
                    {selectedMessages.size} selected
                  </span>
                  <Button
                    variant="secondary"
                    onClick={handleMarkSelectedAsRead}
                    disabled={markMultipleAsReadMutation.isPending}
                    className="flex items-center gap-1 text-sm px-3 py-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark Read
                  </Button>
                </div>
              )}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : messagesData?.messages.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No messages found</h3>
                  <p className="text-[#4b4b4b]">
                    {searchQuery || selectedScope || showUnreadOnly
                      ? 'Try adjusting your filters.'
                      : 'No system messages yet.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* Select All */}
                  <div className="flex items-center gap-2 p-2">
                    <input
                      type="checkbox"
                      checked={selectedMessages.size === messagesData?.messages.length && messagesData?.messages.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                      title="Select all messages"
                    />
                    <span className="text-sm text-[#4b4b4b]">Select All</span>
                  </div>

                  {messagesData?.messages.map((message: SystemMessage) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        message.readAt
                          ? 'border-gray-200 bg-white'
                          : 'border-[#7F232E]/20 bg-[#7F232E]/5'
                      }`}
                      onClick={() => handleSelectMessage(message.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMessages.has(message.id)}
                          onChange={() => handleSelectMessage(message.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 rounded border-gray-300"
                          title={`Select message: ${message.title}`}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(message.type)}
                              <h3 className="font-medium text-[#2b2b2b] truncate">
                                {message.title}
                              </h3>
                              {!message.readAt && (
                                <div className="w-2 h-2 bg-[#7F232E] rounded-full"></div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {message.scope}
                              </Badge>
                              <span className="text-xs text-[#4b4b4b]">
                                {formatDate(message.createdAt.toString())}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-[#4b4b4b] mb-2 line-clamp-2">
                            {message.body}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-[#4b4b4b]">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {message.vendorProfileId}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(message.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!message.readAt && (
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(message.id);
                              }}
                              className="p-1"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMessageMutation.mutate(message.id);
                            }}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
