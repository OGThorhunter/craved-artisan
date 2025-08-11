import { useQuery } from '@tanstack/react-query';
import { http } from '../lib/http';
import { flags } from '../lib/flags';

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
      const path = flags.LIVE_PRODUCTS ? `/api/products?limit=${limit}&offset=${offset}` : `/products?limit=${limit}&offset=${offset}`;
      const response = await http(path);
      return response.json();
    },
    staleTime: 5000,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product> => {
      const path = flags.LIVE_PRODUCTS ? `/api/products/${productId}` : `/products/${productId}`;
      const response = await http(path);
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
      const path = flags.LIVE_PRODUCTS ? `/api/vendors/${vendorId}` : `/vendors/${vendorId}`;
      const response = await http(path);
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
      const path = flags.LIVE_PRODUCTS ? `/api/vendors/${vendorId}/products` : `/vendors/${vendorId}/products`;
      const response = await http(path);
      return response.json();
    },
    staleTime: 5000,
    enabled: !!vendorId,
  });
}
