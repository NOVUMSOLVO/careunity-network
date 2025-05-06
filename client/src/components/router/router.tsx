import React, { useState, useEffect, ReactNode } from 'react';
import { appRoutes, RouteKey, matchRoute } from '@/lib/routes';

type RouteProps = {
  path: string;
  element: React.ReactNode;
};

type RouterProps = {
  routes: RouteProps[];
  notFoundElement?: React.ReactNode;
};

/**
 * A simple router component that renders the matching route
 */
export function Router({ routes, notFoundElement }: RouterProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('route-change', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('route-change', handleLocationChange);
    };
  }, []);
  
  // Find the matching route
  const matchingRoute = routes.find(route => {
    // Exact match
    if (route.path === currentPath) {
      return true;
    }
    
    // Handle root path specially
    if (route.path === '/' && currentPath === '/') {
      return true;
    }
    
    // Handle parameterized routes (e.g., '/users/:id')
    if (route.path.includes(':')) {
      const paramRegex = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${paramRegex}$`);
      return regex.test(currentPath);
    }
    
    return false;
  });
  
  if (matchingRoute) {
    return <>{matchingRoute.element}</>;
  }
  
  return <>{notFoundElement}</>;
}

/**
 * Route component to define a route
 */
export function Route({ path, element }: RouteProps) {
  return <>{element}</>;
}

/**
 * Redirect component to redirect to another route
 */
export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new CustomEvent('route-change'));
  }, [to]);
  
  return null;
}

/**
 * Switch component that renders the first matching route
 */
export function Switch({ children }: { children: React.ReactNode }) {
  const childrenArray = React.Children.toArray(children);
  const routes = childrenArray
    .filter(child => React.isValidElement(child) && child.type === Route)
    .map(child => {
      const element = child as React.ReactElement<RouteProps>;
      return {
        path: element.props.path,
        element: element.props.element
      };
    });
  
  const notFoundElement = childrenArray
    .find(child => 
      React.isValidElement(child) && 
      child.type === Route && 
      !child.props.path
    );
  
  return (
    <Router 
      routes={routes} 
      notFoundElement={notFoundElement ? (notFoundElement as React.ReactElement).props.element : null} 
    />
  );
}