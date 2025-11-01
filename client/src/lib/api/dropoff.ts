import { api } from '../http';

/**
 * Dropoff Manager API endpoints
 */

export async function getDropoffs() {
  const { data } = await api.get('/dropoff/locations');
  return data;
}

