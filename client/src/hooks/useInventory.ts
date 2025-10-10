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
  // Additional fields for cost calculation
  avg_cost?: number;
  last_cost?: number;
  current_qty?: number;
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
  },
  {
    id: '5',
    name: 'All-Purpose Flour',
    description: 'High-quality all-purpose flour for baking',
    category: 'food_grade',
    currentStock: 5,
    reorderPoint: 20,
    unit: 'kg',
    unitPrice: 2.50,
    totalValue: 12.50,
    supplier: 'ABC Suppliers',
    batch: 'APF-2024-005',
    expiryDate: '2024-12-31',
    tags: ['flour', 'baking', 'all-purpose'],
    location: 'Storage Room A',
    isExpired: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '6',
    name: 'Granulated Sugar',
    description: 'Fine granulated white sugar',
    category: 'food_grade',
    currentStock: 3,
    reorderPoint: 15,
    unit: 'kg',
    unitPrice: 1.80,
    totalValue: 5.40,
    supplier: 'ABC Suppliers',
    batch: 'GS-2024-006',
    expiryDate: '2025-06-30',
    tags: ['sugar', 'granulated', 'sweetener'],
    location: 'Storage Room A',
    isExpired: false,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '7',
    name: 'Butter (Unsalted)',
    description: 'Premium unsalted butter',
    category: 'food_grade',
    currentStock: 2,
    reorderPoint: 10,
    unit: 'lb',
    unitPrice: 4.50,
    totalValue: 9.00,
    supplier: 'Dairy Direct',
    batch: 'BU-2024-007',
    expiryDate: '2024-11-30',
    tags: ['butter', 'dairy', 'unsalted'],
    location: 'Refrigerator',
    isExpired: false,
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-25T09:15:00Z'
  },
  {
    id: '8',
    name: 'Active Dry Yeast',
    description: 'Fast-acting dry yeast packets',
    category: 'food_grade',
    currentStock: 8,
    reorderPoint: 6,
    unit: 'packets',
    unitPrice: 0.75,
    totalValue: 6.00,
    supplier: 'ABC Suppliers',
    batch: 'ADY-2024-008',
    expiryDate: '2024-12-31',
    tags: ['yeast', 'dry', 'baking'],
    location: 'Cool Storage',
    isExpired: false,
    createdAt: '2024-02-01T11:45:00Z',
    updatedAt: '2024-02-01T11:45:00Z'
  },
  {
    id: '9',
    name: 'Chocolate Chips',
    description: 'Premium dark chocolate chips',
    category: 'food_grade',
    currentStock: 1,
    reorderPoint: 8,
    unit: 'kg',
    unitPrice: 8.50,
    totalValue: 8.50,
    supplier: 'Chocolate Co',
    batch: 'CC-2024-009',
    expiryDate: '2024-11-30',
    tags: ['chocolate', 'chips', 'dark'],
    location: 'Cool Storage',
    isExpired: false,
    createdAt: '2024-02-05T13:20:00Z',
    updatedAt: '2024-02-05T13:20:00Z'
  },
  {
    id: '10',
    name: 'Bread Flour (High Protein)',
    description: 'High protein bread flour for artisan breads',
    category: 'food_grade',
    currentStock: 4,
    reorderPoint: 15,
    unit: 'kg',
    unitPrice: 3.20,
    totalValue: 12.80,
    supplier: 'Local Mill Co',
    batch: 'BF-2024-010',
    expiryDate: '2024-12-31',
    tags: ['flour', 'bread', 'high-protein'],
    location: 'Storage Room A',
    isExpired: false,
    createdAt: '2024-02-10T15:30:00Z',
    updatedAt: '2024-02-10T15:30:00Z'
  },
  {
    id: '11',
    name: 'Brown Sugar (Dark)',
    description: 'Dark brown sugar for rich flavor',
    category: 'food_grade',
    currentStock: 2,
    reorderPoint: 8,
    unit: 'kg',
    unitPrice: 2.10,
    totalValue: 4.20,
    supplier: 'Sweet Supply Co',
    batch: 'BS-2024-011',
    expiryDate: '2025-06-30',
    tags: ['sugar', 'brown', 'dark'],
    location: 'Storage Room A',
    isExpired: false,
    createdAt: '2024-02-15T08:45:00Z',
    updatedAt: '2024-02-15T08:45:00Z'
  },
  {
    id: '12',
    name: 'Eggs (Large)',
    description: 'Fresh large eggs',
    category: 'food_grade',
    currentStock: 0,
    reorderPoint: 12,
    unit: 'dozen',
    unitPrice: 3.50,
    totalValue: 0.00,
    supplier: 'Farm Fresh Dairy',
    batch: 'EG-2024-012',
    expiryDate: '2024-10-15',
    tags: ['eggs', 'fresh', 'large'],
    location: 'Refrigerator',
    isExpired: false,
    createdAt: '2024-02-20T12:15:00Z',
    updatedAt: '2024-02-20T12:15:00Z'
  }
];

// Hooks
export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventory-items'],
    queryFn: async (): Promise<InventoryItem[]> => {
      try {
        const response = await fetch('/api/inventory/items');
        if (!response.ok) {
          throw new Error('Failed to fetch inventory items');
        }
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.warn('Failed to fetch inventory from API, using mock data:', error);
        // Fallback to mock data if API fails
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockInventoryData;
      }
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













