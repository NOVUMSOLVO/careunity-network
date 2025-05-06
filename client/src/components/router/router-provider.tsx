import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { appRoutes, RouteKey, navigateTo, matchRoute } from '@/lib/routes';

// Define router context type
type RouterContextType = {
  currentPath: string;
  navigate: (path: string) => void;
  navigateByKey: (key: RouteKey) => void;
  isActive: (path: string) => boolean;
  isRouteActive: (key: RouteKey) => boolean;
  routes: typeof appRoutes;
};

// Create router context
const RouterContext = createContext<RouterContextType | null>(null);

// Router provider props
interface RouterProviderProps {
  children: ReactNode;
}

/**
 * Router provider that makes routing functionality available throughout the app
 */
export function RouterProvider({ children }: RouterProviderProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Update current path when location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    
    // Listen for our custom route change event
    window.addEventListener('route-change', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('route-change', handleLocationChange);
    };
  }, []);
  
  // Navigate to a new route
  const navigate = (path: string) => {
    navigateTo(path);
  };
  
  // Navigate by route key
  const navigateByKey = (key: RouteKey) => {
    const route = appRoutes[key];
    if (route) {
      navigateTo(route.path);
    } else {
      console.error(`Route key not found: ${key}`);
    }
  };
  
  // Check if path is active
  const isActive = (path: string) => {
    return currentPath === path || 
           (path !== '/' && currentPath.startsWith(path));
  };
  
  // Check if route key is active
  const isRouteActive = (key: RouteKey) => {
    const route = appRoutes[key];
    return route ? isActive(route.path) : false;
  };
  
  // Create context value
  const contextValue: RouterContextType = {
    currentPath,
    navigate,
    navigateByKey,
    isActive,
    isRouteActive,
    routes: appRoutes
  };
  
  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
}

/**
 * Custom hook to use the router context
 */
export function useRouter() {
  const context = useContext(RouterContext);
  
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  
  return context;
}

/**
 * Router Link component that works with our custom router
 */
export function RouterLink({ 
  to, 
  children, 
  className = '', 
  activeClassName = '',
  onClick,
  ...props 
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  [key: string]: any;
}) {
  const { isActive } = useRouter();
  const active = isActive(to);
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow default handling for external links
    if (to.startsWith('http')) {
      return;
    }
    
    e.preventDefault();
    navigateTo(to);
    
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <a 
      href={to}
      className={`${className} ${active ? activeClassName : ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}