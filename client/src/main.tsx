import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProviders } from "@/components/providers";

// Service Worker registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
  
  // Handle offline/online events
  window.addEventListener('online', () => {
    // Trigger sync for any local data
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('sync-messages');
    });
    
    document.dispatchEvent(new CustomEvent('app:online'));
    console.log('App is now online');
  });
  
  window.addEventListener('offline', () => {
    document.dispatchEvent(new CustomEvent('app:offline'));
    console.log('App is now offline');
  });
}

// Expose online status to components
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Create a custom event for online/offline status changes
export const onOnlineStatusChange = (callback: (online: boolean) => void): () => void => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  document.addEventListener('app:online', handleOnline);
  document.addEventListener('app:offline', handleOffline);
  
  return () => {
    document.removeEventListener('app:online', handleOnline);
    document.removeEventListener('app:offline', handleOffline);
  };
};

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
