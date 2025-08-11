import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/http';

interface Ingredient {
  id: string;
  vendorId: string;
  name: string;
  unit: string;
  costPerUnit: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  inventory?: {
    id: string;
    quantity: number;
    costBasis: number;
    updatedAt: string;
  };
}

interface InventoryTransaction {
  id: string;
  vendorId: string;
  ingredientId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'waste';
  quantity: number;
  unitCost: number;
  note?: string;
  createdAt: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}

interface CreateIngredientData {
  name: string;
  unit: string;
  costPerUnit: number;
  tags?: string[];
}

interface PurchaseData {
  ingredientId: string;
  quantity: number;
  unitCost: number;
}

interface RecipeLinkData {
  productId: string;
  recipeId: string;
}

interface TransactionQueryOptions {
  from?: string;
  to?: string;
  type?: 'purchase' | 'sale' | 'adjustment' | 'waste';
}

// Hooks
export function useIngredients(vendorId: string) {
  return useQuery({
    queryKey: ['ingredients', vendorId],
    queryFn: async (): Promise<Ingredient[]> => {
      const response = await api.get(`/api/inventory/vendor/${vendorId}/ingredients`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInventoryTransactions(vendorId: string, options: TransactionQueryOptions = {}) {
  const { from, to, type } = options;
  
  return useQuery({
    queryKey: ['inventory-transactions', vendorId, from, to, type],
    queryFn: async (): Promise<InventoryTransaction[]> => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (type) params.append('type', type);
      
      const response = await api.get(`/api/inventory/vendor/${vendorId}/transactions?${params.toString()}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: CreateIngredientData }): Promise<Ingredient> => {
      const response = await api.post(`/api/inventory/vendor/${vendorId}/ingredients`, data);
      return response.data;
    },
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', vendorId] });
    },
  });
}

export function usePurchase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: PurchaseData }): Promise<any> => {
      const response = await api.post(`/api/inventory/vendor/${vendorId}/purchase`, data);
      return response.data;
    },
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions', vendorId] });
    },
  });
}

export function useLinkRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: RecipeLinkData }): Promise<any> => {
      const response = await api.post(`/api/inventory/vendor/${vendorId}/link-recipe`, data);
      return response.data;
    },
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', vendorId] });
    },
  });
}
