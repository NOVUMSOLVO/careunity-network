/**
 * Routes utility to manage application routing
 */

// Define app routes and their display names
export const appRoutes = {
  // Dashboard routes
  home: { path: '/', label: 'Dashboard' },
  coordinatorDashboard: { path: '/coordinator-dashboard', label: 'Care Coordinator Dashboard' },

  // Care management routes
  serviceUsers: { path: '/service-users', label: 'Service Users' },
  carePlans: { path: '/care-plans', label: 'Care Plans' },
  careAllocation: { path: '/care-allocation', label: 'Care Allocation' },

  // Calendar and scheduling
  calendar: { path: '/calendar', label: 'Calendar' },

  // CQC compliance
  cqcCompliance: { path: '/cqc-compliance', label: 'CQC Compliance' },
  incidentReporting: { path: '/incident-reporting', label: 'Incident Reporting' },

  // Staff management
  staffManagement: { path: '/staff-management', label: 'Staff Management' },
  rbacManagement: { path: '/rbac-management', label: 'RBAC Management' },
  permissionsManagement: { path: '/permissions-management', label: 'Permissions Management' },
  apiMonitoring: { path: '/admin/api-monitoring', label: 'API Monitoring' },

  // Reports
  reports: { path: '/reports', label: 'Reports' },

  // Authentication
  auth: { path: '/auth', label: 'Authentication' },

  // Features
  familyPortal: { path: '/family-portal', label: 'Family Portal' },
  routeOptimizer: { path: '/route-optimizer', label: 'Route Optimizer' },
  predictiveHealth: { path: '/predictive-health', label: 'Predictive Health' },
  healthcareIntegration: { path: '/healthcare-integration', label: 'Healthcare Integration' },
  integrations: { path: '/integrations', label: 'Integrations' },
  mlModels: { path: '/ml-models', label: 'ML Models' },
  communityResources: { path: '/community-resources', label: 'Community Resources' },
  communityResourcesDirectory: { path: '/community-resources-directory', label: 'Community Resources Directory' },

  // User tools
  messages: { path: '/messages', label: 'Messages' },
  alerts: { path: '/alerts', label: 'Alerts' },
  settings: { path: '/settings', label: 'Settings' },
  security: { path: '/security', label: 'Security' },
  feedback: { path: '/feedback', label: 'Feedback' },

  // Testing
  test: { path: '/test', label: 'Test' },
  loadingDemo: { path: '/loading-demo', label: 'Loading Demo' },
};

// Helper function to navigate to a route
export const navigateTo = (path: string) => {
  console.log(`Navigating to ${path}`);
  window.history.pushState({}, '', path);
  // Dispatch a custom event that our routing system can listen for
  window.dispatchEvent(new CustomEvent('route-change', { detail: { path } }));

  // For debugging
  setTimeout(() => {
    console.log(`Current location after navigation: ${window.location.pathname}`);
  }, 0);
};

// Type for the routes object
export type AppRoutes = typeof appRoutes;
export type RouteKey = keyof AppRoutes;

// Check if a path matches a route
export function matchRoute(path: string): { matched: boolean; key?: RouteKey } {
  const normalizedPath = path.endsWith('/') && path !== '/'
    ? path.slice(0, -1)
    : path;

  const entry = Object.entries(appRoutes).find(
    ([_, route]) => route.path === normalizedPath
  );

  if (entry) {
    return { matched: true, key: entry[0] as RouteKey };
  }

  return { matched: false };
}

// Extract route parameters from path
export function extractRouteParams(path: string, pattern: string): Record<string, string> {
  // Convert the pattern to a regex to extract parameters
  // e.g., '/users/:id' becomes '/users/([^/]+)'
  const paramNames: string[] = [];
  const regexPattern = pattern
    .replace(/:[a-zA-Z0-9_]+/g, (match) => {
      paramNames.push(match.slice(1));
      return '([^/]+)';
    })
    .replace(/\//g, '\\/');

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) {
    return {};
  }

  // Extract parameter values
  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return params;
}