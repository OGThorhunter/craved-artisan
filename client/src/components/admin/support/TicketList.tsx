import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { SLAChip } from './SLAChip';

interface Ticket {
  id: string;
  subject: string;
  status: any;
  severity: any;
  category: any;
  createdAt: string;
  updatedAt: string;
  slaDueAt: string | null;
  requester?: {
    id: string;
    name: string | null;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
  onRefresh?: () => void;
}

type SortField = 'createdAt' | 'updatedAt' | 'subject' | 'status' | 'severity';
type SortOrder = 'asc' | 'desc';

export function TicketList({ tickets, loading = false, onRefresh }: TicketListProps) {
  const [, setLocation] = useLocation();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Calculate SLA status for each ticket
  const getTicketSlaStatus = (slaDueAt: string | null) => {
    if (!slaDueAt) {
      return { status: 'green' as const, minutesRemaining: 0 };
    }
    
    const now = new Date();
    const dueDate = new Date(slaDueAt);
    const minutesRemaining = Math.floor((dueDate.getTime() - now.getTime()) / 1000 / 60);
    
    if (minutesRemaining < 0) {
      return { status: 'breached' as const, minutesRemaining };
    }
    
    // Calculate percentage used (assume 24-hour SLA for simplicity)
    const totalMinutes = 24 * 60;
    const percentUsed = ((totalMinutes - minutesRemaining) / totalMinutes) * 100;
    
    if (percentUsed < 60) {
      return { status: 'green' as const, minutesRemaining };
    } else if (percentUsed < 90) {
      return { status: 'yellow' as const, minutesRemaining };
    } else {
      return { status: 'red' as const, minutesRemaining };
    }
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  const sortedTickets = [...tickets].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F232E]"></div>
        </div>
      </div>
    );
  }
  
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg font-medium mb-2">No tickets found</p>
          <p className="text-sm">Try adjusting your filters or create a new ticket</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortableHeader field="subject" label="Subject" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <SortableHeader field="severity" label="Severity" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Requester
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SLA
              </th>
              <SortableHeader field="updatedAt" label="Last Update" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTickets.map(ticket => {
              const slaStatus = getTicketSlaStatus(ticket.slaDueAt);
              
              return (
                <tr
                  key={ticket.id}
                  onClick={() => setLocation(`/control/support/${ticket.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                    <div className="text-xs text-gray-500 mt-0.5">#{ticket.id.substring(0, 8)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-4">
                    <SeverityBadge severity={ticket.severity} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{ticket.category}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {ticket.requester?.name || ticket.requester?.email || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {ticket.assignedTo?.name || ticket.assignedTo?.email || (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <SLAChip
                      slaDueAt={ticket.slaDueAt}
                      status={slaStatus.status}
                      minutesRemaining={slaStatus.minutesRemaining}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-700">{formatDate(ticket.updatedAt)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortableHeader({ field, label, sortField, sortOrder, onSort }: SortableHeaderProps) {
  const isActive = sortField === field;
  
  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && (
          sortOrder === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        )}
      </div>
    </th>
  );
}

