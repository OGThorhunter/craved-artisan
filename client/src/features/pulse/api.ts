import { api } from '../../lib/api';
import type { PulsePayload, PulseRange } from './types';

/**
 * Fetch vendor pulse data for the specified time range
 * @param vendorId - The vendor's unique identifier
 * @param range - Time range: 'today', 'week', or 'month'
 * @returns Promise<PulsePayload> - Complete pulse data payload
 */
export async function fetchVendorPulse(
  vendorId: string, 
  range: PulseRange
): Promise<PulsePayload> {
  const { data } = await api.get(`/vendor/${vendorId}/pulse`, { 
    params: { range } 
  });
  return data;
}
