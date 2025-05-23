import React, { useState } from 'react';
import { createRoot } from "react-dom/client";
import "./index.css";
import { performanceMonitoring } from './services/performance-monitoring';

// Initialize performance monitoring
performanceMonitoring.mark('app-init-start');

// Simple Dashboard Component
function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Care Hours</h2>
          <p className="text-3xl font-bold">128</p>
          <p className="text-sm text-gray-500">This week</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Service Users</h2>
          <p className="text-3xl font-bold">24</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Compliance</h2>
          <p className="text-3xl font-bold">94%</p>
          <p className="text-sm text-gray-500">CQC Standards</p>
        </div>
      </div>
    </div>
  );
}

// Simple Service Users Component
function ServiceUsers() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Service Users</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Care Plan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">John Smith</td>
              <td className="px-6 py-4 whitespace-nowrap">Active</td>
              <td className="px-6 py-4 whitespace-nowrap">Daily Care</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Jane Doe</td>
              <td className="px-6 py-4 whitespace-nowrap">Active</td>
              <td className="px-6 py-4 whitespace-nowrap">Weekly Visit</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simple App Component with basic routing
function SimpleApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'service-users':
        return <ServiceUsers />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white">
        <div className="p-4 text-xl font-bold">CareUnity</div>
        <nav className="mt-6">
          <button
            className={`w-full text-left px-4 py-2 ${currentPage === 'dashboard' ? 'bg-indigo-800' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`w-full text-left px-4 py-2 ${currentPage === 'service-users' ? 'bg-indigo-800' : ''}`}
            onClick={() => setCurrentPage('service-users')}
          >
            Service Users
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
}

// Import enhanced service worker registration
import { registerServiceWorker, updateServiceWorker } from './enhanced-service-worker-registration';
import { setupBadgeListener } from './utils/badge-helper';

// Initialize service worker and PWA features
const initializeServiceWorker = async () => {
  try {
    // Register the enhanced service worker
    const registration = await registerServiceWorker();
    
    if (registration) {
      console.log('Enhanced service worker registered successfully:', registration.scope);
      
      // Set up badge notification listener
      setupBadgeListener();
      
      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('Service worker controller changed, reloading page');
          window.location.reload();
        }
      });
      
      // Listen for update available events
      window.addEventListener('serviceWorkerUpdateAvailable', () => {
        // Show update notification to user
        if (confirm('A new version of the application is available. Reload to update?')) {
          updateServiceWorker();
        }
      });
    }
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
};

// Initialize React
const rootElement = document.getElementById('root');
if (rootElement) {
  // Mark the start of rendering
  performanceMonitoring.mark('app-render-start');

  createRoot(rootElement).render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );

  // Mark the end of initialization
  performanceMonitoring.mark('app-init-end');
  performanceMonitoring.measure('app-initialization', 'app-init-start', 'app-init-end');

  // Log performance metrics after the app is loaded
  window.addEventListener('load', () => {
    performanceMonitoring.mark('app-load-complete');
    performanceMonitoring.measure('app-load-time', 'app-init-start', 'app-load-complete');

    // Initialize enhanced service worker after the app is loaded
    initializeServiceWorker();

    // Log metrics after a short delay to ensure all metrics are collected
    setTimeout(() => {
      performanceMonitoring.logMetrics();
    }, 1000);
  });
} else {
  console.error('Root element not found!');
}
