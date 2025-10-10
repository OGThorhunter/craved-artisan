import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
  Users,
  Target, 
  BarChart3, 
  FileText
} from 'lucide-react';

// Import consolidated CRM components
import Customer360 from '../components/crm/Customer360';
import Pipeline from '../components/crm/Pipeline';
import TaskManagement from '../components/crm/TaskManagement';
import CustomerHealthOverview from '../components/crm/CustomerHealthOverview';
import { Customer } from '@/types/customer';

interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo?: string;
  status: 'active' | 'on_hold' | 'cancelled';
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  customerId?: string;
  assignedTo?: string;
  createdAt: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: string;
  actions: string[];
  createdAt: string;
  lastRun?: string;
  runCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'sales_rep' | 'support';
  isActive: boolean;
  tasksAssigned: number;
  tasksCompleted: number;
}

// Mock team members data
const mockTeamMembers = [
  {
    id: 'tm-1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    role: 'manager' as const,
    isActive: true,
    tasksAssigned: 8,
    tasksCompleted: 5
  },
  {
    id: 'tm-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 234-5678',
    role: 'sales_rep' as const,
    isActive: true,
    tasksAssigned: 12,
    tasksCompleted: 9
  },
  {
    id: 'tm-3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    phone: '+1 (555) 345-6789',
    role: 'sales_rep' as const,
    isActive: true,
    tasksAssigned: 6,
    tasksCompleted: 4
  },
  {
    id: 'tm-4',
    name: 'Emily Brown',
    email: 'emily.brown@company.com',
    phone: '+1 (555) 456-7890',
    role: 'support' as const,
    isActive: true,
    tasksAssigned: 4,
    tasksCompleted: 3
  }
];

// Mock data functions
const fetchDashboard = async () => {
  return {
    customers: { total: 1247, growth: 12.5 },
    sales: { 
      pipelineValue: 245000, 
      conversionRate: 23.5,
      totalRevenue: 1250000,
      averageOrderValue: 1250
    },
    performance: {
      customerSatisfaction: 4.8,
      responseTime: 2.5
    },
    recentActivities: [
      { id: 1, type: 'customer', message: 'New customer John Doe signed up', timestamp: '2 hours ago' },
      { id: 2, type: 'opportunity', message: 'Deal "Enterprise Contract" moved to negotiation', timestamp: '4 hours ago' },
      { id: 3, type: 'task', message: 'Follow-up call with Sarah completed', timestamp: '6 hours ago' },
    ]
  };
};

const fetchCustomers = async (filters: any) => {
  return {
    customers: [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        status: 'customer',
        source: 'Website',
        tags: ['VIP', 'Enterprise'],
        totalOrders: 15,
        totalSpent: 25000,
        lifetimeValue: 35000,
        lastContactAt: '2024-01-15',
        createdAt: '2023-06-15',
        assignedTo: 'sales@company.com',
        isVip: true
      }
    ]
  };
};

const fetchOpportunities = async (filters: any, localOpportunities: any[]) => {
  return {
    opportunities: [
      {
        id: '1',
        customerId: '1',
        title: 'Enterprise Contract',
        description: 'Large enterprise contract for custom software development',
        stage: 'negotiation',
        value: 50000,
        probability: 75,
        expectedCloseDate: '2024-02-15',
        actualCloseDate: undefined,
        source: 'Website',
        assignedTo: 'sales@company.com',
        tags: ['Enterprise', 'Software', 'High Value'],
        customFields: {},
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
        lastActivityAt: '2024-01-15',
        customer: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          company: 'Acme Corp'
        }
      }
    ]
  };
};

const fetchTasks = async (filters: any) => {
  return {
    tasks: [
      {
        id: '1',
        title: 'Follow up with John Doe',
        type: 'call',
        priority: 'high',
        status: 'pending',
        dueDate: '2024-01-20',
        customerId: '1',
        assignedTo: 'sales@company.com',
        createdAt: '2024-01-15'
      }
    ]
  };
};


// StatCard Component
const StatCard = ({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  color: string;
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Main Component
const VendorCRMPage = () => {
  const [activeTab, setActiveTab] = useState<'customer-360' | 'pipeline' | 'automation-tasks' | 'customer-health'>('customer-360');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    assignedTo: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('90d');
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [localOpportunities, setLocalOpportunities] = useState<Opportunity[]>([]);

  // Data fetching
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: fetchDashboard,
  });

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['crm-customers', filters, searchTerm],
    queryFn: () => fetchCustomers({ ...filters, search: searchTerm }),
  });

  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['crm-opportunities', filters],
    queryFn: () => fetchOpportunities(filters, []),
  });

  // Combine fetched customers with locally added customers
  const allCustomers = React.useMemo(() => {
    const fetchedCustomers = customersData?.customers || [];
    return [...fetchedCustomers, ...localCustomers];
  }, [customersData?.customers, localCustomers]);

  // Combine fetched opportunities with locally added opportunities
  const allOpportunities = React.useMemo(() => {
    const fetchedOpportunities = opportunitiesData?.opportunities || [];
    return [...fetchedOpportunities, ...localOpportunities];
  }, [opportunitiesData?.opportunities, localOpportunities]);

  // Customer management functions
  const handleCustomerUpdate = (customer: Customer) => {
    setLocalCustomers(prev => {
      const existingIndex = prev.findIndex(c => c.id === customer.id);
      if (existingIndex >= 0) {
        // Update existing customer
        const updated = [...prev];
        updated[existingIndex] = customer;
        toast.success('Customer updated successfully!');
        return updated;
      } else {
        // Add new customer
        toast.success(`${customer.firstName} ${customer.lastName} added to CRM!`);
        return [...prev, customer];
      }
    });
  };

  const handleCustomerDelete = (id: string) => {
    setLocalCustomers(prev => prev.filter(c => c.id !== id));
    toast.success('Customer deleted successfully!');
  };

  // Opportunity management functions
  const handleOpportunityCreate = (opportunity: Partial<Opportunity>) => {
    const newOpportunity: Opportunity = {
      ...opportunity,
      id: opportunity.id || Date.now().toString(),
      customerId: opportunity.customerId || '',
      title: opportunity.title || '',
      description: opportunity.description || '',
      stage: opportunity.stage || 'lead',
      value: opportunity.value || 0,
      probability: opportunity.probability || 25,
      expectedCloseDate: opportunity.expectedCloseDate || '',
      actualCloseDate: opportunity.actualCloseDate,
      source: opportunity.source || 'Website',
      assignedTo: opportunity.assignedTo || '',
      tags: opportunity.tags || [],
      customFields: opportunity.customFields || {},
      status: opportunity.status || 'active',
      createdAt: opportunity.createdAt || new Date().toISOString(),
      updatedAt: opportunity.updatedAt || new Date().toISOString(),
      lastActivityAt: opportunity.lastActivityAt || new Date().toISOString()
    } as Opportunity;

    setLocalOpportunities(prev => [...prev, newOpportunity]);
    toast.success(`Opportunity "${newOpportunity.title}" created successfully!`);
  };

  const handleOpportunityUpdate = (opportunity: Opportunity) => {
    setLocalOpportunities(prev => {
      const existingIndex = prev.findIndex(o => o.id === opportunity.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...opportunity, updatedAt: new Date().toISOString() };
        return updated;
      }
      return prev;
    });
    toast.success(`Opportunity "${opportunity.title}" updated successfully!`);
  };

  const handleOpportunityDelete = (id: string) => {
    setLocalOpportunities(prev => prev.filter(o => o.id !== id));
    toast.success('Opportunity deleted successfully!');
  };

  const handleStageChange = (id: string, stage: string) => {
    setLocalOpportunities(prev => 
      prev.map(o => 
        o.id === id 
          ? { ...o, stage: stage as any, updatedAt: new Date().toISOString() }
          : o
      )
    );
    toast.success('Opportunity stage updated successfully!');
  };

  // Task management functions
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  
  // Workflow management functions
  const [localWorkflows, setLocalWorkflows] = useState<Workflow[]>([]);
  const [localTeamMembers, setLocalTeamMembers] = useState<TeamMember[]>([]);

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['crm-tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const allTasks = React.useMemo(() => {
    const fetchedTasks = tasksData?.tasks || [];
    return [...fetchedTasks, ...localTasks];
  }, [tasksData?.tasks, localTasks]);

  const allWorkflows = React.useMemo(() => {
    // For now, just return local workflows since we don't have a workflow API yet
    return localWorkflows;
  }, [localWorkflows]);

  const allTeamMembers = React.useMemo(() => {
    return [...mockTeamMembers, ...localTeamMembers];
  }, [localTeamMembers]);

  const handleTaskCreate = (task: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title || 'New Task',
      type: task.type || 'follow_up',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      dueDate: task.dueDate,
      customerId: task.customerId,
      assignedTo: task.assignedTo,
      createdAt: new Date().toISOString(),
      description: task.description,
      customer: task.customer
    } as Task;
    setLocalTasks(prev => [...prev, newTask]);
    toast.success(`Task "${newTask.title}" created successfully!`);
  };

  const handleTaskUpdate = (task: Task) => {
    setLocalTasks(prev => 
      prev.map(t => 
        t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t
      )
    );
    toast.success(`Task "${task.title}" updated successfully!`);
  };

  const handleTaskComplete = (taskId: string) => {
    setLocalTasks(prev => 
      prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed', updatedAt: new Date().toISOString() } : t
      )
    );
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      toast.success(`Task "${task.title}" marked as complete!`);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    setLocalTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task) {
        toast.success(`Task "${task.title}" deleted successfully!`);
      }
      return prev.filter(t => t.id !== taskId);
    });
  };

  // Workflow management functions
  const handleWorkflowCreate = (workflow: Partial<Workflow>) => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: workflow.name || 'New Workflow',
      description: workflow.description || '',
      status: workflow.status || 'draft',
      trigger: workflow.trigger || '',
      actions: workflow.actions || [],
      createdAt: new Date().toISOString(),
      runCount: 0
    } as Workflow;
    setLocalWorkflows(prev => [...prev, newWorkflow]);
    toast.success(`Workflow "${newWorkflow.name}" created successfully!`);
  };

  const handleWorkflowUpdate = (workflow: Workflow) => {
    setLocalWorkflows(prev => 
      prev.map(w => 
        w.id === workflow.id ? { ...workflow, updatedAt: new Date().toISOString() } : w
      )
    );
    toast.success(`Workflow "${workflow.name}" updated successfully!`);
  };

  const handleWorkflowToggle = (id: string, status: 'active' | 'inactive') => {
    setLocalWorkflows(prev => 
      prev.map(w => 
        w.id === id ? { ...w, status, updatedAt: new Date().toISOString() } : w
      )
    );
    const workflow = localWorkflows.find(w => w.id === id);
    if (workflow) {
      toast.success(`Workflow "${workflow.name}" ${status === 'active' ? 'activated' : 'deactivated'}!`);
    }
  };

  // Team member management functions
  const handleTeamMemberCreate = (member: Partial<TeamMember>) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: member.name || 'New Team Member',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'sales_rep',
      isActive: member.isActive ?? true,
      tasksAssigned: 0,
      tasksCompleted: 0
    };
    
    setLocalTeamMembers(prev => [...prev, newMember]);
    toast.success('Team member added successfully');
  };

  const handleTeamMemberUpdate = (member: TeamMember) => {
    setLocalTeamMembers(prev => 
      prev.map(m => m.id === member.id ? member : m)
    );
    toast.success('Team member updated successfully');
  };

  const handleTeamMemberDelete = (id: string) => {
    setLocalTeamMembers(prev => prev.filter(m => m.id !== id));
    toast.success('Team member deleted successfully');
  };


  // New consolidated tabs
  const tabs = [
    { 
      id: 'customer-360', 
      label: 'Customer 360', 
      icon: Users,
      description: 'Unified customer view with communications and segmentation'
    },
    { 
      id: 'pipeline', 
      label: 'Pipeline', 
      icon: Target,
      description: 'Sales pipeline and opportunity management'
    },
    { 
      id: 'automation-tasks', 
      label: 'Tasks', 
      icon: FileText,
      description: 'Task management and team collaboration'
    },
    { 
      id: 'customer-health', 
      label: 'Customer Health', 
      icon: BarChart3,
      description: 'CRM metrics, trends, and customer health analysis'
    },
  ];

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader 
          title="Customer Relations"
          description="Manage customer relationships, opportunities, and sales pipeline"
        />

        {/* Navigation Tabs */}
        <div className="border border-gray-200 rounded-lg shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
          <nav className="flex space-x-8 overflow-x-auto px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'customer-360' && (
            <Customer360
              customers={allCustomers}
              onCustomerSelect={setSelectedCustomer}
              onCustomerUpdate={handleCustomerUpdate}
              onCustomerDelete={handleCustomerDelete}
              onTagUpdate={(customerId, tags) => console.log('Update tags:', customerId, tags)}
              onNoteAdd={(customerId, note) => console.log('Add note:', customerId, note)}
              onMessageSend={(customerId, message) => {
                const customer = allCustomers.find(c => c.id === customerId);
                if (customer) {
                  toast.success(`Message sent to ${customer.firstName} ${customer.lastName}!`);
                }
              }}
              onTaskCreate={(customerId, task) => {
                const customer = allCustomers.find(c => c.id === customerId);
                if (customer) {
                  toast.success(`Task "${task.title}" created for ${customer.firstName} ${customer.lastName}!`);
                }
              }}
              isLoading={customersLoading}
            />
          )}

          {activeTab === 'pipeline' && (
            <Pipeline
              opportunities={allOpportunities}
              onOpportunityCreate={handleOpportunityCreate}
              onOpportunityUpdate={handleOpportunityUpdate}
              onOpportunityDelete={handleOpportunityDelete}
              onStageChange={handleStageChange}
              onForecastUpdate={() => {
                console.log('Update forecast');
                toast.success('Forecast updated successfully!');
              }}
              isLoading={opportunitiesLoading}
            />
          )}

          {activeTab === 'automation-tasks' && (
            <TaskManagement
              tasks={allTasks}
              teamMembers={allTeamMembers}
              onTaskCreate={handleTaskCreate}
              onTaskUpdate={handleTaskUpdate}
              onTaskComplete={handleTaskComplete}
              onTaskDelete={handleTaskDelete}
              onTaskAssign={(taskId, userId) => {
                const task = allTasks.find(t => t.id === taskId);
                if (task) {
                  handleTaskUpdate({...task, assignedTo: userId});
                }
              }}
              onTaskReassign={(taskId, fromUserId, toUserId) => {
                const task = allTasks.find(t => t.id === taskId);
                if (task) {
                  handleTaskUpdate({...task, assignedTo: toUserId});
                }
              }}
              onSubtaskCreate={(parentTaskId, subtask) => {
                console.log('Create subtask:', {parentTaskId, subtask});
              }}
              onTeamMemberCreate={handleTeamMemberCreate}
              onTeamMemberUpdate={handleTeamMemberUpdate}
              onTeamMemberDelete={handleTeamMemberDelete}
              isLoading={tasksLoading}
            />
          )}


          {activeTab === 'customer-health' && (
            <CustomerHealthOverview
              customers={allCustomers}
              opportunities={allOpportunities}
              tasks={allTasks}
              isLoading={customersLoading || opportunitiesLoading || tasksLoading}
            />
          )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorCRMPage;