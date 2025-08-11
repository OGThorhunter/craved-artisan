import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/http';

interface RestockSuggestion {
  ingredientId: string;
  name: string;
  onHand: number;
  dailyVelocity: number;
  leadTimeDays: number;
  reorderPoint: number;
  suggestedQty: number;
  preferredSupplierId: string | null;
}

interface PurchaseOrderLine {
  ingredientId: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseOrder {
  poNumber: string;
  vendorId: string;
  supplierId: string | null;
  lines: PurchaseOrderLine[];
  status: string;
  createdAt: string;
  totalAmount: number;
}

// Hook to get restock suggestions
export function useRestockSuggestions(vendorId: string, lookbackDays: number = 30) {
  return useQuery({
    queryKey: ['restock-suggestions', vendorId, lookbackDays],
    queryFn: async (): Promise<RestockSuggestion[]> => {
      const response = await api.get(`/api/restock/vendor/${vendorId}/suggestions?lookbackDays=${lookbackDays}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook to create purchase order
export function useCreatePO(vendorId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { supplierId?: string; lines: PurchaseOrderLine[] }): Promise<PurchaseOrder> => {
      const response = await api.post(`/api/restock/vendor/${vendorId}/purchase-order`, data);
      return response.data;
    },
    onSuccess: (_, { lines }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['restock-suggestions', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['ingredients', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions', vendorId] });
    },
  });
}
