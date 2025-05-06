import { useState, useEffect, useCallback } from 'react';
import { appRoutes, RouteKey, navigateTo, matchRoute } from '@/lib/routes';

/**
 * Custom router hook to handle app navigation
 */
export function useRouter() {
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
  const navigate = useCallback((path: string) => {
    navigateTo(path);
  }, []);
  
  // Navigate by route key
  const navigateByKey = useCallback((key: RouteKey) => {
    const route = appRoutes[key];
    if (route) {
      navigateTo(route.path);
    } else {
      console.error(`Route key not found: ${key}`);
    }
  }, []);
  
  // Check if path is active
  const isActive = useCallback((path: string) => {
    return currentPath === path || 
           (path !== '/' && currentPath.startsWith(path));
  }, [currentPath]);
  
  // Check if route key is active
  const isRouteActive = useCallback((key: RouteKey) => {
    const route = appRoutes[key];
    return route ? isActive(route.path) : false;
  }, [isActive]);
  
  return {
    currentPath,
    navigate,
    navigateByKey,
    isActive,
    isRouteActive,
    routes: appRoutes
  };
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