import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/http';

interface VendorPNLData {
  period: {
    from: string;
    to: string;
  };
  revenue: number;
  cogs: number;
  fees: {
    platform: number;
    stripe: number;
    total: number;
  };
  grossProfit: number;
  expenses: number;
  netIncome: number;
}

interface VendorCashFlowData {
  period: {
    from: string;
    to: string;
  };
  method: 'direct' | 'indirect';
  inflows?: {
    sales: number;
  };
  outflows?: {
    cogs: number;
    fees: number;
  };
  netIncome?: number;
  adjustments?: {
    deltaWorkingCapital: number;
  };
  net: number;
}

interface VendorBalanceSheetData {
  asOf: string;
  assets: {
    cash: number;
    inventory: number;
  };
  liabilities: {
    payables: number;
    taxesPayable: number;
  };
  equity: number;
}

interface FinancialsOptions {
  from?: string;
  to?: string;
  method?: 'direct' | 'indirect';
  asOf?: string;
}

export function useVendorPNL(vendorId: string, options: FinancialsOptions = {}) {
  const { from, to } = options;
  
  return useQuery({
    queryKey: ['vendor-pnl', vendorId, from, to],
    queryFn: async (): Promise<VendorPNLData> => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      
      const response = await api.get(`/financials/vendor/${vendorId}/pnl?${params.toString()}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useVendorCashFlow(vendorId: string, options: FinancialsOptions = {}) {
  const { from, to, method = 'direct' } = options;
  
  return useQuery({
    queryKey: ['vendor-cash-flow', vendorId, from, to, method],
    queryFn: async (): Promise<VendorCashFlowData> => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      params.append('method', method);
      
      const response = await api.get(`/financials/vendor/${vendorId}/cash-flow?${params.toString()}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useVendorBalanceSheet(vendorId: string, options: FinancialsOptions = {}) {
  const { asOf } = options;
  
  return useQuery({
    queryKey: ['vendor-balance-sheet', vendorId, asOf],
    queryFn: async (): Promise<VendorBalanceSheetData> => {
      const params = new URLSearchParams();
      if (asOf) params.append('asOf', asOf);
      
      const response = await api.get(`/financials/vendor/${vendorId}/balance-sheet?${params.toString()}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Fallback mock data for when the feature flag is disabled
export function useMockVendorPNL(vendorId: string, options: FinancialsOptions = {}) {
  const { from, to } = options;
  
  return useQuery({
    queryKey: ['mock-vendor-pnl', vendorId, from, to],
    queryFn: async (): Promise<VendorPNLData> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date();
      const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : now;
      
      const revenue = Math.floor(Math.random() * 10000) + 2000;
      const cogs = Math.floor(revenue * 0.6);
      const platformFees = Math.floor(revenue * 0.01);
      const stripeFees = Math.floor(revenue * 0.029) + 30;
      const totalFees = platformFees + stripeFees;
      const grossProfit = revenue - cogs;
      const netIncome = grossProfit - totalFees;
      
      return {
        period: {
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        },
        revenue,
        cogs,
        fees: {
          platform: platformFees,
          stripe: stripeFees,
          total: totalFees
        },
        grossProfit,
        expenses: totalFees,
        netIncome
      };
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMockVendorCashFlow(vendorId: string, options: FinancialsOptions = {}) {
  const { from, to, method = 'direct' } = options;
  
  return useQuery({
    queryKey: ['mock-vendor-cash-flow', vendorId, from, to, method],
    queryFn: async (): Promise<VendorCashFlowData> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date();
      const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : now;
      
      if (method === 'direct') {
        const sales = Math.floor(Math.random() * 10000) + 2000;
        const cogs = Math.floor(sales * 0.6);
        const fees = Math.floor(sales * 0.039) + 30;
        const net = sales - cogs - fees;
        
        return {
          period: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          },
          method: 'direct',
          inflows: { sales },
          outflows: { cogs, fees },
          net
        };
      } else {
        const netIncome = Math.floor(Math.random() * 3000) + 500;
        const deltaWorkingCapital = Math.floor(Math.random() * 1000) - 500;
        const net = netIncome + deltaWorkingCapital;
        
        return {
          period: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          },
          method: 'indirect',
          netIncome,
          adjustments: { deltaWorkingCapital },
          net
        };
      }
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMockVendorBalanceSheet(vendorId: string, options: FinancialsOptions = {}) {
  const { asOf } = options;
  
  return useQuery({
    queryKey: ['mock-vendor-balance-sheet', vendorId, asOf],
    queryFn: async (): Promise<VendorBalanceSheetData> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const asOfDate = asOf ? new Date(asOf) : new Date();
      
      const cash = Math.floor(Math.random() * 5000) + 1000;
      const inventory = Math.floor(Math.random() * 3000) + 500;
      const payables = Math.floor(Math.random() * 2000) + 200;
      const taxesPayable = Math.floor(Math.random() * 1000) + 100;
      const equity = cash + inventory - payables - taxesPayable;
      
      return {
        asOf: asOfDate.toISOString(),
        assets: { cash, inventory },
        liabilities: { payables, taxesPayable },
        equity
      };
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}
