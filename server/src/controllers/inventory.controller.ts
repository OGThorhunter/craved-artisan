import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { upsertPurchase } from '../services/inventory.service';

export async function listIngredients(req: Request, res: Response) {
  const { vendorId } = req.params;
  
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { vendorId },
      include: {
        inventory: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(ingredients);
  } catch (error) {
    console.error('Error listing ingredients:', error);
    res.status(500).json({ error: 'Failed to list ingredients' });
  }
}

export async function createIngredient(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { name, unit, costPerUnit, tags } = req.body;
  
  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        vendorId,
        name,
        unit,
        costPerUnit,
        tags
      }
    });

    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
}

export async function recordPurchase(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { ingredientId, quantity, unitCost } = req.body;
  
  try {
    const result = await upsertPurchase(vendorId, ingredientId, quantity, unitCost);
    res.json(result);
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
}

export async function listTransactions(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { from, to, type } = req.query as any;
  
  try {
    const where: any = { vendorId };
    
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    
    if (type) {
      where.type = type;
    }

    const transactions = await prisma.inventoryTx.findMany({
      where,
      include: {
        ingredient: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
}

export async function linkRecipe(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { productId, recipeId } = req.body;
  
  try {
    // Verify both product and recipe belong to the vendor
    const [product, recipe] = await Promise.all([
      prisma.product.findFirst({ where: { id: productId, vendor_id: vendorId } }),
      prisma.recipe.findFirst({ where: { id: recipeId, vendorId } })
    ]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { recipeId }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error linking recipe:', error);
    res.status(500).json({ error: 'Failed to link recipe' });
  }
}
