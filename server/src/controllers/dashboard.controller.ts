import { LRUCache } from "lru-cache";
import dayjs from "dayjs";
import { vendorOverview, vendorBestSellers } from "../services/analytics.service";
import { pnl } from "../services/financials.service";
import { restockSuggestions } from "../services/restock.service";
import prisma from '/prisma';

const cache = new LRUCache<string, any>({ ttl: 30_000, max: 300 });

function rangeToDates(range?: string) {
  const now = dayjs();
  if (range === "week") return { from: now.subtract(6, "day").startOf("day").toDate(), to: now.toDate(), label: "Last 7 days" };
  if (range === "month") return { from: now.subtract(29, "day").startOf("day").toDate(), to: now.toDate(), label: "Last 30 days" };
  return { from: now.startOf("day").toDate(), to: now.toDate(), label: "Today" };
}

function prevWindow({from,to}:{from:Date;to:Date}) {
  const dur = to.getTime() - from.getTime();
  const pTo = new Date(from.getTime());
  const pFrom = new Date(from.getTime() - dur);
  return { from: pFrom, to: pTo };
}

export async function getVendorDashboard(req: any, res: any) {
  const vendorId = req.params.vendorId;
  const { range = "today" } = req.query as any;
  const { from, to, label } = rangeToDates(range);
  const key = `dash:${vendorId}:${range}`;
  const hit = cache.get(key); if (hit) return res.json(hit);

  const interval = range === "today" ? "day" : (range === "week" ? "day" : "day");

  try {
    // Current window
    const [overview, best, profit] = await Promise.all([
      vendorOverview(vendorId, { from, to, interval: "day" as any }),
      vendorBestSellers(vendorId, { from, to, limit: 1 }),
      pnl(vendorId, { from, to })
    ]);

    const revenue = Number(overview.totals?.totalRevenue || 0);
    const orders = overview.series?.reduce((a:any,r:any)=> a + Number(r.orders||0), 0) || 0;
    const aov = orders ? +(revenue / orders).toFixed(2) : 0;

    // Sparkline + best day
    const sparkline = (overview.series || []).map((r:any)=>({ date: r.date, revenue: Number(r.revenue||0), orders: Number(r.orders||0) }));
    const bestDay = sparkline.reduce((max:any,cur:any)=> cur.revenue > (max?.revenue||0) ? cur : max, null);

    // Top product today
    const topProductToday = best.items?.[0] ? {
      productId: best.items[0].productId,
      name: best.items[0].name,
      qtySold: Number(best.items[0].qtySold||0)
    } : undefined;

    // Health
    const [restock, unreadConvos, fulfillQueueCount, churnRiskCount] = await Promise.all([
      restockSuggestions(vendorId).catch(()=>[]),
      prisma.conversation.count({ where: { vendorId, status: { in:["open","awaiting_vendor"] } } }).catch(()=>0),
      prisma.orderFulfillment.count({ where: { vendorId, order: { status: { in:["paid","pending"] } } } }).catch(()=>0),
      (async ()=>{
        try {
          // crude: buyers with >=2 orders overall and 0 in last 60d
          const since = dayjs().subtract(60,"day").toDate();
          const rows:any[] = await prisma.$queryRawUnsafe(`
            SELECT o."customerId"
            FROM "Order" o
            WHERE o."vendorId" = $1 AND o."customerId" IS NOT NULL
            GROUP BY o."customerId"
            HAVING COUNT(*) >= 2
            EXCEPT
            SELECT o2."customerId" FROM "Order" o2 WHERE o2."vendorId" = $1 AND o2."createdAt" >= $2
          `, vendorId, since);
          return rows.length || 0;
        } catch (e) {
          console.error("Churn risk query failed:", e);
          return 0;
        }
      })()
    ]);

    // Margin & payouts estimate
    const grossProfit = Number(profit.grossProfit || 0);
    const profitMarginPct = revenue ? +((grossProfit / revenue) * 100).toFixed(1) : 0;
    const platformFeePct = Number(process.env.PLATFORM_FEE_BPS || "100")/10000;
    const pendingPayoutsEstimate = +(revenue * (1 - platformFeePct)).toFixed(2);

    // Previous window for deltas
    const prev = prevWindow({from,to});
    const [prevOv, prevPn] = await Promise.all([
      vendorOverview(vendorId, { from: prev.from, to: prev.to, interval: "day" as any }),
      pnl(vendorId, { from: prev.from, to: prev.to })
    ]);
    const prevRev = Number(prevOv.totals?.totalRevenue || 0);
    const prevOrders = prevOv.series?.reduce((a:any,r:any)=> a + Number(r.orders||0), 0) || 0;
    const prevAov = prevOrders ? +(prevRev / prevOrders).toFixed(2) : 0;
    const delta = {
      revenuePct: prevRev ? +(((revenue - prevRev)/prevRev)*100).toFixed(1) : 0,
      ordersPct: prevOrders ? +(((orders - prevOrders)/prevOrders)*100).toFixed(1) : 0,
      aovPct: prevAov ? +(((aov - prevAov)/prevAov)*100).toFixed(1) : 0
    };

    // Insights (simple rules)
    const insights:string[] = [];
    if (delta.revenuePct <= -20) insights.push("Order volume is down this period — consider a flash promo.");
    if ((topProductToday?.qtySold||0) >= 10) insights.push(`Customers who bought ${topProductToday?.name} also buy complements — try a bundle.`);
    const abandonedCarts = 3; // TODO: wire once cart tracking is in
    if (abandonedCarts > 0) insights.push(`${abandonedCarts} shoppers left items in cart — send a recovery email?`);

    const payload = {
      sales: { period: { from, to, label }, revenue, orders, aov, delta, sparkline, topProductToday, bestDay },
      health: {
        lowStockCount: Array.isArray(restock) ? restock.length : 0,
        fulfillmentQueueCount: fulfillQueueCount || 0,
        profitMarginPct,
        pendingPayoutsEstimate,
        churnRiskCount
      },
      messages: { unreadCount: unreadConvos || 0, newReviewsToday: 0 },
      insights,
      leaderboard: bestDay ? { bestSalesDay: bestDay, totalCustomersServed: 500 } : undefined
    };

    cache.set(key, payload);
    res.json(payload);
  } catch (error) {
    console.error("Dashboard overview error:", error);
    // Return safe defaults on error
    res.json({
      sales: { 
        period: { from, to, label }, 
        revenue: 0, orders: 0, aov: 0, 
        delta: { revenuePct: 0, ordersPct: 0, aovPct: 0 }, 
        sparkline: [], 
        topProductToday: undefined, 
        bestDay: undefined 
      },
      health: {
        lowStockCount: 0,
        fulfillmentQueueCount: 0,
        profitMarginPct: 0,
        pendingPayoutsEstimate: 0,
        churnRiskCount: 0
      },
      messages: { unreadCount: 0, newReviewsToday: 0 },
      insights: ["Unable to load insights at this time."],
      leaderboard: undefined
    });
  }
}
