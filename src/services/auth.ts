import { api } from '@/utils/api';
import { handleLoginResponse } from '@/utils/auth';

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
  console.log('Login Request:', credentials); // Debug log
  
  const response = await api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    requiresAuth: false
  });
  
  console.log('Login Response from API:', response); // Debug log
  return handleLoginResponse(response);
};

export const logout = async () => {
  await api('/auth/logout', {
    method: 'POST'
  });
}; 