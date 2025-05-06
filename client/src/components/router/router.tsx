import React, { useState, useEffect, ReactNode } from 'react';
import { appRoutes, RouteKey, matchRoute } from '@/lib/routes';

type RouteProps = {
  path?: string;
  element?: React.ReactNode;
  component?: React.ComponentType<any>;
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
    // Skip routes without a path
    if (!route.path) {
      return false;
    }
    
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
export function Route({ path, element, component: Component }: RouteProps) {
  // If a component prop is provided, render it
  if (Component) {
    return <Component />;
  }
  // Otherwise render the element
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
      
      // If a component prop is provided, convert it to an element
      if (element.props.component) {
        const Component = element.props.component;
        return {
          path: element.props.path,
          element: <Component />
        };
      }
      
      // Otherwise use the element prop
      return {
        path: element.props.path,
        element: element.props.element
      };
    });
  
  const notFoundRoute = childrenArray
    .find(child => 
      React.isValidElement(child) && 
      child.type === Route && 
      !child.props.path
    ) as React.ReactElement<RouteProps> | undefined;
  
  let notFoundElement = null;
  
  if (notFoundRoute) {
    if (notFoundRoute.props.component) {
      const Component = notFoundRoute.props.component;
      notFoundElement = <Component />;
    } else {
      notFoundElement = notFoundRoute.props.element;
    }
  }
  
  return (
    <Router 
      routes={routes} 
      notFoundElement={notFoundElement} 
    />
  );
}