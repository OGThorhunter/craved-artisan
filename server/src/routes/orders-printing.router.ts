import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const PrintListSchema = z.object({
  filters: z.object({
    status: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    salesWindowId: z.string().optional(),
  }).optional(),
  include: z.object({
    customer: z.boolean().default(true),
    products: z.boolean().default(true),
    financials: z.boolean().default(true),
    timeline: z.boolean().default(false),
    tags: z.boolean().default(false),
  }).default({}),
});

const PrintTicketsSchema = z.object({
  orderIds: z.array(z.string()),
  type: z.enum(['order', 'item']).default('order'),
});

const PrintManifestsSchema = z.object({
  orderIds: z.array(z.string()),
  type: z.enum(['delivery', 'pickup']).default('delivery'),
});

// POST /api/vendor/orders/print/list
router.post('/print/list', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { filters = {}, include = {} } = PrintListSchema.parse(req.body);

    // Build where clause
    const where: any = { vendorProfileId };
    
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    
    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }
    
    if (filters.salesWindowId) {
      where.salesWindowId = filters.salesWindowId;
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: include.products ? {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        } : false,
        salesWindow: include.customer ? {
          select: {
            id: true,
            name: true,
          },
        } : false,
        timeline: include.timeline ? {
          orderBy: { createdAt: 'desc' },
          take: 10,
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate HTML report
    const html = generateOrderListHTML(orders, include, filters);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Print order list error:', error);
    res.status(500).json({ error: 'Failed to generate order list' });
  }
});

// POST /api/vendor/orders/print/tickets
router.post('/print/tickets', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { orderIds, type } = PrintTicketsSchema.parse(req.body);

    // Get orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        vendorProfileId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                allergenFlags: true,
              },
            },
          },
        },
        salesWindow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate HTML tickets
    const html = generateTicketsHTML(orders, type);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Print tickets error:', error);
    res.status(500).json({ error: 'Failed to generate tickets' });
  }
});

// POST /api/vendor/orders/print/manifests
router.post('/print/manifests', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { orderIds, type } = PrintManifestsSchema.parse(req.body);

    // Get orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        vendorProfileId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        salesWindow: {
          select: {
            id: true,
            name: true,
          },
        },
        shippingAddress: type === 'delivery' ? true : false,
        customerVehicle: type === 'pickup' ? true : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate HTML manifest
    const html = generateManifestHTML(orders, type);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Print manifest error:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

// Helper function to generate order list HTML
function generateOrderListHTML(orders: any[], include: any, filters: any): string {
  const now = new Date().toLocaleString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Order List Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .order { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 5px; }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .order-number { font-weight: bold; font-size: 18px; }
        .order-status { padding: 5px 10px; border-radius: 3px; color: white; font-size: 12px; }
        .status-pending { background: #ffc107; }
        .status-confirmed { background: #17a2b8; }
        .status-in-production { background: #fd7e14; }
        .status-ready { background: #28a745; }
        .status-delivered { background: #6c757d; }
        .order-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
        .order-items { margin-top: 15px; }
        .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
        .timeline { margin-top: 15px; }
        .timeline-item { padding: 5px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Order List Report</h1>
        <p>Generated: ${now}</p>
    </div>
    
    <div class="summary">
        <h3>Summary</h3>
        <p>Total Orders: ${orders.length}</p>
        <p>Total Value: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
        <p>Status Breakdown: ${Object.entries(orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {})).map(([status, count]) => `${status}: ${count}`).join(', ')}</p>
    </div>
    
    ${orders.map(order => `
        <div class="order">
            <div class="order-header">
                <div class="order-number">${order.orderNumber}</div>
                <div class="order-status status-${order.status.toLowerCase().replace('_', '-')}">${order.status}</div>
            </div>
            
            <div class="order-details">
                <div>
                    ${include.customer ? `
                        <p><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
                        <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
                    ` : ''}
                    <p><strong>Priority:</strong> ${order.priority}</p>
                    <p><strong>Source:</strong> ${order.source || 'N/A'}</p>
                </div>
                <div>
                    <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Due:</strong> ${order.dueAt ? new Date(order.dueAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Expected:</strong> ${order.expectedAt ? new Date(order.expectedAt).toLocaleString() : 'N/A'}</p>
                    ${include.financials ? `<p><strong>Total:</strong> $${order.total.toFixed(2)}</p>` : ''}
                </div>
            </div>
            
            ${include.products && order.orderItems ? `
                <div class="order-items">
                    <h4>Items (${order.orderItems.length})</h4>
                    ${order.orderItems.map((item: any) => `
                        <div class="item">
                            <span>${item.productName} ${item.variantName ? `(${item.variantName})` : ''} x${item.quantity}</span>
                            <span>$${item.total.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${include.timeline && order.timeline ? `
                <div class="timeline">
                    <h4>Recent Activity</h4>
                    ${order.timeline.map((entry: any) => `
                        <div class="timeline-item">
                            <strong>${entry.type}</strong> - ${new Date(entry.createdAt).toLocaleString()}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${include.tags && order.tags ? `
                <div class="tags">
                    <p><strong>Tags:</strong> ${JSON.parse(order.tags).join(', ')}</p>
                </div>
            ` : ''}
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Report generated by Craved Artisan Orders Management System</p>
    </div>
</body>
</html>`;
}

// Helper function to generate tickets HTML
function generateTicketsHTML(orders: any[], type: string): string {
  const now = new Date().toLocaleString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Order Tickets</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .ticket { border: 2px solid #000; margin-bottom: 30px; padding: 20px; page-break-after: always; }
        .ticket:last-child { page-break-after: avoid; }
        .header { text-align: center; margin-bottom: 20px; }
        .order-number { font-size: 24px; font-weight: bold; }
        .qr-code { text-align: center; margin: 20px 0; }
        .order-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .items { margin-top: 20px; }
        .item { padding: 10px 0; border-bottom: 1px solid #ddd; }
        .allergens { background: #fff3cd; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    ${orders.map(order => `
        <div class="ticket">
            <div class="header">
                <div class="order-number">${order.orderNumber}</div>
                <div>${order.customerName}</div>
                <div>${order.dueAt ? new Date(order.dueAt).toLocaleString() : 'No due date'}</div>
            </div>
            
            <div class="qr-code">
                <div>QR Code for ${order.orderNumber}</div>
                <div style="border: 1px solid #000; width: 100px; height: 100px; margin: 10px auto; display: flex; align-items: center; justify-content: center;">
                    QR
                </div>
            </div>
            
            <div class="order-details">
                <div>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Priority:</strong> ${order.priority}</p>
                    <p><strong>Station:</strong> ${order.station || 'N/A'}</p>
                </div>
                <div>
                    <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Expected:</strong> ${order.expectedAt ? new Date(order.expectedAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="items">
                <h3>Items (${order.orderItems.length})</h3>
                ${order.orderItems.map((item: any) => `
                    <div class="item">
                        <div><strong>${item.productName} ${item.variantName ? `(${item.variantName})` : ''}</strong></div>
                        <div>Quantity: ${item.quantity} | Made: ${item.madeQty || 0} | Status: ${item.status}</div>
                        ${item.notes ? `<div>Notes: ${item.notes}</div>` : ''}
                        ${item.product.allergenFlags ? `
                            <div class="allergens">
                                <strong>Allergens:</strong> ${JSON.parse(item.product.allergenFlags).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            ${order.notes ? `
                <div class="notes">
                    <h3>Order Notes</h3>
                    <p>${order.notes}</p>
                </div>
            ` : ''}
            
            <div class="footer">
                <p>Generated: ${now}</p>
                <p>Craved Artisan Orders Management System</p>
            </div>
        </div>
    `).join('')}
</body>
</html>`;
}

// Helper function to generate manifest HTML
function generateManifestHTML(orders: any[], type: string): string {
  const now = new Date().toLocaleString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>${type === 'delivery' ? 'Delivery' : 'Pickup'} Manifest</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .order { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 5px; }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .order-number { font-weight: bold; font-size: 18px; }
        .order-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
        .items { margin-top: 15px; }
        .item { padding: 5px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${type === 'delivery' ? 'Delivery' : 'Pickup'} Manifest</h1>
        <p>Generated: ${now}</p>
    </div>
    
    <div class="summary">
        <h3>Summary</h3>
        <p>Total Orders: ${orders.length}</p>
        <p>Total Value: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
        <p>Total Items: ${orders.reduce((sum, order) => sum + order.orderItems.length, 0)}</p>
    </div>
    
    ${orders.map(order => `
        <div class="order">
            <div class="order-header">
                <div class="order-number">${order.orderNumber}</div>
                <div>${order.customerName}</div>
            </div>
            
            <div class="order-details">
                <div>
                    <p><strong>Customer:</strong> ${order.customerName}</p>
                    <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
                    ${type === 'delivery' && order.shippingAddress ? `
                        <p><strong>Address:</strong> ${order.shippingAddress.address}</p>
                        <p><strong>City:</strong> ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
                    ` : ''}
                    ${type === 'pickup' && order.customerVehicle ? `
                        <p><strong>Vehicle:</strong> ${order.customerVehicle.make_model}</p>
                        <p><strong>Color:</strong> ${order.customerVehicle.color}</p>
                        <p><strong>Plate:</strong> ${order.customerVehicle.plate || 'N/A'}</p>
                    ` : ''}
                </div>
                <div>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Priority:</strong> ${order.priority}</p>
                    <p><strong>Due:</strong> ${order.dueAt ? new Date(order.dueAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Expected:</strong> ${order.expectedAt ? new Date(order.expectedAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="items">
                <h4>Items (${order.orderItems.length})</h4>
                ${order.orderItems.map((item: any) => `
                    <div class="item">
                        <span>${item.productName} ${item.variantName ? `(${item.variantName})` : ''} x${item.quantity}</span>
                        <span>$${item.total.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            ${order.notes ? `
                <div class="notes">
                    <h4>Notes</h4>
                    <p>${order.notes}</p>
                </div>
            ` : ''}
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Manifest generated by Craved Artisan Orders Management System</p>
    </div>
</body>
</html>`;
}

export default router;
