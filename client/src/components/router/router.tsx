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
    
    console.log(`Checking route: ${route.path} against current path: ${currentPath}`);
    
    // Exact match
    if (route.path === currentPath) {
      console.log(`Found exact match for ${currentPath}`);
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
      const matches = regex.test(currentPath);
      if (matches) {
        console.log(`Found parameterized match for ${currentPath}`);
        return true;
      }
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
 * This component doesn't actually render anything directly - it's used by the Switch component
 * to define route mappings
 */
export function Route({ path, element, component: Component }: RouteProps) {
  // This is just a route definition component
  // The actual rendering happens in the Switch component
  return null;
}

/**
 * Redirect component to redirect to another route
 */
export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new CustomEvent('route-change', { detail: { path: to } }));
  }, [to]);
  
  return null;
}

/**
 * Switch component that renders the first matching route
 */
export function Switch({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      console.log(`Switch: Path changed to ${window.location.pathname}`);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('route-change', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('route-change', handleLocationChange);
    };
  }, []);
  
  // Process all routes from React children
  const childrenArray = React.Children.toArray(children);
  
  // Extract routes that have a path prop
  const routes = childrenArray
    .filter(child => React.isValidElement(child) && child.type === Route && child.props.path)
    .map(child => {
      const element = child as React.ReactElement<RouteProps>;
      
      // If a component prop is provided, convert it to an element
      if (element.props.component) {
        const Component = element.props.component;
        return {
          path: element.props.path,
          element: <Component />,
          component: element.props.component
        };
      }
      
      // Otherwise use the element prop
      return {
        path: element.props.path,
        element: element.props.element
      };
    });
  
  console.log(`Switch: Checking ${routes.length} routes for path ${currentPath}`);
  
  // Find the notFound route (the route without a path prop)
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
  
  // Find the matching route
  const matchingRoute = routes.find(route => {
    if (!route.path) return false;
    
    // Exact match
    if (route.path === currentPath) {
      console.log(`Switch: Found exact match for ${currentPath}`);
      return true;
    }
    
    // Root path
    if (route.path === '/' && currentPath === '/') {
      console.log(`Switch: Found root match`);
      return true;
    }
    
    // Parameterized routes
    if (route.path.includes(':')) {
      const paramRegex = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${paramRegex}$`);
      const matches = regex.test(currentPath);
      if (matches) {
        console.log(`Switch: Found parameterized match for ${currentPath} with pattern ${route.path}`);
        return true;
      }
    }
    
    return false;
  });
  
  if (matchingRoute) {
    console.log(`Switch: Rendering route for ${currentPath}:`, matchingRoute);
    return <>{matchingRoute.element}</>;
  }
  
  console.log(`Switch: No matching route found for ${currentPath}, rendering notFound element`);
  return <>{notFoundElement}</>;
}