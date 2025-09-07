import { Router } from 'express';

export const inventoryRouter = Router();

// Mock data for inventory items
const mockInventoryItems = [
  {
    id: 'inv-1',
    name: 'All-Purpose Flour',
    description: 'High-quality all-purpose flour for baking',
    category: 'food_grade',
    unit: 'kg',
    currentStock: 50,
    reorderPoint: 10,
    costPerUnit: 2.50,
    supplier: 'Local Mill Co.',
    isAvailable: true,
    expirationDate: '2025-12-31',
    batchNumber: 'FLR-2025-001',
    location: 'A-1-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    name: 'Active Dry Yeast',
    description: 'Premium active dry yeast for bread making',
    category: 'food_grade',
    unit: 'g',
    currentStock: 500,
    reorderPoint: 100,
    costPerUnit: 0.15,
    supplier: 'Yeast Masters',
    isAvailable: true,
    expirationDate: '2025-06-30',
    batchNumber: 'YST-2025-002',
    location: 'B-2-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    name: 'Sea Salt',
    description: 'Fine sea salt for seasoning',
    category: 'food_grade',
    unit: 'kg',
    currentStock: 25,
    reorderPoint: 5,
    costPerUnit: 3.00,
    supplier: 'Salt Works',
    isAvailable: true,
    expirationDate: '2026-12-31',
    batchNumber: 'SALT-2025-003',
    location: 'A-1-3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-4',
    name: 'Oak Wood Planks',
    description: 'Premium oak wood for furniture making',
    category: 'raw_materials',
    unit: 'pieces',
    currentStock: 15,
    reorderPoint: 5,
    costPerUnit: 25.00,
    supplier: 'Timber Supply Co.',
    isAvailable: true,
    location: 'C-3-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-5',
    name: 'Steel Ingots',
    description: 'High-grade steel ingots for metalworking',
    category: 'raw_materials',
    unit: 'kg',
    currentStock: 200,
    reorderPoint: 50,
    costPerUnit: 8.50,
    supplier: 'Metal Works Inc.',
    isAvailable: true,
    location: 'C-3-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-6',
    name: 'Gift Boxes',
    description: 'Elegant gift boxes for product packaging',
    category: 'packaging',
    unit: 'pieces',
    currentStock: 100,
    reorderPoint: 25,
    costPerUnit: 2.00,
    supplier: 'Packaging Solutions',
    isAvailable: true,
    location: 'D-4-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-7',
    name: 'Ribbon Rolls',
    description: 'Decorative ribbon for gift wrapping',
    category: 'packaging',
    unit: 'meters',
    currentStock: 500,
    reorderPoint: 100,
    costPerUnit: 0.50,
    supplier: 'Craft Supplies Ltd.',
    isAvailable: true,
    location: 'D-4-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-8',
    name: 'Vintage Tools',
    description: 'Antique tools for restoration projects',
    category: 'used_goods',
    unit: 'pieces',
    currentStock: 8,
    reorderPoint: 3,
    costPerUnit: 45.00,
    supplier: 'Antique Tools Co.',
    isAvailable: true,
    location: 'E-5-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-9',
    name: 'Reclaimed Wood',
    description: 'Reclaimed wood planks for eco-friendly projects',
    category: 'used_goods',
    unit: 'pieces',
    currentStock: 12,
    reorderPoint: 4,
    costPerUnit: 15.00,
    supplier: 'Green Materials',
    isAvailable: true,
    location: 'E-5-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-10',
    name: 'Olive Oil',
    description: 'Extra virgin olive oil for cooking',
    category: 'food_grade',
    unit: 'liters',
    currentStock: 30,
    reorderPoint: 8,
    costPerUnit: 12.00,
    supplier: 'Mediterranean Imports',
    isAvailable: true,
    expirationDate: '2025-08-15',
    batchNumber: 'OIL-2025-004',
    location: 'A-1-4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/inventory - Get all inventory items
inventoryRouter.get('/inventory', (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    
    let filteredItems = [...mockInventoryItems];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    // Filter by search term
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.supplier?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter for low stock items
    if (lowStock === 'true') {
      filteredItems = filteredItems.filter(item => item.currentStock <= item.reorderPoint);
    }
    
    res.json({
      items: filteredItems,
      total: filteredItems.length,
      categories: {
        food_grade: mockInventoryItems.filter(item => item.category === 'food_grade').length,
        raw_materials: mockInventoryItems.filter(item => item.category === 'raw_materials').length,
        packaging: mockInventoryItems.filter(item => item.category === 'packaging').length,
        used_goods: mockInventoryItems.filter(item => item.category === 'used_goods').length,
      },
      lowStockCount: mockInventoryItems.filter(item => item.currentStock <= item.reorderPoint).length,
      totalValue: mockInventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0),
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// GET /api/inventory/:id - Get specific inventory item
inventoryRouter.get('/inventory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const item = mockInventoryItems.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(item);
    return;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
    return;
  }
});

// POST /api/inventory - Create new inventory item
inventoryRouter.post('/inventory', (req, res) => {
  try {
    const newItem = {
      id: `inv-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockInventoryItems.push(newItem);
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// PUT /api/inventory/:id - Update inventory item
inventoryRouter.put('/inventory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = mockInventoryItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    mockInventoryItems[itemIndex] = {
      ...mockInventoryItems[itemIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    res.json(mockInventoryItems[itemIndex]);
    return;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
    return;
  }
});

// DELETE /api/inventory/:id - Delete inventory item
inventoryRouter.delete('/inventory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = mockInventoryItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    const deletedItem = mockInventoryItems.splice(itemIndex, 1)[0];
    
    res.json({ message: 'Inventory item deleted successfully', item: deletedItem });
    return;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
    return;
  }
});

// POST /api/inventory/:id/adjust - Adjust stock levels
inventoryRouter.post('/inventory/:id/adjust', (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment, reason, notes } = req.body;
    
    const itemIndex = mockInventoryItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    const currentStock = mockInventoryItems[itemIndex].currentStock;
    const newStock = Math.max(0, currentStock + adjustment);
    
    mockInventoryItems[itemIndex] = {
      ...mockInventoryItems[itemIndex],
      currentStock: newStock,
      updatedAt: new Date().toISOString(),
    };
    
    res.json({
      item: mockInventoryItems[itemIndex],
      adjustment: {
        previousStock: currentStock,
        adjustment,
        newStock,
        reason,
        notes,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({ error: 'Failed to adjust inventory' });
    return;
  }
});

// GET /api/inventory/analytics/summary - Get inventory analytics
inventoryRouter.get('/inventory/analytics/summary', (req, res) => {
  try {
    const totalItems = mockInventoryItems.length;
    const totalValue = mockInventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
    const lowStockItems = mockInventoryItems.filter(item => item.currentStock <= item.reorderPoint);
    const expiredItems = mockInventoryItems.filter(item => 
      item.expirationDate && new Date(item.expirationDate) < new Date()
    );
    
    const categoryBreakdown = mockInventoryItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const valueByCategory = mockInventoryItems.reduce((acc, item) => {
      const value = item.currentStock * item.costPerUnit;
      acc[item.category] = (acc[item.category] || 0) + value;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      totalItems,
      totalValue,
      lowStockCount: lowStockItems.length,
      expiredCount: expiredItems.length,
      categoryBreakdown,
      valueByCategory,
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint,
        category: item.category,
      })),
      expiredItems: expiredItems.map(item => ({
        id: item.id,
        name: item.name,
        expirationDate: item.expirationDate,
        category: item.category,
      })),
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ error: 'Failed to fetch inventory analytics' });
  }
});
