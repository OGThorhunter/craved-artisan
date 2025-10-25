import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Headphones, Inbox, User, List, AlertCircle, 
  FileText, Bug, BarChart3, ArrowLeft, Plus 
} from 'lucide-react';
import { TicketList } from '../../components/admin/support/TicketList';
import { TicketFilters, FilterState } from '../../components/admin/support/TicketFilters';
import { SupportStats } from '../../components/admin/support/SupportStats';
import { useSupportSSE } from '../../hooks/useSupportSSE';
import { useAuth } from '../../contexts/AuthContext';

type SupportView = 'inbox' | 'my-queue' | 'all' | 'disputes' | 'compliance' | 'bugs' | 'analytics';

export default function SupportPage() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<SupportView>('inbox');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    severity: [],
    category: '',
    assignedTo: '',
  });
  const [search, setSearch] = useState('');
  
  // Connect to SSE for real-time updates
  const { events, isConnected } = useSupportSSE();
  
  // Fetch support stats
  const { data: stats } = useQuery({
    queryKey: ['support-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/support/stats', {
        withCredentials: true,
      });
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Fetch tickets based on view and filters
  const { data: ticketsData, isLoading, refetch } = useQuery({
    queryKey: ['support-tickets', activeView, filters, search],
    queryFn: async () => {
      const params: any = { search };
      
      // Apply view-specific filters
      if (activeView === 'inbox') {
        params.status = ['OPEN'];
        params.assignedTo = null;
      } else if (activeView === 'my-queue') {
        params.assignedTo = user?.id;
        params.status = ['OPEN', 'PENDING', 'AWAITING_VENDOR'];
      } else if (activeView === 'disputes') {
        params.category = 'PAYMENT';
      } else if (activeView === 'compliance') {
        params.category = 'COMPLIANCE';
      } else if (activeView === 'bugs') {
        params.category = 'TECH';
      }
      
      // Apply user filters
      if (filters.status.length > 0) params.status = filters.status;
      if (filters.severity.length > 0) params.severity = filters.severity;
      if (filters.category) params.category = filters.category;
      if (filters.assignedTo) params.assignedTo = filters.assignedTo;
      
      const response = await axios.get('/api/admin/support', {
        params,
        withCredentials: true,
      });
      return response.data;
    },
  });
  
  // Auto-refresh when SSE events arrive
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      if (latestEvent?.type === 'ticket_update') {
        refetch();
      }
    }
  }, [events, refetch]);
  
  // If viewing a specific ticket, show ticket detail
  if (id) {
    return (
      <div className="min-h-screen bg-[#F7F2EC]">
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => setLocation('/control/support')}
              className="flex items-center gap-2 text-[#7F232E] hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Support
            </button>
            <h1 className="text-2xl font-bold text-[#2b2b2b]">Ticket #{id.substring(0, 8)}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-500">Ticket detail view - Implementation in progress</p>
            <p className="text-sm text-gray-400 mt-2">Ticket ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const tickets = ticketsData?.tickets || [];

  // Main support dashboard with tabs
  return (
    <div className="min-h-screen bg-[#F7F2EC]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#7F232E] rounded-lg">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2b2b2b]">Support — The Command Desk</h1>
                <p className="text-sm text-[#4b4b4b]">
                  Manage tickets, escalations, and customer support operations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => toast.success('Create ticket modal - Coming soon')}
                className="flex items-center gap-2 px-4 py-2 bg-[#7F232E] text-white rounded-lg hover:bg-[#6b1e27]"
              >
                <Plus className="w-4 h-4" />
                Create Ticket
              </button>
              <button
                onClick={() => setLocation('/dashboard/admin')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            <TabButton
              active={activeView === 'inbox'}
              onClick={() => setActiveView('inbox')}
              icon={<Inbox className="w-4 h-4" />}
              label="Inbox"
              badge={0}
            />
            <TabButton
              active={activeView === 'my-queue'}
              onClick={() => setActiveView('my-queue')}
              icon={<User className="w-4 h-4" />}
              label="My Queue"
              badge={0}
            />
            <TabButton
              active={activeView === 'all'}
              onClick={() => setActiveView('all')}
              icon={<List className="w-4 h-4" />}
              label="All Tickets"
            />
            <TabButton
              active={activeView === 'disputes'}
              onClick={() => setActiveView('disputes')}
              icon={<AlertCircle className="w-4 h-4" />}
              label="Disputes"
            />
            <TabButton
              active={activeView === 'compliance'}
              onClick={() => setActiveView('compliance')}
              icon={<FileText className="w-4 h-4" />}
              label="Compliance"
            />
            <TabButton
              active={activeView === 'bugs'}
              onClick={() => setActiveView('bugs')}
              icon={<Bug className="w-4 h-4" />}
              label="Bug Reports"
            />
            <TabButton
              active={activeView === 'analytics'}
              onClick={() => setActiveView('analytics')}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Analytics"
            />
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Section */}
        {stats && <SupportStats stats={stats} />}
        
        {/* SSE Connection Indicator */}
        {isConnected && (
          <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Real-time updates active
          </div>
        )}
        
        {/* Filters */}
        {activeView !== 'analytics' && (
          <TicketFilters
            onFilterChange={setFilters}
            onSearchChange={setSearch}
          />
        )}
        
        {/* Ticket List */}
        {activeView === 'analytics' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            Analytics view - Coming soon
          </div>
        ) : (
          <div className="mt-4">
            <TicketList
              tickets={tickets}
              loading={isLoading}
              onRefresh={refetch}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
        ${active
          ? 'border-[#7F232E] text-[#7F232E] bg-[#7F232E]/5'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-[#7F232E] text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

