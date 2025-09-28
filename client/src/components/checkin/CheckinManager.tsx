import React, { useState } from 'react';
import { QrCode, Play, Pause, Square, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { QRScanner } from './QRScanner';
import type { CheckinSession, Checkin, Incident } from '@/lib/api/checkin';
import { formatCheckinTime, getCheckinStats, SESSION_STATUS_COLORS, CHECKIN_STATUS_COLORS } from '@/lib/api/checkin';

interface CheckinManagerProps {
  session: CheckinSession | null;
  checkins: Checkin[];
  incidents: Incident[];
  loading?: boolean;
  onStartSession: (sessionData: any) => void;
  onEndSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onCreateIncident: (incidentData: any) => void;
}

export function CheckinManager({
  session,
  checkins,
  incidents,
  loading = false,
  onStartSession,
  onEndSession,
  onPauseSession,
  onResumeSession,
  onCreateIncident
}: CheckinManagerProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showStartSession, setShowStartSession] = useState(false);

  const stats = getCheckinStats(checkins);

  const handleStartSession = () => {
    setShowStartSession(true);
  };

  const handleQRScanResult = (result: any) => {
    console.log('QR scan result:', result);
    setShowQRScanner(false);
    // The parent component should handle the actual check-in processing
  };

  const handleCreateIncident = () => {
    const incidentData = {
      eventId: session?.eventId,
      sessionId: session?.id,
      incidentType: 'TECHNICAL',
      severity: 'MEDIUM',
      title: 'Quick Incident Report',
      description: 'Issue reported during check-in session'
    };
    onCreateIncident(incidentData);
  };

  const getSessionDuration = () => {
    if (!session) return '0m';
    const start = new Date(session.startedAt);
    const end = session.endedAt ? new Date(session.endedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (status: string, colors: Record<string, string>) => {
    return (
      <span
        className="inline-block px-2 py-1 text-xs rounded-full font-medium"
        style={{ 
          backgroundColor: colors[status] + '20',
          color: colors[status]
        }}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6 shadow-md border animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Check-in Management</h2>
          <p className="text-gray-600">Manage check-in sessions and process customer arrivals</p>
        </div>
        
        {!session && (
          <button
            onClick={handleStartSession}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Session
          </button>
        )}
      </div>

      {/* Active Session */}
      {session && (
        <div className="bg-white rounded-lg p-6 shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{session.sessionName}</h3>
              <div className="flex items-center gap-3 mt-1">
                {getStatusBadge(session.status, SESSION_STATUS_COLORS)}
                <span className="text-sm text-gray-600">
                  {session.location && `📍 ${session.location}`}
                </span>
                <span className="text-sm text-gray-600">
                  ⏱️ {getSessionDuration()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {session.status === 'ACTIVE' && (
                <>
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan QR Code
                  </button>
                  <button
                    onClick={onPauseSession}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                </>
              )}
              
              {session.status === 'PAUSED' && (
                <button
                  onClick={onResumeSession}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
              
              <button
                onClick={onEndSession}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="w-4 h-4" />
                End Session
              </button>
            </div>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Check-ins', count: stats.total, color: 'blue' },
              { label: 'Completed', count: stats.completed, color: 'green' },
              { label: 'Failed', count: stats.failed, color: 'red' },
              { label: 'Verified', count: stats.verified, color: 'purple' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold ${
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-blue-600'
                }`}>
                  {stat.count}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQRScanner(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              QR Scanner
            </button>
            <button
              onClick={handleCreateIncident}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Incident
            </button>
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Check-ins</h3>
        </div>
        
        <div className="divide-y">
          {checkins.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No check-ins yet</p>
            </div>
          ) : (
            checkins.slice(0, 10).map((checkin) => (
              <div key={checkin.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">
                        {checkin.customer?.name || 'Unknown Customer'}
                      </span>
                      {getStatusBadge(checkin.status, CHECKIN_STATUS_COLORS)}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span>Stall {checkin.ticket?.stallNumber}</span>
                      <span className="mx-2">•</span>
                      <span>{checkin.ticket?.customerEmail}</span>
                      <span className="mx-2">•</span>
                      <span>{formatCheckinTime(checkin.checkinTime)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {checkin.method === 'QR_SCAN' && (
                      <QrCode className="w-4 h-4 text-gray-400" />
                    )}
                    {checkin.verifiedAt && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && session && (
        <QRScanner
          sessionId={session.id}
          onScanResult={handleQRScanResult}
          onClose={() => setShowQRScanner(false)}
          location={session.location}
        />
      )}

      {/* Start Session Modal */}
      {showStartSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Start Check-in Session</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const sessionData = {
                sessionName: formData.get('sessionName'),
                location: formData.get('location'),
                deviceInfo: navigator.userAgent,
              };
              onStartSession(sessionData);
              setShowStartSession(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name
                  </label>
                  <input
                    type="text"
                    name="sessionName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="e.g., Morning Check-in"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="e.g., Main Entrance"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowStartSession(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
