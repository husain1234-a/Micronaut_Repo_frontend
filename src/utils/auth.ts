import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

interface UserData {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface DecodedToken {
  sub: string;
  userId: string;
  email: string;
  roles: string;
  firstname?: string;
  lastname?: string;
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
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log('User data stored successfully');
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

export const getUser = (): UserData | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

export const removeUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
    console.log('User data removed successfully');
  } catch (error) {
    console.error('Failed to remove user data:', error);
  }
};

export const handleLoginResponse = (response: any) => {
  console.log('Login Response:', response);
  
  if (!response.accessToken) {
    console.error('No access token in response');
    throw new Error('Invalid login response');
  }
  
  const { accessToken, userId, email, role, firstname, lastname } = response;
  
  // Set token
  setToken(accessToken);
  
  // Set user data with proper field mapping
  const userData: UserData = {
    id: userId,
    email,
    role,
    firstName: firstname || undefined,
    lastName: lastname || undefined
  };
  
  console.log('User Data to be stored:', userData);
  setUser(userData);
  
  return userData;
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
  removeToken();
  removeUser();
  console.log('Logout completed');
}; 