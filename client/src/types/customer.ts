export interface Customer {
  id: string;
  email: string;
  phone?: string;
  website?: string;
  firstName: string;
  lastName: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'vip' | 'inactive';
  source: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  lastContactAt?: string;
  createdAt: string;
  assignedTo?: string;
  isVip: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
}
