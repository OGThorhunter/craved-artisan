import { prisma } from "../lib/prisma";
import { weightedAvgCost, recipeUnitCost } from "./inventory.math";

export async function upsertPurchase(vendorId: string, ingredientId: string, addQty: number, unitCost: number) {
  const inv = await prisma.ingredientInventory.upsert({
    where: { vendorId_ingredientId: { vendorId, ingredientId } },
    update: {},
    create: { vendorId, ingredientId, quantity: 0, costBasis: unitCost }
  });

  const newCost = weightedAvgCost(Number(inv.quantity), Number(inv.costBasis), addQty, unitCost);
  const quantity = +(Number(inv.quantity) + addQty).toFixed(4);

  await prisma.$transaction([
    prisma.ingredientInventory.update({ 
      where: { vendorId_ingredientId: { vendorId, ingredientId } }, 
      data: { quantity, costBasis: newCost } 
    }),
    prisma.inventoryTx.create({ 
      data: { vendorId, ingredientId, type: "purchase", quantity: addQty, unitCost } 
    })
  ]);

  return { quantity, costBasis: newCost };
}

export async function consumeForRecipe(vendorId: string, recipeId: string, units: number) {
  // consume ingredients based on recipe items
  const recipe = await prisma.recipe.findUnique({ 
    where: { id: recipeId }, 
    include: { items: { include: { ingredient: true } } } 
  });
  if (!recipe) throw new Error("Recipe not found");
  
  const perUnit = recipe.items.map(i => ({
    ingredientId: i.ingredientId,
    qty: Number(i.qtyPerBatch) * (1 + Number(i.wastePct || 0)) / Number(recipe.yieldQty)
  }));

  // For each ingredient: reduce inventory, record tx; return total cogs per finished unit (from costBasis)
  let cogsPerUnit = 0;
  const txs = [];

  for (const i of perUnit) {
    const inv = await prisma.ingredientInventory.findUnique({ 
      where: { vendorId_ingredientId: { vendorId, ingredientId: i.ingredientId } } 
    });
    const basis = Number(inv?.costBasis ?? 0);
    cogsPerUnit += basis * i.qty;

    const consumeQty = +(i.qty * units).toFixed(4);
    const newQty = +(((inv?.quantity ? Number(inv.quantity) : 0) - consumeQty)).toFixed(4);

    txs.push(
      prisma.ingredientInventory.upsert({
        where: { vendorId_ingredientId: { vendorId, ingredientId: i.ingredientId } },
        update: { quantity: newQty },
        create: { vendorId, ingredientId: i.ingredientId, quantity: Math.max(0, -consumeQty), costBasis: basis }
      }),
      prisma.inventoryTx.create({ 
        data: { vendorId, ingredientId: i.ingredientId, type: "sale", quantity: -consumeQty, unitCost: basis } 
      })
    );
  }

  await prisma.$transaction(txs);
  return +cogsPerUnit.toFixed(4);
}

export async function computeRecipeUnitCost(recipeId: string) {
  const recipe = await prisma.recipe.findUnique({ 
    where: { id: recipeId }, 
    include: { items: { include: { ingredient: true } } } 
  });
  if (!recipe) throw new Error("Recipe not found");
  
  const items = recipe.items.map(i => ({
    qtyPerBatch: Number(i.qtyPerBatch),
    wastePct: Number(i.wastePct || 0),
    costPerUnit: Number(i.ingredient.costPerUnit)
  }));
  
  return recipeUnitCost(items, Number(recipe.yieldQty));
}
