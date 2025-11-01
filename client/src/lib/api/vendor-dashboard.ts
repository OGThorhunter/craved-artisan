import { api } from '../http';

/**
 * Vendor Dashboard API endpoints
 * For logged-in vendor (dashboard context), not public vendor lookups
 */

export async function getMyVendorProfile() {
  const { data } = await api.get('/vendor/me');
  return data;
}

export async function getMyVendorProducts() {
  const { data } = await api.get('/vendor/products');
  return data;
}

export async function getMyVendorInventory() {
  const { data } = await api.get('/vendor/inventory');
  return data;
}

export async function getMyVendorOrders() {
  const { data } = await api.get('/vendor/orders');
  return data;
}

export async function getMyVendorRecipes() {
  const { data } = await api.get('/vendor/recipes');
  return data;
}

