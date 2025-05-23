/**
 * Network Status Utility
 * 
 * This utility provides methods for checking and monitoring network connectivity.
 */

import { logger } from './logger';

/**
 * Network status class
 */
export class NetworkStatus {
  private online: boolean;
  private onlineListeners: Array<() => void> = [];
  private offlineListeners: Array<() => void> = [];
  private checkInterval: number | null = null;
  private apiEndpoint: string = '/api/healthcheck';
  
  /**
   * Initialize the network status
   */
  constructor() {
    this.online = navigator.onLine;
    
    // Add event listeners for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    logger.info(`Initial network status: ${this.online ? 'online' : 'offline'}`);
  }
  
  /**
   * Handle online event
   */
  private handleOnline(): void {
    logger.info('Browser reports online status');
    
    // Verify connectivity with a network request
    this.checkConnectivity().then((isConnected) => {
      if (isConnected && !this.online) {
        this.online = true;
        logger.info('Network connection confirmed');
        this.notifyOnlineListeners();
      }
    });
  }
  
  /**
   * Handle offline event
   */
  private handleOffline(): void {
    logger.info('Browser reports offline status');
    
    if (this.online) {
      this.online = false;
      logger.info('Network connection lost');
      this.notifyOfflineListeners();
    }
  }
  
  /**
   * Check connectivity by making a network request
   */
  public async checkConnectivity(): Promise<boolean> {
    try {
      // Try to fetch a small resource to verify connectivity
      const response = await fetch(this.apiEndpoint, {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      return response.ok;
    } catch (error) {
      logger.warn('Connectivity check failed:', error);
      return false;
    }
  }
  
  /**
   * Start periodic connectivity checks
   */
  public startPeriodicChecks(intervalSeconds: number = 30): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = window.setInterval(async () => {
      const isConnected = await this.checkConnectivity();
      
      if (isConnected !== this.online) {
        this.online = isConnected;
        logger.info(`Network status changed to: ${isConnected ? 'online' : 'offline'}`);
        
        if (isConnected) {
          this.notifyOnlineListeners();
        } else {
          this.notifyOfflineListeners();
        }
      }
    }, intervalSeconds * 1000);
    
    logger.info(`Started periodic connectivity checks every ${intervalSeconds} seconds`);
  }
  
  /**
   * Stop periodic connectivity checks
   */
  public stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Stopped periodic connectivity checks');
    }
  }
  
  /**
   * Add a listener for online events
   */
  public addOnlineListener(listener: () => void): void {
    this.onlineListeners.push(listener);
  }
  
  /**
   * Add a listener for offline events
   */
  public addOfflineListener(listener: () => void): void {
    this.offlineListeners.push(listener);
  }
  
  /**
   * Remove a listener for online events
   */
  public removeOnlineListener(listener: () => void): void {
    this.onlineListeners = this.onlineListeners.filter((l) => l !== listener);
  }
  
  /**
   * Remove a listener for offline events
   */
  public removeOfflineListener(listener: () => void): void {
    this.offlineListeners = this.offlineListeners.filter((l) => l !== listener);
  }
  
  /**
   * Notify all online listeners
   */
  private notifyOnlineListeners(): void {
    this.onlineListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        logger.error('Error in online listener:', error);
      }
    });
  }
  
  /**
   * Notify all offline listeners
   */
  private notifyOfflineListeners(): void {
    this.offlineListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        logger.error('Error in offline listener:', error);
      }
    });
  }
  
  /**
   * Check if the network is online
   */
  public isOnline(): boolean {
    return this.online;
  }
  
  /**
   * Set the API endpoint for connectivity checks
   */
  public setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint;
  }
}

// Export a singleton instance
export const networkStatus = new NetworkStatus();

export default networkStatus;
