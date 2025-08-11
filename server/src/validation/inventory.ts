import { z } from "zod";

export const zIngredientCreate = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  costPerUnit: z.coerce.number().positive(),
  tags: z.array(z.string()).optional().default([])
});

export const zPurchase = z.object({
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().positive()
});

export const zTransactionQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  type: z.enum(["purchase", "sale", "adjustment", "waste"]).optional()
});

export const zRecipeLink = z.object({
  productId: z.string().min(1),
  recipeId: z.string().min(1)
});
