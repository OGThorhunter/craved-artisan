import { Router } from 'express';

export const ingredientsRouter = Router();

// Mock ingredients data
const mockIngredients = [
  {
    id: '1',
    name: 'All-Purpose Flour',
    category: 'Dry Ingredients',
    unit: 'cups',
    cost: 0.15,
    stock: 50,
    supplier: 'Local Mill Co.',
    lastRestocked: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    name: 'Organic Butter',
    category: 'Dairy',
    unit: 'cups',
    cost: 0.45,
    stock: 25,
    supplier: 'Farm Fresh Dairy',
    lastRestocked: '2024-01-12T00:00:00Z'
  },
  {
    id: '3',
    name: 'Granulated Sugar',
    category: 'Sweeteners',
    unit: 'cups',
    cost: 0.20,
    stock: 40,
    supplier: 'Sweet Supply Co.',
    lastRestocked: '2024-01-08T00:00:00Z'
  },
  {
    id: '4',
    name: 'Sea Salt',
    category: 'Seasonings',
    unit: 'teaspoons',
    cost: 0.05,
    stock: 100,
    supplier: 'Salt Works',
    lastRestocked: '2024-01-05T00:00:00Z'
  },
  {
    id: '5',
    name: 'Active Dry Yeast',
    category: 'Leavening',
    unit: 'packets',
    cost: 0.25,
    stock: 30,
    supplier: 'Baker\'s Supply',
    lastRestocked: '2024-01-14T00:00:00Z'
  },
  {
    id: '6',
    name: 'Whole Milk',
    category: 'Dairy',
    unit: 'cups',
    cost: 0.30,
    stock: 20,
    supplier: 'Farm Fresh Dairy',
    lastRestocked: '2024-01-13T00:00:00Z'
  },
  {
    id: '7',
    name: 'Vanilla Extract',
    category: 'Flavorings',
    unit: 'teaspoons',
    cost: 0.40,
    stock: 15,
    supplier: 'Flavor Co.',
    lastRestocked: '2024-01-11T00:00:00Z'
  },
  {
    id: '8',
    name: 'Dark Chocolate Chips',
    category: 'Add-ins',
    unit: 'cups',
    cost: 0.60,
    stock: 35,
    supplier: 'Chocolate Works',
    lastRestocked: '2024-01-09T00:00:00Z'
  }
];

// GET /api/ingredients
ingredientsRouter.get('/ingredients', async (req, res) => {
  try {
    // TODO: Add authentication check
    // if (!req.user || req.user.role !== 'VENDOR') {
    //   return res.status(403).json({ error: 'VENDOR_ACCESS_REQUIRED' });
    // }

    // TODO: Filter ingredients by vendor ID from session
    // const vendorId = req.user.vendorId;
    // const ingredients = await getVendorIngredients(vendorId);

    res.json(mockIngredients);
  } catch (error: any) {
    console.error('INGREDIENTS_ERROR', error);
    res.status(500).json({ error: 'INGREDIENTS_FETCH_FAILED', message: error.message });
  }
});
