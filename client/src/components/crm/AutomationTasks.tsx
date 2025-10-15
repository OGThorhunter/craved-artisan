import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Edit,
  Trash2,
  Eye,
  Settings,
  Target,
  BarChart3,
  Users,
  TrendingUp,
  Star,
  Bell,
  FileText,
  MoreVertical,
  X,
  UserPlus,
  Flag,
  CalendarDays,
  Tag,
  ArrowRight,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Activity
} from 'lucide-react';

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
  role: 'admin' | 'manager' | 'sales_rep' | 'support';
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
  onTaskAssign: (taskId: string, userId: string) => void;
  onTaskReassign: (taskId: string, fromUserId: string, toUserId: string) => void;
  onSubtaskCreate: (parentTaskId: string, subtask: Partial<Task>) => void;
  isLoading: boolean;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  teamMembers,
  onTaskCreate,
  onTaskUpdate,
  onTaskComplete,
  onTaskDelete,
  onTaskAssign,
  onTaskReassign,
  onSubtaskCreate,
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
  const [showTaskAssign, setShowTaskAssign] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);
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

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
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
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
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
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Calendar;
      case 'follow_up': return MessageSquare;
      case 'proposal': return FileText;
      case 'demo': return Play;
      default: return Calendar;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (dueDate: string) => {
    return getDaysUntilDue(dueDate) < 0;
  };

  const isDueSoon = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    return days >= 0 && days <= 3;
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
              placeholder="Search..."
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
            onChange={(e) => setSortBy(e.target.value as any)}
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                className={`px-3 py-1 text-sm font-medium rounded-l-lg transition-colors ${
                  activeView === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setActiveView('kanban')}
                className={`px-3 py-1 text-sm font-medium border-l border-gray-300 transition-colors ${
                  activeView === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-3 py-1 text-sm font-medium border-l border-gray-300 rounded-r-lg transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {sortedTasks.length} of {tasks.length} tasks
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTaskAssign(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <UserPlus className="h-4 w-4" />
            Bulk Assign
          </button>
        </div>
      </div>

      {/* Task Management Content */}
      <div className="space-y-6">
          {/* Task Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'pending').length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'completed').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.dueDate && isOverdue(t.dueDate)).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Tasks List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const TypeIcon = getTypeIcon(task.type);
                return (
                  <div
                    key={task.id}
                    className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                    style={{ backgroundColor: '#F7F2EC' }}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                          
                          {task.customer && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <User className="h-4 w-4" />
                              <span>{task.customer.firstName} {task.customer.lastName}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span className={isOverdue(task.dueDate) ? 'text-red-600' : isDueSoon(task.dueDate) ? 'text-yellow-600' : 'text-gray-500'}>
                                  {formatDate(task.dueDate)}
                                  {isOverdue(task.dueDate) && ' (Overdue)'}
                                  {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && ' (Due Soon)'}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Created {formatDate(task.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskComplete(task.id);
                            }}
                            className="p-2 text-green-600 hover:text-green-700 transition-colors"
                            title="Mark as Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                            setShowTaskEdit(true);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit Task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                            setShowTaskDetails(true);
                          }}
                          className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskDelete(task.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      {'}'})

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                    {selectedTask.dueDate && (
                      <p><span className="font-medium">Due Date:</span> {formatDate(selectedTask.dueDate)}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  {selectedTask.customer ? (
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedTask.customer.firstName} {selectedTask.customer.lastName}</p>
                      <p><span className="font-medium">Email:</span> {selectedTask.customer.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No customer assigned</p>
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
              
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex items-center gap-3">
                  {selectedTask.status === 'pending' && (
                    <button
                      onClick={() => {
                        onTaskComplete(selectedTask.id);
                        setShowTaskDetails(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Complete
                    </button>
                  )}
                  <button
                    onClick={() => onTaskUpdate(selectedTask)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                      description: ''
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
                    onChange={(e) => setNewTask({...newTask, type: e.target.value as any})}
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
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority || 'medium'}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task priority"
                    aria-label="Select task priority"
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
                    value={newTask.status || 'pending'}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task status"
                    aria-label="Select task status"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                    title="Select due date"
                    aria-label="Select due date"
                  />
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
                  placeholder="Enter task description..."
                  title="Enter task description"
                  aria-label="Enter task description"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTaskCreate(false);
                    setNewTask({
                      title: '',
                      type: 'follow_up',
                      priority: 'medium',
                      status: 'pending',
                      dueDate: '',
                      description: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
                      description: ''
                    });
                  }}
                  disabled={!newTask.title?.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Workflow</h2>
                <button
                  onClick={() => {
                    setShowWorkflowCreate(false);
                    setNewWorkflow({
                      name: '',
                      description: '',
                      status: 'draft',
                      trigger: '',
                      actions: []
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close create workflow modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Workflow Name *
                    </label>
                    <div className="group relative">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-blue-600 text-xs font-bold">?</span>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                        <div className="font-semibold mb-1">Workflow Name:</div>
                        <div>Give your workflow a descriptive name that explains what it does (e.g., "New Lead Follow-up", "High-Value Customer Nurture")</div>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newWorkflow.name || ''}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter workflow name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newWorkflow.description || ''}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what this workflow does..."
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Trigger Event
                    </label>
                    <div className="group relative">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-blue-600 text-xs font-bold">?</span>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                        <div className="font-semibold mb-1">Trigger Event:</div>
                        <div>Choose what event will start this workflow. The workflow will automatically run when this event occurs in your CRM.</div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={newWorkflow.trigger || ''}
                    onChange={(e) => setNewWorkflow({...newWorkflow, trigger: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select trigger event"
                    aria-label="Select trigger event"
                  >
                    <option value="">Select trigger event</option>
                    <option value="new_lead">New Lead Created</option>
                    <option value="lead_status_change">Lead Status Changed</option>
                    <option value="task_completed">Task Completed</option>
                    <option value="opportunity_created">Opportunity Created</option>
                    <option value="opportunity_stage_change">Opportunity Stage Changed</option>
                    <option value="email_opened">Email Opened</option>
                    <option value="website_visit">Website Visit</option>
                    <option value="form_submission">Form Submission</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Actions
                    </label>
                    <div className="group relative">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-blue-600 text-xs font-bold">?</span>
                      </div>
                      <div className="absolute top-0 left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                        <div className="font-semibold mb-1">Actions:</div>
                        <div>Select what actions should happen when the trigger event occurs. You can choose multiple actions - they'll all run automatically.</div>
                        <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="action_email"
                        checked={newWorkflow.actions?.includes('send_email') || false}
                        onChange={(e) => {
                          const actions = newWorkflow.actions || [];
                          if (e.target.checked) {
                            setNewWorkflow({...newWorkflow, actions: [...actions, 'send_email']});
                          } else {
                            setNewWorkflow({...newWorkflow, actions: actions.filter(a => a !== 'send_email')});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="action_email" className="text-sm text-gray-700">Send Email</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="action_task"
                        checked={newWorkflow.actions?.includes('create_task') || false}
                        onChange={(e) => {
                          const actions = newWorkflow.actions || [];
                          if (e.target.checked) {
                            setNewWorkflow({...newWorkflow, actions: [...actions, 'create_task']});
                          } else {
                            setNewWorkflow({...newWorkflow, actions: actions.filter(a => a !== 'create_task')});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="action_task" className="text-sm text-gray-700">Create Task</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="action_tag"
                        checked={newWorkflow.actions?.includes('add_tag') || false}
                        onChange={(e) => {
                          const actions = newWorkflow.actions || [];
                          if (e.target.checked) {
                            setNewWorkflow({...newWorkflow, actions: [...actions, 'add_tag']});
                          } else {
                            setNewWorkflow({...newWorkflow, actions: actions.filter(a => a !== 'add_tag')});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="action_tag" className="text-sm text-gray-700">Add Tag</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="action_score"
                        checked={newWorkflow.actions?.includes('update_score') || false}
                        onChange={(e) => {
                          const actions = newWorkflow.actions || [];
                          if (e.target.checked) {
                            setNewWorkflow({...newWorkflow, actions: [...actions, 'update_score']});
                          } else {
                            setNewWorkflow({...newWorkflow, actions: actions.filter(a => a !== 'update_score')});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="action_score" className="text-sm text-gray-700">Update Lead Score</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="action_webhook"
                        checked={newWorkflow.actions?.includes('call_webhook') || false}
                        onChange={(e) => {
                          const actions = newWorkflow.actions || [];
                          if (e.target.checked) {
                            setNewWorkflow({...newWorkflow, actions: [...actions, 'call_webhook']});
                          } else {
                            setNewWorkflow({...newWorkflow, actions: actions.filter(a => a !== 'call_webhook')});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="action_webhook" className="text-sm text-gray-700">Call Webhook</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="group relative">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-blue-600 text-xs font-bold">?</span>
                      </div>
                      <div className="absolute top-0 left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
                        <div className="font-semibold mb-1">Workflow Status:</div>
                        <div>
                          <div><span className="text-green-300">Draft:</span> Not running yet (for testing)</div>
                          <div><span className="text-blue-300">Active:</span> Running automatically</div>
                          <div><span className="text-gray-300">Inactive:</span> Paused/disabled</div>
                        </div>
                        <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={newWorkflow.status || 'draft'}
                    onChange={(e) => setNewWorkflow({...newWorkflow, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select workflow status"
                    aria-label="Select workflow status"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowWorkflowCreate(false);
                    setNewWorkflow({
                      name: '',
                      description: '',
                      status: 'draft',
                      trigger: '',
                      actions: []
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onWorkflowCreate(newWorkflow);
                    setShowWorkflowCreate(false);
                    setNewWorkflow({
                      name: '',
                      description: '',
                      status: 'draft',
                      trigger: '',
                      actions: []
                    });
                  }}
                  disabled={!newWorkflow.name?.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      {'}'})

      {/* Edit Task Modal */}
      {showTaskEdit && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                    onChange={(e) => setEditingTask({...editingTask, type: e.target.value as any})}
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
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task priority"
                    aria-label="Select task priority"
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
                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select task status"
                    aria-label="Select task status"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                    title="Select due date"
                    aria-label="Select due date"
                  />
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
                  placeholder="Enter task description..."
                  title="Enter task description"
                  aria-label="Enter task description"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTaskEdit(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onTaskUpdate(editingTask);
                    setShowTaskEdit(false);
                    setEditingTask(null);
                  }}
                  disabled={!editingTask.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationTasks;
