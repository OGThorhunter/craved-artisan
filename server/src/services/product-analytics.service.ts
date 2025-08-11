import { prisma } from "../lib/prisma";

type Range = { from?: Date; to?: Date };

function normalizeRange(r: Range) {
  const now = new Date();
  const from = r.from ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  const to = r.to ?? now;
  return { from, to };
}

export async function productOverview(vendorId: string, productId: string, range: Range) {
  const { from, to } = normalizeRange(range);

  try {
    // Use OrderItem-based approach since we have that model
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT DATE_TRUNC('day', oi."created_at")::date AS bucket,
             SUM(oi."price" * oi."quantity")::numeric AS revenue,
             SUM(oi."quantity")::int AS qty,
             COUNT(DISTINCT oi."order_id") AS orders
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."product_id"
      WHERE p."vendor_id" = $1
        AND oi."product_id" = $2
        AND oi."created_at" BETWEEN $3 AND $4
      GROUP BY 1
      ORDER BY 1
    `, vendorId, productId, from, to);

    const totals = rows.reduce((acc, row) => ({
      revenue: acc.revenue + Number(row.revenue || 0),
      qtySold: acc.qtySold + Number(row.qty || 0),
      orders: acc.orders + Number(row.orders || 0)
    }), { revenue: 0, qtySold: 0, orders: 0 });

    const series = rows.map(row => ({
      date: row.bucket.toISOString().slice(0, 10),
      revenue: Number(row.revenue),
      qty: Number(row.qty)
    }));

    // Optional: Get price history if available
    let priceHistory: Array<{ date: string; price: number }> = [];
    try {
      const priceRows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT DATE_TRUNC('day', p."created_at")::date AS date,
               p."price"::numeric AS price
        FROM "Product" p
        WHERE p."vendor_id" = $1
          AND p.id = $2
          AND p."created_at" BETWEEN $3 AND $4
        ORDER BY 1
      `, vendorId, productId, from, to);

      priceHistory = priceRows.map(row => ({
        date: row.date.toISOString().slice(0, 10),
        price: Number(row.price)
      }));
    } catch (error) {
      // Price history not available, continue without it
      console.log('Price history not available for product:', productId);
    }

    return {
      totals,
      series,
      priceHistory: priceHistory.length > 0 ? priceHistory : undefined
    };
  } catch (error) {
    console.error('Error in productOverview:', error);

    // Fallback: Order-based approach
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT DATE_TRUNC('day', o."created_at")::date AS bucket,
               SUM(o."total_amount")::numeric AS revenue,
               COUNT(*) AS orders
        FROM "Order" o
        WHERE o."vendor_id" = $1
          AND o."created_at" BETWEEN $2 AND $3
        GROUP BY 1
        ORDER BY 1
      `, vendorId, from, to);

      const totals = rows.reduce((acc, row) => ({
        revenue: acc.revenue + Number(row.revenue || 0),
        qtySold: 0, // Not available in Order-only approach
        orders: acc.orders + Number(row.orders || 0)
      }), { revenue: 0, qtySold: 0, orders: 0 });

      const series = rows.map(row => ({
        date: row.bucket.toISOString().slice(0, 10),
        revenue: Number(row.revenue),
        qty: 0 // Not available in Order-only approach
      }));

      return {
        totals,
        series,
        priceHistory: undefined
      };
    } catch (fallbackError) {
      console.error('Fallback error in productOverview:', fallbackError);
      
      // Return safe defaults
      return {
        totals: { revenue: 0, qtySold: 0, orders: 0 },
        series: [],
        priceHistory: undefined
      };
    }
  }
}
