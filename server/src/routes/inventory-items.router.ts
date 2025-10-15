import express from 'express';
import { z } from 'zod';
import { logger } from '../logger';

const router = express.Router();

// Validation schemas
const CreateInventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['FOOD_GRADE', 'PACKAGING', 'EQUIPMENT', 'RAW_MATERIALS']),
  unit: z.string().min(1),
  current_qty: z.number().min(0),
  reorder_point: z.number().min(0),
  preferred_qty: z.number().min(0),
  avg_cost: z.number().min(0),
  last_cost: z.number().min(0),
  supplier_name: z.string().optional(),
  location: z.string().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().datetime().optional(),
  tags: z.string().optional(), // JSON array as string
});

const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial().extend({
  id: z.string(),
});

// GET /api/inventory/items - Get all inventory items for vendor
router.get('/items', async (req, res) => {
  try {
    // TODO: Replace with Prisma query when authenticated
    // const vendorId = req.user?.vendorProfileId;
    
    // Mock data for now - replace with Prisma query
    const mockInventoryItems = [
      {
        id: 'inv_1',
        vendorProfileId: 'vendor_1',
        name: 'Organic All-Purpose Flour',
        category: 'FOOD_GRADE',
        unit: 'kg',
        current_qty: 25.5,
        reorder_point: 10.0,
        preferred_qty: 30.0,
        avg_cost: 3.50,
        last_cost: 3.75,
        supplier_name: 'Local Organic Farm',
        location: 'Storage Room A',
        batch_number: 'OF-2024-001',
        expiry_date: '2024-12-31T00:00:00Z',
        tags: '["organic", "flour", "baking"]',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'inv_2',
        vendorProfileId: 'vendor_1',
        name: 'Madagascar Vanilla Extract',
        category: 'FOOD_GRADE',
        unit: 'bottles',
        current_qty: 8.0,
        reorder_point: 5.0,
        preferred_qty: 12.0,
        avg_cost: 12.00,
        last_cost: 12.50,
        supplier_name: 'Premium Spices Co',
        location: 'Spice Cabinet',
        batch_number: 'VE-2024-002',
        expiry_date: '2025-06-30T00:00:00Z',
        tags: '["vanilla", "extract", "premium"]',
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: 'inv_3',
        vendorProfileId: 'vendor_1',
        name: 'Eco-Friendly Cardboard Boxes',
        category: 'PACKAGING',
        unit: 'boxes',
        current_qty: 150.0,
        reorder_point: 50.0,
        preferred_qty: 200.0,
        avg_cost: 2.25,
        last_cost: 2.30,
        supplier_name: 'Green Packaging Solutions',
        location: 'Storage Room B',
        batch_number: 'PB-2024-003',
        tags: '["packaging", "eco-friendly", "cardboard"]',
        createdAt: '2024-01-25T09:15:00Z',
        updatedAt: '2024-01-25T09:15:00Z'
      },
      {
        id: 'inv_4',
        vendorProfileId: 'vendor_1',
        name: 'Granulated White Sugar',
        category: 'FOOD_GRADE',
        unit: 'kg',
        current_qty: 18.0,
        reorder_point: 15.0,
        preferred_qty: 25.0,
        avg_cost: 1.80,
        last_cost: 1.85,
        supplier_name: 'Sweet Supplies Inc',
        location: 'Storage Room A',
        batch_number: 'SG-2024-001',
        expiry_date: '2025-12-31T00:00:00Z',
        tags: '["sugar", "granulated"]',
        createdAt: '2024-01-30T08:00:00Z',
        updatedAt: '2024-01-30T08:00:00Z'
      },
      {
        id: 'inv_5',
        vendorProfileId: 'vendor_1',
        name: 'Sea Salt',
        category: 'FOOD_GRADE',
        unit: 'kg',
        current_qty: 5.0,
        reorder_point: 3.0,
        preferred_qty: 8.0,
        avg_cost: 4.20,
        last_cost: 4.50,
        supplier_name: 'Artisan Salt Co',
        location: 'Spice Cabinet',
        batch_number: 'SS-2024-001',
        tags: '["salt", "sea salt", "artisan"]',
        createdAt: '2024-02-01T11:20:00Z',
        updatedAt: '2024-02-01T11:20:00Z'
      }
    ];
    
    res.json({ 
      success: true, 
      data: mockInventoryItems,
      message: 'Inventory items fetched successfully'
    });
  } catch (error) {
    logger.error('Error fetching inventory items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inventory items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/inventory/items/:id - Get specific inventory item
router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Replace with Prisma query
    // Mock response for now
    const mockItem = {
      id,
      vendorProfileId: 'vendor_1',
      name: 'Sample Inventory Item',
      category: 'FOOD_GRADE',
      unit: 'kg',
      current_qty: 10.0,
      reorder_point: 5.0,
      preferred_qty: 15.0,
      avg_cost: 5.00,
      last_cost: 5.25,
      supplier_name: 'Sample Supplier',
      location: 'Storage Room',
      batch_number: 'SAMPLE-001',
      tags: '["sample", "test"]',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
    
    res.json({ 
      success: true, 
      data: mockItem,
      message: 'Inventory item fetched successfully'
    });
  } catch (error) {
    logger.error('Error fetching inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/inventory/items - Create new inventory item
router.post('/items', async (req, res) => {
  try {
    const validatedData = CreateInventoryItemSchema.parse(req.body);
    
    // TODO: Replace with Prisma create operation
    const newItem = {
      id: `inv_${Date.now()}`,
      vendorProfileId: 'vendor_1', // TODO: Get from authenticated user
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({ 
      success: true, 
      data: newItem,
      message: 'Inventory item created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error creating inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/inventory/items/:id - Update inventory item
router.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateInventoryItemSchema.parse({ id, ...req.body });
    
    // TODO: Replace with Prisma update operation
    const updatedItem = {
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      data: updatedItem,
      message: 'Inventory item updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error updating inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/inventory/items/:id - Delete inventory item
router.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Replace with Prisma delete operation
    // For now, just return success
    
    res.json({ 
      success: true, 
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;









