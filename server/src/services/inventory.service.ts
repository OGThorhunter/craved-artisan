import prisma from '../lib/prisma';
import { weightedAvgCost, recipeUnitCost } from "./inventory.math";

export async function upsertPurchase(vendorProfileId: string, ingredientId: string, addQty: number, unitCost: number) {
  // IngredientInventory and InventoryTx models not available in current schema
  throw new Error("Inventory functionality not available in current schema");
  
  // TODO: Restore when models are properly implemented
  /*
  const inv = await prisma.ingredientInventory.upsert({
    where: { vendorProfileId_ingredientId: { vendorProfileId, ingredientId } },
    update: {},
    create: { vendorProfileId, ingredientId, quantity: 0, costBasis: unitCost }
  });

  const newCost = weightedAvgCost(Number(inv.quantity), Number(inv.costBasis), addQty, unitCost);
  const quantity = +(Number(inv.quantity) + addQty).toFixed(4);

  await prisma.$transaction([
    prisma.ingredientInventory.update({ 
      where: { vendorProfileId_ingredientId: { vendorProfileId, ingredientId } }, 
      data: { quantity, costBasis: newCost } 
    }),
    prisma.inventoryTx.create({ 
      data: { vendorProfileId, ingredientId, type: "purchase", quantity: addQty, unitCost } 
    })
  ]);

  return { quantity, costBasis: newCost };
  */
}

export async function consumeForRecipe(vendorProfileId: string, recipeId: string, units: number) {
  // IngredientInventory and InventoryTx models not available in current schema
  throw new Error("Inventory functionality not available in current schema");
  
  // TODO: Restore when models are properly implemented
  /*
  // consume ingredients based on recipe items
  const recipe = await prisma.recipe.findUnique({ 
    where: { id: recipeId }, 
    include: { recipeIngredients: { include: { ingredient: true } } } 
  });
  if (!recipe) throw new Error("Recipe not found");
  
  const perUnit = recipe.recipeIngredients.map((i: any) => ({
    ingredientId: i.ingredientId,
    qty: Number(i.qtyPerBatch) * (1 + Number(i.wastePct || 0)) / Number(recipe.yield)
  }));

  // For each ingredient: reduce inventory, record tx; return total cogs per finished unit (from costBasis)
  let cogsPerUnit = 0;
  const txs = [];

  for (const i of perUnit) {
    const inv = await prisma.ingredientInventory.findUnique({ 
      where: { vendorProfileId_ingredientId: { vendorProfileId, ingredientId: i.ingredientId } } 
    });
    const basis = Number(inv?.costBasis ?? 0);
    cogsPerUnit += basis * i.qty;

    const consumeQty = +(i.qty * units).toFixed(4);
    const newQty = +(((inv?.quantity ? Number(inv.quantity) : 0) - consumeQty)).toFixed(4);

    txs.push(
      prisma.ingredientInventory.upsert({
        where: { vendorProfileId_ingredientId: { vendorProfileId, ingredientId: i.ingredientId } },
        update: { quantity: newQty },
        create: { vendorProfileId, ingredientId: i.ingredientId, quantity: Math.max(0, -consumeQty), costBasis: basis }
      }),
      prisma.inventoryTx.create({ 
        data: { vendorProfileId, ingredientId: i.ingredientId, type: "sale", quantity: -consumeQty, unitCost: basis } 
      })
    );
  }

  await prisma.$transaction(txs);
  return +cogsPerUnit.toFixed(4);
  */
}

export async function computeRecipeUnitCost(recipeId: string) {
  const recipe = await prisma.recipe.findUnique({ 
    where: { id: recipeId }, 
    include: { recipeIngredients: { include: { ingredient: true } } } 
  });
  if (!recipe) throw new Error("Recipe not found");
  
  const items = recipe.recipeIngredients.map((i: any) => ({
    qtyPerBatch: Number(i.qtyPerBatch),
    wastePct: Number(i.wastePct || 0),
    costPerUnit: Number(i.ingredient.costPerUnit)
  }));
  
  return recipeUnitCost(items, Number(recipe.yield));
}
