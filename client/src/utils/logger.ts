/**
 * Client-side Logger Utility
 * 
 * This module provides a centralized logging system for the client application.
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableLocalStorage: boolean;
  maxLogsInLocalStorage: number;
  prefix: string;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableLocalStorage: true,
  maxLogsInLocalStorage: 100,
  prefix: 'careunity',
};

/**
 * Logger class
 */
class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private localStorageKey = 'careunity_logs';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.loadLogsFromLocalStorage();
  }

  /**
   * Load logs from local storage
   */
  private loadLogsFromLocalStorage(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const storedLogs = localStorage.getItem(this.localStorageKey);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Error loading logs from local storage:', error);
    }
  }

  /**
   * Save logs to local storage
   */
  private saveLogsToLocalStorage(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      // Limit the number of logs stored
      const logsToStore = this.logs.slice(-this.config.maxLogsInLocalStorage);
      localStorage.setItem(this.localStorageKey, JSON.stringify(logsToStore));
    } catch (error) {
      console.error('Error saving logs to local storage:', error);
    }
  }

  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    // Add to in-memory logs
    this.logs.push(entry);

    // Trim logs if they exceed the maximum
    if (this.logs.length > this.config.maxLogsInLocalStorage * 2) {
      this.logs = this.logs.slice(-this.config.maxLogsInLocalStorage);
    }

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Save to local storage
    if (this.config.enableLocalStorage) {
      this.saveLogsToLocalStorage();
    }
  }

  /**
   * Check if we should log at the specified level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const configLevelIndex = levels.indexOf(this.config.minLevel);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= configLevelIndex;
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, context } = entry;
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    
    let consoleMethod: 'log' | 'info' | 'warn' | 'error';
    switch (level) {
      case LogLevel.DEBUG:
        consoleMethod = 'log';
        break;
      case LogLevel.INFO:
        consoleMethod = 'info';
        break;
      case LogLevel.WARN:
        consoleMethod = 'warn';
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        consoleMethod = 'error';
        break;
      default:
        consoleMethod = 'log';
    }
    
    if (context) {
      console[consoleMethod](`${prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`, context);
    } else {
      console[consoleMethod](`${prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Log a debug message
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  public error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log a fatal message
   */
  public fatal(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context);
  }

  /**
   * Get recent logs
   */
  public getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear logs
   */
  public clearLogs(): void {
    this.logs = [];
    if (this.config.enableLocalStorage && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.localStorageKey);
    }
  }
}

// Create and export a singleton instance
export const logger = new Logger();

export default logger;
