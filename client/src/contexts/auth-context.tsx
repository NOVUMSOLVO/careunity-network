/**
 * Authentication context for the web app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Types
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  
  // Initialize the provider
  useEffect(() => {
    console.log('AuthProvider mounted');
    setInitialized(true);
  }, []);
  
  // Fetch the current user
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const { data, error } = await apiClient.get<User>('/api/user');
      
      if (error) {
        if (error.status === 401) {
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: initialized,
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data, error } = await apiClient.post<User>('/api/login', credentials);
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData?.fullName || 'User'}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const { data: userData, error } = await apiClient.post<User>('/api/register', data);
      
      if (error) {
        throw error;
      }
      
      return userData;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: 'Registration successful',
        description: `Welcome to CareUnity, ${userData?.fullName || 'User'}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.post('/api/logout');
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
    await refetch();
  };
  
  // Register function
  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
    await refetch();
  };
  
  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
    await refetch();
  };
  
  // Context value
  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
