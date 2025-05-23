// Main entry point for mobile app - implements code splitting
// This file dynamically loads other modules as needed

// Core modules loaded immediately
import './js/careunity-mobile-db.js';
import './js/careunity-touch-interactions.js';

// Track loaded modules to prevent duplicate loading
const loadedModules = new Set();

// Function to dynamically import modules
async function loadModule(modulePath, condition = true) {
  if (!condition || loadedModules.has(modulePath)) return;
  
  loadedModules.add(modulePath);
  try {
    console.log(`Loading module: ${modulePath}`);
    return await import(/* @vite-ignore */ modulePath);
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error);
  }
}

// Initialize core functionality
async function initializeCore() {
  // Essential sync functionality loaded early
  await loadModule('./js/careunity-sync-manager.js');
  await loadModule('./js/careunity-notifications.js');
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/mobile-service-worker.js');
      console.log('Service worker registered:', registration);
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
}

// Load feature modules based on current view
function loadFeatureModules() {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash.substring(1);
  
  // Load care plan related modules when viewing care plans
  if (currentPath.includes('care-plan') || currentHash === 'careplans') {
    loadModule('./js/careunity-care-plan.js');
    loadModule('./js/careunity-care-plan-viewer.js');
    
    // Load advanced care plan features only when needed
    if (document.querySelector('.advanced-care-plan')) {
      loadModule('./js/careunity-care-plan-monitoring.js');
    }
  }
  
  // Load authentication related modules when on login pages or performing auth actions
  if (currentPath.includes('login') || currentHash === 'login' || currentHash === 'account') {
    loadModule('./js/careunity-biometric-auth.js');
  }
  
  // Load voice command modules when voice features are activated
  document.addEventListener('voice-activated', () => {
    loadModule('./js/careunity-voice-commands.js');
    loadModule('./js/careunity-voice-context-aware.js');
  });
  
  // Load conflict resolution modules when needed
  document.addEventListener('sync-conflict', () => {
    loadModule('./js/careunity-conflict-resolution.js');
    loadModule('./js/careunity-conflict-resolver.js');
    loadModule('./js/careunity-conflict-ui.js');
  });
}

// Load analytics on user interaction to prioritize core features first
function loadAnalyticsAfterInteraction() {
  const loadAnalytics = () => {
    loadModule('./js/careunity-analytics.js', !loadedModules.has('./js/careunity-analytics.js'));
    
    // Remove listeners after loading to prevent multiple loads
    ['click', 'scroll', 'input'].forEach(event => {
      document.removeEventListener(event, loadAnalytics);
    });
  };
  
  // Load analytics after user interacts with the page
  ['click', 'scroll', 'input'].forEach(event => {
    document.addEventListener(event, loadAnalytics, { once: true });
  });
  
  // Fallback - load analytics after a delay if no interaction
  setTimeout(loadAnalytics, 5000);
}

// Initialize app
async function initApp() {
  await initializeCore();
  loadFeatureModules();
  loadAnalyticsAfterInteraction();
  
  // Listen for route changes to load appropriate modules
  window.addEventListener('hashchange', loadFeatureModules);
  
  // Check if we need to load check-in functionality
  if (localStorage.getItem('enableCheckin') === 'true') {
    loadModule('./js/careunity-checkin.js');
  }
  
  // Load integration modules if integration features are enabled
  if (localStorage.getItem('enableIntegrations') === 'true') {
    loadModule('./js/careunity-integration.js');
  }
  
  console.log('App initialized with dynamic module loading');
}

// Start application
document.addEventListener('DOMContentLoaded', initApp);

// Export function to manually load modules from other parts of the application
window.loadFeatureModule = loadModule;
