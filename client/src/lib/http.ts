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

// API object that wraps the http function
export const api = {
  async get(path: string): Promise<{ data: any }> {
    const response = await http(path, { method: 'GET' });
    const data = await response.json();
    return { data };
  },
  
  async post(path: string, body?: any): Promise<{ data: any }> {
    const response = await http(path, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    });
    const data = await response.json();
    return { data };
  },
  
  async put(path: string, body?: any): Promise<{ data: any }> {
    const response = await http(path, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    });
    const data = await response.json();
    return { data };
  },
  
  async delete(path: string): Promise<{ data: any }> {
    const response = await http(path, { method: 'DELETE' });
    const data = await response.json();
    return { data };
  },
  
  async patch(path: string, body?: any): Promise<{ data: any }> {
    const response = await http(path, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    });
    const data = await response.json();
    return { data };
  }
};

// HTTP Client with Response object interface (used by legal service)
export const httpClient = {
  async get(path: string): Promise<Response> {
    return await http(path, { method: 'GET' });
  },
  
  async post(path: string, body?: any): Promise<Response> {
    return await http(path, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    });
  },
  
  async put(path: string, body?: any): Promise<Response> {
    return await http(path, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    });
  },
  
  async delete(path: string): Promise<Response> {
    return await http(path, { method: 'DELETE' });
  },
  
  async patch(path: string, body?: any): Promise<Response> {
    return await http(path, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }
};

// Legacy export for backward compatibility
export const httpJson = {
  async get(path: string): Promise<any> {
    const response = await http(path, { method: 'GET' });
    return await response.json();
  },
  
  async post(path: string, body?: any): Promise<any> {
    const response = await http(path, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    });
    return await response.json();
  },
  
  async put(path: string, body?: any): Promise<any> {
    const response = await http(path, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    });
    return await response.json();
  },
  
  async delete(path: string): Promise<any> {
    const response = await http(path, { method: 'DELETE' });
    return await response.json();
  }
};
