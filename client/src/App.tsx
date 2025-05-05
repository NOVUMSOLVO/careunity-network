import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ServiceUsers from "@/pages/service-users";
import CarePlans from "@/pages/care-plans";
import Calendar from "@/pages/calendar";
import Reports from "@/pages/reports";
import Messages from "@/pages/messages";
import CQCCompliancePage from "@/pages/cqc-compliance";
import CareAllocation from "@/pages/care-allocation";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useErrorNotification } from "@/hooks/use-notifications";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/service-users" component={ServiceUsers} />
      <ProtectedRoute path="/care-plans" component={CarePlans} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/cqc-compliance" component={CQCCompliancePage} />
      <ProtectedRoute path="/care-allocation" component={CareAllocation} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const showErrorNotification = useErrorNotification();
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Application is online');
    };
    
    const handleOffline = () => {
      showErrorNotification(
        'You are offline',
        'Some features may be limited until your connection is restored.'
      );
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showErrorNotification]);
  
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </div>
  );
}

export default App;
