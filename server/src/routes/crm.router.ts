import { Router } from 'express';
import { logger } from '../logger';
import { AuthenticatedRequest } from '../types/session';
import { 
  Customer, 
  Contact, 
  Opportunity, 
  Task, 
  Template, 
  Campaign,
  CRMAnalytics,
  CRMSchemas 
} from '../types/crm';

export const crmRouter = Router();

// Mock data storage (in production, this would be database)
const customers: Customer[] = [];
let contacts: Contact[] = [];
let opportunities: Opportunity[] = [];
let tasks: Task[] = [];
const templates: Template[] = [];
const campaigns: Campaign[] = [];

// CUSTOMER MANAGEMENT ENDPOINTS

// GET /api/crm/customers - Get all customers with filtering and pagination
crmRouter.get('/crm/customers', (req: AuthenticatedRequest, res) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      search = '', 
      status = '', 
      source = '', 
      tags = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    let filteredCustomers = [...customers];

    // Apply filters
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.company?.toLowerCase().includes(searchLower)
      );
    }

    if (status && typeof status === 'string') {
      filteredCustomers = filteredCustomers.filter(customer => customer.status === status);
    }

    if (source && typeof source === 'string') {
      filteredCustomers = filteredCustomers.filter(customer => customer.source === source);
    }

    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',').map((tag: string) => tag.trim());
      filteredCustomers = filteredCustomers.filter(customer => 
        tagArray.some((tag: string) => customer.tags.includes(tag))
      );
    }

    // Apply sorting
    filteredCustomers.sort((a, b) => {
      const aValue = a[sortBy as keyof Customer];
      const bValue = b[sortBy as keyof Customer];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    // Calculate analytics
    const analytics = {
      total: filteredCustomers.length,
      byStatus: filteredCustomers.reduce((acc, customer) => {
        acc[customer.status] = (acc[customer.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySource: filteredCustomers.reduce((acc, customer) => {
        acc[customer.source] = (acc[customer.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalValue: filteredCustomers.reduce((sum, customer) => sum + customer.lifetimeValue, 0),
      averageValue: filteredCustomers.length > 0 ? 
        filteredCustomers.reduce((sum, customer) => sum + customer.lifetimeValue, 0) / filteredCustomers.length : 0,
    };

    res.json({
      customers: paginatedCustomers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredCustomers.length,
        totalPages: Math.ceil(filteredCustomers.length / limitNum),
      },
      analytics,
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching customers');
    res.status(500).json({ error: 'Failed to fetch customers' });
    return;
  }
});

// GET /api/crm/customers/:id - Get specific customer
crmRouter.get('/crm/customers/:id', (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const customer = customers.find(c => c.id === id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get related data
    const customerContacts = contacts.filter(c => c.customerId === id);
    const customerOpportunities = opportunities.filter(o => o.customerId === id);
    const customerTasks = tasks.filter(t => t.customerId === id);

    res.json({
      customer,
      contacts: customerContacts,
      opportunities: customerOpportunities,
      tasks: customerTasks,
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching customer');
    res.status(500).json({ error: 'Failed to fetch customer' });
    return;
  }
});

// POST /api/crm/customers - Create new customer
crmRouter.post('/crm/customers', (req: AuthenticatedRequest, res) => {
  try {
    const customerData = CRMSchemas.Customer.parse({
      ...req.body,
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    customers.push(customerData);

    logger.info({
      customerId: customerData.id,
      email: customerData.email,
      source: customerData.source,
    }, 'Customer created');

    res.status(201).json({
      success: true,
      customer: customerData,
      message: 'Customer created successfully',
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error creating customer');
    res.status(500).json({ error: 'Failed to create customer' });
    return;
  }
});

// PUT /api/crm/customers/:id - Update customer
crmRouter.put('/crm/customers/:id', (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = CRMSchemas.Customer.parse({
      ...customers[customerIndex],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    });

    customers[customerIndex] = updatedCustomer;

    logger.info({
      customerId: id,
      changes: Object.keys(req.body),
    }, 'Customer updated');

    res.json({
      success: true,
      customer: updatedCustomer,
      message: 'Customer updated successfully',
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error updating customer');
    res.status(500).json({ error: 'Failed to update customer' });
    return;
  }
});

// DELETE /api/crm/customers/:id - Delete customer
crmRouter.delete('/crm/customers/:id', (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Remove related data
    contacts = contacts.filter(c => c.customerId !== id);
    opportunities = opportunities.filter(o => o.customerId !== id);
    tasks = tasks.filter(t => t.customerId !== id);

    customers.splice(customerIndex, 1);

    logger.info({ customerId: id }, 'Customer deleted');

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error deleting customer');
    res.status(500).json({ error: 'Failed to delete customer' });
    return;
  }
});

// OPPORTUNITY MANAGEMENT ENDPOINTS

// GET /api/crm/opportunities - Get all opportunities
crmRouter.get('/crm/opportunities', (req: AuthenticatedRequest, res) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      stage = '', 
      assignedTo = '', 
      status = 'active' 
    } = req.query;

    let filteredOpportunities = [...opportunities];

    if (stage) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.stage === stage);
    }

    if (assignedTo) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.assignedTo === assignedTo);
    }

    if (status) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.status === status);
    }

    // Calculate pipeline metrics
    const pipelineValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
    const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const wonValue = filteredOpportunities
      .filter(opp => opp.stage === 'closed_won')
      .reduce((sum, opp) => sum + opp.value, 0);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedOpportunities = filteredOpportunities.slice(startIndex, startIndex + limitNum);

    res.json({
      opportunities: paginatedOpportunities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredOpportunities.length,
        totalPages: Math.ceil(filteredOpportunities.length / limitNum),
      },
      metrics: {
        pipelineValue,
        totalValue,
        wonValue,
        winRate: filteredOpportunities.length > 0 ? 
          (filteredOpportunities.filter(opp => opp.stage === 'closed_won').length / filteredOpportunities.length) * 100 : 0,
      },
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching opportunities');
    res.status(500).json({ error: 'Failed to fetch opportunities' });
    return;
  }
});

// POST /api/crm/opportunities - Create new opportunity
crmRouter.post('/crm/opportunities', (req: AuthenticatedRequest, res) => {
  try {
    const opportunityData = CRMSchemas.Opportunity.parse({
      ...req.body,
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });

    opportunities.push(opportunityData);

    logger.info({
      opportunityId: opportunityData.id,
      customerId: opportunityData.customerId,
      value: opportunityData.value,
      stage: opportunityData.stage,
    }, 'Opportunity created');

    res.status(201).json({
      success: true,
      opportunity: opportunityData,
      message: 'Opportunity created successfully',
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error creating opportunity');
    res.status(500).json({ error: 'Failed to create opportunity' });
    return;
  }
});

// TASK MANAGEMENT ENDPOINTS

// GET /api/crm/tasks - Get all tasks
crmRouter.get('/crm/tasks', (req: AuthenticatedRequest, res) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      status = '', 
      assignedTo = '', 
      type = '', 
      priority = '' 
    } = req.query;

    let filteredTasks = [...tasks];

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    if (assignedTo) {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo);
    }

    if (type) {
      filteredTasks = filteredTasks.filter(task => task.type === type);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    // Sort by due date and priority
    filteredTasks.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedTasks = filteredTasks.slice(startIndex, startIndex + limitNum);

    res.json({
      tasks: paginatedTasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / limitNum),
      },
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching tasks');
    res.status(500).json({ error: 'Failed to fetch tasks' });
    return;
  }
});

// POST /api/crm/tasks - Create new task
crmRouter.post('/crm/tasks', (req: AuthenticatedRequest, res) => {
  try {
    const taskData = CRMSchemas.Task.parse({
      ...req.body,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    tasks.push(taskData);

    logger.info({
      taskId: taskData.id,
      type: taskData.type,
      priority: taskData.priority,
      assignedTo: taskData.assignedTo,
    }, 'Task created');

    res.status(201).json({
      success: true,
      task: taskData,
      message: 'Task created successfully',
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error creating task');
    res.status(500).json({ error: 'Failed to create task' });
    return;
  }
});

// ANALYTICS ENDPOINTS

// GET /api/crm/analytics - Get CRM analytics
crmRouter.get('/crm/analytics', (req: AuthenticatedRequest, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Calculate customer metrics
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => new Date(c.createdAt) >= startDate).length;
    const activeCustomers = customers.filter(c => c.status === 'customer' || c.status === 'vip').length;
    const churnedCustomers = customers.filter(c => c.status === 'inactive').length;

    // Calculate sales metrics
    const totalRevenue = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
    const averageOrderValue = customers.length > 0 ? totalRevenue / customers.length : 0;
    const pipelineValue = opportunities
      .filter(o => o.status === 'active')
      .reduce((sum, o) => sum + (o.value * o.probability / 100), 0);

    // Calculate activity metrics
    const totalContacts = contacts.length;
    const emailsSent = contacts.filter(c => c.type === 'email').length;
    const callsMade = contacts.filter(c => c.type === 'phone').length;
    const meetingsScheduled = contacts.filter(c => c.type === 'meeting').length;
    const tasksCompleted = tasks.filter(t => t.status === 'completed').length;

    const analytics: CRMAnalytics = {
      period: period as string,
      customers: {
        total: totalCustomers,
        new: newCustomers,
        active: activeCustomers,
        churned: churnedCustomers,
        growth: totalCustomers > 0 ? ((newCustomers - churnedCustomers) / totalCustomers) * 100 : 0,
      },
      sales: {
        totalRevenue,
        averageOrderValue,
        conversionRate: opportunities.length > 0 ? 
          (opportunities.filter(o => o.stage === 'closed_won').length / opportunities.length) * 100 : 0,
        pipelineValue,
        closedWon: opportunities.filter(o => o.stage === 'closed_won').length,
        closedLost: opportunities.filter(o => o.stage === 'closed_lost').length,
      },
      activities: {
        totalContacts,
        emailsSent,
        callsMade,
        meetingsScheduled,
        tasksCompleted,
      },
      performance: {
        responseTime: 2.5, // Mock data - would calculate from actual response times
        followUpRate: 85, // Mock data
        customerSatisfaction: 4.2, // Mock data
        leadConversionRate: 15, // Mock data
      },
    };

    res.json(analytics);
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching CRM analytics');
    res.status(500).json({ error: 'Failed to fetch CRM analytics' });
    return;
  }
});

// DASHBOARD ENDPOINTS

// GET /api/crm/dashboard - Get dashboard data
crmRouter.get('/crm/dashboard', (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    // Get user-specific data
    const userTasks = tasks.filter(t => t.assignedTo === userId);
    const userOpportunities = opportunities.filter(o => o.assignedTo === userId);
    const userCustomers = customers.filter(c => c.assignedTo === userId);

    // Recent activities
    const recentActivities = [
      ...contacts.slice(-10).map(contact => ({
        type: 'contact',
        id: contact.id,
        title: contact.subject,
        timestamp: contact.createdAt,
        customerId: contact.customerId,
      })),
      ...tasks.slice(-10).map(task => ({
        type: 'task',
        id: task.id,
        title: task.title,
        timestamp: task.createdAt,
        customerId: task.customerId,
        status: task.status,
      })),
      ...opportunities.slice(-10).map(opp => ({
        type: 'opportunity',
        id: opp.id,
        title: opp.title,
        timestamp: opp.createdAt,
        customerId: opp.customerId,
        value: opp.value,
        stage: opp.stage,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

    // Upcoming tasks
    const upcomingTasks = userTasks
      .filter(t => t.dueDate && new Date(t.dueDate) > new Date() && t.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 10);

    // Quick stats
    const quickStats = {
      totalCustomers: customers.length,
      activeOpportunities: opportunities.filter(o => o.status === 'active').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      thisMonthRevenue: customers.reduce((sum, c) => sum + c.lifetimeValue, 0), // Simplified
    };

    res.json({
      quickStats,
      recentActivities,
      upcomingTasks,
      userStats: {
        customers: userCustomers.length,
        opportunities: userOpportunities.length,
        tasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.status === 'completed').length,
      },
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching dashboard data');
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
    return;
  }
});

// ENHANCED OPPORTUNITY MANAGEMENT ENDPOINTS

// GET /api/crm/opportunities - Get all opportunities with advanced filtering
crmRouter.get('/crm/opportunities', (req: AuthenticatedRequest, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      stage = '',
      status = 'active',
      assignedTo = '',
      source = '',
      sortBy = 'expectedCloseDate',
      sortOrder = 'asc',
      dateRange = ''
    } = req.query;

    let filteredOpportunities = [...opportunities];

    // Apply filters
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter(opportunity =>
        opportunity.title.toLowerCase().includes(searchLower) ||
        opportunity.description?.toLowerCase().includes(searchLower)
      );
    }

    if (stage && typeof stage === 'string') {
      filteredOpportunities = filteredOpportunities.filter(opportunity => opportunity.stage === stage);
    }

    if (status && typeof status === 'string') {
      filteredOpportunities = filteredOpportunities.filter(opportunity => opportunity.status === status);
    }

    if (assignedTo && typeof assignedTo === 'string') {
      filteredOpportunities = filteredOpportunities.filter(opportunity => opportunity.assignedTo === assignedTo);
    }

    if (source && typeof source === 'string') {
      filteredOpportunities = filteredOpportunities.filter(opportunity => opportunity.source === source);
    }

    // Apply date range filter
    if (dateRange && typeof dateRange === 'string') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filteredOpportunities = filteredOpportunities.filter(opportunity =>
        new Date(opportunity.createdAt) >= startDate
      );
    }

    // Apply sorting
    filteredOpportunities.sort((a, b) => {
      const aValue = a[sortBy as keyof Opportunity];
      const bValue = b[sortBy as keyof Opportunity];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex);

    // Calculate metrics
    const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const weightedValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
    const wonDeals = filteredOpportunities.filter(opp => opp.stage === 'closed_won');
    const lostDeals = filteredOpportunities.filter(opp => opp.stage === 'closed_lost');
    const winRate = wonDeals.length + lostDeals.length > 0 ? 
      (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;

    res.json({
      opportunities: paginatedOpportunities,
      total: filteredOpportunities.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredOpportunities.length / limitNum),
      metrics: {
        totalValue,
        weightedValue,
        winRate,
        totalDeals: filteredOpportunities.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
      }
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching opportunities');
    res.status(500).json({ error: 'Failed to fetch opportunities' });
    return;
  }
});

// POST /api/crm/opportunities - Create new opportunity
crmRouter.post('/crm/opportunities', (req: AuthenticatedRequest, res) => {
  try {
    const opportunityData = req.body;

    // Validate required fields
    if (!opportunityData.title || !opportunityData.customerId) {
      res.status(400).json({ error: 'Title and customerId are required' });
      return;
    }

    const newOpportunity: Opportunity = {
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: opportunityData.customerId,
      title: opportunityData.title,
      description: opportunityData.description || '',
      stage: opportunityData.stage || 'lead',
      value: opportunityData.value || 0,
      probability: opportunityData.probability || 10,
      expectedCloseDate: opportunityData.expectedCloseDate || new Date().toISOString(),
      actualCloseDate: opportunityData.actualCloseDate,
      source: opportunityData.source || '',
      assignedTo: opportunityData.assignedTo || '',
      tags: opportunityData.tags || [],
      customFields: opportunityData.customFields || {},
      status: opportunityData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    opportunities.push(newOpportunity);

    logger.info({ opportunityId: newOpportunity.id }, 'Opportunity created');
    res.status(201).json(newOpportunity);
    return;
  } catch (error) {
    logger.error({ error }, 'Error creating opportunity');
    res.status(500).json({ error: 'Failed to create opportunity' });
    return;
  }
});

// PUT /api/crm/opportunities/:id - Update opportunity
crmRouter.put('/crm/opportunities/:id', (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const opportunityIndex = opportunities.findIndex(opp => opp.id === id);
    if (opportunityIndex === -1) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    const updatedOpportunity = {
      ...opportunities[opportunityIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    opportunities[opportunityIndex] = updatedOpportunity;

    logger.info({ opportunityId: id }, 'Opportunity updated');
    res.json(updatedOpportunity);
    return;
  } catch (error) {
    logger.error({ error }, 'Error updating opportunity');
    res.status(500).json({ error: 'Failed to update opportunity' });
    return;
  }
});

// DELETE /api/crm/opportunities/:id - Delete opportunity
crmRouter.delete('/crm/opportunities/:id', (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const opportunityIndex = opportunities.findIndex(opp => opp.id === id);
    if (opportunityIndex === -1) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    opportunities.splice(opportunityIndex, 1);

    logger.info({ opportunityId: id }, 'Opportunity deleted');
    res.status(204).send();
    return;
  } catch (error) {
    logger.error({ error }, 'Error deleting opportunity');
    res.status(500).json({ error: 'Failed to delete opportunity' });
    return;
  }
});

// GET /api/crm/opportunities/analytics - Get opportunity analytics
crmRouter.get('/crm/opportunities/analytics', (req: AuthenticatedRequest, res) => {
  try {
    const { timeRange = '90d' } = req.query;

    // Filter opportunities by time range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredOpportunities = opportunities.filter(opp =>
      new Date(opp.createdAt) >= startDate
    );

    // Calculate analytics
    const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const weightedValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
    const wonDeals = filteredOpportunities.filter(opp => opp.stage === 'closed_won');
    const lostDeals = filteredOpportunities.filter(opp => opp.stage === 'closed_lost');
    const activeDeals = filteredOpportunities.filter(opp => 
      opp.stage !== 'closed_won' && opp.stage !== 'closed_lost' && opp.status === 'active'
    );

    const wonValue = wonDeals.reduce((sum, opp) => sum + opp.value, 0);
    const lostValue = lostDeals.reduce((sum, opp) => sum + opp.value, 0);
    const activeValue = activeDeals.reduce((sum, opp) => sum + opp.value, 0);
    const activeWeightedValue = activeDeals.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

    const totalDeals = wonDeals.length + lostDeals.length;
    const winRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;
    const averageDealSize = filteredOpportunities.length > 0 ? totalValue / filteredOpportunities.length : 0;

    // Calculate average sales cycle
    const averageSalesCycle = wonDeals.length > 0 ? 
      wonDeals.reduce((sum, deal) => {
        const created = new Date(deal.createdAt);
        const closed = new Date(deal.actualCloseDate || deal.updatedAt);
        return sum + Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / wonDeals.length : 0;

    // Stage distribution
    const stageDistribution = filteredOpportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Source distribution
    const sourceDistribution = filteredOpportunities.reduce((acc, opp) => {
      const source = opp.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends
    const monthlyData: Record<string, { revenue: number; deals: number }> = {};
    filteredOpportunities.forEach(opp => {
      const month = new Date(opp.createdAt).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, deals: 0 };
      }
      monthlyData[month].revenue += opp.value;
      monthlyData[month].deals += 1;
    });

    const monthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        deals: data.deals,
        averageDealSize: data.deals > 0 ? data.revenue / data.deals : 0,
      }));

    res.json({
      metrics: {
        totalValue,
        weightedValue,
        wonValue,
        lostValue,
        activeValue,
        activeWeightedValue,
        totalDeals: filteredOpportunities.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        activeDeals: activeDeals.length,
        winRate,
        averageDealSize,
        averageSalesCycle: Math.round(averageSalesCycle),
      },
      stageDistribution,
      sourceDistribution,
      monthlyTrends,
      forecast: {
        weighted: activeWeightedValue,
        optimistic: activeValue,
        conservative: activeDeals
          .filter(opp => opp.probability >= 50)
          .reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0),
        activeDeals: activeDeals.length,
      }
    });
    return;
  } catch (error) {
    logger.error({ error }, 'Error fetching opportunity analytics');
    res.status(500).json({ error: 'Failed to fetch opportunity analytics' });
    return;
  }
});

export default crmRouter;
