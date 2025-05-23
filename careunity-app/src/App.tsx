import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/auth-context';
import { WebSocketProvider } from './contexts/websocket-context';
import { NotificationProvider } from './contexts/notification-context';
import { OfflineProvider } from './contexts/offline-context';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ServiceUsers from './pages/ServiceUsers';
import CareAllocation from './pages/CareAllocation';
import StaffManagement from './pages/StaffManagement';
import Calendar from './pages/Calendar';
import CarePlans from './pages/CarePlans';
import Reports from './pages/Reports';
import QualityImprovement from './pages/QualityImprovement';
import UserProfile from './pages/UserProfile';
import FamilyPortal from './pages/FamilyPortal';
import Documents from './pages/Documents';
import MedicationManagement from './pages/MedicationManagement';
import AdvancedSearch from './pages/AdvancedSearch';
import SecuritySettings from './pages/SecuritySettings';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ConflictResolution from './pages/ConflictResolution';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Create a query client
const queryClient = new QueryClient();

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <WebSocketProvider>
            <NotificationProvider>
              <OfflineProvider>
                <Router>
                  <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/service-users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ServiceUsers />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/care-allocation"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CareAllocation />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff-management"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <StaffManagement />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Calendar />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/care-plans"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CarePlans />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quality-improvement"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QualityImprovement />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserProfile />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/family-portal"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FamilyPortal />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Documents />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/medications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MedicationManagement />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AdvancedSearch />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/security"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SecuritySettings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AnalyticsDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Conflict resolution route */}
              <Route
                path="/conflicts/:conflictId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ConflictResolution />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Add more routes here */}

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Router>
              </OfflineProvider>
            </NotificationProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
