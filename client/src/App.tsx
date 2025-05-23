import React, { useEffect, Suspense, lazy } from 'react';
import { Switch, Route } from '@/components/router';
import { RouterLink } from '@/components/router/router-provider';
import { ResponsiveLayout } from '@/components/layout/responsive-layout';
import { OfflineIndicator } from '@/components/offline/offline-indicator';
import RealTimeNotifications from '@/components/notifications/real-time-notifications';
import { useOffline } from '@/contexts/offline-context';
import { apiClient } from '@/services/enhanced-api-client';

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Lazy load all pages to improve initial load time
const Dashboard = lazy(() => import('@/pages/dashboard'));
const ServiceUsers = lazy(() => import('@/pages/service-users'));
const Calendar = lazy(() => import('@/pages/calendar'));
const CarePlans = lazy(() => import('@/pages/care-plans'));
const CareAllocation = lazy(() => import('@/pages/care-allocation'));
const CQCCompliance = lazy(() => import('@/pages/cqc-compliance'));
const Messages = lazy(() => import('@/pages/messages'));
const Settings = lazy(() => import('@/pages/settings'));
const SecuritySettings = lazy(() => import('@/pages/SecuritySettings'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));
const IntegrationSettings = lazy(() => import('@/pages/IntegrationSettings'));
const IncidentReporting = lazy(() => import('@/pages/incident-reporting'));
const StaffManagement = lazy(() => import('@/pages/staff-management'));
const SimpleRbacManagement = lazy(() => import('@/pages/simple-rbac'));
const PermissionsManagement = lazy(() => import('@/pages/permissions-management'));
const Reports = lazy(() => import('@/pages/reports'));
const AuthPage = lazy(() => import('@/pages/auth-page'));
const FamilyPortal = lazy(() => import('@/pages/family-portal'));
const RouteOptimizer = lazy(() => import('@/pages/route-optimizer'));
const NotFound = lazy(() => import('@/pages/not-found'));
const PredictiveHealth = lazy(() => import('@/pages/predictive-health'));
const HealthcareIntegration = lazy(() => import('@/pages/healthcare-integration'));
const MLModels = lazy(() => import('@/pages/ml-models'));
const ModelManagement = lazy(() => import('@/pages/ml-models/model-management'));
const CommunityResources = lazy(() => import('@/pages/community-resources-new'));
const CommunityResourcesDirectory = lazy(() => import('@/pages/community-resources-directory'));
const Alerts = lazy(() => import('@/pages/alerts'));
const CareCoordinatorDashboard = lazy(() => import('@/pages/care-coordinator-dashboard'));
const LoadingDemoPage = lazy(() => import('@/pages/loading-demo-page'));
const FeedbackDashboard = lazy(() => import('@/pages/FeedbackDashboard'));
const ImageOptimizationDemo = lazy(() => import('@/pages/demo/image-optimization'));
const ApiMonitoring = lazy(() => import('@/pages/admin/api-monitoring'));

// Test page to verify API connectivity
function TestPage() {
  const [message, setMessage] = React.useState('Click the button to test API');

  const testApi = async () => {
    setMessage('Testing API connection...');
    try {
      const response = await fetch('/api/healthcheck');
      const data = await response.json();
      setMessage(`API response: ${JSON.stringify(data)}`);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">API Test Page</h1>

      <p className="text-gray-700 mb-4">
        This is a test page to verify that React and API connections are working correctly.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => alert('React events are working!')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Test React
        </button>

        <button
          onClick={testApi}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Test API
        </button>
      </div>

      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">API Response:</h2>
        <p className="text-gray-700 break-all">{message}</p>
      </div>
    </div>
  );
}

// Landing page for non-authenticated users
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">CareUnity</h1>

        <p className="text-gray-700 mb-4">
          Welcome to the CareUnity care management platform, designed to improve care coordination and delivery.
        </p>

        <div className="flex justify-center mt-6 space-x-4">
          <RouterLink to="/auth" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
            Login
          </RouterLink>
          <RouterLink to="/auth?register=true" className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition">
            Register
          </RouterLink>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Use enhanced offline functionality
  const {
    isOnline,
    isSyncing,
    hasPendingChanges,
    syncPendingChanges,
    lastSyncTime
  } = useOffline();

  // Sync data when the app loads and when coming back online
  useEffect(() => {
    if (isOnline && hasPendingChanges) {
      syncPendingChanges();
    }
  }, [isOnline, hasPendingChanges, syncPendingChanges]);

  // Set up API client to use enhanced offline functionality
  useEffect(() => {
    // Configure API client with base URL
    apiClient.baseUrl = '/api';

    // Log offline status changes
    console.log(`App is ${isOnline ? 'online' : 'offline'}`);
  }, [isOnline]);

  // Check if we're in the admin area or main application where layout is needed
  const needsLayout = (pathname: string) => {
    return !['/landing', '/auth', '/login', '/register'].includes(pathname);
  };

  // Main application with layout
  const AppWithLayout = () => {
    return (
      <ResponsiveLayout>
        {/* Enhanced offline indicator with sync functionality */}
        <OfflineIndicator showSyncButton={true} showPendingCount={true} />

        {/* Real-time notifications */}
        <RealTimeNotifications maxNotifications={10} autoHideAfter={8000} />

        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            {/* Dashboard */}
            <Route path="/" component={Dashboard} />
            <Route path="/coordinator-dashboard" component={CareCoordinatorDashboard} />

            {/* Main Application Pages */}
            <Route path="/service-users" component={ServiceUsers} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/care-plans" component={CarePlans} />
            <Route path="/care-allocation" component={CareAllocation} />

            {/* Compliance & Reporting */}
            <Route path="/cqc-compliance" component={CQCCompliance} />
            <Route path="/reports" component={Reports} />
            <Route path="/incident-reporting" component={IncidentReporting} />

            {/* Administration */}
            <Route path="/staff-management" component={StaffManagement} />
            <Route path="/rbac-management" component={SimpleRbacManagement} />
            <Route path="/permissions-management" component={PermissionsManagement} />

            {/* User Tools */}
            <Route path="/messages" component={Messages} />
            <Route path="/alerts" component={Alerts} />
            <Route path="/settings" component={Settings} />
            <Route path="/security" component={SecurityPage} />
            <Route path="/security-settings" component={SecuritySettings} />
            <Route path="/feedback" component={FeedbackDashboard} />

            {/* Advanced Features */}
            <Route path="/family-portal" component={FamilyPortal} />
            <Route path="/route-optimizer" component={RouteOptimizer} />
            <Route path="/predictive-health" component={PredictiveHealth} />
            <Route path="/healthcare-integration" component={HealthcareIntegration} />
            <Route path="/integrations" component={IntegrationSettings} />
            <Route path="/ml-models" component={MLModels} />
            <Route path="/ml-models/:modelId" component={ModelManagement} />
            <Route path="/community-resources" component={CommunityResources} />
            <Route path="/community-resources-directory" component={CommunityResourcesDirectory} />

            {/* Testing & Authentication */}
            <Route path="/test" component={TestPage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/loading-demo" component={LoadingDemoPage} />

            {/* Admin Pages */}
            <Route path="/admin/api-monitoring" component={ApiMonitoring} />

            {/* Demo Pages */}
            <Route path="/demo/image-optimization" component={ImageOptimizationDemo} />

            {/* 404 Page */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </ResponsiveLayout>
    );
  };

  // App without layout (for auth pages, etc.)
  const AppWithoutLayout = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/landing" component={LandingPage} />
          <Route component={LandingPage} />
        </Switch>
      </Suspense>
    );
  };

  // For this demo, we'll always use the layout
  // In a real application, you would conditionally render based on route or auth status
  return <AppWithLayout />;
}

export default App;
