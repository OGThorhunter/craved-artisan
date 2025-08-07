import axios from 'axios';

export interface AnalyticsEvent {
  vendor_id: string;
  user_id?: string;
  product_id?: string;
  order_id?: string;
  event_type: 'page_view' | 'add_to_cart' | 'checkout_started' | 'purchase_completed' | 'cart_abandoned';
  event_data?: Record<string, any>;
  session_id?: string;
}

class AnalyticsEventService {
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async trackEvent(event: Omit<AnalyticsEvent, 'session_id'>): Promise<void> {
    try {
      const fullEvent: AnalyticsEvent = {
        ...event,
        session_id: this.sessionId
      };

      await axios.post('/api/analytics/events', fullEvent);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  // Track page view
  async trackPageView(vendorId: string, userId?: string, productId?: string): Promise<void> {
    await this.trackEvent({
      vendor_id: vendorId,
      user_id: userId,
      product_id: productId,
      event_type: 'page_view',
      event_data: {
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      }
    });
  }

  // Track add to cart
  async trackAddToCart(vendorId: string, userId: string, productId: string, quantity: number, price: number): Promise<void> {
    await this.trackEvent({
      vendor_id: vendorId,
      user_id: userId,
      product_id: productId,
      event_type: 'add_to_cart',
      event_data: {
        quantity,
        price,
        total_value: quantity * price
      }
    });
  }

  // Track checkout started
  async trackCheckoutStarted(vendorId: string, userId: string, orderId: string, totalAmount: number): Promise<void> {
    await this.trackEvent({
      vendor_id: vendorId,
      user_id: userId,
      order_id: orderId,
      event_type: 'checkout_started',
      event_data: {
        total_amount: totalAmount,
        checkout_method: 'online'
      }
    });
  }

  // Track purchase completed
  async trackPurchaseCompleted(vendorId: string, userId: string, orderId: string, totalAmount: number): Promise<void> {
    await this.trackEvent({
      vendor_id: vendorId,
      user_id: userId,
      order_id: orderId,
      event_type: 'purchase_completed',
      event_data: {
        total_amount: totalAmount,
        payment_method: 'stripe'
      }
    });
  }

  // Track cart abandonment
  async trackCartAbandoned(vendorId: string, userId: string, cartValue: number): Promise<void> {
    await this.trackEvent({
      vendor_id: vendorId,
      user_id: userId,
      event_type: 'cart_abandoned',
      event_data: {
        cart_value: cartValue,
        abandonment_reason: 'user_left_site'
      }
    });
  }

  // Get session ID for external use
  getSessionId(): string {
    return this.sessionId;
  }

  // Reset session (useful for testing or user logout)
  resetSession(): void {
    localStorage.removeItem('analytics_session_id');
    this.sessionId = this.getOrCreateSessionId();
  }
}

// Create singleton instance
export const analyticsEvents = new AnalyticsEventService();

// React hook for easy integration
export const useAnalyticsEvents = () => {
  return {
    trackPageView: analyticsEvents.trackPageView.bind(analyticsEvents),
    trackAddToCart: analyticsEvents.trackAddToCart.bind(analyticsEvents),
    trackCheckoutStarted: analyticsEvents.trackCheckoutStarted.bind(analyticsEvents),
    trackPurchaseCompleted: analyticsEvents.trackPurchaseCompleted.bind(analyticsEvents),
    trackCartAbandoned: analyticsEvents.trackCartAbandoned.bind(analyticsEvents),
    getSessionId: analyticsEvents.getSessionId.bind(analyticsEvents),
    resetSession: analyticsEvents.resetSession.bind(analyticsEvents)
  };
}; 