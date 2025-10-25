import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Bell,
  FileText,
  X,
  UserPlus,
  SortAsc,
  SortDesc,
  List,
  Grid3X3,
  Calendar as CalendarIcon
} from 'lucide-react';
import AIInsights from './AIInsights';
import { Badge } from '../ui/Badge';

interface Task {
  id: string;
  title: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'research' | 'documentation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  dueDate?: string;
  customerId?: string;
  assignedTo?: string;
  assignedBy?: string;
  createdAt: string;
  updatedAt?: string;
  description?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  assignedUser?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  subtasks?: Task[];
  dependencies?: string[];
  attachments?: string[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'sales_rep' | 'support' | 'marketing' | 'other';
  avatar?: string;
  isActive: boolean;
  tasksAssigned: number;
  tasksCompleted: number;
}

interface TaskManagementProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskCreate: (task: Partial<Task>) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskComplete: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskAssign?: (taskId: string, userId: string) => void;
  onTaskReassign?: (taskId: string, fromUserId: string, toUserId: string) => void;
  onSubtaskCreate?: (parentTaskId: string, subtask: Partial<Task>) => void;
  onTeamMemberCreate: (member: Partial<TeamMember>) => void;
  onTeamMemberUpdate: (member: TeamMember) => void;
  onTeamMemberDelete?: (memberId: string) => void;
  isLoading: boolean;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  teamMembers,
  onTaskCreate,
  onTaskUpdate,
  onTaskComplete,
  onTaskDelete,
  onTeamMemberCreate,
  onTeamMemberUpdate,
  isLoading
}) => {
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showTaskEdit, setShowTaskEdit] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskCreate, setShowTaskCreate] = useState(false);
  const [showTeamMemberCreate, setShowTeamMemberCreate] = useState(false);
  const [showTeamMemberEdit, setShowTeamMemberEdit] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    phone: '',
    role: 'sales_rep',
    isActive: true,
    tasksAssigned: 0,
    tasksCompleted: 0
  });
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    type: 'follow_up',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    description: '',
    estimatedHours: 1,
    tags: []
  });

  // Generate AI insights based on task data
  const taskInsights = useMemo(() => {
    const insights = [];
    
    // Overdue tasks insight
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today;
    });
    
    if (overdueTasks.length > 0) {
      insights.push({
        id: 'overdue-tasks',
        type: 'warning' as const,
        title: 'Overdue Tasks',
        description: `${overdueTasks.length} tasks are past their due date. These need immediate attention to avoid customer impact.`,
        confidence: 95,
        priority: 'high' as const,
        category: 'task-management' as const,
        action: 'Review Overdue Tasks'
      });
    }

    // High priority unassigned tasks
    const unassignedHighPriority = tasks.filter(task => 
      !task.assignedTo && (task.priority === 'high' || task.priority === 'urgent') && 
      task.status !== 'completed' && task.status !== 'cancelled'
    );
    
    if (unassignedHighPriority.length > 0) {
      insights.push({
        id: 'unassigned-high-priority',
        type: 'warning' as const,
        title: 'Unassigned High Priority Tasks',
        description: `${unassignedHighPriority.length} high or urgent priority tasks are unassigned. Assign these immediately to prevent delays.`,
        confidence: 90,
        priority: 'high' as const,
        category: 'task-management' as const,
        action: 'Assign High Priority Tasks'
      });
    }

    // Task completion rate insight
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.filter(task => task.status !== 'cancelled').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    if (completionRate < 60 && totalTasks > 10) {
      insights.push({
        id: 'low-completion-rate',
        type: 'warning' as const,
        title: 'Low Task Completion Rate',
        description: `Only ${completionRate.toFixed(1)}% of tasks are completed. Focus on task prioritization and team productivity.`,
        confidence: 85,
        priority: 'medium' as const,
        category: 'task-management' as const,
        action: 'Improve Task Management'
      });
    } else if (completionRate > 80 && totalTasks > 10) {
      insights.push({
        id: 'high-completion-rate',
        type: 'success' as const,
        title: 'Excellent Task Completion',
        description: `${completionRate.toFixed(1)}% task completion rate is excellent! Team is performing well.`,
        confidence: 90,
        priority: 'low' as const,
        category: 'task-management' as const,
        action: 'Maintain Performance'
      });
    }

    // Workload imbalance insight
    const taskCounts = teamMembers.map(member => ({
      member,
      taskCount: tasks.filter(task => task.assignedTo === member.id && task.status !== 'completed' && task.status !== 'cancelled').length
    }));
    
    const maxTasks = Math.max(...taskCounts.map(tc => tc.taskCount));
    const minTasks = Math.min(...taskCounts.map(tc => tc.taskCount));
    const workloadImbalance = maxTasks - minTasks;
    
    if (workloadImbalance > 5 && taskCounts.length > 1) {
      insights.push({
        id: 'workload-imbalance',
        type: 'info' as const,
        title: 'Workload Imbalance Detected',
        description: `Task distribution is uneven. Some team members have ${workloadImbalance} more tasks than others. Consider redistributing workload.`,
        confidence: 88,
        priority: 'medium' as const,
        category: 'task-management' as const,
        action: 'Balance Team Workload'
      });
    }

    // Upcoming deadlines insight
    const upcomingDeadlines = tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue > 0;
    });
    
    if (upcomingDeadlines.length > 0) {
      insights.push({
        id: 'upcoming-deadlines',
        type: 'info' as const,
        title: 'Upcoming Deadlines',
        description: `${upcomingDeadlines.length} tasks are due within the next 3 days. Ensure team is prepared to meet these deadlines.`,
        confidence: 92,
        priority: 'medium' as const,
        category: 'task-management' as const,
        action: 'Prepare for Deadlines'
      });
    }

    return insights;
  }, [tasks, teamMembers]);

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    // Handle special priority filters
    let matchesPriority = true;
    if (priorityFilter === 'overdue') {
      matchesPriority = isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'cancelled';
    } else if (priorityFilter === 'dueSoon') {
      matchesPriority = isDueSoon(task.dueDate) && task.status !== 'completed' && task.status !== 'cancelled';
    } else if (priorityFilter) {
      matchesPriority = task.priority === priorityFilter;
    }
    
    const matchesAssignee = !assigneeFilter || task.assignedTo === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'dueDate':
        comparison = new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
        break;
      case 'priority': {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      }
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'on_hold': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 3;
  };

  // Task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate)).length,
    dueSoon: tasks.filter(t => isDueSoon(t.dueDate)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-600">Organize, assign, and track your team's tasks efficiently</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tasks..."
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
            aria-label="Filter tasks by status"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by priority"
            aria-label="Filter tasks by priority"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by assignee"
            aria-label="Filter tasks by assignee"
          >
            <option value="">All Assignees</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'createdAt' | 'title')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Sort by"
            aria-label="Sort tasks"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </button>
          
          <button 
            onClick={() => setShowTaskCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/80 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md transition-colors ${
                activeView === 'list'
                  ? 'bg-brand-green text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
                title="List view"
                aria-label="Switch to list view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveView('kanban')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                  activeView === 'kanban'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Kanban view"
                aria-label="Switch to kanban view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 rounded-r-md transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Calendar view"
                aria-label="Switch to calendar view"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {sortedTasks.length} of {tasks.length} tasks
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTeamMemberCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-brand-maroon text-white rounded-md hover:bg-brand-maroon/80 transition-colors text-sm font-medium"
          >
            <UserPlus className="h-4 w-4" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights 
        insights={taskInsights}
        isLoading={isLoading}
        maxInsights={3}
        showCategories={true}
        onInsightClick={(insight) => {
          console.log('Task AI Insight clicked:', insight);
          // Handle insight click actions
          switch (insight.id) {
            case 'overdue-tasks':
              setStatusFilter('pending');
              break;
            case 'unassigned-high-priority':
              setAssigneeFilter('unassigned');
              setPriorityFilter('high');
              break;
            case 'workload-imbalance':
              // Could show workload distribution
              break;
            case 'upcoming-deadlines':
              // Could show tasks due soon
              break;
          }
        }}
      />

      {/* Task Statistics - Clickable to Filter */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <button
          onClick={() => {
            setStatusFilter('');
            setPriorityFilter('');
          }}
          className={`rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-200 text-left ${
            statusFilter === '' && priorityFilter === '' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ backgroundColor: '#F7F2EC' }}
          title="Show all tasks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            if (statusFilter === 'pending') {
              setStatusFilter('');
            } else {
              setStatusFilter('pending');
              setPriorityFilter('');
            }
          }}
          className={`rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-200 text-left ${
            statusFilter === 'pending' && priorityFilter !== 'overdue' ? 'ring-2 ring-yellow-500' : ''
          }`}
          style={{ backgroundColor: '#F7F2EC' }}
          title="Filter by pending tasks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            if (statusFilter === 'in_progress') {
              setStatusFilter('');
            } else {
              setStatusFilter('in_progress');
              setPriorityFilter('');
            }
          }}
          className={`rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-200 text-left ${
            statusFilter === 'in_progress' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ backgroundColor: '#F7F2EC' }}
          title="Filter by in progress tasks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            if (statusFilter === 'completed') {
              setStatusFilter('');
            } else {
              setStatusFilter('completed');
              setPriorityFilter('');
            }
          }}
          className={`rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-200 text-left ${
            statusFilter === 'completed' ? 'ring-2 ring-green-500' : ''
          }`}
          style={{ backgroundColor: '#F7F2EC' }}
          title="Filter by completed tasks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            // Show overdue tasks - filter by pending/in_progress and check due date
            if (statusFilter === 'pending' && priorityFilter === 'overdue') {
              setStatusFilter('');
              setPriorityFilter('');
            } else {
              setStatusFilter('pending');
              setPriorityFilter('overdue');
            }
          }}
          className={`rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-200 text-left ${
            priorityFilter === 'overdue' ? 'ring-2 ring-red-500' : ''
          }`}
          style={{ backgroundColor: '#F7F2EC' }}
          title="Filter by overdue tasks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            // Show due soon tasks
            if (priorityFilter === 'dueSoon') {
              setPriorityFilter('');
              setStatusFilter('');
            } else {
              setPriorityFilter('dueSoon');
              setStatusFilter('');
            }
          }}
          className={`rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-200 text-left ${
            priorityFilter === 'dueSoon' ? 'ring-2 ring-orange-500' : ''
          }`}
          style={{ backgroundColor: '#F7F2EC' }}
          title="Filter by due soon tasks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Soon</p>
              <p className="text-2xl font-bold text-orange-600">{taskStats.dueSoon}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Active Filter Indicator */}
      {(statusFilter || priorityFilter) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">Active Filter:</span>
            <Badge className="bg-blue-600 text-white">
              {statusFilter === 'pending' && 'Pending Tasks'}
              {statusFilter === 'in_progress' && 'In Progress Tasks'}
              {statusFilter === 'completed' && 'Completed Tasks'}
              {statusFilter === 'cancelled' && 'Cancelled Tasks'}
              {statusFilter === 'on_hold' && 'On Hold Tasks'}
              {priorityFilter === 'overdue' && 'Overdue Tasks'}
              {priorityFilter === 'dueSoon' && 'Due Soon Tasks'}
              {priorityFilter && !['overdue', 'dueSoon'].includes(priorityFilter) && `${priorityFilter} Priority`}
            </Badge>
            <span className="text-sm text-blue-800">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>
          <button
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear Filter
          </button>
        </div>
      )}

      {/* Task List View */}
      {activeView === 'list' && (
        <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.assignedUser ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {task.assignedUser.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{task.assignedUser.name}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.dueDate ? (
                        <div className="text-sm text-gray-900">
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && (
                            <span className="ml-2 text-red-600 text-xs">Overdue</span>
                          )}
                          {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && (
                            <span className="ml-2 text-orange-600 text-xs">Due Soon</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No due date</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setShowTaskEdit(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onTaskComplete(task.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onTaskDelete(task.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['pending', 'in_progress', 'completed', 'on_hold'].map((status) => (
            <div key={status} className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">{status.replace('_', ' ')}</h3>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {sortedTasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {sortedTasks
                  .filter(task => task.status === status)
                  .map((task) => (
                    <div key={task.id} className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {task.assignedUser ? (
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {task.assignedUser.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="ml-2 text-xs text-gray-600">{task.assignedUser.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Unassigned</span>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskDetails(true);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title="View details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setShowTaskEdit(true);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit task"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => onTaskComplete(task.id)}
                              className="text-gray-400 hover:text-green-600"
                              title="Mark complete"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => onTaskDelete(task.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Calendar</h3>
            <p className="text-sm text-gray-600">View and manage tasks by date</p>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date();
              const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
              const startDate = new Date(firstDay);
              startDate.setDate(startDate.getDate() - firstDay.getDay());
              startDate.setDate(startDate.getDate() + i);
              
              const isCurrentMonth = startDate.getMonth() === date.getMonth();
              const isToday = startDate.toDateString() === new Date().toDateString();
              
              // Get tasks for this date
              const dayTasks = sortedTasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === startDate.toDateString();
              });
              
              return (
                <div
                  key={i}
                  className={`min-h-[100px] p-2 border border-gray-200 rounded ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday ? 'text-blue-600' : ''}`}>
                    {startDate.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800 line-through' 
                            : task.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetails(true);
                        }}
                        title={`${task.title} - ${task.priority} priority`}
                      >
                        <div className="truncate">{task.title}</div>
                        {task.assignedUser && (
                          <div className="text-xs opacity-75">
                            {task.assignedUser.name}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                  
                  {/* Add task button */}
                  <button
                    onClick={() => {
                        const tomorrow = new Date(startDate);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setNewTask({
                      ...newTask,
                      dueDate: tomorrow.toISOString().split('T')[0]
                    });
                    setShowTaskCreate(true);
                  }}
                    className="w-full mt-1 p-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Add task for this date"
                  >
                    <Plus className="h-3 w-3 mx-auto" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Calendar Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-100 rounded"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedTasks.length === 0 && (
        <div className="rounded-lg shadow-lg p-8 text-center" style={{ backgroundColor: '#F7F2EC' }}>
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first task</p>
          <button
            onClick={() => setShowTaskCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium mx-auto"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
                <button
                  onClick={() => {
                    setShowTaskCreate(false);
                    setNewTask({
                      title: '',
                      type: 'follow_up',
                      priority: 'medium',
                      status: 'pending',
                      dueDate: '',
                      description: '',
                      estimatedHours: 1,
                      tags: []
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close create task modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <select
                    value={newTask.type || 'follow_up'}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value as 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'research' | 'documentation' | 'other'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task type"
                    aria-label="Select task type"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="proposal">Proposal</option>
                    <option value="demo">Demo</option>
                    <option value="research">Research</option>
                    <option value="documentation">Documentation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority || 'medium'}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select priority"
                    aria-label="Select priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate || ''}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Due date"
                    aria-label="Due date for this task"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTask.estimatedHours || 1}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Estimated hours"
                    aria-label="Estimated hours for this task"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={newTask.assignedTo || ''}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select assignee"
                    aria-label="Select assignee"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the task..."
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowTaskCreate(false);
                    setNewTask({
                      title: '',
                      type: 'follow_up',
                      priority: 'medium',
                      status: 'pending',
                      dueDate: '',
                      description: '',
                      estimatedHours: 1,
                      tags: []
                    });
                  }}
                  className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onTaskCreate(newTask);
                    setShowTaskCreate(false);
                    setNewTask({
                      title: '',
                      type: 'follow_up',
                      priority: 'medium',
                      status: 'pending',
                      dueDate: '',
                      description: '',
                      estimatedHours: 1,
                      tags: []
                    });
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                <button
                  onClick={() => setShowTaskDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close task details modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Task Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type:</span> {selectedTask.type}</p>
                    <p><span className="font-medium">Priority:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Due Date:</span> {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}</p>
                    <p><span className="font-medium">Estimated Hours:</span> {selectedTask.estimatedHours || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
                  {selectedTask.assignedUser ? (
                    <div className="space-y-2">
                      <p><span className="font-medium">Assigned To:</span> {selectedTask.assignedUser.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedTask.assignedUser.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Unassigned</p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              {selectedTask.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700">{selectedTask.description}</p>
                </div>
              )}
              
              {/* Tags */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex items-center gap-3">
                  {selectedTask.status !== 'completed' && (
                    <button
                      onClick={() => {
                        onTaskComplete(selectedTask.id);
                        setShowTaskDetails(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowTaskDetails(false);
                      setEditingTask(selectedTask);
                      setShowTaskEdit(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Task
                  </button>
                  <button
                    onClick={() => {
                      setShowTaskDetails(false);
                      onTaskDelete(selectedTask.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showTaskEdit && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
                <button
                  onClick={() => {
                    setShowTaskEdit(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close edit task modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <select
                    value={editingTask.type}
                    onChange={(e) => setEditingTask({...editingTask, type: e.target.value as 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'research' | 'documentation' | 'other'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task type"
                    aria-label="Select task type"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="proposal">Proposal</option>
                    <option value="demo">Demo</option>
                    <option value="research">Research</option>
                    <option value="documentation">Documentation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select priority"
                    aria-label="Select priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select status"
                    aria-label="Select status"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Due date"
                    aria-label="Due date for this task"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={editingTask.estimatedHours || 1}
                    onChange={(e) => setEditingTask({...editingTask, estimatedHours: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Estimated hours"
                    aria-label="Estimated hours for this task"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={editingTask.assignedTo || ''}
                    onChange={(e) => setEditingTask({...editingTask, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select assignee"
                    aria-label="Select assignee"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the task..."
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowTaskEdit(false);
                    setEditingTask(null);
                  }}
                  className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onTaskUpdate(editingTask);
                    setShowTaskEdit(false);
                    setEditingTask(null);
                  }}
                  disabled={!editingTask.title}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Member Modal */}
      {showTeamMemberCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add Team Member</h2>
                <button
                  onClick={() => {
                    setShowTeamMemberCreate(false);
                    setNewTeamMember({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'sales_rep',
                      isActive: true,
                      tasksAssigned: 0,
                      tasksCompleted: 0
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close add team member modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newTeamMember.name || ''}
                    onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newTeamMember.email || ''}
                    onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newTeamMember.phone || ''}
                    onChange={(e) => setNewTeamMember({...newTeamMember, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newTeamMember.role || 'sales_rep'}
                    onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value as 'manager' | 'sales_rep' | 'support' | 'marketing' | 'admin' | 'other'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select role"
                    aria-label="Select team member role"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="sales_rep">Sales Representative</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newTeamMember.isActive || true}
                    onChange={(e) => setNewTeamMember({...newTeamMember, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active team member
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Active members can be assigned tasks and will appear in assignment dropdowns.
                </p>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowTeamMemberCreate(false);
                    setNewTeamMember({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'sales_rep',
                      isActive: true,
                      tasksAssigned: 0,
                      tasksCompleted: 0
                    });
                  }}
                  className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onTeamMemberCreate(newTeamMember);
                    setShowTeamMemberCreate(false);
                    setNewTeamMember({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'sales_rep',
                      isActive: true,
                      tasksAssigned: 0,
                      tasksCompleted: 0
                    });
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Add Team Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      {showTeamMemberEdit && editingTeamMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Team Member</h2>
                <button
                  onClick={() => {
                    setShowTeamMemberEdit(false);
                    setEditingTeamMember(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close edit team member modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingTeamMember.name}
                    onChange={(e) => setEditingTeamMember({...editingTeamMember, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editingTeamMember.email}
                    onChange={(e) => setEditingTeamMember({...editingTeamMember, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingTeamMember.phone || ''}
                    onChange={(e) => setEditingTeamMember({...editingTeamMember, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={editingTeamMember.role}
                    onChange={(e) => setEditingTeamMember({...editingTeamMember, role: e.target.value as 'manager' | 'sales_rep' | 'support' | 'marketing' | 'admin' | 'other'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select role"
                    aria-label="Select team member role"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="sales_rep">Sales Representative</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    checked={editingTeamMember.isActive}
                    onChange={(e) => setEditingTeamMember({...editingTeamMember, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveEdit" className="ml-2 block text-sm text-gray-900">
                    Active team member
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Active members can be assigned tasks and will appear in assignment dropdowns.
                </p>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowTeamMemberEdit(false);
                    setEditingTeamMember(null);
                  }}
                  className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onTeamMemberUpdate(editingTeamMember);
                    setShowTeamMemberEdit(false);
                    setEditingTeamMember(null);
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Update Team Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
