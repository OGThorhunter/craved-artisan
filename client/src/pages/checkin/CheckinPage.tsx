import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, QrCode, AlertTriangle, Package, Users, DollarSign } from 'lucide-react';
import { CheckinManager } from '@/components/checkin/CheckinManager';
import { IncidentManager } from '@/components/checkin/IncidentManager';
import type { CheckinSession, Checkin, Incident, LostFoundItem } from '@/lib/api/checkin';

interface CheckinPageProps {
  eventId: string;
}

export default function CheckinPage({ eventId }: CheckinPageProps) {
  const [activeTab, setActiveTab] = useState<'checkin' | 'incidents' | 'lostfound' | 'offline'>('checkin');

  // Mock data - replace with React Query
  const [session, setSession] = useState<CheckinSession | null>({
    id: 'session_1',
    eventId,
    staffId: 'user_1',
    sessionName: 'Morning Check-in',
    location: 'Main Entrance',
    deviceInfo: 'iPad Pro - Station 1',
    startedAt: '2024-02-15T08:00:00Z',
    endedAt: null,
    status: 'ACTIVE',
    isOffline: false,
    lastSyncAt: '2024-02-15T10:30:00Z',
    pendingCheckins: 0,
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-02-15T10:30:00Z',
    staff: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com'
    }
  });

  const [checkins, setCheckins] = useState<Checkin[]>([
    {
      id: 'checkin_1',
      sessionId: 'session_1',
      ticketId: 'ticket_1',
      customerId: 'user_1',
      checkinTime: '2024-02-15T09:15:00Z',
      method: 'QR_SCAN',
      deviceType: 'mobile',
      location: 'Main Entrance',
      status: 'COMPLETED',
      notes: null,
      isOffline: false,
      syncedAt: '2024-02-15T09:15:00Z',
      verifiedAt: null,
      verifiedBy: null,
      createdAt: '2024-02-15T09:15:00Z',
      updatedAt: '2024-02-15T09:15:00Z',
      ticket: {
        id: 'ticket_1',
        ticketNumber: 'TKT-2024-001',
        stallNumber: 'A1',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com'
      },
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    },
    {
      id: 'checkin_2',
      sessionId: 'session_1',
      ticketId: 'ticket_2',
      customerId: 'user_2',
      checkinTime: '2024-02-15T09:30:00Z',
      method: 'MANUAL',
      deviceType: 'tablet',
      location: 'Main Entrance',
      status: 'COMPLETED',
      notes: 'Customer forgot QR code',
      isOffline: false,
      syncedAt: '2024-02-15T09:30:00Z',
      verifiedAt: '2024-02-15T09:35:00Z',
      verifiedBy: 'user_3',
      createdAt: '2024-02-15T09:30:00Z',
      updatedAt: '2024-02-15T09:35:00Z',
      ticket: {
        id: 'ticket_2',
        ticketNumber: 'TKT-2024-002',
        stallNumber: 'B2',
        customerName: 'Mike Wilson',
        customerEmail: 'mike@example.com'
      },
      customer: {
        name: 'Mike Wilson',
        email: 'mike@example.com'
      }
    }
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'incident_1',
      eventId,
      sessionId: 'session_1',
      incidentType: 'TECHNICAL',
      severity: 'MEDIUM',
      title: 'QR Scanner Not Working',
      description: 'QR scanner at Station 1 is not responding to scans. Customers are having to use manual entry.',
      location: 'Main Entrance - Station 1',
      coordinates: null,
      stallId: null,
      reportedBy: 'user_1',
      reportedAt: '2024-02-15T09:30:00Z',
      status: 'OPEN',
      assignedTo: null,
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
      followUpRequired: false,
      followUpDate: null,
      followUpNotes: null,
      isOffline: false,
      syncedAt: '2024-02-15T09:30:00Z',
      createdAt: '2024-02-15T09:30:00Z',
      updatedAt: '2024-02-15T09:30:00Z',
      reporter: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    },
    {
      id: 'incident_2',
      eventId,
      sessionId: 'session_1',
      incidentType: 'CUSTOMER',
      severity: 'LOW',
      title: 'Customer Dispute',
      description: 'Customer claims they purchased a stall but ticket shows different stall number.',
      location: 'Main Entrance',
      coordinates: null,
      stallId: 'stall_a1',
      reportedBy: 'user_1',
      reportedAt: '2024-02-15T10:15:00Z',
      status: 'IN_PROGRESS',
      assignedTo: 'user_3',
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
      followUpRequired: true,
      followUpDate: '2024-02-15T14:00:00Z',
      followUpNotes: 'Check sales records and contact customer',
      isOffline: false,
      syncedAt: '2024-02-15T10:15:00Z',
      createdAt: '2024-02-15T10:15:00Z',
      updatedAt: '2024-02-15T10:15:00Z',
      reporter: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      }
    }
  ]);

  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([
    {
      id: 'item_1',
      eventId,
      itemType: 'ELECTRONICS',
      description: 'iPhone 13 Pro Max - Black case with cracked screen',
      location: 'Food Court Area',
      status: 'FOUND',
      foundBy: 'user_1',
      foundAt: '2024-02-15T10:00:00Z',
      foundLocation: 'Table near Stall A5',
      claimedBy: null,
      claimedAt: null,
      claimerContact: null,
      storageLocation: 'Lost & Found Office',
      storageNotes: 'In secure storage, owner has 30 days to claim',
      isOffline: false,
      syncedAt: '2024-02-15T10:00:00Z',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:00:00Z',
      finder: {
        name: 'Mike Wilson',
        email: 'mike@example.com'
      }
    }
  ]);

  const handleStartSession = (sessionData: any) => {
    console.log('Starting session:', sessionData);
    // TODO: Implement API call
  };

  const handleEndSession = () => {
    console.log('Ending session');
    setSession(null);
  };

  const handlePauseSession = () => {
    console.log('Pausing session');
    if (session) {
      setSession({ ...session, status: 'PAUSED' });
    }
  };

  const handleResumeSession = () => {
    console.log('Resuming session');
    if (session) {
      setSession({ ...session, status: 'ACTIVE' });
    }
  };

  const handleCreateIncident = (incidentData: any) => {
    console.log('Creating incident:', incidentData);
    // TODO: Implement API call
  };

  const handleUpdateIncident = (incidentId: string, updates: any) => {
    console.log('Updating incident:', incidentId, updates);
    // TODO: Implement API call
  };

  const handleAssignIncident = (incidentId: string, assigneeId: string) => {
    console.log('Assigning incident:', incidentId, assigneeId);
    // TODO: Implement API call
  };

  const handleResolveIncident = (incidentId: string, resolution: string) => {
    console.log('Resolving incident:', incidentId, resolution);
    // TODO: Implement API call
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/event-coordinator/events/${eventId}/inventory`}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Inventory
              </button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Check-in & Operations</h1>
              <p className="text-gray-600">Manage check-ins, incidents, and offline operations</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/event-coordinator/events/${eventId}/refunds-payouts`}>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <DollarSign className="w-4 h-4" />
                  Refunds & Payouts
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
              { id: 'checkin', label: 'Check-in', icon: QrCode },
              { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
              { id: 'lostfound', label: 'Lost & Found', icon: Package },
              { id: 'offline', label: 'Offline Mode', icon: Users },
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
        {activeTab === 'checkin' && (
          <CheckinManager
            session={session}
            checkins={checkins}
            incidents={incidents}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            onPauseSession={handlePauseSession}
            onResumeSession={handleResumeSession}
            onCreateIncident={handleCreateIncident}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentManager
            incidents={incidents}
            onCreateIncident={handleCreateIncident}
            onUpdateIncident={handleUpdateIncident}
            onAssignIncident={handleAssignIncident}
            onResolveIncident={handleResolveIncident}
          />
        )}

        {activeTab === 'lostfound' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lost & Found</h2>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lost & Found Management</h3>
              <p className="text-gray-600">Track found items and manage claims</p>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {lostFoundItems.length} item{lostFoundItems.length !== 1 ? 's' : ''} currently in lost & found
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offline' && (
          <div className="bg-white rounded-lg p-6 shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Offline Mode</h2>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Offline Operations</h3>
              <p className="text-gray-600">Continue operations when internet connection is unavailable</p>
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online Mode
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
