// Core type aliases for the application
// This file centralizes all type definitions to avoid string literal mismatches

// Order Status Type
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

// Payout Status Type
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REJECTED' | 'PROCESSED';

// User Status Type
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

// Event Status Type
export type EventStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled';

// Badge Variant Type (for UI components) - includes all used variants
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'red' | 'yellow' | 'gray';

// Button Variant Type (for UI components) - includes all used variants
export type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'primary';
