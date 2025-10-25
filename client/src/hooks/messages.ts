import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/http';

interface Conversation {
  id: string;
  vendorId: string;
  customerId: string;
  subject?: string;
  status: string;
  tags: string[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  issues?: OrderIssue[];
}

interface Message {
  id: string;
  conversationId: string;
  senderRole: string;
  senderId: string;
  body: string;
  attachments: string[];
  createdAt: string;
  readBy: string[];
  sentiment?: string;
}

interface OrderIssue {
  id: string;
  conversationId: string;
  orderId: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateConversationParams {
  vendorId: string;
  customerId: string;
  subject?: string;
}

interface SendMessageParams {
  conversationId: string;
  body: string;
  attachments?: string[];
}

// Hook to get conversations
export function useConversations({ 
  status, 
  q, 
  limit = 30 
}: { 
  status?: string; 
  q?: string; 
  limit?: number; 
}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (q) params.append('q', q);
  params.append('limit', limit.toString());
  params.append('vendorId', 'dev-user-id'); // TODO: Get from context

  return useQuery({
    queryKey: ['conversations', status, q, limit],
    queryFn: async (): Promise<Conversation[]> => {
      const response = await api.get(`/api/messages/conversations?${params.toString()}`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

// Hook to get a single conversation
export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async (): Promise<Conversation> => {
      const response = await api.get(`/api/messages/conversations/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
    retry: 2,
  });
}

// Hook to send a message
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, body, attachments }: SendMessageParams): Promise<Message> => {
      const response = await api.post(`/api/messages/conversations/${conversationId}/message`, {
        body,
        attachments
      });
      return response.data;
    },
    onSuccess: (message, { conversationId }) => {
      // Invalidate conversation queries
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Hook to create a conversation
export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreateConversationParams): Promise<Conversation> => {
      const response = await api.post('/api/messages/conversations', params);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Hook to mark conversation as read
export function useMarkRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversationId: string): Promise<{ success: boolean }> => {
      const response = await api.put(`/api/messages/conversations/${conversationId}/read`);
      return response.data;
    },
    onSuccess: (_, conversationId) => {
      // Invalidate conversation queries
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Hook for SSE message stream
export function useMessageStream(vendorId: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['message-stream', vendorId],
    queryFn: async () => {
      // This is a placeholder - SSE would be handled differently
      // In a real implementation, you'd set up an EventSource
      return null;
    },
    enabled: false, // Don't auto-fetch
    staleTime: Infinity,
  });
}
