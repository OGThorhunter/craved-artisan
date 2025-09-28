import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Package, FileText, Users, BarChart3, QrCode } from 'lucide-react';
import { HoldManager } from '@/components/inventory/HoldManager';
import { BulkOperationsManager } from '@/components/inventory/BulkOperationsManager';
import type { Hold, BulkOperation } from '@/lib/api/inventory';

interface InventoryPageProps {
  eventId: string;
}

export default function InventoryPage({ eventId }: InventoryPageProps) {
  const [activeTab, setActiveTab] = useState<'holds' | 'bulk' | 'documents' | 'assignments' | 'reports'>('holds');

  // Mock data - replace with React Query
  const [holds, setHolds] = useState<Hold[]>([
    {
      id: 'hold_1',
      eventId,
      stallId: 'stall_a1',
      userId: 'user_1',
      holdType: 'TEMPORARY',
      reason: 'Customer considering purchase',
      notes: 'Follow up in 24 hours',
      placedAt: '2024-02-15T10:00:00Z',
      expiresAt: '2024-02-16T10:00:00Z',
      status: 'ACTIVE',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:00:00Z',
      stall: {
        id: 'stall_a1',
        number: 'A1',
        zone: { name: 'Zone A - Food Court', color: '#10B981' }
      },
      user: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    },
    {
      id: 'hold_2',
      eventId,
      stallId: 'stall_b5',
      userId: 'user_2',
      holdType: 'MANUAL',
      reason: 'Payment processing',
      notes: 'Awaiting bank transfer',
      placedAt: '2024-02-14T14:30:00Z',
      expiresAt: '2024-02-21T14:30:00Z',
      status: 'ACTIVE',
      createdAt: '2024-02-14T14:30:00Z',
      updatedAt: '2024-02-14T14:30:00Z',
      stall: {
        id: 'stall_b5',
        number: 'B5',
        zone: { name: 'Zone B - Crafts', color: '#3B82F6' }
      },
      user: {
        name: 'Mike Wilson',
        email: 'mike@example.com'
      }
    }
  ]);

  const [operations, setOperations] = useState<BulkOperation[]>([
    {
      id: 'op_1',
      eventId,
      operatorId: 'user_1',
      operationType: 'PRICE_UPDATE',
      description: 'Update Zone A pricing to $75',
      targetType: 'stalls',
      targetIds: ['stall_a1', 'stall_a2', 'stall_a3'],
      operationData: { newPrice: 75 },
      status: 'COMPLETED',
      startedAt: '2024-02-15T09:00:00Z',
      completedAt: '2024-02-15T09:02:00Z',
      successCount: 3,
      failureCount: 0,
      totalCount: 3,
      createdAt: '2024-02-15T09:00:00Z',
      updatedAt: '2024-02-15T09:02:00Z'
    },
    {
      id: 'op_2',
      eventId,
      operatorId: 'user_1',
      operationType: 'HOLD_PLACEMENT',
      description: 'Place holds on premium stalls',
      targetType: 'stalls',
      targetIds: ['stall_a1', 'stall_b1'],
      operationData: { holdType: 'MANUAL', expiresAt: '2024-02-20T23:59:59Z' },
      status: 'RUNNING',
      startedAt: '2024-02-15T10:00:00Z',
      successCount: 1,
      failureCount: 0,
      totalCount: 2,
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:01:00Z'
    }
  ]);

  const handleCreateHold = (holdData: any) => {
    console.log('Creating hold:', holdData);
    // TODO: Implement API call
  };

  const handleUpdateHold = (holdId: string, updates: any) => {
    console.log('Updating hold:', holdId, updates);
    // TODO: Implement API call
  };

  const handleReleaseHold = (holdId: string) => {
    console.log('Releasing hold:', holdId);
    setHolds(prev => prev.filter(h => h.id !== holdId));
  };

  const handleDeleteHold = (holdId: string) => {
    console.log('Deleting hold:', holdId);
    setHolds(prev => prev.filter(h => h.id !== holdId));
  };

  const handleStartOperation = (operationData: any) => {
    console.log('Starting operation:', operationData);
    // TODO: Implement API call
  };

  const handleCancelOperation = (operationId: string) => {
    console.log('Cancelling operation:', operationId);
    setOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, status: 'CANCELLED' as const } : op
    ));
  };

  const handleRetryOperation = (operationId: string) => {
    console.log('Retrying operation:', operationId);
    setOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, status: 'PENDING' as const } : op
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/event-coordinator/events/${eventId}/sales`}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Sales
              </button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Inventory Operations</h1>
              <p className="text-gray-600">Manage holds, bulk operations, documents, and assignments</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/event-coordinator/events/${eventId}/checkin`}>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <QrCode className="w-4 h-4" />
                  Check-in Ops
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
              { id: 'holds', label: 'Hold Management', icon: Package },
              { id: 'bulk', label: 'Bulk Operations', icon: BarChart3 },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'assignments', label: 'Assignments', icon: Users },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
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
        {activeTab === 'holds' && (
          <HoldManager
            holds={holds}
            onCreateHold={handleCreateHold}
            onUpdateHold={handleUpdateHold}
            onReleaseHold={handleReleaseHold}
            onDeleteHold={handleDeleteHold}
          />
        )}

        {activeTab === 'bulk' && (
          <BulkOperationsManager
            operations={operations}
            onStartOperation={handleStartOperation}
            onCancelOperation={handleCancelOperation}
            onRetryOperation={handleRetryOperation}
          />
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Management</h2>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Management</h3>
              <p className="text-gray-600">Upload and manage vendor documents (COI, permits, contracts)</p>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment Management</h2>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment Management</h3>
              <p className="text-gray-600">Manage vendor assignments and reassignments</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Reports</h2>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Reports</h3>
              <p className="text-gray-600">Generate comprehensive inventory and operations reports</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
