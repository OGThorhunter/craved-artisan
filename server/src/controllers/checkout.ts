import Stripe from 'stripe';
import prisma from '/prisma';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-12-18.acacia' 
});

// Commission rate (2%)
const COMMISSION_RATE = 0.02;

interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
      images?: string[];
    };
    unit_amount: number;
  };
  quantity: number;
}

interface CheckoutSessionData {
  orderId: string;
  customerEmail: string;
  lineItems: LineItem[];
  totalAmount: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create Stripe Checkout Session with 2% application fee
 * Automatically transfers funds to vendor after successful payment
 */
export const createCheckoutSession = async (req: any, res: any) => {
  try {
    const { orderId, customerEmail, lineItems, totalAmount, currency = 'usd', successUrl, cancelUrl } = req.body;

    // Validate required fields
    if (!orderId || !customerEmail || !lineItems || !totalAmount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'orderId, customerEmail, lineItems, and totalAmount are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            product: {
              include: {
                vendorProfile: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    if (order.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only create checkout sessions for your own orders'
      });
    }

    // Verify all vendors are connected to Stripe
    const vendorsNotConnected = order.orderItems.filter(item => 
      !item.product.vendorProfile.stripeAccountId
    );

    if (vendorsNotConnected.length > 0) {
      return res.status(400).json({
        error: 'Vendors not connected',
        message: 'Some vendors are not connected to Stripe. Please contact support.',
        vendors: vendorsNotConnected.map(item => ({
          productId: item.product.id,
          vendorId: item.product.vendorProfile.id,
          vendorName: item.product.vendorProfile.storeName,
        }))
      });
    }

    // Calculate application fee (2% of total amount)
    const applicationFeeAmount = Math.round(totalAmount * COMMISSION_RATE);

    // For single vendor orders, use direct transfer
    const uniqueVendors = [...new Set(order.orderItems.map(item => item.product.vendorProfile.id))];
    
    if (uniqueVendors.length === 1) {
      // Single vendor order - use transfer_data
      const vendorProfile = order.orderItems[0].product.vendorProfile;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: customerEmail,
        success_url: successUrl || `${process.env.CLIENT_URL}/orders/${orderId}/success`,
        cancel_url: cancelUrl || `${process.env.CLIENT_URL}/orders/${orderId}/cancel`,
        metadata: {
          orderId: orderId,
          orderNumber: order.orderNumber,
          customerId: order.userId,
        },
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          transfer_data: {
            destination: vendorProfile.stripeAccountId,
          },
          metadata: {
            orderId: orderId,
            vendorId: vendorProfile.id,
            commissionAmount: applicationFeeAmount.toString(),
            vendorPayoutAmount: (totalAmount - applicationFeeAmount).toString(),
          },
        },
      });

      // Update order with session info
      await prisma.order.update({
        where: { id: orderId },
        data: {
          stripePaymentIntentId: session.payment_intent as string,
          commissionAmount: applicationFeeAmount,
          vendorPayoutAmount: totalAmount - applicationFeeAmount,
        },
      });

      res.json({
        sessionId: session.id,
        sessionUrl: session.url,
        applicationFeeAmount,
        vendorPayoutAmount: totalAmount - applicationFeeAmount,
        commissionRate: COMMISSION_RATE,
        message: 'Checkout session created successfully'
      });

    } else {
      // Multi-vendor order - handle manually after payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: customerEmail,
        success_url: successUrl || `${process.env.CLIENT_URL}/orders/${orderId}/success`,
        cancel_url: cancelUrl || `${process.env.CLIENT_URL}/orders/${orderId}/cancel`,
        metadata: {
          orderId: orderId,
          orderNumber: order.orderNumber,
          customerId: order.userId,
          multiVendor: 'true',
        },
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          metadata: {
            orderId: orderId,
            commissionAmount: applicationFeeAmount.toString(),
            multiVendor: 'true',
          },
        },
      });

      // Update order with session info
      await prisma.order.update({
        where: { id: orderId },
        data: {
          stripePaymentIntentId: session.payment_intent as string,
          commissionAmount: applicationFeeAmount,
        },
      });

      res.json({
        sessionId: session.id,
        sessionUrl: session.url,
        applicationFeeAmount,
        commissionRate: COMMISSION_RATE,
        multiVendor: true,
        message: 'Checkout session created successfully (multi-vendor order)'
      });
    }

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Checkout session creation failed',
      message: 'Unable to create checkout session'
    });
  }
};

/**
 * Process multi-vendor order transfers after successful payment
 */
export const processMultiVendorTransfers = async (req: any, res: any) => {
  try {
    const { orderId } = req.params;

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                vendorProfile: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    if (order.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only process transfers for your own orders'
      });
    }

    if (!order.stripePaymentIntentId) {
      return res.status(400).json({
        error: 'No payment intent',
        message: 'Order does not have a payment intent'
      });
    }

    // Get payment intent to verify it was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not completed',
        message: 'Payment intent is not in succeeded status'
      });
    }

    // Group order items by vendor
    const vendorGroups = order.orderItems.reduce((groups, item) => {
      const vendorId = item.product.vendorProfile.id;
      if (!groups[vendorId]) {
        groups[vendorId] = {
          vendor: item.product.vendorProfile,
          items: [],
          totalAmount: 0,
        };
      }
      groups[vendorId].items.push(item);
      groups[vendorId].totalAmount += item.price * item.quantity;
      return groups;
    }, {} as Record<string, any>);

    // Process transfers for each vendor
    const transfers = [];
    for (const [vendorId, group] of Object.entries(vendorGroups)) {
      const vendorAmount = group.totalAmount;
      const commissionAmount = Math.round(vendorAmount * COMMISSION_RATE);
      const vendorPayoutAmount = vendorAmount - commissionAmount;

      const transfer = await stripe.transfers.create({
        amount: vendorPayoutAmount,
        currency: 'usd',
        destination: group.vendor.stripeAccountId,
        source_transaction: paymentIntent.latest_charge as string,
        metadata: {
          orderId: orderId,
          vendorId: vendorId,
          commissionAmount: commissionAmount.toString(),
          vendorPayoutAmount: vendorPayoutAmount.toString(),
        },
      });

      transfers.push({
        vendorId,
        vendorName: group.vendor.storeName,
        amount: vendorAmount,
        commissionAmount,
        vendorPayoutAmount,
        transferId: transfer.id,
      });
    }

    // Update order with transfer information
    await prisma.order.update({
      where: { id: orderId },
      data: {
        stripeTransferId: transfers.map(t => t.transferId).join(','),
        vendorPayoutAmount: transfers.reduce((sum, t) => sum + t.vendorPayoutAmount, 0),
      },
    });

    res.json({
      orderId,
      transfers,
      totalTransfers: transfers.length,
      totalVendorPayout: transfers.reduce((sum, t) => sum + t.vendorPayoutAmount, 0),
      message: 'Multi-vendor transfers processed successfully'
    });

  } catch (error) {
    console.error('Error processing multi-vendor transfers:', error);
    res.status(500).json({
      error: 'Transfer processing failed',
      message: 'Unable to process vendor transfers'
    });
  }
};

/**
 * Get checkout session status
 */
export const getCheckoutSessionStatus = async (req: any, res: any) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });

  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({
      error: 'Session retrieval failed',
      message: 'Unable to retrieve checkout session status'
    });
  }
};

/**
 * Calculate commission breakdown for order
 */
export const calculateCommissionBreakdown = async (req: any, res: any) => {
  try {
    const { orderId } = req.params;

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                vendorProfile: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    if (order.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only view commission breakdown for your own orders'
      });
    }

    // Calculate total order amount
    const totalAmount = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);
    const vendorPayoutAmount = totalAmount - commissionAmount;

    // Group by vendor for breakdown
    const vendorBreakdown = order.orderItems.reduce((groups, item) => {
      const vendorId = item.product.vendorProfile.id;
      const vendorName = item.product.vendorProfile.storeName;
      
      if (!groups[vendorId]) {
        groups[vendorId] = {
          vendorId,
          vendorName,
          items: [],
          subtotal: 0,
          commissionAmount: 0,
          vendorPayoutAmount: 0,
        };
      }
      
      const itemTotal = item.price * item.quantity;
      groups[vendorId].items.push({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
      });
      groups[vendorId].subtotal += itemTotal;
      
      return groups;
    }, {} as Record<string, any>);

    // Calculate commission for each vendor
    Object.values(vendorBreakdown).forEach((vendor: any) => {
      vendor.commissionAmount = Math.round(vendor.subtotal * COMMISSION_RATE);
      vendor.vendorPayoutAmount = vendor.subtotal - vendor.commissionAmount;
    });

    res.json({
      orderId,
      orderNumber: order.orderNumber,
      totalAmount,
      commissionAmount,
      vendorPayoutAmount,
      commissionRate: COMMISSION_RATE,
      vendorBreakdown: Object.values(vendorBreakdown),
      summary: {
        totalItems: order.orderItems.length,
        uniqueVendors: Object.keys(vendorBreakdown).length,
        averageCommission: commissionAmount / Object.keys(vendorBreakdown).length,
      }
    });

  } catch (error) {
    console.error('Error calculating commission breakdown:', error);
    res.status(500).json({
      error: 'Commission calculation failed',
      message: 'Unable to calculate commission breakdown'
    });
  }
}; 