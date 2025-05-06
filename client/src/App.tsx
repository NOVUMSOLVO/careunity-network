import React from 'react';
import { Route, Switch, Link } from 'wouter';
import { Layout } from '@/components/layout/layout';
import Dashboard from '@/pages/dashboard';
import ServiceUsers from '@/pages/service-users';
import Calendar from '@/pages/calendar';
import CarePlans from '@/pages/care-plans';
import CareAllocation from '@/pages/care-allocation';
import CQCCompliance from '@/pages/cqc-compliance';
import Messages from '@/pages/messages';
import Settings from '@/pages/settings';
import IncidentReporting from '@/pages/incident-reporting';
import StaffManagement from '@/pages/staff-management';
import SimpleRbacManagement from '@/pages/simple-rbac';
import PermissionsManagement from '@/pages/permissions-management';
import Reports from '@/pages/reports';
import AuthPage from '@/pages/auth-page';
import FamilyPortal from '@/pages/family-portal';
import RouteOptimizer from '@/pages/route-optimizer';
import NotFound from '@/pages/not-found';
import PredictiveHealth from '@/pages/predictive-health';
import HealthcareIntegration from '@/pages/healthcare-integration';
import CommunityResources from '@/pages/community-resources-new';
import Alerts from '@/pages/alerts';
import CareCoordinatorDashboard from '@/pages/care-coordinator-dashboard';

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
          <Link href="/auth" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
            Login
          </Link>
          <Link href="/auth?register=true" className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Check if we're in the admin area or main application where layout is needed
  const needsLayout = (pathname: string) => {
    return !['/landing', '/auth', '/login', '/register'].includes(pathname);
  };

  // Main application with layout
  const AppWithLayout = () => {
    return (
      <Layout>
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
          
          {/* Advanced Features */}
          <Route path="/family-portal" component={FamilyPortal} />
          <Route path="/route-optimizer" component={RouteOptimizer} />
          <Route path="/predictive-health" component={PredictiveHealth} />
          <Route path="/healthcare-integration" component={HealthcareIntegration} />
          <Route path="/community-resources" component={CommunityResources} />
          
          {/* Testing & Authentication */}
          <Route path="/test" component={TestPage} />
          <Route path="/auth" component={AuthPage} />
          
          {/* 404 Page */}
          <Route component={NotFound} />
        </Switch>
      </Layout>
    );
  };

  // App without layout (for auth pages, etc.)
  const AppWithoutLayout = () => {
    return (
      <Switch>
        <Route path="/landing" component={LandingPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  };

  // For this demo, we'll always use the layout
  // In a real application, you would conditionally render based on route or auth status
  return <AppWithLayout />;
}

export default App;
