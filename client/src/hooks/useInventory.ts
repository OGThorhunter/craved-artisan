import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Types
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'equipment';
  currentStock: number;
  reorderPoint: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  batch?: string;
  expiryDate?: string;
  tags: string[];
  location: string;
  isExpired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemData {
  name: string;
  description: string;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'equipment';
  currentStock: number;
  reorderPoint: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  batch?: string;
  expiryDate?: string;
  tags: string[];
  location: string;
}

export interface UpdateInventoryItemData extends Partial<CreateInventoryItemData> {
  id: string;
}

// Mock data for development
const mockInventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Organic Flour',
    description: 'High-quality organic all-purpose flour',
    category: 'food_grade',
    currentStock: 25,
    reorderPoint: 10,
    unit: 'kg',
    unitPrice: 3.50,
    totalValue: 87.50,
    supplier: 'Local Organic Farm',
    batch: 'OF-2024-001',
    expiryDate: '2024-12-31',
    tags: ['organic', 'flour', 'baking'],
    location: 'Storage Room A',
    isExpired: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Vanilla Extract',
    description: 'Pure Madagascar vanilla extract',
    category: 'food_grade',
    currentStock: 5,
    reorderPoint: 8,
    unit: 'bottles',
    unitPrice: 12.00,
    totalValue: 60.00,
    supplier: 'Premium Spices Co',
    batch: 'VE-2024-002',
    expiryDate: '2025-06-30',
    tags: ['vanilla', 'extract', 'premium'],
    location: 'Spice Cabinet',
    isExpired: false,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Packaging Boxes',
    description: 'Eco-friendly cardboard boxes for products',
    category: 'packaging',
    currentStock: 100,
    reorderPoint: 50,
    unit: 'boxes',
    unitPrice: 2.25,
    totalValue: 225.00,
    supplier: 'Green Packaging Solutions',
    batch: 'PB-2024-003',
    tags: ['packaging', 'eco-friendly', 'cardboard'],
    location: 'Storage Room B',
    isExpired: false,
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-25T09:15:00Z'
  },
  {
    id: '4',
    name: 'Expired Sugar',
    description: 'Granulated white sugar (EXPIRED)',
    category: 'food_grade',
    currentStock: 15,
    reorderPoint: 20,
    unit: 'kg',
    unitPrice: 1.80,
    totalValue: 27.00,
    supplier: 'Sweet Supplies Inc',
    batch: 'SG-2023-001',
    expiryDate: '2023-12-31',
    tags: ['sugar', 'expired'],
    location: 'Storage Room A',
    isExpired: true,
    createdAt: '2023-12-01T08:00:00Z',
    updatedAt: '2023-12-01T08:00:00Z'
  }
];

// Hooks
export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventory-items'],
    queryFn: async (): Promise<InventoryItem[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInventoryData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async (): Promise<InventoryItem | null> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockInventoryData.find(item => item.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateInventoryItemData): Promise<InventoryItem> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...data,
        totalValue: data.currentStock * data.unitPrice,
        isExpired: data.expiryDate ? new Date(data.expiryDate) < new Date() : false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newItem;
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(['inventory-items'], (old: InventoryItem[] = []) => [...old, newItem]);
      toast.success('Item added successfully!');
    },
    onError: () => {
      toast.error('Failed to add item');
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateInventoryItemData): Promise<InventoryItem> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedItem: InventoryItem = {
        ...data,
        totalValue: (data.currentStock || 0) * (data.unitPrice || 0),
        isExpired: data.expiryDate ? new Date(data.expiryDate) < new Date() : false,
        updatedAt: new Date().toISOString(),
      } as InventoryItem;
      
      return updatedItem;
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(['inventory-items'], (old: InventoryItem[] = []) =>
        old.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      queryClient.setQueryData(['inventory-item', updatedItem.id], updatedItem);
      toast.success('Item updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update item');
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['inventory-items'], (old: InventoryItem[] = []) =>
        old.filter(item => item.id !== id)
      );
      queryClient.removeQueries({ queryKey: ['inventory-item', id] });
      toast.success('Item deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });
}


