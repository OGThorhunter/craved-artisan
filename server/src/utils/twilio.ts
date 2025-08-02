import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface DeliveryNotification {
  phone: string;
  message: string;
}

/**
 * Send delivery ETA notification via SMS
 */
export async function sendDeliveryETA(phone: string, message: string): Promise<void> {
  try {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
      console.warn('⚠️ Twilio credentials not configured, skipping SMS notification');
      console.log(`📱 Would send SMS to ${phone}: ${message}`);
      return;
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    console.log(`✅ SMS sent successfully to ${phone}:`, result.sid);
  } catch (error) {
    console.error('❌ Failed to send SMS notification:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Send delivery confirmation notification
 */
export async function sendDeliveryConfirmation(phone: string, orderNumber: string): Promise<void> {
  const message = `📦 Delivered! Your order ${orderNumber} has arrived. Thank you for choosing us!`;
  await sendDeliveryETA(phone, message);
}

/**
 * Send delivery ETA notification with time window
 */
export async function sendDeliveryETAWithTime(
  phone: string, 
  vendorName: string, 
  timeWindow: string,
  orderNumber: string
): Promise<void> {
  const message = `🕒 Delivery ETA: Your order ${orderNumber} from ${vendorName} will arrive between ${timeWindow}`;
  await sendDeliveryETA(phone, message);
}

/**
 * Send batch delivery notification
 */
export async function sendBatchDeliveryNotification(
  phone: string,
  batchInfo: {
    orderNumbers: string[];
    estimatedTime: string;
    vendorName: string;
  }
): Promise<void> {
  const orderList = batchInfo.orderNumbers.join(', ');
  const message = `📦 Batch Delivery: Your orders ${orderList} from ${batchInfo.vendorName} will be delivered around ${batchInfo.estimatedTime}`;
  await sendDeliveryETA(phone, message);
} 