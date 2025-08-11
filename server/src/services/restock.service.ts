import dayjs from "dayjs";
import { prisma } from "../lib/prisma";

// ROP = demand_during_lead + safety_stock
// demand_during_lead = daily_velocity * leadTimeDays
// safety_stock (MVP) = 0.5 * daily_velocity * leadTimeDays (tunable)
const DEFAULT_LEAD_DAYS = 5;

export async function ingredientVelocity(vendorId: string, lookbackDays = 30) {
  // Sum consumption from InventoryTx type "sale" per ingredient in the window
  const since = dayjs().subtract(lookbackDays, "day").toDate();
  const rows = await prisma.inventoryTx.groupBy({
    by: ["ingredientId"],
    where: { vendorId, type: "sale", createdAt: { gte: since } },
    _sum: { quantity: true }
  });
  // quantities are negative for sale; velocity is + per day
  const perDay = new Map<string, number>();
  rows.forEach(r => perDay.set(r.ingredientId, Math.abs(Number(r._sum.quantity || 0)) / lookbackDays));
  return perDay;
}

export async function restockSuggestions(vendorId: string, opts?: { lookbackDays?: number }) {
  const lookback = opts?.lookbackDays ?? 30;
  const vmap = await ingredientVelocity(vendorId, lookback);

  const ingredients = await prisma.ingredient.findMany({ where: { vendorId } });
  const invs = await prisma.ingredientInventory.findMany({ where: { vendorId } });
  const invMap = new Map(invs.map(i => [i.ingredientId, i]));

  const suggestions = [];
  for (const ing of ingredients) {
    const onHand = Number(invMap.get(ing.id)?.quantity || 0);
    const vel = vmap.get(ing.id) || 0;
    const lead = ing.leadTimeDays ?? DEFAULT_LEAD_DAYS;
    const rop = vel * lead + 0.5 * vel * lead; // with simple safety stock
    const deficit = rop - onHand;

    if (deficit > 0.01) {
      const minQty = Number(ing.minOrderQty || 0);
      const qty = Math.max(deficit, minQty || 0);
      suggestions.push({
        ingredientId: ing.id,
        name: ing.name,
        onHand,
        dailyVelocity: +vel.toFixed(3),
        leadTimeDays: lead,
        reorderPoint: +rop.toFixed(2),
        suggestedQty: +qty.toFixed(2),
        preferredSupplierId: ing.preferredSupplierId || null,
      });
    }
  }
  // sort by urgency (ROP - onHand desc)
  suggestions.sort((a, b) => (a.reorderPoint - a.onHand) < (b.reorderPoint - b.onHand) ? 1 : -1);
  return suggestions;
}
