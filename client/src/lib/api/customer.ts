import { api } from '../http';

/**
 * Customer API endpoints
 */

export async function getCustomerProfile() {
  const { data } = await api.get('/customer/profile');
  // Backend returns { success: true, customer: {...} }
  return data.customer || data;
}

export async function getCustomerOrders() {
  const { data } = await api.get('/customer/orders');
  return data;
}

export async function getCart() {
  const { data } = await api.get('/customer/cart');
  return data;
}

export async function updateCart(payload: any) {
  const { data } = await api.post('/customer/cart', payload);
  return data;
}

