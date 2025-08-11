import { prisma } from "../lib/prisma";
import { financialConfig } from "../config/env";

type Range = { from?: Date; to?: Date };

function normalizeRange(r: Range) {
  const now = new Date();
  const from = r.from ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  const to = r.to ?? now;
  return { from, to };
}

function calcFees(gross: number, ordersCount: number) {
  const stripePct = (financialConfig.stripeFeeBps ?? 290) / 10000;
  const platformPct = (financialConfig.platformFeeBps ?? 100) / 10000;
  const flat = ((financialConfig.stripeFeeFlat ?? 30) / 100) * ordersCount;
  const stripe = +(gross * stripePct + flat).toFixed(2);
  const platform = +(gross * platformPct).toFixed(2);
  return { stripe, platform, total: +(stripe + platform).toFixed(2) };
}

export async function pnl(vendorId: string, range: Range) {
  const { from, to } = normalizeRange(range);

  // Prefer OrderItem if present
  try {
    // @ts-ignore - check if prisma.orderItem exists
    if ((prisma as any).orderItem) {
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          SUM(oi."price" * oi."quantity")::numeric AS revenue,
          SUM(COALESCE(oi."cogsUnit", 0) * oi."quantity")::numeric AS cogs,
          COUNT(DISTINCT oi."order_id") AS orders
        FROM "OrderItem" oi
        JOIN "Product" p ON p.id = oi."product_id"
        WHERE p."vendor_id" = $1
          AND oi."created_at" BETWEEN $2 AND $3
      `, vendorId, from, to);

      const revenue = Number(rows?.[0]?.revenue ?? 0);
      // If you don't have cogsUnit yet, fallback
      let cogs = Number(rows?.[0]?.cogs ?? 0);
      if (!cogs) cogs = +(revenue * ((financialConfig.defaultCogsPct ?? 0) / 100)).toFixed(2);

      const orders = Number(rows?.[0]?.orders ?? 0);
      const fees = calcFees(revenue, orders);
      const grossProfit = +(revenue - cogs).toFixed(2);
      const netIncome = +(grossProfit - fees.total).toFixed(2);

      return {
        period: { from, to },
        revenue, cogs, fees, grossProfit, expenses: fees.total, netIncome,
      };
    }
  } catch (error) {
    console.error('Error in OrderItem-based P&L:', error);
  }

  // Fallback: Order table has vendor_id + total (+ optional fees/cogs columns)
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT SUM(o."total_amount")::numeric AS revenue,
             SUM(COALESCE(o."total_amount" * 0.6, 0))::numeric AS cogs,
             COUNT(*) AS orders
      FROM "Order" o
      WHERE o."vendor_id" = $1
        AND o."created_at" BETWEEN $2 AND $3
    `, vendorId, from, to);

    const revenue = Number(rows?.[0]?.revenue ?? 0);
    let cogs = Number(rows?.[0]?.cogs ?? 0);
    if (!cogs) cogs = +(revenue * ((financialConfig.defaultCogsPct ?? 0) / 100)).toFixed(2);

    const orders = Number(rows?.[0]?.orders ?? 0);
    const fees = calcFees(revenue, orders);

    const grossProfit = +(revenue - cogs).toFixed(2);
    const netIncome = +(grossProfit - fees.total).toFixed(2);

    return {
      period: { from, to },
      revenue, cogs, fees, grossProfit, expenses: fees.total, netIncome,
    };
  } catch (error) {
    console.error('Error in Order-based P&L:', error);
    
    // Return safe defaults
    return {
      period: { from, to },
      revenue: 0, cogs: 0, fees: { stripe: 0, platform: 0, total: 0 },
      grossProfit: 0, expenses: 0, netIncome: 0,
    };
  }
}

export async function cashFlow(vendorId: string, range: Range, method: "direct" | "indirect") {
  const { from, to } = normalizeRange(range);

  // Direct: inflows from paid orders; outflows = fees + cogs (paid)
  // For MVP assume paid-at = createdAt; refine later if you track payouts.
  const p = await pnl(vendorId, { from, to });
  const inflows = p.revenue;
  const outflows = +(p.fees.total + p.cogs).toFixed(2);
  const net = +(inflows - outflows).toFixed(2);

  if (method === "direct") {
    return { 
      period: { from, to }, 
      method, 
      inflows: { sales: p.revenue }, 
      outflows: { cogs: p.cogs, fees: p.fees.total }, 
      net 
    };
  }

  // Indirect: start from net income and adjust (simplified MVP)
  const netIncome = p.netIncome;
  const deltaWorkingCapital = 0; // TODO when you track receivables/payables
  return { 
    period: { from, to }, 
    method, 
    netIncome, 
    adjustments: { deltaWorkingCapital }, 
    net: +(netIncome + deltaWorkingCapital).toFixed(2) 
  };
}

export async function balanceSheet(vendorId: string, asOf: Date) {
  // MVP snapshot using what we have:
  // Cash on hand unknown → 0 unless you track balance; Inventory ~ recent COGS (approx)
  const last30 = await pnl(vendorId, { from: new Date(asOf.getTime() - 30 * 86400000), to: asOf });
  const inventory = +(last30.cogs / 4).toFixed(2); // crude approx; refine when inventory model lands
  const assets = { cash: 0, inventory };
  const liabilities = { payables: 0, taxesPayable: 0 };
  const equity = +(assets.cash + assets.inventory - liabilities.payables - liabilities.taxesPayable).toFixed(2);
  return { asOf, assets, liabilities, equity };
}
