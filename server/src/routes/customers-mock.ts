import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Mock data storage
let customers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, CA 90210',
    totalOrders: 15,
    totalSpent: 1250.75,
    lastOrderDate: '2024-01-15T10:30:00Z',
    averageOrderValue: 83.38,
    customerSince: '2023-03-15T00:00:00Z',
    tags: ['repeat-customer', 'local'],
    notes: 'Prefers gluten-free options. Always orders on weekends.',
    status: 'vip'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave, Somewhere, NY 10001',
    totalOrders: 8,
    totalSpent: 420.50,
    lastOrderDate: '2024-01-10T14:20:00Z',
    averageOrderValue: 52.56,
    customerSince: '2023-08-22T00:00:00Z',
    tags: ['new-customer'],
    notes: 'Interested in vegan options. First order was for a party.',
    status: 'active'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    address: '789 Pine St, Elsewhere, TX 75001',
    totalOrders: 3,
    totalSpent: 95.25,
    lastOrderDate: '2023-12-20T16:45:00Z',
    averageOrderValue: 31.75,
    customerSince: '2023-11-05T00:00:00Z',
    tags: ['seasonal'],
    notes: 'Orders mainly during holidays. Likes traditional recipes.',
    status: 'active'
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@email.com',
    phone: '+1 (555) 456-7890',
    address: '321 Elm St, Nowhere, FL 33101',
    totalOrders: 25,
    totalSpent: 2100.00,
    lastOrderDate: '2024-01-18T12:15:00Z',
    averageOrderValue: 84.00,
    customerSince: '2022-06-10T00:00:00Z',
    tags: ['vip', 'loyal-customer', 'business'],
    notes: 'Regular business customer. Orders for office events. Very satisfied with quality.',
    status: 'vip'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1 (555) 567-8901',
    address: '654 Maple Dr, Anywhere, WA 98101',
    totalOrders: 1,
    totalSpent: 45.00,
    lastOrderDate: '2023-10-15T09:30:00Z',
    averageOrderValue: 45.00,
    customerSince: '2023-10-15T00:00:00Z',
    tags: ['one-time'],
    notes: 'Single order for birthday party. No follow-up since.',
    status: 'inactive'
  }
];

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const updateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'vip']).optional()
});

// Middleware to validate request body
const validateRequest = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
  };
};

// GET /api/customers - Get all customers for vendor
router.get('/', (req, res) => {
  try {
    return res.json({
      message: 'Customers retrieved successfully',
      customers: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(400).json({ message: 'Failed to fetch customers' });
  }
});

// GET /api/customers/stats - Get customer statistics
router.get('/stats', (req, res) => {
  try {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const vipCustomers = customers.filter(c => c.status === 'vip').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageOrderValue = totalCustomers > 0 
      ? customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / totalCustomers 
      : 0;

    return res.json({
      message: 'Customer statistics retrieved successfully',
      stats: {
        totalCustomers,
        activeCustomers,
        vipCustomers,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return res.status(400).json({ message: 'Failed to fetch customer statistics' });
  }
});

// GET /api/customers/:id - Get specific customer
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const customer = customers.find(c => c.id === id);
    
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }
    
    return res.json({
      message: 'Customer retrieved successfully',
      customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(400).json({ message: 'Failed to fetch customer' });
  }
});

// POST /api/customers - Create new customer
router.post('/', validateRequest(createCustomerSchema), (req, res) => {
  try {
    const newCustomer = {
      id: Date.now().toString(),
      ...req.body,
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      customerSince: new Date().toISOString(),
      tags: req.body.tags || [],
      status: 'active'
    };
    
    customers.push(newCustomer);
    
    return res.status(400).json({
      message: 'Customer created successfully',
      customer: newCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(400).json({ message: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', validateRequest(updateCustomerSchema), (req, res) => {
  try {
    const { id } = req.params;
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(400).json({ message: 'Customer not found' });
    }
    
    const updatedCustomer = {
      ...customers[customerIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    customers[customerIndex] = updatedCustomer;
    
    return res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(400).json({ message: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(400).json({ message: 'Customer not found' });
    }
    
    const deletedCustomer = customers[customerIndex];
    customers.splice(customerIndex, 1);
    
    return res.json({
      message: 'Customer deleted successfully',
      customer: deletedCustomer
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(400).json({ message: 'Failed to delete customer' });
  }
});

export default router;
