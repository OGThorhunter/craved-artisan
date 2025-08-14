import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { sendDeliveryConfirmation, sendDeliveryETAWithTime } from '../utils/twilio';
import PDFDocument from 'pdfkit';
import { Role } from '../lib/prisma';

const router = express.Router();

// Validation schemas
const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive().int(),
  price: z.number().positive()
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Cart must contain at least one item'),
  userId: z.string().uuid(),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().positive(),
  shippingAddressId: z.string().uuid().optional(),
  notes: z.string().optional(),
  prediction: z.object({
    predictedFulfillmentTime: z.string(),
    label: z.string(),
    baseEstimate: z.number(),
    prepTime: z.number(),
    shippingTime: z.number()
  }).optional()
});

// POST /api/orders/checkout - Create a new order from cart items
router.post('/checkout', requireAuth, requireRole([Role.CUSTOMER]), async (req, res) => {
  try {
    // Validate request body
    const validationResult = checkoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { items, userId, subtotal, tax, shipping, total, shippingAddressId, notes, prediction } = validationResult.data;

    // Verify user is creating order for themselves
    if (req.session.userId !== userId) {
      return res.status(400).json({
        error: 'Unauthorized',
        message: 'You can only create orders for yourself'
      });
    }

    // Validate that user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Get or create shipping address
    let finalShippingAddressId = shippingAddressId;
    if (!finalShippingAddressId) {
      // Get default shipping address or create one
      const defaultAddress = user.addresses.find((addr: any) => addr.isDefault && addr.type === 'SHIPPING');
      if (!defaultAddress) {
        return res.status(400).json({
          error: 'Shipping address required',
          message: 'Please provide a shipping address or set a default address'
        });
      }
      finalShippingAddressId = defaultAddress.id;
    }

    // Validate all products exist and are available
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true
      }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        error: 'Invalid products',
        message: 'One or more products are not available or do not exist'
      });
    }

    // Validate stock levels
    const stockValidationErrors: string[] = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        stockValidationErrors.push(
          `${product.name}: requested ${item.quantity}, available ${product.stock}`
        );
      }
    }

    if (stockValidationErrors.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: 'Some items have insufficient stock',
        details: stockValidationErrors
      });
    }

    // Validate price consistency (prevent price manipulation)
    const priceValidationErrors: string[] = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && Math.abs(product.price - item.price) > 0.01) {
        priceValidationErrors.push(
          `${product.name}: expected $${product.price}, received $${item.price}`
        );
      }
    }

    if (priceValidationErrors.length > 0) {
      return res.status(400).json({
        error: 'Price mismatch',
        message: 'Product prices have changed',
        details: priceValidationErrors
      });
    }

    // Verify all vendors are connected to Stripe before allowing order creation
    const productsWithVendors = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        vendorProfile: true
      }
    });

    const vendorsNotConnected = productsWithVendors.filter(product => 
      !product.vendorProfile.stripeAccountId
    );

    if (vendorsNotConnected.length > 0) {
      return res.status(400).json({
        error: 'Vendors not connected',
        message: 'Some vendors are not connected to Stripe. Please contact support.',
        vendors: vendorsNotConnected.map(product => ({
          productId: product.id,
          productName: product.name,
          vendorId: product.vendorProfile.id,
          vendorName: product.vendorProfile.storeName,
        }))
      });
    }

    // Recalculate totals to ensure accuracy
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedTax = calculatedSubtotal * 0.085; // 8.5% tax rate
    const calculatedShipping = calculatedSubtotal >= 50 ? 0 : 5.99;
    const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping;

    // Validate totals match (allow small rounding differences)
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({
        error: 'Total mismatch',
        message: 'Order total does not match calculated total',
        expected: calculatedTotal,
        received: total
      });
    }

    // Get shipping address to extract ZIP code for delivery day assignment
    const shippingAddress = await prisma.address.findUnique({
      where: { id: finalShippingAddressId }
    });

    if (!shippingAddress) {
      return res.status(400).json({
        error: 'Shipping address not found',
        message: 'The specified shipping address does not exist'
      });
    }

    // Auto-assign delivery day based on ZIP code
    function getNextAvailableDay(zip: string): string {
      const dayMap: Record<string, string> = {
        '30248': 'Monday',
        '30252': 'Tuesday', 
        '30236': 'Wednesday',
        '30301': 'Thursday',
        '30302': 'Friday',
        '30303': 'Saturday',
        '30304': 'Sunday',
        '30305': 'Monday',
        '30306': 'Tuesday',
        '30307': 'Wednesday',
        '30308': 'Thursday',
        '30309': 'Friday',
        '30310': 'Saturday',
        '30311': 'Sunday',
        '30312': 'Monday',
        '30313': 'Tuesday',
        '30314': 'Wednesday',
        '30315': 'Thursday',
        '30316': 'Friday',
        '30317': 'Saturday',
        '30318': 'Sunday',
        '30319': 'Monday',
        '30320': 'Tuesday',
        '30321': 'Wednesday',
        '30322': 'Thursday',
        '30323': 'Friday',
        '30324': 'Saturday',
        '30325': 'Sunday',
        '30326': 'Monday',
        '30327': 'Tuesday',
        '30328': 'Wednesday',
        '30329': 'Thursday',
        '30330': 'Friday',
        '30331': 'Saturday',
        '30332': 'Sunday',
        '30333': 'Monday',
        '30334': 'Tuesday',
        '30335': 'Wednesday',
        '30336': 'Thursday',
        '30337': 'Friday',
        '30338': 'Saturday',
        '30339': 'Sunday',
        '30340': 'Monday',
        '30341': 'Tuesday',
        '30342': 'Wednesday',
        '30343': 'Thursday',
        '30344': 'Friday',
        '30345': 'Saturday',
        '30346': 'Sunday',
        '30347': 'Monday',
        '30348': 'Tuesday',
        '30349': 'Wednesday',
        '30350': 'Thursday'
      };
      return dayMap[zip] || 'Friday'; // Default to Friday for unknown ZIPs
    }

    const deliveryDay = getNextAvailableDay(shippingAddress.postalCode);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order with transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx: any) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: FulfillmentStatus.PENDING,
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          shipping: calculatedShipping,
          total: calculatedTotal,
          notes,
          userId,
          shippingAddressId: finalShippingAddressId,
          shippingZip: shippingAddress.postalCode,
          deliveryDay
        }
      });

      // Create order items
      const orderItems = await Promise.all(
        items.map((item: any) =>
          tx.orderItem.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              orderId: newOrder.id,
              productId: item.productId
            }
          })
        )
      );

      // Update product stock levels
      await Promise.all(
        items.map((item: any) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        )
      );

      // Create fulfillment record
      const fulfillment = await tx.fulfillment.create({
        data: {
          fulfillmentType: 'SHIPPING',
          status: FulfillmentStatus.PENDING,
          orderId: newOrder.id,
          etaLabel: prediction?.label || undefined,
          predictedHours: prediction?.baseEstimate || undefined
        }
      });

      return {
        order: newOrder,
        orderItems,
        fulfillment
      };
    });

    // Return success response
    return res.status(400).json({
      message: 'Order created successfully',
      order: {
        id: order.order.id,
        orderNumber: order.order.orderNumber,
        status: order.order.status,
        total: order.order.total,
        createdAt: order.order.createdAt
      },
      items: order.orderItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      fulfillment: {
        id: order.fulfillment.id,
        status: order.fulfillment.status,
        type: order.fulfillment.fulfillmentType
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to process checkout'
    });
  }
});

// GET /api/orders - Get user's orders
router.get('/', requireAuth, requireRole([Role.CUSTOMER]), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.session.userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        fulfillments: {
          select: {
            id: true,
            status: true,
            fulfillmentType: true,
            trackingNumber: true,
            carrier: true,
            estimatedDelivery: true,
            actualDelivery: true,
            notes: true
          }
        },
        shippingAddress: { select: { id: true, address1: true, city: true, state: true, postalCode: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl: item.product.imageUrl
          }
        })),
        fulfillment: order.fulfillments[0] ? {
          id: order.fulfillments[0].id,
          status: order.fulfillments[0].status,
          type: order.fulfillments[0].fulfillmentType,
          trackingNumber: order.fulfillments[0].trackingNumber,
          estimatedDelivery: order.fulfillments[0].estimatedDelivery
        } : undefined,
        shippingAddress: order.shippingAddress ? {
          id: order.shippingAddress.id,
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          address1: order.shippingAddress.address1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode
        } : undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/history - Get customer order history
router.get('/history', requireAuth, requireRole([Role.CUSTOMER]), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: {
              select: { 
                id: true,
                name: true, 
                imageUrl: true,
                price: true
              }
            }
          }
        },
                 fulfillments: {
           orderBy: { createdAt: 'desc' },
           take: 1,
           select: {
             id: true,
             status: true,
             fulfillmentType: true,
             trackingNumber: true,
             carrier: true,
             estimatedDelivery: true,
             actualDelivery: true,
             notes: true
           }
         },
        shippingAddress: { select: { id: true, address1: true, city: true, state: true, postalCode: true } }
      }
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      shippingZip: order.shippingZip,
      deliveryDay: order.deliveryDay,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          price: item.product.price
        }
      })),
      fulfillment: order.fulfillments[0] ? {
        id: order.fulfillments[0].id,
        status: order.fulfillments[0].status,
        type: order.fulfillments[0].fulfillmentType,
        trackingNumber: order.fulfillments[0].trackingNumber,
        carrier: order.fulfillments[0].carrier,
        estimatedDelivery: order.fulfillments[0].estimatedDelivery,
        actualDelivery: order.fulfillments[0].actualDelivery,
        notes: order.fulfillments[0].notes
      } : undefined,
      shippingAddress: order.shippingAddress ? {
        id: order.shippingAddress.id,
        firstName: order.shippingAddress.firstName,
        lastName: order.shippingAddress.lastName,
        company: order.shippingAddress.company,
        address1: order.shippingAddress.address1,
        address2: order.shippingAddress.address2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phone
      } : undefined
    }));

    return res.json({
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch order history'
    });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', requireAuth, requireRole([Role.CUSTOMER]), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.session.userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        fulfillments: {
          select: {
            id: true,
            status: true,
            fulfillmentType: true,
            trackingNumber: true,
            carrier: true,
            estimatedDelivery: true,
            actualDelivery: true,
            notes: true
          }
        },
        shippingAddress: { select: { id: true, address1: true, city: true, state: true, postalCode: true } }
      }
    });

    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist or does not belong to you'
      });
    }

    return res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        notes: order.notes,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            imageUrl: item.product.imageUrl,
            price: item.product.price
          }
        })),
        fulfillment: order.fulfillments[0] ? {
          id: order.fulfillments[0].id,
          status: order.fulfillments[0].status,
          type: order.fulfillments[0].fulfillmentType,
          trackingNumber: order.fulfillments[0].trackingNumber,
          carrier: order.fulfillments[0].carrier,
          estimatedDelivery: order.fulfillments[0].estimatedDelivery,
          actualDelivery: order.fulfillments[0].actualDelivery,
          notes: order.fulfillments[0].notes
        } : undefined,
        shippingAddress: order.shippingAddress ? {
          id: order.shippingAddress.id,
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          company: order.shippingAddress.company,
          address1: order.shippingAddress.address1,
          address2: order.shippingAddress.address2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone
        } : undefined
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch order'
    });
  }
});

// POST /api/orders/:id/confirm-delivery - Confirm delivery with optional photo
router.post('/:id/confirm-delivery', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { photoUrl } = req.body;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        fulfillments: { select: { id: true, status: true, trackingNumber: true, carrier: true, estimatedDelivery: true, actualDelivery: true, notes: true } },
        user: {
          select: {
            email: true,
            profile: {
              select: {
                phone: true
              }
            }
          }
        }
      }
    });
    
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    // Update order delivery status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        deliveryStatus: FulfillmentStatus.DELIVERED,
        deliveryTimestamp: new Date(),
        deliveryPhotoUrl: photoUrl || undefined,
        status: FulfillmentStatus.DELIVERED,
        deliveredAt: new Date()
      }
    });

    // Update fulfillment status
    if (order.fulfillments.length > 0) {
      await prisma.fulfillment.updateMany({
        where: {
          orderId: id
        },
        data: {
          status: FulfillmentStatus.DELIVERED,
          actualDelivery: new Date()
        }
      });
    }

    // Send customer notifications
    console.log(`📧 Customer notification sent for order ${order.orderNumber} to ${order.user.email}`);
    if (order.user.profile?.phone) {
      // Send SMS notification via Twilio
      await sendDeliveryConfirmation(order.user.profile.phone, order.orderNumber);
    }

    return res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        deliveryStatus: updatedOrder.deliveryStatus,
        deliveryTimestamp: updatedOrder.deliveryTimestamp,
        deliveryPhotoUrl: updatedOrder.deliveryPhotoUrl,
        status: updatedOrder.status,
        deliveredAt: updatedOrder.deliveredAt
      }
    });
  } catch (error) {
    console.error('Error confirming delivery:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to confirm delivery'
    });
  }
});

// POST /api/orders/:id/send-eta - Send delivery ETA notification
router.post('/:id/send-eta', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { timeWindow } = req.body;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                phone: true
              }
            }
          }
        },
        vendor: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    if (!order.user.profile?.phone) {
      return res.status(400).json({
        error: 'No phone number',
        message: 'Customer does not have a phone number for SMS notifications'
      });
    }

    // Send ETA notification via Twilio
    await sendDeliveryETAWithTime(
      order.user.profile.phone,
      order.vendor?.name || 'Rose Creek',
      timeWindow || '3-5 PM',
      order.orderNumber
    );

    return res.json({
      success: true,
      message: 'Delivery ETA notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending ETA notification:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to send ETA notification'
    });
  }
});

// GET /api/orders/:id/receipt - Generate and serve PDF receipt
router.get('/:id/receipt', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order with all necessary relations
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                description: true
              }
            }
          }
        },
        vendor: {
          select: {
            name: true,
            email: true
          }
        },
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        },
        shippingAddress: {
          select: {
            address1: true,
            city: true,
            state: true,
            postalCode: true
          }
        }
      }
    });

    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    // Verify user has access to this order
    if (req.session.userId !== order.userId && req.session.user.role !== 'ADMIN') {
      return res.status(400).json({
        error: 'Unauthorized',
        message: 'You can only view receipts for your own orders'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${order.orderNumber}.pdf"`);
    doc.pipe(res);

    // Add header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('Craved Artisan', { align: 'center' });
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Delivery Receipt', { align: 'center' });
    
    doc.moveDown(0.5);

    // Add order details
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Order Information');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Order Number: ${order.orderNumber}`)
       .text(`Order Date: ${order.createdAt.toLocaleDateString()}`)
       .text(`Status: ${order.status}`)
       .text(`Delivery Status: ${order.deliveryStatus || FulfillmentStatus.PENDING}`);
    
    if (order.deliveryTimestamp) {
      doc.text(`Delivered: ${order.deliveryTimestamp.toLocaleDateString()} at ${order.deliveryTimestamp.toLocaleTimeString()}`);
    }
    
    doc.moveDown(0.5);

    // Add vendor information
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Vendor Information');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Vendor: ${order.vendor?.name || 'Unknown'}`)
       .text(`Email: ${order.vendor?.email || 'N/A'}`);
    
    doc.moveDown(0.5);

    // Add customer information
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Customer Information');
    
    const customerName = order.user.profile 
      ? `${order.user.profile.firstName || ''} ${order.user.profile.lastName || ''}`.trim()
      : order.user.email;
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Customer: ${customerName}`)
       .text(`Email: ${order.user.email}`)
       .text(`Phone: ${order.user.profile?.phone || 'N/A'}`);
    
    doc.moveDown(0.5);

    // Add shipping address
    if (order.shippingAddress) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Shipping Address');
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${order.shippingAddress.street}`)
         .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`);
      
      doc.moveDown(0.5);
    }

    // Add order items
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Order Items');
    
    doc.moveDown(0.25);

    let yPosition = doc.y;
    const itemStartY = yPosition;

    order.orderItems.forEach((item: any, index: any) => {
      const itemName = item.product?.name || `Product ${index + 1}`;
      const itemDescription = item.product?.description || '';
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(itemName);
      
      if (itemDescription) {
        doc.fontSize(8)
           .font('Helvetica')
           .text(itemDescription, { indent: 10 });
      }
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Quantity: ${item.quantity}`, { indent: 10 })
         .text(`Price: $${item.price.toFixed(2)}`, { indent: 10 })
         .text(`Subtotal: $${(item.quantity * item.price).toFixed(2)}`, { indent: 10 });
      
      doc.moveDown(0.25);
    });

    // Add totals
    doc.moveDown(0.5);
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Order Summary');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Subtotal: $${order.subtotal.toFixed(2)}`)
       .text(`Tax: $${order.tax.toFixed(2)}`)
       .text(`Shipping: $${order.shipping.toFixed(2)}`)
       .text(`Total: $${order.total.toFixed(2)}`, { continued: false });
    
    doc.moveDown(0.5);

    // Add notes if any
    if (order.notes) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Order Notes');
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(order.notes);
      
      doc.moveDown(0.5);
    }

    // Add footer
    doc.fontSize(8)
       .font('Helvetica')
       .text('Thank you for choosing Craved Artisan!', { align: 'center' })
       .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });

    // End the document
    doc.end();
  } catch (error) {
    console.error('Error generating receipt:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to generate receipt'
    });
  }
});

export default router; 
