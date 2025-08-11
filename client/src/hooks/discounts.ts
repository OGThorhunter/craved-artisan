import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/http';

interface QuickCouponParams {
  vendorId: string;
  type: 'percent' | 'fixed';
  amount: number;
  ttlHours?: number;
  maxUses?: number;
}

interface QuickCouponResponse {
  code: string;
  display: string;
  expiresAt: string;
  maxUses?: number;
}

// Hook to create a quick coupon
export function useQuickCoupon() {
  return useMutation({
    mutationFn: async (params: QuickCouponParams): Promise<QuickCouponResponse> => {
      const response = await api.post('/api/discounts/quick', params);
      return response.data;
    },
  });
}
