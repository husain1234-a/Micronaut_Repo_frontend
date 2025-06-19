import { api } from '../utils/api';
import { handleLoginResponse } from '../utils/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
}

export const login = async (credentials: LoginCredentials) => {
  console.log('🔑 Attempting login with credentials:', { email: credentials.email });
  try {
    const response = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      requiresAuth: false
    });
    
    // Debug log to see exact response structure
    console.log('🔍 Raw API Response:', JSON.stringify(response, null, 2));
    console.log('🔍 Response type:', typeof response);
    console.log('🔍 Response keys:', Object.keys(response));
    
    return response;
  } catch (error) {
    console.error('❌ Login API error:', error);
    throw error;
  }
};

export const logout = async () => {
  console.log('🚪 Attempting logout...');
  try {
    await api('/auth/logout', {
      method: 'POST'
    });
    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Logout API error:', error);
    throw error;
  }
}; 