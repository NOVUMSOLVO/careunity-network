import React, { useState, useEffect } from 'react';
import { updateBadgeFromNotifications, isBadgeSupported } from '../utils/badge-helper';
import { syncNow } from '../enhanced-service-worker-registration';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  url?: string;
}

const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [badgeSupported, setBadgeSupported] = useState(false);
  
  // Check if Badge API is supported
  useEffect(() => {
    setBadgeSupported(isBadgeSupported());
  }, []);
  
  // Fetch notifications from IndexedDB
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Open IndexedDB
      const request = indexedDB.open('careunityOfflineDB', 2);
      
      request.onerror = () => {
        setError('Failed to open database');
        setLoading(false);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Start a transaction
        const tx = db.transaction('notifications', 'readonly');
        const store = tx.objectStore('notifications');
        
        // Get all notifications
        const notificationsRequest = store.getAll();
        
        notificationsRequest.onsuccess = () => {
          // Sort notifications by timestamp (newest first)
          const sortedNotifications = notificationsRequest.result.sort((a, b) => b.timestamp - a.timestamp);
          setNotifications(sortedNotifications);
          setLoading(false);
          
          // Update badge count
          const unreadCount = sortedNotifications.filter(n => !n.read).length;
          updateBadgeFromNotifications(unreadCount);
        };
        
        notificationsRequest.onerror = () => {
          setError('Failed to fetch notifications');
          setLoading(false);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create notifications store if it doesn't exist
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationsStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationsStore.createIndex('by-read', 'read');
          notificationsStore.createIndex('by-timestamp', 'timestamp');
        }
      };
    } catch (error) {
      setError(`Error fetching notifications: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const request = indexedDB.open('careunityOfflineDB', 2);
      
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        
        // Get the notification
        const getRequest = store.get(notificationId);
        
        getRequest.onsuccess = () => {
          const notification = getRequest.result;
          if (notification) {
            notification.read = true;
            
            // Update the notification
            store.put(notification);
            
            // Update the local state
            setNotifications(prev => 
              prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            
            // Update the badge count
            const unreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
            updateBadgeFromNotifications(unreadCount);
          }
        };
      };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const request = indexedDB.open('careunityOfflineDB', 2);
      
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        
        // Get all unread notifications
        const index = store.index('by-read');
        const unreadRequest = index.getAll(false);
        
        unreadRequest.onsuccess = () => {
          const unreadNotifications = unreadRequest.result;
          
          // Mark each as read
          unreadNotifications.forEach(notification => {
            notification.read = true;
            store.put(notification);
          });
          
          // Update the local state
          setNotifications(prev => 
            prev.map(n => ({ ...n, read: true }))
          );
          
          // Update the badge count
          updateBadgeFromNotifications(0);
        };
      };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  
  // Trigger a manual sync
  const handleManualSync = async () => {
    try {
      setLoading(true);
      await syncNow();
      await fetchNotifications();
    } catch (error) {
      console.error('Manual sync failed:', error);
      setError('Failed to sync notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Listen for badge updates
  useEffect(() => {
    const handleBadgeUpdate = (event: Event) => {
      // Refresh notifications when badge count is updated
      fetchNotifications();
    };
    
    window.addEventListener('badgeCountUpdated', handleBadgeUpdate);
    
    return () => {
      window.removeEventListener('badgeCountUpdated', handleBadgeUpdate);
    };
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    
    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && 
         (event.data.type === 'SYNC_COMPLETED' || 
          event.data.type === 'BADGE_COUNT_UPDATED')) {
        fetchNotifications();
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative">
      <button 
        className="relative p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${unreadCount} unread notifications`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            <div className="flex space-x-2">
              <button 
                className="text-xs text-gray-600 hover:text-gray-900"
                onClick={handleManualSync}
                disabled={loading}
              >
                {loading ? 'Syncing...' : 'Sync'}
              </button>
              <button 
                className="text-xs text-gray-600 hover:text-gray-900"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {error && (
              <div className="p-4 text-sm text-red-600">
                {error}
              </div>
            )}
            
            {loading && !error && (
              <div className="p-4 text-sm text-gray-500 text-center">
                Loading notifications...
              </div>
            )}
            
            {!loading && !error && notifications.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center">
                No notifications
              </div>
            )}
            
            {!loading && !error && notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.url) {
                    window.location.href = notification.url;
                  }
                }}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{notification.body}</p>
              </div>
            ))}
          </div>
          
          {badgeSupported && (
            <div className="px-4 py-2 bg-gray-100 text-xs text-gray-500">
              Badge notifications enabled
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
