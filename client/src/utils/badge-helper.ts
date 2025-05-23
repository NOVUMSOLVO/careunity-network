/**
 * Badge API Helper
 * 
 * Utility functions for working with the Web Badge API
 */

/**
 * Check if Badge API is supported in the browser
 */
export function isBadgeSupported(): boolean {
  return 'setAppBadge' in navigator;
}

/**
 * Set the app badge count
 * @param count The number to display on the badge
 */
export async function setAppBadge(count: number): Promise<boolean> {
  if (!isBadgeSupported()) {
    console.warn('Badge API is not supported in this browser');
    return false;
  }

  try {
    await navigator.setAppBadge(count);
    return true;
  } catch (error) {
    console.error('Failed to set app badge:', error);
    return false;
  }
}

/**
 * Clear the app badge
 */
export async function clearAppBadge(): Promise<boolean> {
  if (!isBadgeSupported()) {
    return false;
  }

  try {
    await navigator.clearAppBadge();
    return true;
  } catch (error) {
    console.error('Failed to clear app badge:', error);
    return false;
  }
}

/**
 * Handle notification status change
 * @param unreadCount Number of unread notifications
 */
export async function updateBadgeFromNotifications(unreadCount: number): Promise<void> {
  if (isBadgeSupported()) {
    if (unreadCount > 0) {
      await setAppBadge(unreadCount);
    } else {
      await clearAppBadge();
    }
  }
  
  // Also dispatch an event for components to listen to
  window.dispatchEvent(
    new CustomEvent('badgeCountUpdated', { 
      detail: { count: unreadCount } 
    })
  );
}

/**
 * Listen for badge updates from service worker
 */
export function setupBadgeListener(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'BADGE_COUNT_UPDATED') {
        const count = event.data.count || 0;
        
        // Update UI or state based on the new count
        window.dispatchEvent(
          new CustomEvent('badgeCountUpdated', { 
            detail: { count } 
          })
        );
      }
    });
  }
}
