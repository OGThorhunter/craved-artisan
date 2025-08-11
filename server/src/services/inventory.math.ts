import { Decimal } from "@prisma/client/runtime/library";

export function weightedAvgCost(prevQty: number, prevCost: number, addQty: number, addCost: number) {
  const totalCost = prevQty * prevCost + addQty * addCost;
  const totalQty = prevQty + addQty;
  return totalQty > 0 ? +(totalCost / totalQty).toFixed(4) : 0;
}

export function recipeUnitCost(items: Array<{ qtyPerBatch: number; wastePct: number; costPerUnit: number }>, yieldQty: number) {
  const batchCost = items.reduce((a, i) => a + (i.qtyPerBatch * (1 + (i.wastePct || 0)) * i.costPerUnit), 0);
  return yieldQty > 0 ? +(batchCost / yieldQty).toFixed(4) : 0;
}
