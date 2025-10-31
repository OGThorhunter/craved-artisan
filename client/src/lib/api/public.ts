import { api } from '../http';

/**
 * Public API endpoints - no authentication required
 */

export interface PublicStats {
  totalVendors: number;
  totalProducts: number;
  totalCustomers: number;
  totalEvents: number;
}

export interface FeaturedVendor {
  id: string;
  businessName: string;
  tagline: string;
  avatarUrl?: string;
  rating: number;
  totalProducts: number;
}

export interface TrendingProduct {
  id: string;
  name: string;
  price: number;
  thumbUrl?: string;
  ratingAvg: number;
  ratingCount: number;
  vendor: {
    id: string;
    businessName: string;
  };
}

/**
 * Get public statistics for homepage
 */
export async function getPublicStats(): Promise<PublicStats> {
  const response = await api.get('/public/stats');
  return response.data;
}

/**
 * Get featured vendors for homepage
 */
export async function getFeaturedVendors(limit = 8): Promise<FeaturedVendor[]> {
  const response = await api.get(`/public/vendors/featured?limit=${limit}`);
  return response.data;
}

/**
 * Get trending products for homepage
 */
export async function getTrendingProducts(limit = 8): Promise<TrendingProduct[]> {
  const response = await api.get(`/public/products/trending?limit=${limit}`);
  return response.data;
}

