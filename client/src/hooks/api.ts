import { useQuery } from '@tanstack/react-query';
import { http } from '../lib/http';

// Types - fallback to inferred types until OpenAPI types are generated
interface Product {
  id: string;
  vendorId: string;
  title: string;
  price: number;
  imageUrl: string;
  tags: string[];
  availability: 'in_stock' | 'low' | 'out';
}

interface Vendor {
  id: string;
  name: string;
  city: string;
  state: string;
  tagline?: string;
  verified?: boolean;
}

interface ProductListResponse {
  data: Product[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface VendorProductsResponse {
  data: Product[];
  meta: {
    total: number;
  };
}

// API hooks
export function useProducts({ limit = 12, offset = 0 } = {}) {
  return useQuery({
    queryKey: ['products', { limit, offset }],
    queryFn: async (): Promise<ProductListResponse> => {
      const response = await http(`/products?limit=${limit}&offset=${offset}`);
      return response.json();
    },
    staleTime: 5000,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product> => {
      const response = await http(`/products/${productId}`);
      return response.json();
    },
    staleTime: 5000,
    enabled: !!productId,
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async (): Promise<Vendor> => {
      const response = await http(`/vendors/${vendorId}`);
      return response.json();
    },
    staleTime: 5000,
    enabled: !!vendorId,
  });
}

export function useVendorProducts(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-products', vendorId],
    queryFn: async (): Promise<VendorProductsResponse> => {
      const response = await http(`/vendors/${vendorId}/products`);
      return response.json();
    },
    staleTime: 5000,
    enabled: !!vendorId,
  });
}
