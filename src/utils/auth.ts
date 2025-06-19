import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

interface UserData {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface DecodedToken {
  sub: string;
  userId: string;
  email: string;
  roles: string;
  firstname: string;
  lastname: string;
  exp?: number;
  iat?: number;
}

export const setToken = (token: string) => {
  if (!token) {
    console.error('Attempted to set empty token');
    return;
  }
  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('Token stored successfully');
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log('No token found in storage');
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    console.log('Token removed successfully');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

export const setUser = (userData: UserData) => {
  console.log('💾 Attempting to store user data...');
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log('✅ User data stored successfully:', userData);
  } catch (error) {
    console.error('❌ Failed to store user data:', error);
  }
};

export const getUser = (): UserData | null => {
  console.log('🔍 Attempting to retrieve user data...');
  try {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      console.log('✅ User data retrieved successfully');
      return JSON.parse(userData);
    }
    console.log('ℹ️ No user data found in storage');
    return null;
  } catch (error) {
    console.error('❌ Error retrieving user data:', error);
    return null;
  }
};

export const removeUser = () => {
  console.log('🗑️ Attempting to remove user data...');
  try {
    localStorage.removeItem(USER_KEY);
    console.log('✅ User data removed successfully');
  } catch (error) {
    console.error('❌ Failed to remove user data:', error);
  }
};

export const handleLoginResponse = (response: any) => {
  console.log('📥 Processing login response...');
  
  if (!response.accessToken) {
    console.error('❌ No access token in response');
    throw new Error('Invalid login response');
  }
  
  // Debug log to see exact response structure
  console.log('🔍 Raw response:', JSON.stringify(response, null, 2));
  
  // Extract all fields from response
  const { 
    accessToken, 
    userId, 
    email, 
    role, 
    firstName, 
    lastName 
  } = response;

  // Debug log to see extracted values
  console.log('🔑 Extracted values:', {
    accessToken: accessToken ? 'present' : 'missing',
    userId,
    email,
    role,
    firstName,
    lastName
  });
  
  try {
    // Set token in localStorage
    console.log('🔒 Storing access token...');
    localStorage.setItem('token', accessToken);
    console.log('✅ Access token stored in localStorage');

    // Set token in cookie for persistence
    console.log('🍪 Setting token in cookie...');
    Cookies.set('token', accessToken, { 
      expires: 7, // 7 days
      secure: true,
      sameSite: 'strict'
    });
    console.log('✅ Token stored in cookie');
    
    // Set user data with proper field mapping
    const userData = {
      id: userId,
      email,
      role,
      firstName: firstName || undefined,
      lastName: lastName || undefined
    };
    
    // Debug log to see final user data
    console.log('👤 Final user data to be stored:', JSON.stringify(userData, null, 2));
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Verify the stored data
    const storedData = localStorage.getItem('user');
    console.log('🔍 Verified stored data:', storedData);
    
    return userData;
  } catch (error) {
    console.error('❌ Error storing authentication data:', error);
    // Clean up any partial data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token');
    throw new Error('Failed to store authentication data');
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    console.log('No token found for authentication check');
    return false;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    if (!decoded.exp) {
      console.warn('Token has no expiration time');
      return true;
    }
    
    const isValid = decoded.exp > currentTime;
    if (!isValid) {
      console.log('Token has expired');
      removeToken();
      removeUser();
    }
    
    return isValid;
  } catch (error) {
    console.error('Error validating token:', error);
    removeToken();
    removeUser();
    return false;
  }
};

export const logout = () => {
  console.log('🚪 Starting logout process...');
  removeToken();
  removeUser();
  console.log('✅ Logout completed successfully');
}; 