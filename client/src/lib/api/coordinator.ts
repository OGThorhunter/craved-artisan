import { api } from '../http';

/**
 * Event Coordinator API endpoints
 */

export async function getMyEvents() {
  const { data } = await api.get('/event-coordinator/events');
  return data;
}

export async function getEventApplications(eventId: string) {
  const { data } = await api.get(`/event-coordinator/events/${eventId}/applications`);
  return data;
}

export async function getEventInventory(eventId: string) {
  const { data } = await api.get(`/event-coordinator/events/${eventId}/inventory`);
  return data;
}

