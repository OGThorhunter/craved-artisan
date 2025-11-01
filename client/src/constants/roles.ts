export const ROLES = [
  'ADMIN',
  'CUSTOMER',
  'VENDOR',
  'EVENT_COORDINATOR',
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  VENDOR: 'Vendor',
  EVENT_COORDINATOR: 'Event Coordinator',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: 'Full system access and admin controls',
  CUSTOMER: 'Can place orders and manage favorites',
  VENDOR: 'Can sell products and manage storefront',
  EVENT_COORDINATOR: 'Can create and manage events',
};

