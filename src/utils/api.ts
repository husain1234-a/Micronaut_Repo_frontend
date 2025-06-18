import { getToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/api';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {})
  });

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      console.error('No authentication token found');
      window.location.href = '/login';
      throw new Error('No authentication token found');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Unauthorized access');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
} 
