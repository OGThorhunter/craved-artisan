import prisma from '../lib/prisma';
import { consumeForRecipe, computeRecipeUnitCost } from "./inventory.service";

export async function snapshotCogsForOrderItem(orderItemId: string) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { product: true, order: true }
  });
  if (!item) return;

  const vendorProfileId = item.product.vendorProfileId;
  let cost = 0;

  if (item.product.recipeId) {
    // consume ingredients and compute cogs from inventory basis
    // cost = await consumeForRecipe(vendorProfileId, item.product.recipeId, Number(item.quantity));
    // cost is per 1 finished unit — above returns per unit; ensure we store per unit, not total
  } else {
    // fallback to static recipe cost (no live inventory impact)
    try {
      cost = await computeRecipeUnitCost(item.product.recipeId!);
    } catch { 
      cost = 0; 
    }
  }

  await prisma.orderItem.update({ 
    where: { id: orderItemId }, 
    data: { } 
  });
}
