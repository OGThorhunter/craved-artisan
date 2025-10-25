import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/http';

interface CreateIssueParams {
  conversationId: string;
  orderId: string;
  type: string;
  notes?: string;
}

interface UpdateIssueParams {
  id: string;
  status: string;
  notes?: string;
}

// Hook to create an issue
export function useCreateIssue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreateIssueParams) => {
      const response = await api.post('/api/issues', params);
      return response.data;
    },
    onSuccess: (_, { conversationId }) => {
      // Invalidate conversation queries
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });
}

// Hook to update an issue
export function useUpdateIssue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...params }: UpdateIssueParams) => {
      const response = await api.put(`/api/issues/${id}`, params);
      return response.data;
    },
    onSuccess: (issue) => {
      // Invalidate conversation queries
      queryClient.invalidateQueries({ queryKey: ['conversation', issue.conversationId] });
    },
  });
}
