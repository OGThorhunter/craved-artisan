import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Bell, AlertTriangle, TrendingUp, Calendar, Package, Check, CheckCheck, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { toast } from 'react-hot-toast';

interface SystemMessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scope: string;
}

interface SystemMessage {
  id: string;
  scope: string;
  type: string;
  title: string;
  body: string;
  data: any;
  readAt: string | null;
  createdAt: string;
}

const SystemMessagesDrawer: React.FC<SystemMessagesDrawerProps> = ({
  isOpen,
  onClose,
  scope
}) => {
  const queryClient = useQueryClient();
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  // Fetch system messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['ai-system-messages', scope],
    queryFn: async () => {
      const response = await fetch(`/api/ai/system-messages?scope=${scope}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch system messages');
      }
      
      return response.json();
    }
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch('/api/ai/system-messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-messages'] });
      toast.success('Messages marked as read');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor/system-messages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-messages'] });
      toast.success('Message deleted');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSelectMessage = (id: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMessages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messagesData?.messages?.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messagesData?.messages?.map((m: SystemMessage) => m.id) || []));
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedMessages.size === 0) return;
    
    const unreadIds = Array.from(selectedMessages).filter(id => {
      const message = messagesData?.messages?.find((m: SystemMessage) => m.id === id);
      return message && !message.readAt;
    });
    
    if (unreadIds.length > 0) {
      markReadMutation.mutate(unreadIds);
    }
    
    setSelectedMessages(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedMessages.size === 0) return;
    
    if (window.confirm(`Delete ${selectedMessages.size} message(s)?`)) {
      selectedMessages.forEach(id => {
        deleteMessageMutation.mutate(id);
      });
      setSelectedMessages(new Set());
    }
  };

  const handleMarkAsRead = (message: SystemMessage) => {
    if (!message.readAt) {
      markReadMutation.mutate([message.id]);
    }
  };

  const handleDelete = (message: SystemMessage) => {
    if (window.confirm('Delete this message?')) {
      deleteMessageMutation.mutate(message.id);
    }
  };

  const handleOpenRelated = (message: SystemMessage) => {
    if (message.data?.route) {
      // Navigate to related page
      window.location.href = message.data.route;
    } else {
      toast.success('No related page available');
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'restock_alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'price_watch_hit':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'shortfall':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'seasonal_forecast':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'receipt_parsed':
        return <Check className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'restock_alert':
        return 'Restock Alert';
      case 'price_watch_hit':
        return 'Price Watch Hit';
      case 'shortfall':
        return 'Shortfall Warning';
      case 'seasonal_forecast':
        return 'Seasonal Forecast';
      case 'receipt_parsed':
        return 'Receipt Parsed';
      default:
        return 'System Message';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'restock_alert':
        return 'red';
      case 'price_watch_hit':
        return 'green';
      case 'shortfall':
        return 'orange';
      case 'seasonal_forecast':
        return 'purple';
      case 'receipt_parsed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const unreadMessages = messagesData?.messages?.filter((m: SystemMessage) => !m.readAt) || [];
  const readMessages = messagesData?.messages?.filter((m: SystemMessage) => m.readAt) || [];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">System Messages</h2>
              <p className="text-sm text-gray-600">
                {messagesData?.unreadCount || 0} unread messages
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X size={20} />
            </Button>
          </div>
          
          {/* Actions */}
          {messagesData?.messages?.length > 0 && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={handleSelectAll}
                >
                  {selectedMessages.size === messagesData?.messages?.length ? 'Deselect All' : 'Select All'}
                </Button>
                
                {selectedMessages.size > 0 && (
                  <>
                    <Button
                      variant="secondary"
                      className="text-xs"
                      onClick={handleMarkSelectedAsRead}
                      disabled={markReadMutation.isPending}
                    >
                      <CheckCheck size={16} />
                      Mark Read
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-xs"
                      onClick={handleDeleteSelected}
                      disabled={deleteMessageMutation.isPending}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                {selectedMessages.size} selected
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <Tabs defaultValue="unread" className="h-full">
                <TabsList className="grid w-full grid-cols-2 m-4">
                  <TabsTrigger value="unread" className="flex items-center gap-2">
                    <Bell size={16} />
                    Unread ({unreadMessages.length})
                  </TabsTrigger>
                  <TabsTrigger value="read" className="flex items-center gap-2">
                    <CheckCheck size={16} />
                    Read ({readMessages.length})
                  </TabsTrigger>
                </TabsList>
                
                {/* Unread Messages */}
                <TabsContent value="unread" className="px-4 pb-4">
                  {unreadMessages.length === 0 ? (
                    <Card className="p-6 text-center">
                      <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Unread Messages</h4>
                      <p className="text-gray-600">You're all caught up!</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {unreadMessages.map((message: SystemMessage) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className={`p-4 border-l-4 border-l-${getMessageTypeColor(message.type)}-500 ${
                            selectedMessages.has(message.id) ? 'bg-blue-50' : ''
                          }`}>
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedMessages.has(message.id)}
                                onChange={() => handleSelectMessage(message.id)}
                                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                              />
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getMessageIcon(message.type)}
                                  <Badge variant="default" className="text-xs">
                                    {getMessageTypeLabel(message.type)}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <h4 className="font-semibold text-gray-900 mb-1">{message.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{message.body}</p>
                                
                                <div className="flex gap-2">
                                  <Button
                                    className="text-xs"
                                    variant="secondary"
                                    onClick={() => handleMarkAsRead(message)}
                                  >
                                    <Check size={16} />
                                    Mark Read
                                  </Button>
                                  {message.data?.route && (
                                    <Button
                                      className="text-xs"
                                      variant="secondary"
                                      onClick={() => handleOpenRelated(message)}
                                    >
                                      View Related
                                    </Button>
                                  )}
                                  <Button
                                    className="text-xs"
                                    variant="secondary"
                                    onClick={() => handleDelete(message)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Read Messages */}
                <TabsContent value="read" className="px-4 pb-4">
                  {readMessages.length === 0 ? (
                    <Card className="p-6 text-center">
                      <CheckCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Read Messages</h4>
                      <p className="text-gray-600">No read messages yet.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {readMessages.map((message: SystemMessage) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className={`p-4 opacity-75 ${
                            selectedMessages.has(message.id) ? 'bg-blue-50' : ''
                          }`}>
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedMessages.has(message.id)}
                                onChange={() => handleSelectMessage(message.id)}
                                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                              />
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getMessageIcon(message.type)}
                                  <Badge variant="default" className="text-xs">
                                    {getMessageTypeLabel(message.type)}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    • Read {new Date(message.readAt!).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <h4 className="font-semibold text-gray-900 mb-1">{message.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{message.body}</p>
                                
                                <div className="flex gap-2">
                                  {message.data?.route && (
                                    <Button
                                      className="text-xs"
                                      variant="secondary"
                                      onClick={() => handleOpenRelated(message)}
                                    >
                                      View Related
                                    </Button>
                                  )}
                                  <Button
                                    className="text-xs"
                                    variant="secondary"
                                    onClick={() => handleDelete(message)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SystemMessagesDrawer;

