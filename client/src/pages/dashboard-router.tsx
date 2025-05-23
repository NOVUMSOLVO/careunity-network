import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

// Import all role-specific dashboards
import SystemAdminDashboard from './dashboards/system-admin-dashboard';
import RegionalManagerDashboard from './dashboards/regional-manager-dashboard';
import CareWorkerDashboard from './dashboards/care-worker-dashboard';
import SeniorCareWorkerDashboard from './dashboards/senior-care-worker-dashboard';
import FinanceDashboard from './dashboards/finance-dashboard';
import AdminDashboard from './dashboards/admin-dashboard';
import ServiceManagerDashboard from './dashboards/service-manager-dashboard';
import CareCoordinatorDashboard from './dashboards/care-coordinator-dashboard';
import FamilyDashboard from './dashboards/family-dashboard';
import Dashboard from './dashboard'; // Default dashboard

/**
 * Dashboard Router Component
 *
 * This component routes users to the appropriate dashboard based on their role.
 * It handles loading states and fallbacks to the default dashboard if a
 * role-specific dashboard is not available.
 */
const DashboardRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isClientSide, setIsClientSide] = useState(false);

  // Set isClientSide to true after component mounts
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Show loading skeleton while auth state is loading
  if (isLoading || !isClientSide) {
    return (
      <div className="space-y-6" data-testid="dashboard-skeleton">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  // If no user is logged in, show the default dashboard
  if (!user) {
    return <Dashboard />;
  }

  // Route to the appropriate dashboard based on user role
  switch (user.role) {
    case 'system_admin':
      return <SystemAdminDashboard />;

    case 'regional_manager':
    case 'area_manager':
      return <RegionalManagerDashboard />;

    case 'service_manager':
    case 'branch_manager':
      return <ServiceManagerDashboard />;

    case 'care_coordinator':
    case 'supervisor':
      return <CareCoordinatorDashboard />;

    case 'senior_care_worker':
      return <SeniorCareWorkerDashboard />;

    case 'care_worker':
    case 'caregiver':
      return <CareWorkerDashboard />;

    case 'office_admin':
      return <AdminDashboard />;

    case 'finance':
    case 'payroll':
      return <FinanceDashboard />;

    case 'service_user':
    case 'family':
      return <FamilyDashboard />;

    default:
      // Fallback to the default dashboard for unknown roles
      return <Dashboard />;
  }
};

export default DashboardRouter;
