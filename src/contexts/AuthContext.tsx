import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../services/auth';
import { getUser, setUser, removeUser, isAuthenticated } from '../utils/auth';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Starting authentication check...');
      try {
        if (isAuthenticated()) {
          console.log('✅ User is authenticated, fetching user data...');
          const userData = getUser();
          if (userData) {
            console.log('👤 User data retrieved successfully:', userData);
            setUserState(userData);
          } else {
            console.warn('⚠️ No user data found despite valid token');
            removeUser();
          }
        } else {
          console.log('❌ User is not authenticated');
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setError('Authentication check failed');
      } finally {
        console.log('🏁 Authentication check completed');
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔑 Login attempt for user:', email);
    try {
      setError(null);
      setLoading(true);
      console.log('📡 Sending login request to API...');
      const response = await apiLogin({ email, password });
      console.log('✅ Login successful:', response);
      setUserState(response);
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      console.log('🏁 Login process completed');
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout process...');
    try {
      setError(null);
      setLoading(true);
      console.log('📡 Sending logout request to API...');
      await apiLogout();
      removeUser();
      setUserState(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setError(error instanceof Error ? error.message : 'Logout failed');
      throw error;
    } finally {
      console.log('🏁 Logout process completed');
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 