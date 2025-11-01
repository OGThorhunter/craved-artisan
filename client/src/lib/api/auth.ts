import { api } from '../http';

/**
 * Auth API endpoints
 */

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function signup(payload: {
  email: string;
  password: string;
  role: string;
  name?: string;
}) {
  const { data } = await api.post('/auth/signup', payload);
  return data;
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function logout() {
  const { data } = await api.post('/auth/logout');
  return data;
}

