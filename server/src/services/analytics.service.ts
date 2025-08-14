import prisma from '../lib/prisma';

/**
 * NOTE: We support 2 schemas:
 * A) Order + OrderItem (preferred) - which we have
 * B) Order with vendorId + total (simpler)
 * Inspect prisma schema and pick the right path.
 */
type Range = { from?: Date; to?: Date; interval: "day" | "week" | "month" };

export async function vendorOverview(vendorId: string, { from, to, interval }: Range) {
  // Normalize range
  const now = new Date();
  const start = from ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
  const end = to ?? now;

  // Use OrderItem-based approach since we have that model
  try {
    // revenue & orders by day using raw SQL (Postgres)
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT DATE_TRUNC($1, oi."created_at")::date AS bucket,
             SUM(oi."price" * oi."quantity")::numeric AS revenue,
             COUNT(DISTINCT oi."order_id") AS orders
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."product_id"
      WHERE p."vendor_id" = $2
        AND oi."created_at" BETWEEN $3 AND $4
      GROUP BY 1
      ORDER BY 1
    `, interval, vendorId, start, end);

    const totalRevenue = Number(rows.reduce((a, r) => a + Number(r.revenue || 0), 0));
    const totalOrders = rows.reduce((a, r) => a + Number(r.orders || 0), 0);
    const avgOrderValue = totalOrders ? +(totalRevenue / totalOrders).toFixed(2) : 0;

    const series = rows.map(r => ({ 
      date: r.bucket.toISOString().slice(0, 10), 
      revenue: Number(r.revenue), 
      orders: Number(r.orders) 
    }));
    
    return { totals: { totalRevenue, totalOrders, avgOrderValue }, series };
  } catch (error) {
    console.error('Error in vendorOverview:', error);
    
    // Fallback: Order has vendor_id + total_amount
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT DATE_TRUNC($1, o."created_at")::date AS bucket,
               SUM(o."total_amount")::numeric AS revenue,
               COUNT(*) AS orders
        FROM "Order" o
        WHERE o."vendor_id" = $2
          AND o."created_at" BETWEEN $3 AND $4
        GROUP BY 1
        ORDER BY 1
      `, interval, vendorId, start, end);

      const totalRevenue = Number(rows.reduce((a, r) => a + Number(r.revenue || 0), 0));
      const totalOrders = rows.reduce((a, r) => a + Number(r.orders || 0), 0);
      const avgOrderValue = totalOrders ? +(totalRevenue / totalOrders).toFixed(2) : 0;
      const series = rows.map(r => ({ 
        date: r.bucket.toISOString().slice(0, 10), 
        revenue: Number(r.revenue), 
        orders: Number(r.orders) 
      }));

      return { totals: { totalRevenue, totalOrders, avgOrderValue }, series };
    } catch (fallbackError) {
      console.error('Fallback error in vendorOverview:', fallbackError);
      // Return safe defaults
      return { 
        totals: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }, 
        series: [] 
      };
    }
  }
}

export async function vendorBestSellers(vendorId: string, { from, to, limit = 10 }: { from?: Date; to?: Date; limit?: number }) {
  const now = new Date();
  const start = from ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const end = to ?? now;

  try {
    // OrderItem path - preferred approach
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT p.id AS "productId", p.name AS name,
             SUM(oi."quantity")::int AS "qtySold",
             SUM(oi."price" * oi."quantity")::numeric AS "totalRevenue"
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."product_id"
      WHERE p."vendor_id" = $1
        AND oi."created_at" BETWEEN $2 AND $3
      GROUP BY p.id, p.name
      ORDER BY "totalRevenue" DESC
      LIMIT $4
    `, vendorId, start, end, limit);

    return { 
      items: rows.map(r => ({ 
        productId: r.productId, 
        name: r.name, 
        qtySold: Number(r.qtySold), 
        totalRevenue: Number(r.totalRevenue) 
      })) 
    };
  } catch (error) {
    console.error('Error in vendorBestSellers:', error);
    
    // Return safe defaults
    return { items: [] };
  }
}
