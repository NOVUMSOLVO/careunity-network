/**
 * Logger Utility
 * 
 * This module provides logging functionality for the application.
 */

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Logger interface
interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

/**
 * Simple console logger implementation
 */
class ConsoleLogger implements Logger {
  private logLevel: LogLevel = 'info';

  constructor(level?: LogLevel) {
    if (level) {
      this.logLevel = level;
    }
  }

  /**
   * Set the log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Format a log message
   */
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (meta) {
      if (meta instanceof Error) {
        formattedMessage += `\n${meta.stack || meta.message}`;
      } else if (typeof meta === 'object') {
        try {
          formattedMessage += `\n${JSON.stringify(meta, null, 2)}`;
        } catch (e) {
          formattedMessage += `\n[Object cannot be stringified]`;
        }
      } else {
        formattedMessage += `\n${meta}`;
      }
    }
    
    return formattedMessage;
  }

  /**
   * Log a debug message
   */
  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  /**
   * Log an error message
   */
  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}

// Create a default logger instance
const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const logger = new ConsoleLogger(logLevel);

// Export the logger
export { logger, LogLevel, Logger };
