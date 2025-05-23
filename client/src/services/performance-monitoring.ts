/**
 * Performance Monitoring Service
 * 
 * A service for monitoring application performance metrics.
 * Tracks:
 * - Page load time
 * - First contentful paint
 * - Largest contentful paint
 * - First input delay
 * - Cumulative layout shift
 * - Long tasks
 * - Resource loading
 * - API request performance
 */

// Performance metrics
export interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  
  // Page load metrics
  domContentLoaded?: number;
  domInteractive?: number;
  loadComplete?: number;
  
  // Resource metrics
  resourceCount?: number;
  resourceLoadTime?: number;
  
  // JavaScript metrics
  longTasks?: number;
  longTasksTime?: number;
  
  // Custom metrics
  customMetrics?: Record<string, number>;
}

// Performance monitoring options
export interface PerformanceMonitoringOptions {
  /** Whether to enable performance monitoring */
  enabled?: boolean;
  
  /** Whether to log metrics to console */
  logToConsole?: boolean;
  
  /** Whether to send metrics to server */
  sendToServer?: boolean;
  
  /** URL to send metrics to */
  metricsEndpoint?: string;
  
  /** Whether to track core web vitals */
  trackCoreWebVitals?: boolean;
  
  /** Whether to track resource loading */
  trackResources?: boolean;
  
  /** Whether to track long tasks */
  trackLongTasks?: boolean;
  
  /** Whether to track API requests */
  trackApiRequests?: boolean;
}

// Default options
const DEFAULT_OPTIONS: PerformanceMonitoringOptions = {
  enabled: true,
  logToConsole: true,
  sendToServer: false,
  metricsEndpoint: '/api/v2/performance/metrics',
  trackCoreWebVitals: true,
  trackResources: true,
  trackLongTasks: true,
  trackApiRequests: true,
};

/**
 * Performance Monitoring Service
 */
export class PerformanceMonitoringService {
  private options: PerformanceMonitoringOptions;
  private metrics: PerformanceMetrics = {};
  private customMetrics: Record<string, number> = {};
  private apiRequestTimes: Record<string, number[]> = {};
  private longTasksObserver?: PerformanceObserver;
  private lcpObserver?: PerformanceObserver;
  private fidObserver?: PerformanceObserver;
  private clsObserver?: PerformanceObserver;
  private resourceObserver?: PerformanceObserver;
  
  /**
   * Create a new performance monitoring service
   */
  constructor(options: PerformanceMonitoringOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Initialize if enabled
    if (this.options.enabled) {
      this.initialize();
    }
  }
  
  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    // Check if the Performance API is available
    if (!window.performance) {
      console.warn('Performance API is not available');
      return;
    }
    
    // Track page load metrics
    this.trackPageLoadMetrics();
    
    // Track Core Web Vitals
    if (this.options.trackCoreWebVitals) {
      this.trackCoreWebVitals();
    }
    
    // Track resources
    if (this.options.trackResources) {
      this.trackResources();
    }
    
    // Track long tasks
    if (this.options.trackLongTasks) {
      this.trackLongTasks();
    }
    
    // Track API requests
    if (this.options.trackApiRequests) {
      this.trackApiRequests();
    }
    
    // Log metrics when the page is unloaded
    window.addEventListener('beforeunload', () => {
      this.logMetrics();
      
      if (this.options.sendToServer) {
        this.sendMetricsToServer();
      }
    });
  }
  
  /**
   * Track page load metrics
   */
  private trackPageLoadMetrics(): void {
    // Get navigation timing
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navTiming) {
      // DOM Content Loaded
      this.metrics.domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.startTime;
      
      // DOM Interactive
      this.metrics.domInteractive = navTiming.domInteractive - navTiming.startTime;
      
      // Load Complete
      this.metrics.loadComplete = navTiming.loadEventEnd - navTiming.startTime;
    }
    
    // First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    if (fcp) {
      this.metrics.firstContentfulPaint = fcp.startTime;
    }
  }
  
  /**
   * Track Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        this.lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        });
        
        this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // First Input Delay
        this.fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstInput = entries[0];
          this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
        });
        
        this.fidObserver.observe({ type: 'first-input', buffered: true });
        
        // Cumulative Layout Shift
        this.clsObserver = new PerformanceObserver((entryList) => {
          let cumulativeLayoutShift = 0;
          
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cumulativeLayoutShift += (entry as any).value;
            }
          }
          
          this.metrics.cumulativeLayoutShift = cumulativeLayoutShift;
        });
        
        this.clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported for Core Web Vitals', e);
      }
    }
  }
  
  /**
   * Track resource loading
   */
  private trackResources(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          // Count resources
          this.metrics.resourceCount = entries.length;
          
          // Calculate total load time
          this.metrics.resourceLoadTime = entries.reduce((total, entry) => total + entry.duration, 0);
        });
        
        this.resourceObserver.observe({ type: 'resource', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported for resources', e);
      }
    }
  }
  
  /**
   * Track long tasks
   */
  private trackLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        let longTasksCount = 0;
        let longTasksTime = 0;
        
        this.longTasksObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          longTasksCount += entries.length;
          longTasksTime += entries.reduce((total, entry) => total + entry.duration, 0);
          
          this.metrics.longTasks = longTasksCount;
          this.metrics.longTasksTime = longTasksTime;
        });
        
        this.longTasksObserver.observe({ type: 'longtask', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported for long tasks', e);
      }
    }
  }
  
  /**
   * Track API requests
   */
  private trackApiRequests(): void {
    // Monkey patch fetch
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url;
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Record API request time
        this.recordApiRequestTime(url, duration);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Record API request time even for errors
        this.recordApiRequestTime(url, duration);
        
        throw error;
      }
    };
    
    // Monkey patch XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string) {
      (this as any)._perfUrl = url;
      return originalXhrOpen.apply(this, arguments as any);
    };
    
    XMLHttpRequest.prototype.send = function() {
      const url = (this as any)._perfUrl;
      const startTime = performance.now();
      
      const onLoadEnd = () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Record API request time
        this.removeEventListener('loadend', onLoadEnd);
        this.recordApiRequestTime(url, duration);
      };
      
      this.addEventListener('loadend', onLoadEnd);
      return originalXhrSend.apply(this, arguments as any);
    };
  }
  
  /**
   * Record API request time
   */
  private recordApiRequestTime(url: string, duration: number): void {
    // Extract the endpoint from the URL
    const urlObj = new URL(url, window.location.origin);
    const endpoint = urlObj.pathname;
    
    // Initialize array if needed
    if (!this.apiRequestTimes[endpoint]) {
      this.apiRequestTimes[endpoint] = [];
    }
    
    // Add duration to the array
    this.apiRequestTimes[endpoint].push(duration);
  }
  
  /**
   * Mark a custom performance metric
   */
  public mark(name: string): void {
    if (!this.options.enabled) return;
    
    performance.mark(name);
  }
  
  /**
   * Measure time between two marks
   */
  public measure(name: string, startMark: string, endMark: string): void {
    if (!this.options.enabled) return;
    
    try {
      performance.measure(name, startMark, endMark);
      const entry = performance.getEntriesByName(name, 'measure')[0];
      
      // Store the measurement
      this.customMetrics[name] = entry.duration;
      
      // Update metrics object
      this.metrics.customMetrics = this.customMetrics;
    } catch (e) {
      console.warn(`Failed to measure ${name}:`, e);
    }
  }
  
  /**
   * Log metrics to console
   */
  public logMetrics(): void {
    if (!this.options.enabled || !this.options.logToConsole) return;
    
    console.group('Performance Metrics');
    
    // Core Web Vitals
    console.log('Core Web Vitals:');
    console.log(`- First Contentful Paint: ${this.metrics.firstContentfulPaint?.toFixed(2)}ms`);
    console.log(`- Largest Contentful Paint: ${this.metrics.largestContentfulPaint?.toFixed(2)}ms`);
    console.log(`- First Input Delay: ${this.metrics.firstInputDelay?.toFixed(2)}ms`);
    console.log(`- Cumulative Layout Shift: ${this.metrics.cumulativeLayoutShift?.toFixed(4)}`);
    
    // Page load metrics
    console.log('Page Load Metrics:');
    console.log(`- DOM Content Loaded: ${this.metrics.domContentLoaded?.toFixed(2)}ms`);
    console.log(`- DOM Interactive: ${this.metrics.domInteractive?.toFixed(2)}ms`);
    console.log(`- Load Complete: ${this.metrics.loadComplete?.toFixed(2)}ms`);
    
    // Resource metrics
    console.log('Resource Metrics:');
    console.log(`- Resource Count: ${this.metrics.resourceCount}`);
    console.log(`- Resource Load Time: ${this.metrics.resourceLoadTime?.toFixed(2)}ms`);
    
    // JavaScript metrics
    console.log('JavaScript Metrics:');
    console.log(`- Long Tasks: ${this.metrics.longTasks}`);
    console.log(`- Long Tasks Time: ${this.metrics.longTasksTime?.toFixed(2)}ms`);
    
    // API request metrics
    console.log('API Request Metrics:');
    for (const [endpoint, times] of Object.entries(this.apiRequestTimes)) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      console.log(`- ${endpoint}: ${avgTime.toFixed(2)}ms (${times.length} requests)`);
    }
    
    // Custom metrics
    if (this.metrics.customMetrics && Object.keys(this.metrics.customMetrics).length > 0) {
      console.log('Custom Metrics:');
      for (const [name, value] of Object.entries(this.metrics.customMetrics)) {
        console.log(`- ${name}: ${value.toFixed(2)}ms`);
      }
    }
    
    console.groupEnd();
  }
  
  /**
   * Send metrics to server
   */
  private async sendMetricsToServer(): Promise<void> {
    if (!this.options.enabled || !this.options.sendToServer) return;
    
    try {
      // Add API request metrics
      const apiMetrics: Record<string, number> = {};
      
      for (const [endpoint, times] of Object.entries(this.apiRequestTimes)) {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        apiMetrics[endpoint] = avgTime;
      }
      
      // Prepare metrics payload
      const payload = {
        ...this.metrics,
        apiMetrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      
      // Send metrics to server
      const response = await fetch(this.options.metricsEndpoint || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Use keepalive to ensure the request completes even if the page is unloaded
        keepalive: true,
      });
      
      if (!response.ok) {
        console.warn('Failed to send metrics to server:', response.statusText);
      }
    } catch (error) {
      console.warn('Failed to send metrics to server:', error);
    }
  }
  
  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Disconnect all observers
   */
  public disconnect(): void {
    this.lcpObserver?.disconnect();
    this.fidObserver?.disconnect();
    this.clsObserver?.disconnect();
    this.resourceObserver?.disconnect();
    this.longTasksObserver?.disconnect();
  }
}

// Create and export a default instance
export const performanceMonitoring = new PerformanceMonitoringService();
