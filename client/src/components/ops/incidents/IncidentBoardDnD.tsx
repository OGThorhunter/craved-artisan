import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlertTriangle, User } from 'lucide-react';
import Card from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import Button from '../../ui/Button';

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  affected?: string[];
  tags?: string[];
  owner?: any;
  startedAt: string;
  mitigatedAt?: string;
  closedAt?: string;
  slaMitigateMinutes?: number;
  slaCloseMinutes?: number;
  events?: any[];
}

interface IncidentBoardDnDProps {
  incidents: Incident[];
  onStatusChange: (incidentId: string, newStatus: string) => void;
  onIncidentClick: (incident: Incident) => void;
}

function IncidentCard({ incident, onIncidentClick }: { incident: Incident, onIncidentClick: (incident: Incident) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: incident.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV1': return 'bg-red-100 text-red-800 border-red-300';
      case 'SEV2': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'SEV3': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SEV4': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSLAStatus = () => {
    const now = Date.now();
    const start = new Date(incident.startedAt).getTime();
    const elapsed = (now - start) / 60000; // minutes

    if (incident.status === 'OPEN' && incident.slaMitigateMinutes) {
      const remaining = incident.slaMitigateMinutes - elapsed;
      if (remaining < 0) return { status: 'breach', text: 'SLA BREACHED', color: 'text-red-600' };
      if (remaining < incident.slaMitigateMinutes * 0.2) return { status: 'warning', text: `${Math.floor(remaining)}m left`, color: 'text-orange-600' };
      return { status: 'ok', text: `${Math.floor(remaining)}m left`, color: 'text-green-600' };
    }

    if (incident.status === 'MITIGATED' && incident.slaCloseMinutes) {
      const remaining = incident.slaCloseMinutes - elapsed;
      if (remaining < 0) return { status: 'breach', text: 'SLA BREACHED', color: 'text-red-600' };
      return { status: 'ok', text: `${Math.floor(remaining)}m to close`, color: 'text-green-600' };
    }

    return null;
  };

  const slaStatus = getSLAStatus();
  const lastEvent = incident.events && incident.events.length > 0 ? incident.events[0] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onIncidentClick(incident)}
      className="cursor-pointer"
    >
      <Card className="p-3 mb-2 hover:shadow-md transition-shadow border-l-4 border-l-[#7F232E]">
        <div className="space-y-2">
          {/* Title + Severity */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-[#2b2b2b] text-sm flex-1">{incident.title}</h4>
            <Badge className={`${getSeverityColor(incident.severity)} text-xs px-2 py-0.5`}>
              {incident.severity}
            </Badge>
          </div>

          {/* SLA Status */}
          {slaStatus && (
            <div className={`text-xs font-semibold ${slaStatus.color}`}>
              <Clock className="h-3 w-3 inline mr-1" />
              {slaStatus.text}
            </div>
          )}

          {/* Affected Services */}
          {incident.affected && incident.affected.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {incident.affected.slice(0, 3).map((service) => (
                <Badge key={service} variant="secondary" className="text-xs px-2 py-0.5">
                  {service}
                </Badge>
              ))}
              {incident.affected.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{incident.affected.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Owner */}
          {incident.owner && (
            <div className="flex items-center gap-1 text-xs text-[#4b4b4b]">
              <User className="h-3 w-3" />
              <span>{incident.owner.name || incident.owner.email}</span>
            </div>
          )}

          {/* Last Event */}
          {lastEvent && (
            <div className="text-xs text-[#4b4b4b] italic">
              {lastEvent.summary} • {new Date(lastEvent.createdAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function IncidentBoardDnD({ incidents, onStatusChange, onIncidentClick }: IncidentBoardDnDProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const incidentId = active.id as string;
    const newStatus = over.id as string;

    // Find the incident and check if status actually changed
    const incident = incidents.find(i => i.id === incidentId);
    if (incident && incident.status !== newStatus) {
      onStatusChange(incidentId, newStatus);
    }
  };

  const openIncidents = incidents.filter(i => i.status === 'OPEN');
  const mitigatedIncidents = incidents.filter(i => i.status === 'MITIGATED');
  const closedIncidents = incidents.filter(i => i.status === 'CLOSED');

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Open Column */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#2b2b2b] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Open
              <Badge variant="destructive" className="text-xs">{openIncidents.length}</Badge>
            </h3>
          </div>
          <SortableContext items={openIncidents.map(i => i.id)} strategy={verticalListSortingStrategy} id="OPEN">
            <div className="space-y-2 min-h-[200px]">
              {openIncidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} onIncidentClick={onIncidentClick} />
              ))}
              {openIncidents.length === 0 && (
                <div className="text-center text-[#4b4b4b] text-sm py-8">
                  No open incidents
                </div>
              )}
            </div>
          </SortableContext>
        </div>

        {/* Mitigated Column */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#2b2b2b] flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Mitigated
              <Badge variant="warning" className="text-xs">{mitigatedIncidents.length}</Badge>
            </h3>
          </div>
          <SortableContext items={mitigatedIncidents.map(i => i.id)} strategy={verticalListSortingStrategy} id="MITIGATED">
            <div className="space-y-2 min-h-[200px]">
              {mitigatedIncidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} onIncidentClick={onIncidentClick} />
              ))}
              {mitigatedIncidents.length === 0 && (
                <div className="text-center text-[#4b4b4b] text-sm py-8">
                  No mitigated incidents
                </div>
              )}
            </div>
          </SortableContext>
        </div>

        {/* Closed Column */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#2b2b2b] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              Closed
              <Badge variant="success" className="text-xs">{closedIncidents.length}</Badge>
            </h3>
          </div>
          <SortableContext items={closedIncidents.map(i => i.id)} strategy={verticalListSortingStrategy} id="CLOSED">
            <div className="space-y-2 min-h-[200px]">
              {closedIncidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} onIncidentClick={onIncidentClick} />
              ))}
              {closedIncidents.length === 0 && (
                <div className="text-center text-[#4b4b4b] text-sm py-8">
                  No closed incidents
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}

