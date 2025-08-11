export async function http(path: string, init?: RequestInit): Promise<Response> {
  const base = import.meta.env.VITE_API_BASE_URL;
  const url = `${base}${path}`;
  
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  };

  const response = await fetch(url, config);
  
  // Read request ID from response headers
  const requestId = response.headers.get('x-request-id');
  
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    
    // Try to read error body
    let body: any;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    
    throw new Error(JSON.stringify({
      status: response.status,
      requestId,
      body,
    }));
  }
  
  return response;
}
