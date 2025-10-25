import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

interface FinancialsData {
  kpis: {
    revenue: number;
    profit: number;
    orders: number;
    avgOrderValue: number;
    grossMargin: number;
    netMargin: number;
    cashFlow: number;
    workingCapital: number;
  };
  series: Array<{
    date: string;
    revenue: number;
    profit: number;
    orders: number;
  }>;
}

interface ProfitLossData {
  period: {
    from: string;
    to: string;
  };
  revenue: {
    grossSales: number;
    returns: number;
    discounts: number;
    netSales: number;
  };
  cogs: {
    directMaterials: number;
    directLabor: number;
    manufacturingOverhead: number;
    totalCogs: number;
  };
  grossProfit: number;
  operatingExpenses: {
    marketing: number;
    sales: number;
    admin: number;
    technology: number;
    total: number;
  };
  ebitda: number;
  interest: number;
  taxes: number;
  netIncome: number;
}

interface BalanceSheetData {
  asOf: string;
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      totalCurrent: number;
    };
    fixed: {
      equipment: number;
      vehicles: number;
      buildings: number;
      totalFixed: number;
    };
    totalAssets: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      totalCurrent: number;
    };
    longTerm: {
      longTermDebt: number;
      deferredTaxes: number;
      totalLongTerm: number;
    };
    totalLiabilities: number;
  };
  equity: {
    commonStock: number;
    retainedEarnings: number;
    totalEquity: number;
  };
}

interface CashFlowData {
  period: {
    from: string;
    to: string;
  };
  operating: {
    netIncome: number;
    depreciation: number;
    changesInWorkingCapital: number;
    netOperatingCashFlow: number;
  };
  investing: {
    capitalExpenditures: number;
    assetSales: number;
    netInvestingCashFlow: number;
  };
  financing: {
    debtIssuance: number;
    debtRepayment: number;
    dividends: number;
    netFinancingCashFlow: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

interface AccountsReceivableData {
  summary: {
    totalOutstanding: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
  };
  aging: Array<{
    customer: string;
    invoice: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
    status: 'current' | 'overdue' | 'critical';
  }>;
  trends: Array<{
    date: string;
    totalOutstanding: number;
    current: number;
    overdue: number;
  }>;
}

interface AccountsPayableData {
  summary: {
    totalOutstanding: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
  };
  aging: Array<{
    vendor: string;
    invoice: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
    status: 'current' | 'overdue' | 'critical';
  }>;
  trends: Array<{
    date: string;
    totalOutstanding: number;
    current: number;
    overdue: number;
  }>;
}

interface ComprehensiveFinancialsData {
  profitLoss: ProfitLossData;
  balanceSheet: BalanceSheetData;
  cashFlow: CashFlowData;
  accountsReceivable: AccountsReceivableData;
  accountsPayable: AccountsPayableData;
  kpis: FinancialsData['kpis'];
  series: FinancialsData['series'];
}

interface FinancialsOptions {
  vendorId: string;
  range: 'week' | 'month' | 'quarter' | 'year';
  asOf?: string;
}

export function useFinancials({ vendorId, range, asOf }: FinancialsOptions, enabled: boolean = true) {
  console.log('=== COMPREHENSIVE FINANCIALS HOOK DEBUG ===');
  console.log('Vendor ID:', vendorId);
  console.log('Range:', range);
  console.log('As Of:', asOf);
  console.log('Enabled:', enabled);
  
  return useQuery({
    queryKey: ['comprehensive-financials', vendorId, range, asOf],
    queryFn: async (): Promise<ComprehensiveFinancialsData> => {
      console.log('=== COMPREHENSIVE FINANCIALS QUERY EXECUTING ===');
      
      // For development/testing, return comprehensive mock data
      if (import.meta.env.DEV) {
        console.log('Using comprehensive mock data for development');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockData = generateComprehensiveMockData(range, asOf);
        console.log('Comprehensive mock data generated:', mockData);
        return mockData;
      }
      
      console.log('Making real API call for comprehensive financials');
      // Real API call for comprehensive financials
      const params = new URLSearchParams({ range });
      if (asOf) params.append('asOf', asOf);
      
      const response = await http(`/api/analytics/comprehensive-financials/${vendorId}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate comprehensive data structure
      if (!data || !data.profitLoss || !data.balanceSheet || !data.cashFlow) {
        throw new Error('Invalid comprehensive financials data structure');
      }
      
      console.log('Comprehensive API data received:', data);
      return data;
    },
    enabled: enabled && !!vendorId,
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

function generateComprehensiveMockData(range: string, asOf?: string): ComprehensiveFinancialsData {
  const days = range === 'week' ? 7 : range === 'month' ? 30 : range === 'quarter' ? 90 : 365;
  const asOfDate = asOf ? new Date(asOf) : new Date();
  
  // Generate time series data
  const series = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 100,
      profit: Math.floor(Math.random() * 500) + 50,
      orders: Math.floor(Math.random() * 20) + 1,
    };
  });
  
  const totalRevenue = series.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = series.reduce((sum, item) => sum + item.profit, 0);
  const totalOrders = series.reduce((sum, item) => sum + item.orders, 0);
  
  // Generate comprehensive P&L
  const grossSales = totalRevenue * 1.1; // Include some returns/discounts
  const returns = grossSales * 0.05;
  const discounts = grossSales * 0.03;
  const netSales = grossSales - returns - discounts;
  const cogs = netSales * 0.65;
  const grossProfit = netSales - cogs;
  const operatingExpenses = grossProfit * 0.4;
  const ebitda = grossProfit - operatingExpenses;
  const interest = ebitda * 0.1;
  const taxes = (ebitda - interest) * 0.25;
  const netIncome = ebitda - interest - taxes;
  
  // Generate balance sheet
  const cash = totalRevenue * 0.3;
  const accountsReceivable = totalRevenue * 0.2;
  const inventory = cogs * 0.8;
  const prepaidExpenses = totalRevenue * 0.05;
  const totalCurrentAssets = cash + accountsReceivable + inventory + prepaidExpenses;
  
  const equipment = totalRevenue * 0.4;
  const vehicles = totalRevenue * 0.1;
  const buildings = totalRevenue * 0.8;
  const totalFixedAssets = equipment + vehicles + buildings;
  
  const accountsPayable = cogs * 0.6;
  const shortTermDebt = totalRevenue * 0.1;
  const accruedExpenses = totalRevenue * 0.05;
  const totalCurrentLiabilities = accountsPayable + shortTermDebt + accruedExpenses;
  
  const longTermDebt = totalRevenue * 0.5;
  const deferredTaxes = totalRevenue * 0.02;
  const totalLongTermLiabilities = longTermDebt + deferredTaxes;
  
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
  const totalAssets = totalCurrentAssets + totalFixedAssets;
  const totalEquity = totalAssets - totalLiabilities;
  
  // Generate cash flow
  const depreciation = totalFixedAssets * 0.1;
  const changesInWorkingCapital = (accountsReceivable + inventory + prepaidExpenses) - accountsPayable - accruedExpenses;
  const netOperatingCashFlow = netIncome + depreciation + changesInWorkingCapital;
  
  const capitalExpenditures = totalFixedAssets * 0.15;
  const assetSales = totalFixedAssets * 0.02;
  const netInvestingCashFlow = assetSales - capitalExpenditures;
  
  const debtIssuance = longTermDebt * 0.1;
  const debtRepayment = longTermDebt * 0.05;
  const dividends = netIncome * 0.2;
  const netFinancingCashFlow = debtIssuance - debtRepayment - dividends;
  
  const netCashFlow = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;
  const beginningCash = cash - netCashFlow;
  
  // Generate AR/AP data
  const arAging = generateARAgingData(accountsReceivable);
  const apAging = generateAPAgingData(accountsPayable);
  
  return {
    profitLoss: {
      period: {
        from: series[0]?.date || '',
        to: series[series.length - 1]?.date || '',
      },
      revenue: {
        grossSales,
        returns,
        discounts,
        netSales,
      },
      cogs: {
        directMaterials: cogs * 0.4,
        directLabor: cogs * 0.3,
        manufacturingOverhead: cogs * 0.3,
        totalCogs: cogs,
      },
      grossProfit,
      operatingExpenses: {
        marketing: operatingExpenses * 0.3,
        sales: operatingExpenses * 0.25,
        admin: operatingExpenses * 0.25,
        technology: operatingExpenses * 0.2,
        total: operatingExpenses,
      },
      ebitda,
      interest,
      taxes,
      netIncome,
    },
    balanceSheet: {
      asOf: asOfDate.toISOString().split('T')[0],
      assets: {
        current: {
          cash,
          accountsReceivable,
          inventory,
          prepaidExpenses,
          totalCurrent: totalCurrentAssets,
        },
        fixed: {
          equipment,
          vehicles,
          buildings,
          totalFixed: totalFixedAssets,
        },
        totalAssets,
      },
      liabilities: {
        current: {
          accountsPayable,
          shortTermDebt,
          accruedExpenses,
          totalCurrent: totalCurrentLiabilities,
        },
        longTerm: {
          longTermDebt,
          deferredTaxes,
          totalLongTerm: totalLongTermLiabilities,
        },
        totalLiabilities,
      },
      equity: {
        commonStock: totalEquity * 0.6,
        retainedEarnings: totalEquity * 0.4,
        totalEquity,
      },
    },
    cashFlow: {
      period: {
        from: series[0]?.date ?? '',
        to: series[series.length - 1]?.date ?? '',
      },
      operating: {
        netIncome,
        depreciation,
        changesInWorkingCapital,
        netOperatingCashFlow,
      },
      investing: {
        capitalExpenditures,
        assetSales,
        netInvestingCashFlow,
      },
      financing: {
        debtIssuance,
        debtRepayment,
        dividends,
        netFinancingCashFlow,
      },
      netCashFlow,
      beginningCash,
      endingCash: cash,
    },
    accountsReceivable: arAging,
    accountsPayable: apAging,
    kpis: {
      revenue: totalRevenue,
      profit: totalProfit,
      orders: totalOrders,
      avgOrderValue: totalRevenue / totalOrders,
      grossMargin: (grossProfit / netSales) * 100,
      netMargin: (netIncome / netSales) * 100,
      cashFlow: netCashFlow,
      workingCapital: totalCurrentAssets - totalCurrentLiabilities,
    },
    series,
  };
}

function generateARAgingData(totalAR: number) {
  const current = totalAR * 0.6;
  const days30 = totalAR * 0.2;
  const days60 = totalAR * 0.1;
  const days90 = totalAR * 0.07;
  const over90 = totalAR * 0.03;
  
  const aging = [
    { customer: 'Acme Corp', invoice: 'INV-001', amount: current * 0.3, dueDate: new Date().toISOString().split('T')[0]!, daysOverdue: 0, status: 'current' as const },
    { customer: 'Tech Solutions', invoice: 'INV-002', amount: days30 * 0.4, dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 15, status: 'overdue' as const },
    { customer: 'Global Industries', invoice: 'INV-003', amount: days60 * 0.5, dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 45, status: 'overdue' as const },
    { customer: 'Startup Inc', invoice: 'INV-004', amount: days90 * 0.6, dueDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 75, status: 'critical' as const },
    { customer: 'Legacy Corp', invoice: 'INV-005', amount: over90 * 0.7, dueDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 120, status: 'critical' as const },
  ];
  
  const trends = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i - 1));
    return {
      date: date.toISOString().split('T')[0]!,
      totalOutstanding: totalAR * (0.8 + Math.random() * 0.4),
      current: current * (0.7 + Math.random() * 0.6),
      overdue: (days30 + days60 + days90 + over90) * (0.6 + Math.random() * 0.8),
    };
  });
  
  return {
    summary: { totalOutstanding: totalAR, current, days30, days60, days90, over90 },
    aging,
    trends,
  };
}

function generateAPAgingData(totalAP: number) {
  const current = totalAP * 0.7;
  const days30 = totalAP * 0.2;
  const days60 = totalAP * 0.08;
  const days90 = totalAP * 0.015;
  const over90 = totalAP * 0.005;
  
  const aging = [
    { vendor: 'Raw Materials Co', invoice: 'PO-001', amount: current * 0.4, dueDate: new Date().toISOString().split('T')[0]!, daysOverdue: 0, status: 'current' as const },
    { vendor: 'Logistics Inc', invoice: 'PO-002', amount: days30 * 0.5, dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 20, status: 'overdue' as const },
    { vendor: 'Equipment Supply', invoice: 'PO-003', amount: days60 * 0.6, dueDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 50, status: 'overdue' as const },
    { vendor: 'Software Licenses', invoice: 'PO-004', amount: days90 * 0.7, dueDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 80, status: 'critical' as const },
    { vendor: 'Legal Services', invoice: 'PO-005', amount: over90 * 0.8, dueDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, daysOverdue: 110, status: 'critical' as const },
  ];
  
  const trends = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i - 1));
    return {
      date: date.toISOString().split('T')[0]!,
      totalOutstanding: totalAP * (0.75 + Math.random() * 0.5),
      current: current * (0.8 + Math.random() * 0.4),
      overdue: (days30 + days60 + days90 + over90) * (0.7 + Math.random() * 0.6),
    };
  });
  
  return {
    summary: { totalOutstanding: totalAP, current, days30, days60, days90, over90 },
    aging,
    trends,
  };
}
