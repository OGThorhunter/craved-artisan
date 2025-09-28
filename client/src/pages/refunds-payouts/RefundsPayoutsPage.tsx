import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, DollarSign, CreditCard, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { RefundManager } from '@/components/refunds-payouts/RefundManager';
import { PayoutManager } from '@/components/refunds-payouts/PayoutManager';
import type { RefundRequest, Payout, Credit } from '@/lib/api/refunds-payouts';

interface RefundsPayoutsPageProps {
  eventId: string;
}

export default function RefundsPayoutsPage({ eventId }: RefundsPayoutsPageProps) {
  const [activeTab, setActiveTab] = useState<'refunds' | 'payouts' | 'credits' | 'reports'>('refunds');

  // Mock data - replace with React Query
  const [refunds, setRefunds] = useState<RefundRequest[]>([
    {
      id: 'refund_1',
      eventId,
      orderId: 'order_1',
      customerId: 'user_1',
      refundType: 'FULL',
      requestedAmount: 150.00,
      approvedAmount: null,
      processedAmount: null,
      reason: 'Event cancelled due to weather',
      category: 'EVENT_CANCELLATION',
      description: 'Customer requesting full refund due to event cancellation',
      status: 'PENDING',
      requestedAt: '2024-02-15T14:00:00Z',
      reviewedAt: null,
      reviewedBy: null,
      processedAt: null,
      processedBy: null,
      refundMethod: 'ORIGINAL_PAYMENT',
      refundTo: null,
      policyApplied: 'Standard Cancellation Policy',
      termsAccepted: true,
      termsAcceptedAt: '2024-02-15T14:00:00Z',
      supportingDocs: [],
      notes: null,
      stripeRefundId: null,
      stripeChargeId: 'ch_1234567890',
      createdAt: '2024-02-15T14:00:00Z',
      updatedAt: '2024-02-15T14:00:00Z',
      order: {
        id: 'order_1',
        orderNumber: 'ORD-2024-001',
        total: 150.00,
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com'
      },
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    },
    {
      id: 'refund_2',
      eventId,
      orderId: 'order_2',
      customerId: 'user_2',
      refundType: 'PARTIAL',
      requestedAmount: 75.00,
      approvedAmount: 50.00,
      processedAmount: 50.00,
      reason: 'Vendor issue with stall setup',
      category: 'VENDOR_ISSUE',
      description: 'Partial refund due to vendor not showing up',
      status: 'COMPLETED',
      requestedAt: '2024-02-14T10:00:00Z',
      reviewedAt: '2024-02-14T11:00:00Z',
      reviewedBy: 'user_3',
      processedAt: '2024-02-14T12:00:00Z',
      processedBy: 'user_3',
      refundMethod: 'ORIGINAL_PAYMENT',
      refundTo: null,
      policyApplied: 'Partial Refund Policy',
      termsAccepted: true,
      termsAcceptedAt: '2024-02-14T10:00:00Z',
      supportingDocs: [],
      notes: 'Processed partial refund due to vendor no-show',
      stripeRefundId: 're_1234567890',
      stripeChargeId: 'ch_0987654321',
      createdAt: '2024-02-14T10:00:00Z',
      updatedAt: '2024-02-14T12:00:00Z',
      order: {
        id: 'order_2',
        orderNumber: 'ORD-2024-002',
        total: 100.00,
        customerName: 'Mike Wilson',
        customerEmail: 'mike@example.com'
      },
      customer: {
        name: 'Mike Wilson',
        email: 'mike@example.com'
      }
    }
  ]);

  const [payouts, setPayouts] = useState<Payout[]>([
    {
      id: 'payout_1',
      eventId,
      vendorId: 'user_2',
      payoutType: 'REVENUE_SHARE',
      grossAmount: 2500.00,
      platformFee: 250.00,
      processingFee: 75.00,
      taxWithheld: 200.00,
      netAmount: 1975.00,
      periodStart: '2024-02-01T00:00:00Z',
      periodEnd: '2024-02-14T23:59:59Z',
      status: 'PENDING',
      requestedAt: '2024-02-15T09:00:00Z',
      approvedAt: null,
      approvedBy: null,
      processedAt: null,
      completedAt: null,
      paymentMethod: 'STRIPE_CONNECT',
      bankAccount: null,
      paymentReference: null,
      stripeTransferId: null,
      stripeAccountId: 'acct_1234567890',
      invoiceNumber: 'INV-2024-001',
      receiptUrl: null,
      notes: null,
      vendorNotes: null,
      createdAt: '2024-02-15T09:00:00Z',
      updatedAt: '2024-02-15T09:00:00Z',
      vendor: {
        name: 'Mike Wilson',
        email: 'mike@example.com'
      }
    },
    {
      id: 'payout_2',
      eventId,
      vendorId: 'user_4',
      payoutType: 'REVENUE_SHARE',
      grossAmount: 1800.00,
      platformFee: 180.00,
      processingFee: 54.00,
      taxWithheld: 144.00,
      netAmount: 1422.00,
      periodStart: '2024-02-01T00:00:00Z',
      periodEnd: '2024-02-14T23:59:59Z',
      status: 'COMPLETED',
      requestedAt: '2024-02-15T08:00:00Z',
      approvedAt: '2024-02-15T09:00:00Z',
      approvedBy: 'user_3',
      processedAt: '2024-02-15T10:00:00Z',
      completedAt: '2024-02-15T11:00:00Z',
      paymentMethod: 'STRIPE_CONNECT',
      bankAccount: null,
      paymentReference: 'PAY-2024-001',
      stripeTransferId: 'tr_1234567890',
      stripeAccountId: 'acct_0987654321',
      invoiceNumber: 'INV-2024-002',
      receiptUrl: '/receipts/payout_2.pdf',
      notes: 'Successfully processed',
      vendorNotes: 'Payment received',
      createdAt: '2024-02-15T08:00:00Z',
      updatedAt: '2024-02-15T11:00:00Z',
      vendor: {
        name: 'Lisa Chen',
        email: 'lisa@example.com'
      }
    }
  ]);

  const [credits, setCredits] = useState<Credit[]>([
    {
      id: 'credit_1',
      eventId,
      customerId: 'user_1',
      creditType: 'REFUND',
      amount: 150.00,
      balance: 150.00,
      currency: 'USD',
      sourceRefundId: 'refund_1',
      sourceOrderId: null,
      sourcePayoutId: null,
      expiresAt: '2024-12-31T23:59:59Z',
      isExpired: false,
      status: 'ACTIVE',
      createdAt: '2024-02-15T15:00:00Z',
      updatedAt: '2024-02-15T15:00:00Z',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    }
  ]);

  const handleCreateRefund = (refundData: any) => {
    console.log('Creating refund:', refundData);
    // TODO: Implement API call
  };

  const handleProcessRefund = (refundId: string, updates: any) => {
    console.log('Processing refund:', refundId, updates);
    // TODO: Implement API call
  };

  const handleRejectRefund = (refundId: string, reason: string) => {
    console.log('Rejecting refund:', refundId, reason);
    setRefunds(prev => prev.map(r => 
      r.id === refundId ? { ...r, status: 'REJECTED' as const, notes: reason } : r
    ));
  };

  const handleApproveRefund = (refundId: string, amount: number) => {
    console.log('Approving refund:', refundId, amount);
    setRefunds(prev => prev.map(r => 
      r.id === refundId ? { ...r, status: 'APPROVED' as const, approvedAmount: amount } : r
    ));
  };

  const handleCreatePayout = (payoutData: any) => {
    console.log('Creating payout:', payoutData);
    // TODO: Implement API call
  };

  const handleApprovePayout = (payoutId: string) => {
    console.log('Approving payout:', payoutId);
    setPayouts(prev => prev.map(p => 
      p.id === payoutId ? { ...p, status: 'APPROVED' as const, approvedAt: new Date().toISOString() } : p
    ));
  };

  const handleProcessPayout = (payoutId: string) => {
    console.log('Processing payout:', payoutId);
    setPayouts(prev => prev.map(p => 
      p.id === payoutId ? { ...p, status: 'PROCESSING' as const, processedAt: new Date().toISOString() } : p
    ));
  };

  const handleRejectPayout = (payoutId: string, reason: string) => {
    console.log('Rejecting payout:', payoutId, reason);
    setPayouts(prev => prev.map(p => 
      p.id === payoutId ? { ...p, status: 'REJECTED' as const, notes: reason } : p
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/event-coordinator/events/${eventId}/checkin`}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Check-in
              </button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Refunds & Payouts</h1>
              <p className="text-gray-600">Manage refunds, credits, vendor payouts, and financial reconciliation</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/event-coordinator/events/${eventId}/analytics-communications`}>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <BarChart3 className="w-4 h-4" />
                  Analytics & Comms
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'refunds', label: 'Refunds', icon: DollarSign },
              { id: 'payouts', label: 'Payouts', icon: TrendingUp },
              { id: 'credits', label: 'Credits', icon: CreditCard },
              { id: 'reports', label: 'Reports', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'refunds' && (
          <RefundManager
            refunds={refunds}
            onCreateRefund={handleCreateRefund}
            onProcessRefund={handleProcessRefund}
            onRejectRefund={handleRejectRefund}
            onApproveRefund={handleApproveRefund}
          />
        )}

        {activeTab === 'payouts' && (
          <PayoutManager
            payouts={payouts}
            onCreatePayout={handleCreatePayout}
            onApprovePayout={handleApprovePayout}
            onProcessPayout={handleProcessPayout}
            onRejectPayout={handleRejectPayout}
          />
        )}

        {activeTab === 'credits' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Credit Management</h2>
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Credit System</h3>
              <p className="text-gray-600">Manage customer credits and account balances</p>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {credits.length} credit{credits.length !== 1 ? 's' : ''} currently active
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Reports</h2>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Reporting</h3>
              <p className="text-gray-600">Generate reconciliation reports, tax reports, and financial summaries</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
