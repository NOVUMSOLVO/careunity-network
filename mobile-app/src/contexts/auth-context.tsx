import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');

        if (token) {
          // Get user info
          const { data, error } = await authApi.getCurrentUser();

          if (error) {
            throw error;
          }

          setUser(data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Clear invalid token
        await AsyncStorage.removeItem('auth_token');
        console.error('Failed to get user info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await authApi.login(email, password);

      if (error) {
        setError(error.message);
        throw error;
      }

      const { token, user } = data;

      // Save token
      await AsyncStorage.setItem('auth_token', token);

      setUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      // Call logout endpoint
      const { error } = await authApi.logout();

      if (error) {
        console.error('Logout API call failed:', error);
      }
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', err);
    } finally {
      // Clear token
      await AsyncStorage.removeItem('auth_token');

      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setError(null);
    
    try {
      const { data, error } = await authApi.changePassword(currentPassword, newPassword);
      
      if (error) {
        setError(error.message);
        throw error;
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please try again.');
      throw err;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    changePassword,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
