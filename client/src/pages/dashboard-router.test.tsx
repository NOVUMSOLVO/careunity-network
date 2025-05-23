import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardRouter from './dashboard-router';
import { AuthProvider } from '@/contexts/auth-context';
import { SyncProvider } from '@/contexts/sync-context';

// Mock the dashboards
jest.mock('./dashboards/system-admin-dashboard', () => {
  return function MockSystemAdminDashboard() {
    return <div data-testid="system-admin-dashboard">System Admin Dashboard</div>;
  };
});

jest.mock('./dashboards/care-worker-dashboard', () => {
  return function MockCareWorkerDashboard() {
    return <div data-testid="care-worker-dashboard">Care Worker Dashboard</div>;
  };
});

jest.mock('./dashboards/finance-dashboard', () => {
  return function MockFinanceDashboard() {
    return <div data-testid="finance-dashboard">Finance Dashboard</div>;
  };
});

jest.mock('./dashboards/admin-dashboard', () => {
  return function MockAdminDashboard() {
    return <div data-testid="admin-dashboard">Admin Dashboard</div>;
  };
});

jest.mock('./dashboards/service-manager-dashboard', () => {
  return function MockServiceManagerDashboard() {
    return <div data-testid="service-manager-dashboard">Service Manager Dashboard</div>;
  };
});

jest.mock('./dashboards/care-coordinator-dashboard', () => {
  return function MockCareCoordinatorDashboard() {
    return <div data-testid="care-coordinator-dashboard">Care Coordinator Dashboard</div>;
  };
});

jest.mock('./dashboards/family-dashboard', () => {
  return function MockFamilyDashboard() {
    return <div data-testid="family-dashboard">Family Dashboard</div>;
  };
});

jest.mock('./dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="default-dashboard">Default Dashboard</div>;
  };
});

// Mock the auth context
jest.mock('@/contexts/auth-context', () => {
  const originalModule = jest.requireActual('@/contexts/auth-context');
  
  return {
    ...originalModule,
    useAuth: jest.fn(),
    AuthProvider: ({ children }) => <div>{children}</div>
  };
});

// Mock the sync context
jest.mock('@/contexts/sync-context', () => {
  return {
    SyncProvider: ({ children }) => <div>{children}</div>,
    useSync: jest.fn()
  };
});

describe('DashboardRouter', () => {
  const mockUseAuth = require('@/contexts/auth-context').useAuth;
  
  beforeEach(() => {
    // Reset the mock before each test
    mockUseAuth.mockReset();
  });
  
  test('renders loading skeleton when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      user: null
    });
    
    render(<DashboardRouter />);
    
    // Check if loading skeleton is rendered
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });
  
  test('renders default dashboard when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: null
    });
    
    render(<DashboardRouter />);
    
    // Check if default dashboard is rendered
    expect(screen.getByTestId('default-dashboard')).toBeInTheDocument();
  });
  
  test('renders system admin dashboard for system_admin role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 1,
        role: 'system_admin',
        fullName: 'Admin User'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if system admin dashboard is rendered
    expect(screen.getByTestId('system-admin-dashboard')).toBeInTheDocument();
  });
  
  test('renders care worker dashboard for care_worker role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 2,
        role: 'care_worker',
        fullName: 'Care Worker'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if care worker dashboard is rendered
    expect(screen.getByTestId('care-worker-dashboard')).toBeInTheDocument();
  });
  
  test('renders finance dashboard for finance role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 3,
        role: 'finance',
        fullName: 'Finance Staff'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if finance dashboard is rendered
    expect(screen.getByTestId('finance-dashboard')).toBeInTheDocument();
  });
  
  test('renders admin dashboard for office_admin role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 4,
        role: 'office_admin',
        fullName: 'Office Admin'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if admin dashboard is rendered
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });
  
  test('renders service manager dashboard for service_manager role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 5,
        role: 'service_manager',
        fullName: 'Service Manager'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if service manager dashboard is rendered
    expect(screen.getByTestId('service-manager-dashboard')).toBeInTheDocument();
  });
  
  test('renders care coordinator dashboard for care_coordinator role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 6,
        role: 'care_coordinator',
        fullName: 'Care Coordinator'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if care coordinator dashboard is rendered
    expect(screen.getByTestId('care-coordinator-dashboard')).toBeInTheDocument();
  });
  
  test('renders family dashboard for family role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 7,
        role: 'family',
        fullName: 'Family Member'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if family dashboard is rendered
    expect(screen.getByTestId('family-dashboard')).toBeInTheDocument();
  });
  
  test('renders default dashboard for unknown role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: 8,
        role: 'unknown_role',
        fullName: 'Unknown User'
      }
    });
    
    render(<DashboardRouter />);
    
    // Check if default dashboard is rendered
    expect(screen.getByTestId('default-dashboard')).toBeInTheDocument();
  });
});
