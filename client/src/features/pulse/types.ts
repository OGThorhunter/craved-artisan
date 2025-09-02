export type PulseRange = 'today' | 'week' | 'month';

export type Kpi = { 
  readonly label: string; 
  readonly value: number; 
  readonly deltaPct: number | null; 
};

export type TrendPoint = { 
  readonly ts: string; 
  readonly value: number; 
};

export type LeaderboardRow = { 
  readonly productId: string; 
  readonly name: string; 
  readonly qty: number; 
  readonly revenue: number; 
};

export type AttentionPickup = { 
  readonly orderId: string; 
  readonly code: string; 
  readonly customer: string; 
  readonly whenISO: string; 
  readonly location: string; 
};

export type AttentionInventory = { 
  readonly sku: string; 
  readonly name: string; 
  readonly stock: number; 
  readonly reorderAt: number; 
};

export type AttentionCrm = { 
  readonly customerId: string; 
  readonly name: string; 
  readonly score: number; 
  readonly reason: string; 
};

export type SystemPill = { 
  readonly name: string; 
  readonly status: 'ok' | 'warn' | 'down'; 
  readonly note?: string; 
};

export type PulsePayload = {
  readonly vendorId: string;
  readonly range: PulseRange;
  readonly kpis: readonly Kpi[];
  readonly trends: {
    readonly revenue: readonly TrendPoint[];
    readonly orders: readonly TrendPoint[];
  };
  readonly leaderboard: readonly LeaderboardRow[];
  readonly attention: {
    readonly pickups: readonly AttentionPickup[];
    readonly inventory: readonly AttentionInventory[];
    readonly crm: readonly AttentionCrm[];
  };
  readonly suggestions: readonly string[];
  readonly system: readonly SystemPill[];
  readonly asOfISO: string;
};
