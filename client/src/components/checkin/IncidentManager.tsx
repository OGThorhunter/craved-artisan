import React, { useState } from 'react';
import { Plus, AlertTriangle, Clock, User, MapPin, Edit, CheckCircle } from 'lucide-react';
import type { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '@/lib/api/checkin';
import { formatIncidentTime, getIncidentStats, INCIDENT_SEVERITY_COLORS, INCIDENT_STATUS_COLORS, INCIDENT_TYPE_ICONS } from '@/lib/api/checkin';

interface IncidentManagerProps {
  incidents: Incident[];
  loading?: boolean;
  onCreateIncident: (incident: any) => void;
  onUpdateIncident: (incidentId: string, updates: any) => void;
  onAssignIncident: (incidentId: string, assigneeId: string) => void;
  onResolveIncident: (incidentId: string, resolution: string) => void;
}

export function IncidentManager({
  incidents,
  loading = false,
  onCreateIncident,
  onUpdateIncident,
  onAssignIncident,
  onResolveIncident
}: IncidentManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesType = typeFilter === 'all' || incident.incidentType === typeFilter;
    return matchesStatus && matchesSeverity && matchesType;
  });

  const stats = getIncidentStats(incidents);

  const handleCreateIncident = () => {
    setShowCreateForm(true);
  };

  const handleEditIncident = (incident: Incident) => {
    setEditingIncident(incident);
  };

  const handleAssignIncident = (incident: Incident) => {
    const assigneeId = prompt('Enter staff member ID to assign incident:');
    if (assigneeId) {
      onAssignIncident(incident.id, assigneeId);
    }
  };

  const handleResolveIncident = (incident: Incident) => {
    const resolution = prompt('Enter resolution details:');
    if (resolution) {
      onResolveIncident(incident.id, resolution);
    }
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

  const getSeverityIcon = (severity: IncidentSeverity) => {
    const icons = {
      LOW: '🟢',
      MEDIUM: '🟡',
      HIGH: '🟠',
      CRITICAL: '🔴',
    };
    return icons[severity];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Incident Management</h2>
          <p className="text-gray-600">Track and manage incidents during the event</p>
        </div>
        
        <button
          onClick={handleCreateIncident}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', count: stats.total, color: 'gray' },
          { label: 'Open', count: stats.open, color: 'red' },
          { label: 'In Progress', count: stats.inProgress, color: 'yellow' },
          { label: 'Resolved', count: stats.resolved, color: 'green' },
          { label: 'Critical', count: stats.critical, color: 'red' },
          { label: 'High', count: stats.high, color: 'orange' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`text-2xl font-bold ${
              stat.color === 'green' ? 'text-green-600' :
              stat.color === 'yellow' ? 'text-yellow-600' :
              stat.color === 'red' ? 'text-red-600' :
              stat.color === 'orange' ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              {stat.count}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Severity:</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by severity"
          >
            <option value="all">All Severity</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="TECHNICAL">Technical</option>
            <option value="SECURITY">Security</option>
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="FACILITY">Facility</option>
            <option value="MEDICAL">Medical</option>
            <option value="SAFETY">Safety</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No incidents found</h3>
          <p className="text-gray-600">
            {incidents.length === 0 
              ? 'No incidents have been reported yet'
              : 'Try adjusting your filters to see more incidents'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {INCIDENT_TYPE_ICONS[incident.incidentType]}
                    </span>
                    <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                    <span className="text-xl">
                      {getSeverityIcon(incident.severity)}
                    </span>
                    {getStatusBadge(incident.status, INCIDENT_STATUS_COLORS)}
                    {getStatusBadge(incident.severity, INCIDENT_SEVERITY_COLORS)}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{incident.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Reported</div>
                        <div className="text-sm text-gray-900">
                          {formatIncidentTime(incident.reportedAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Reporter</div>
                        <div className="text-sm text-gray-900">
                          {incident.reporter?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    
                    {incident.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Location</div>
                          <div className="text-sm text-gray-900">{incident.location}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {incident.assignedTo && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700">Assigned To</div>
                      <div className="text-sm text-gray-900">
                        {incident.assignee?.name || 'Unknown'}
                      </div>
                    </div>
                  )}
                  
                  {incident.resolution && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Resolution</div>
                      <div className="text-sm text-green-700">{incident.resolution}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {incident.status === 'OPEN' && (
                    <>
                      <button
                        onClick={() => handleEditIncident(incident)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit incident"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleAssignIncident(incident)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Assign incident"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                      </button>
                    </>
                  )}
                  
                  {(incident.status === 'OPEN' || incident.status === 'IN_PROGRESS') && (
                    <button
                      onClick={() => handleResolveIncident(incident)}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      title="Resolve incident"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Report Incident</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const incidentData = {
                eventId: 'evt_1', // TODO: Get from context
                incidentType: formData.get('incidentType'),
                severity: formData.get('severity'),
                title: formData.get('title'),
                description: formData.get('description'),
                location: formData.get('location'),
                followUpRequired: formData.get('followUpRequired') === 'on',
              };
              onCreateIncident(incidentData);
              setShowCreateForm(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Type
                  </label>
                  <select
                    name="incidentType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select incident type"
                  >
                    <option value="">Select type</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="SECURITY">Security</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="FACILITY">Facility</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="SAFETY">Safety</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    name="severity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Select severity"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Brief description of the incident"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="Detailed description of what happened"
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
                    placeholder="Where did this occur?"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                    aria-label="Follow-up required checkbox"
                  />
                  <label className="text-sm text-gray-700">Follow-up required</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90"
                >
                  Report Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
