import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Monitor, Smartphone, LogOut, Shield, Key, FileText, AlertCircle } from 'lucide-react';
import Card from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';

interface ActivitySecurityTabProps {
  userId: string;
}

export default function ActivitySecurityTab({ userId }: ActivitySecurityTabProps) {
  const { data: sessionsData } = useQuery({
    queryKey: ['admin', 'users', userId, 'sessions'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/sessions`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    }
  });
  
  const { data: auditData } = useQuery({
    queryKey: ['admin', 'users', userId, 'audit'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/audit`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  });
  
  const sessions = sessionsData?.data?.sessions || [];
  const auditLogs = auditData?.data?.auditLogs || [];
  
  const handleTerminateSession = async (sessionId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'forceLogout',
          reason: `Terminated session ${sessionId}`
        })
      });
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2b2b2b]">Active Sessions</h2>
          <button
            onClick={() => handleTerminateSession('all')}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            <LogOut className="w-4 h-4 inline mr-2" />
            Terminate All
          </button>
        </div>
        
        <div className="space-y-3">
          {sessions.map((session: any) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {session.deviceType === 'mobile' ? (
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Monitor className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {session.deviceName || 'Unknown Device'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.ip || 'Unknown IP'} • Last seen: {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString() : 'Unknown'}
                  </div>
                  {session.userAgent && (
                    <div className="text-xs text-gray-400 mt-1">
                      {session.userAgent.substring(0, 80)}...
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleTerminateSession(session.id)}
                className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
              >
                Terminate
              </button>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No active sessions</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* MFA Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Multi-Factor Authentication</h2>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">MFA Status</div>
              <div className="text-sm text-gray-600">
                Currently {sessions[0]?.mfaEnabled ? 'enabled' : 'disabled'}
              </div>
            </div>
          </div>
          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
            Reset MFA
          </button>
        </div>
      </Card>
      
      {/* Audit Trail */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Audit Trail</h2>
        
        <div className="space-y-3">
          {auditLogs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg mt-1">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{log.action}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
                {log.payload && (
                  <div className="text-xs text-gray-500 mt-2 font-mono bg-gray-50 p-2 rounded">
                    {JSON.stringify(log.payload, null, 2)}
                  </div>
                )}
              </div>
              {log.ip && (
                <div className="text-xs text-gray-500">
                  IP: {log.ip}
                </div>
              )}
            </div>
          ))}
          
          {auditLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No audit logs</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Rate Limiting */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Rate Limiting & Abuse</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Failed Login Attempts (24h)</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-600 mb-1">API Requests (24h)</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Throttle Status</div>
            <Badge variant="success">Normal</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

