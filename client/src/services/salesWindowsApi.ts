import axios from 'axios';
import { SalesWindow, SalesWindowStats } from '../types/sales-windows';

// API service for sales windows
export class SalesWindowsAPI {
  private baseURL = '/api/vendor/sales-windows';

  /**
   * Get all sales windows for vendor
   */
  async getSalesWindows(params?: {
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
    q?: string;
  }): Promise<{
    data: SalesWindow[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.q) searchParams.set('q', params.q);

    const response = await axios.get(`${this.baseURL}?${searchParams}`, {
      withCredentials: true
    });

    return response.data;
  }

  /**
   * Get single sales window by ID
   */
  async getSalesWindow(id: string): Promise<SalesWindow> {
    const response = await axios.get(`${this.baseURL}/${id}`, {
      withCredentials: true
    });

    return response.data.data;
  }

  /**
   * Create new sales window
   */
  async createSalesWindow(data: {
    type: string;
    name: string;
    description?: string;
    preorder_open_at?: string;
    preorder_close_at?: string;
    fulfill_start_at?: string;
    fulfill_end_at?: string;
    location_name?: string;
    address_text?: string;
    capacity_total?: number;
    auto_close_when_full?: boolean;
  }): Promise<SalesWindow> {
    const response = await axios.post(this.baseURL, data, {
      withCredentials: true
    });

    return response.data.data;
  }

  /**
   * Update sales window
   */
  async updateSalesWindow(id: string, data: Partial<SalesWindow>): Promise<SalesWindow> {
    const response = await axios.put(`${this.baseURL}/${id}`, data, {
      withCredentials: true
    });

    return response.data.data;
  }

  /**
   * Open sales window
   */
  async openSalesWindow(id: string): Promise<SalesWindow> {
    const response = await axios.post(`${this.baseURL}/${id}/open`, {}, {
      withCredentials: true
    });

    return response.data.data;
  }

  /**
   * Close sales window
   */
  async closeSalesWindow(id: string): Promise<SalesWindow> {
    const response = await axios.post(`${this.baseURL}/${id}/close`, {}, {
      withCredentials: true
    });

    return response.data.data;
  }

  /**
   * Duplicate sales window
   */
  async duplicateSalesWindow(id: string): Promise<SalesWindow> {
    const response = await axios.post(`${this.baseURL}/${id}/duplicate`, {}, {
      withCredentials: true
    });

    return response.data.data;
  }

  /**
   * Update products for sales window
   */
  async updateSalesWindowProducts(id: string, products: Array<{
    productId: string;
    price_override?: number;
    qty_limit_per_customer?: number;
    active?: boolean;
  }>): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/products/bulk`, {
      products
    }, {
      withCredentials: true
    });
  }

  /**
   * Create time slots for sales window
   */
  async createTimeSlots(id: string, config: {
    slot_length_min: number;
    slot_capacity: number;
    start_time: string;
    end_time: string;
  }): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/slots`, config, {
      withCredentials: true
    });
  }

  /**
   * Get sales windows statistics
   */
  async getSalesWindowsStats(): Promise<SalesWindowStats> {
    // Since there's no specific stats endpoint, calculate from all windows
    const { data: windows } = await this.getSalesWindows();
    
    const now = new Date();
    const stats: SalesWindowStats = {
      totalWindows: windows.length,
      openWindows: windows.filter(w => w.status === 'OPEN').length,
      scheduledWindows: windows.filter(w => w.status === 'SCHEDULED').length,
      draftWindows: windows.filter(w => w.status === 'DRAFT').length,
      closedWindows: windows.filter(w => ['CLOSED', 'FULFILLED', 'CANCELLED'].includes(w.status)).length,
      totalRevenue: 0 // Would need additional endpoint for revenue calculation
    };

    return stats;
  }
}

// Export singleton instance
export const salesWindowsApi = new SalesWindowsAPI();
