import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
};

type LoginData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("AuthProvider mounted");
    setInitialized(true);
  }, []);

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const { data, error } = await apiClient.get<SelectUser>('/api/user');

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

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login mutation called with:", credentials);
      const { data, error } = await apiClient.post<SelectUser>('/api/login', credentials);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      console.log("Register mutation called with:", data);
      const { data: userData, error } = await apiClient.post<SelectUser>('/api/register', data);

      if (error) {
        throw error;
      }

      return userData;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Registration successful:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to CareUnity, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Logout mutation called");
      const { error } = await apiClient.post('/api/logout');

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Logout successful");
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions with simpler API
  const login = async (credentials: LoginData) => {
    await loginMutation.mutateAsync(credentials);
    await refetch();
  };

  const register = async (data: InsertUser) => {
    await registerMutation.mutateAsync(data);
    await refetch();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    await refetch();
  };

  const value = {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
    login,
    logout,
    register,
  };

  console.log("AuthProvider rendering with value:", value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
