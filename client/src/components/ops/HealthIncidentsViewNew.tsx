import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { List, Grid, Plus } from 'lucide-react';
import Button from '../ui/Button';
import IncidentKPIs from './incidents/IncidentKPIs';
import IncidentFilters, { IncidentFiltersState } from './incidents/IncidentFilters';
import IncidentBoardDnD from './incidents/IncidentBoardDnD';

const initialFilters: IncidentFiltersState = {
  status: ['OPEN', 'MITIGATED'],
  severity: [],
  services: [],
  tags: [],
  hasPostmortem: undefined
};

export default function HealthIncidentsViewNew() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<IncidentFiltersState>(initialFilters);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  // Fetch incidents
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['admin', 'ops', 'incidents', 'search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status.length > 0) params.append('status', filters.status.join(','));
      if (filters.severity.length > 0) params.append('severity', filters.severity.join(','));
      if (filters.services.length > 0) params.append('services', filters.services.join(','));
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.hasPostmortem !== undefined) params.append('hasPostmortem', String(filters.hasPostmortem));

      const response = await fetch(`/api/admin/ops/incidents/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000
  });

  // Update incident status
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

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: incidentId, status: newStatus });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <IncidentKPIs />

      {/* Filters */}
      <IncidentFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2b2b2b]">
          Incidents ({incidents.length})
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'board' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('board')}
            className="text-sm"
          >
            <Grid className="h-4 w-4 mr-1" />
            Board
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
            className="text-sm"
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F232E] mx-auto"></div>
          <p className="text-[#4b4b4b] mt-3">Loading incidents...</p>
        </div>
      ) : viewMode === 'board' ? (
        <IncidentBoardDnD
          incidents={incidents}
          onStatusChange={handleStatusChange}
          onIncidentClick={setSelectedIncident}
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#7F232E]/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incidents.map((incident: any) => (
                <tr
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">{incident.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#2b2b2b]">{incident.title}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.severity === 'SEV1' ? 'bg-red-100 text-red-800' :
                      incident.severity === 'SEV2' ? 'bg-orange-100 text-orange-800' :
                      incident.severity === 'SEV3' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{incident.status}</td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">
                    {incident.owner?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#4b4b4b]">
                    {new Date(incident.startedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#4b4b4b]">
                    No incidents found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TODO: Incident Detail Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <h2 className="text-xl font-bold mb-4">{selectedIncident.title}</h2>
            <p className="text-[#4b4b4b] mb-4">Incident detail drawer coming soon...</p>
            <Button onClick={() => setSelectedIncident(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}

