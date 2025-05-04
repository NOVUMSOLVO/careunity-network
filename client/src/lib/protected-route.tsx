import { Loader2, AlertCircle } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiClient } from "./api-client";
import { useErrorNotification } from "@/hooks/use-notifications";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  // Add any other user fields you need
}

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const showErrorNotification = useErrorNotification();
  const [, setLocation] = useLocation();

  const fetchUser = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    
    try {
      const { data, error } = await apiClient.get<User>('/api/user');
      
      if (error) {
        if (error instanceof Error && error.message !== "Not authenticated") {
          showErrorNotification(
            "Authentication Error",
            error.message || "Failed to check authentication"
          );
        }
        setError(error);
        setUser(null);
        return null;
      }
      
      setUser(data);
      setError(null);
      return data;
    } catch (err: any) {
      console.error('Failed to check authentication:', err);
      setError(err);
      setUser(null);
      
      if (retryCount < 3 && navigator.onLine) {
        setRetryCount(count => count + 1);
        setIsRetrying(true);
      } else if (navigator.onLine) {
        showErrorNotification(
          "Authentication Error",
          "Failed to authenticate after multiple attempts. Please try again later."
        );
      }
      
      return null;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
      setIsRetrying(false);
    }
  };

  // Initial authentication check
  useEffect(() => {
    fetchUser();
    
    // Set up periodic checks for authentication status
    const intervalId = setInterval(() => {
      fetchUser(true); // Silent check
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Retry logic
  useEffect(() => {
    if (isRetrying) {
      const timeoutId = setTimeout(() => {
        fetchUser();
      }, 2000); // Retry after 2 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [isRetrying]);

  // Fallback for offline mode
  useEffect(() => {
    const handleOnline = () => {
      if (!user && error) {
        // Reset retry count and try again when we come back online
        setRetryCount(0);
        fetchUser();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, error]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying your credentials...</p>
        </div>
      </Route>
    );
  }

  if (error && isRetrying) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Retrying authentication...</p>
          <button 
            className="text-primary hover:underline mt-4"
            onClick={() => setLocation("/auth")}
          >
            Go to login
          </button>
        </div>
      </Route>
    );
  }

  if (error) {
    console.error("Authentication check failed:", error);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <ErrorBoundary
        onError={(err) => {
          showErrorNotification(
            "Application Error",
            "Something went wrong in this section. We've recorded the error."
          );
          console.error("Error in protected route:", err);
        }}
      >
        <Component />
      </ErrorBoundary>
    </Route>
  );
}
