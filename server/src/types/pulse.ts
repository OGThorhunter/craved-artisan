export type PulseRange = 'today' | 'week' | 'month';

export type Kpi = { 
  label: string; 
  value: number; 
  deltaPct: number | null; 
};

export type TrendPoint = { 
  ts: string; 
  value: number; 
};

export type LeaderboardRow = { 
  productId: string; 
  name: string; 
  qty: number; 
  revenue: number; 
};

export type AttentionPickup = { 
  orderId: string; 
  code: string; 
  customer: string; 
  whenISO: string; 
  location: string; 
};

export type AttentionInventory = { 
  sku: string; 
  name: string; 
  stock: number; 
  reorderAt: number; 
};

export type AttentionCrm = { 
  customerId: string; 
  name: string; 
  score: number; 
  reason: string; 
};

export type SystemPill = { 
  name: string; 
  status: 'ok' | 'warn' | 'down'; 
  note?: string; 
};

export type PulsePayload = {
  vendorId: string;
  range: PulseRange;
  kpis: Kpi[];
  trends: {
    revenue: TrendPoint[];
    orders: TrendPoint[];
  };
  leaderboard: LeaderboardRow[];
  attention: {
    pickups: AttentionPickup[];
    inventory: AttentionInventory[];
    crm: AttentionCrm[];
  };
  suggestions: string[];
  system: SystemPill[];
  asOfISO: string;
};
