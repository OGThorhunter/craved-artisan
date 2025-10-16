import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Clock, CheckCircle, X } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  startedAt: string;
  mitigatedAt?: string;
  closedAt?: string;
  summary?: string;
  affected?: string[];
  timeline?: any[];
}

interface IncidentBoardProps {
  incidents: Incident[];
}

export default function IncidentBoard({ incidents }: IncidentBoardProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    severity: 'SEV3',
    summary: '',
    affected: [] as string[]
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: typeof createForm) => {
      const response = await fetch('/api/admin/ops/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create incident');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'incidents'] });
      setShowCreateDialog(false);
      setCreateForm({ title: '', severity: 'SEV3', summary: '', affected: [] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/ops/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update incident');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'incidents'] });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV1': return 'bg-red-100 text-red-800 border-red-300';
      case 'SEV2': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'SEV3': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SEV4': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'destructive';
      case 'MITIGATED': return 'warning';
      case 'CLOSED': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2b2b2b]">Active Incidents</h3>
        <Button
          variant="primary"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Incident
        </Button>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.map((incident) => (
          <Card key={incident.id} className={`p-4 border-l-4 ${getSeverityColor(incident.severity)}`}>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[#2b2b2b]">{incident.title}</h4>
                    <Badge variant={getStatusColor(incident.status) as any}>
                      {incident.status}
                    </Badge>
                  </div>
                  {incident.summary && (
                    <p className="text-sm text-[#4b4b4b]">{incident.summary}</p>
                  )}
                </div>

                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-[#4b4b4b]">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Started: {new Date(incident.startedAt).toLocaleString()}
                </div>
                {incident.mitigatedAt && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <CheckCircle className="h-3 w-3" />
                    Mitigated: {new Date(incident.mitigatedAt).toLocaleString()}
                  </div>
                )}
                {incident.closedAt && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Closed: {new Date(incident.closedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Affected Services */}
              {incident.affected && incident.affected.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#4b4b4b]">Affected:</span>
                  <div className="flex gap-1">
                    {incident.affected.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {incident.status === 'OPEN' && (
                <div className="flex items-center gap-2 pt-2 border-t border-[#7F232E]/10">
                  <Button
                    variant="secondary"
                    onClick={() => updateStatusMutation.mutate({ id: incident.id, status: 'MITIGATED' })}
                    disabled={updateStatusMutation.isPending}
                    className="text-sm"
                  >
                    Mark Mitigated
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => updateStatusMutation.mutate({ id: incident.id, status: 'CLOSED' })}
                    disabled={updateStatusMutation.isPending}
                    className="text-sm"
                  >
                    Close
                  </Button>
                </div>
              )}

              {incident.status === 'MITIGATED' && (
                <div className="flex items-center gap-2 pt-2 border-t border-[#7F232E]/10">
                  <Button
                    variant="primary"
                    onClick={() => updateStatusMutation.mutate({ id: incident.id, status: 'CLOSED' })}
                    disabled={updateStatusMutation.isPending}
                    className="text-sm"
                  >
                    Close Incident
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {incidents.length === 0 && (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-[#2b2b2b] font-medium">No active incidents</p>
            <p className="text-sm text-[#4b4b4b] mt-1">All systems operational</p>
          </Card>
        )}
      </div>

      {/* Create Incident Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowCreateDialog(false)}
              className="absolute top-4 right-4 text-[#4b4b4b] hover:text-[#2b2b2b]"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Create Incident</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2b2b2b] mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Brief description of the incident"
                  className="w-full px-3 py-2 border border-[#7F232E]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                />
              </div>

              <div>
                <label htmlFor="incident-severity" className="block text-sm font-medium text-[#2b2b2b] mb-2">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  id="incident-severity"
                  value={createForm.severity}
                  onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-[#7F232E]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  aria-label="Select incident severity"
                >
                  <option value="SEV1">SEV1 - Critical (System Down)</option>
                  <option value="SEV2">SEV2 - High (Major Feature Impaired)</option>
                  <option value="SEV3">SEV3 - Medium (Minor Impact)</option>
                  <option value="SEV4">SEV4 - Low (Cosmetic/Info)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2b2b2b] mb-2">
                  Summary
                </label>
                <textarea
                  value={createForm.summary}
                  onChange={(e) => setCreateForm({ ...createForm, summary: e.target.value })}
                  placeholder="Detailed description of what's happening..."
                  className="w-full px-3 py-2 border border-[#7F232E]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 min-h-[100px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => createMutation.mutate(createForm)}
                  disabled={!createForm.title || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Incident'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

