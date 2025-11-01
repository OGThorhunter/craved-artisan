import { api } from '../http';

/**
 * Admin API endpoints
 */

export async function getAdminOverview() {
  const { data } = await api.get('/admin/overview');
  return data;
}

