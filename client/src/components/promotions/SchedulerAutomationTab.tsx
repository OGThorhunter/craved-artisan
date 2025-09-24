import React, { useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Zap,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Target,
  Users,
  BarChart3,
  Bell,
  Repeat,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  type: 'campaign' | 'promotion' | 'email' | 'social';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  targetAudience: string;
  createdAt: string;
  conflicts?: string[];
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'inactive' | 'draft';
  conditions: string[];
  createdAt: string;
  lastRun?: string;
  runCount: number;
}

interface SchedulerAutomationTabProps {
  schedules: Schedule[];
  automations: Automation[];
  onScheduleCreate: (schedule: Partial<Schedule>) => void;
  onScheduleUpdate: (schedule: Schedule) => void;
  onScheduleDelete: (id: string) => void;
  onAutomationCreate: (automation: Partial<Automation>) => void;
  onAutomationUpdate: (automation: Automation) => void;
  onAutomationToggle: (id: string, status: 'active' | 'inactive') => void;
  onConflictResolve: (conflict: any) => void;
  isLoading: boolean;
}

const SchedulerAutomationTab: React.FC<SchedulerAutomationTabProps> = ({
  schedules,
  automations,
  onScheduleCreate,
  onScheduleUpdate,
  onScheduleDelete,
  onAutomationCreate,
  onAutomationUpdate,
  onAutomationToggle,
  onConflictResolve,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scheduler' | 'automation'>('scheduler');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter schedules/automations
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString();

  return (
    <div className="space-y-6">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Scheduler & Automation</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('scheduler')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'scheduler' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Scheduler
            </button>
            <button
              onClick={() => setActiveSubTab('automation')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'automation' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Automation
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={`Search ${activeSubTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by status"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
          
          {activeSubTab === 'scheduler' && (
            <button
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Calendar View
            </button>
          )}
          
          <button
            onClick={() => {
              if (activeSubTab === 'scheduler') onScheduleCreate({});
              else onAutomationCreate({});
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create {activeSubTab === 'scheduler' ? 'Schedule' : 'Automation'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {activeSubTab === 'scheduler' ? 'Total Schedules' : 'Total Automations'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSubTab === 'scheduler' ? schedules.length : automations.length}
              </p>
            </div>
            {activeSubTab === 'scheduler' ? 
              <Calendar className="h-8 w-8 text-blue-600" /> : 
              <Zap className="h-8 w-8 text-blue-600" />
            }
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSubTab === 'scheduler' ? 
                  schedules.filter(s => s.status === 'active').length :
                  automations.filter(a => a.status === 'active').length
                }
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflicts</p>
              <p className="text-2xl font-bold text-gray-900">
                {schedules.filter(s => s.conflicts && s.conflicts.length > 0).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Runs</p>
              <p className="text-2xl font-bold text-gray-900">
                {automations.reduce((sum, a) => sum + a.runCount, 0)}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSubTab === 'scheduler' ? (
            // Schedules List
            filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                style={{ backgroundColor: '#F7F2EC' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                        {getStatusIcon(schedule.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                        {schedule.conflicts && schedule.conflicts.length > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {schedule.conflicts.length} Conflicts
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>Type: {schedule.type}</span>
                        <span>Start: {formatDate(schedule.startDate)}</span>
                        <span>End: {formatDate(schedule.endDate)}</span>
                        {schedule.recurrence && schedule.recurrence !== 'none' && (
                          <span>Recurrence: {schedule.recurrence}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Target: {schedule.targetAudience}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {schedule.conflicts && schedule.conflicts.length > 0 && (
                      <button
                        onClick={() => onConflictResolve(schedule.conflicts)}
                        className="p-2 text-orange-600 hover:text-orange-700 transition-colors"
                        title="Resolve Conflicts"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onScheduleUpdate(schedule)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit Schedule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onScheduleDelete(schedule.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete Schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Automations List
            filteredAutomations.map((automation) => (
              <div
                key={automation.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                style={{ backgroundColor: '#F7F2EC' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                        {getStatusIcon(automation.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                          {automation.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{automation.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>Trigger: {automation.trigger}</span>
                        <span>Action: {automation.action}</span>
                        <span>Runs: {automation.runCount}</span>
                        {automation.lastRun && (
                          <span>Last Run: {formatDate(automation.lastRun)}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Conditions: {automation.conditions.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAutomationToggle(automation.id, automation.status === 'active' ? 'inactive' : 'active')}
                      className={`p-2 transition-colors ${
                        automation.status === 'active' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                      title={automation.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {automation.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => onAutomationUpdate(automation)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit Automation"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onAutomationUpdate(automation)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete Automation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Calendar</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
                <p className="text-gray-600">Interactive calendar view will be implemented here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerAutomationTab;
