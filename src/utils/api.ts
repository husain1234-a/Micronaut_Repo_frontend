// import { getToken } from './auth';

// const API_BASE_URL = 'http://localhost:8080/api';

// interface ApiOptions extends RequestInit {
//   requiresAuth?: boolean;
// }

// export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
//   const { requiresAuth = true, ...fetchOptions } = options;
  
//   console.log("=== API CALL DEBUG ===")
//   console.log("Endpoint:", endpoint)
//   console.log("Full URL:", `${API_BASE_URL}${endpoint}`)
//   console.log("Method:", fetchOptions.method || 'GET')
//   console.log("Options:", fetchOptions)
  
//   const headers = new Headers({
//     'Content-Type': 'application/json',
//     ...(fetchOptions.headers as Record<string, string> || {})
//   });

//   if (requiresAuth) {
//     const token = getToken();
//     if (!token) {
//       console.error('No authentication token found');
//       window.location.href = '/login';
//       throw new Error('No authentication token found');
//     }
//     headers.set('Authorization', `Bearer ${token}`);
//     console.log("Auth token present:", !!token)
//   }

//   console.log("Request headers:", Object.fromEntries(headers.entries()))
  
//   if (fetchOptions.body) {
//     console.log("Request body:", fetchOptions.body)
//   }

//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       ...fetchOptions,
//       headers
//     });

//     console.log("Response status:", response.status)
//     console.log("Response status text:", response.statusText)
//     console.log("Response headers:", Object.fromEntries(response.headers.entries()))

//     // Always extract text first
//     const text = await response.text();

//     // Handle empty response (204 or no content) for both success and error
//     if (response.status === 204) {
//       console.log("No content (204), returning undefined");
//       return undefined as T;
//     }
//     if (!text) {
//       console.log("Empty response body, returning undefined");
//       return undefined as T;
//     }

//     if (!response.ok) {
//       console.error("=== API ERROR RESPONSE ===")
//       console.error("Status:", response.status)
//       console.error("Status text:", response.statusText)
//       let errorData = {};
//       try {
//         console.error("Raw response text:", text);
//         if (text) {
//           errorData = JSON.parse(text);
//           console.error("Parsed error data:", errorData);
//         }
//       } catch (parseError) {
//         console.error("Failed to parse error response:", parseError);
//       }
//       if (response.status === 401) {
//         console.error('Unauthorized access');
//         window.location.href = '/login';
//         throw new Error('Unauthorized');
//       }
//       const errorMessage = (errorData as any).message || (errorData as any).error || `API Error: ${response.statusText}`;
//       console.error("Final error message:", errorMessage);
//       console.error("=== END API ERROR RESPONSE ===")
//       throw new Error(errorMessage);
//     }

//     // If not empty, parse JSON
//     const responseData = JSON.parse(text);
//     console.log("Response data:", responseData)
//     console.log("=== END API CALL DEBUG ===")
//     return responseData;
//   } catch (error) {
//     console.error("=== API CALL FAILED ===")
//     console.error('API call failed:', error as any);
//     console.error('Error type:', typeof error);
//     console.error('Error constructor:', (error as any).constructor?.name);
//     if (error instanceof Error) {
//       console.error('Error name:', error.name);
//       console.error('Error message:', error.message);
//       console.error('Error stack:', error.stack);
//     }
//     console.error("=== END API CALL FAILED ===")
//     throw error;
//   }
// } 

import { getToken } from './auth';


const SERVICE_ENDPOINTS = {
  USER_SERVICE: 'http://localhost:8081',      // User Management Service
  NOTIFICATION_SERVICE: 'http://localhost:9000', // Notification Service
 
};

// Service route mapping
const SERVICE_ROUTES = {
  // User Management routes
  '/users': 'USER_SERVICE',
  '/auth': 'USER_SERVICE',
  '/login': 'USER_SERVICE',
  
  // Notification routes
  '/notifications': 'NOTIFICATION_SERVICE',
};

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  service?: keyof typeof SERVICE_ENDPOINTS; // Allow explicit service specification
}

function getServiceUrl(endpoint: string, explicitService?: keyof typeof SERVICE_ENDPOINTS): string {
  // If service is explicitly specified, use it
  if (explicitService) {
    return SERVICE_ENDPOINTS[explicitService];
  }

  // Auto-detect service based on endpoint
  for (const [route, service] of Object.entries(SERVICE_ROUTES)) {
    if (endpoint.startsWith(route)) {
      return SERVICE_ENDPOINTS[service as keyof typeof SERVICE_ENDPOINTS];
    }
  }
  
  // Fallback to user service (or you could throw an error)
  console.warn(`No service mapping found for endpoint: ${endpoint}. Using USER_SERVICE as fallback.`);
  return SERVICE_ENDPOINTS.USER_SERVICE;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { requiresAuth = true, service, ...fetchOptions } = options;
  
  // Get the appropriate service URL
  const baseUrl = getServiceUrl(endpoint, service);
  const fullUrl = `${baseUrl}/api${endpoint}`;
  
  console.log("=== API CALL DEBUG ===")
  console.log("Endpoint:", endpoint)
  console.log("Service:", service || 'auto-detected')
  console.log("Base URL:", baseUrl)
  console.log("Full URL:", fullUrl)
  console.log("Method:", fetchOptions.method || 'GET')
  console.log("Options:", fetchOptions)
  
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
    console.log("Auth token present:", !!token)
  }

  console.log("Request headers:", Object.fromEntries(headers.entries()))
  
  if (fetchOptions.body) {
    console.log("Request body:", fetchOptions.body)
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers
    });

    console.log("Response status:", response.status)
    console.log("Response status text:", response.statusText)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    // Always extract text first
    const text = await response.text();

    // Handle empty response (204 or no content) for both success and error
    if (response.status === 204) {
      console.log("No content (204), returning undefined");
      return undefined as T;
    }
    if (!text) {
      console.log("Empty response body, returning undefined");
      return undefined as T;
    }

    if (!response.ok) {
      console.error("=== API ERROR RESPONSE ===")
      console.error("Status:", response.status)
      console.error("Status text:", response.statusText)
      let errorData = {};
      try {
        console.error("Raw response text:", text);
        if (text) {
          errorData = JSON.parse(text);
          console.error("Parsed error data:", errorData);
        }
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
      }
      if (response.status === 401) {
        console.error('Unauthorized access');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      const errorMessage = (errorData as any).message || (errorData as any).error || `API Error: ${response.statusText}`;
      console.error("Final error message:", errorMessage);
      console.error("=== END API ERROR RESPONSE ===")
      throw new Error(errorMessage);
    }

    // If not empty, parse JSON
    const responseData = JSON.parse(text);
    console.log("Response data:", responseData)
    console.log("=== END API CALL DEBUG ===")
    return responseData;
  } catch (error) {
    console.error("=== API CALL FAILED ===")
    console.error('API call failed:', error as any);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', (error as any).constructor?.name);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error("=== END API CALL FAILED ===")
    throw error;
  }
}

// Convenience functions for specific services
export const userApi = <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => 
  api<T>(endpoint, { ...options, service: 'USER_SERVICE' });

export const notificationApi = <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => 
  api<T>(endpoint, { ...options, service: 'NOTIFICATION_SERVICE' });

// Health check functions for each service
export const checkServiceHealth = async (service: keyof typeof SERVICE_ENDPOINTS): Promise<boolean> => {
  try {
    const response = await fetch(`${SERVICE_ENDPOINTS[service]}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Get all service statuses
export const getServiceStatuses = async (): Promise<Record<string, boolean>> => {
  const statuses: Record<string, boolean> = {};
  
  for (const service of Object.keys(SERVICE_ENDPOINTS) as Array<keyof typeof SERVICE_ENDPOINTS>) {
    statuses[service] = await checkServiceHealth(service);
  }
  
  return statuses;
};