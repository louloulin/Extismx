/**
 * Logging Utilities
 * 
 * This module provides logging utilities for the application.
 */

import { format } from 'util';
import { formatDate } from '../format/date';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  NONE = 'none'
}

/**
 * Log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: Record<string, any>;
}

/**
 * Logger options
 */
export interface LoggerOptions {
  minLevel?: LogLevel;
  includeTimestamp?: boolean;
  formatOutput?: boolean;
  outputToConsole?: boolean;
  outputToFile?: boolean;
  logFilePath?: string;
  context?: string;
}

/**
 * Logger class for consistent logging
 */
export class Logger {
  private options: LoggerOptions;
  private static instance: Logger;
  private logHistory: LogEntry[] = [];

  /**
   * Create a new logger
   * 
   * @param options Logger options
   */
  constructor(options: LoggerOptions = {}) {
    this.options = {
      minLevel: LogLevel.INFO,
      includeTimestamp: true,
      formatOutput: true,
      outputToConsole: true,
      outputToFile: false,
      logFilePath: './logs/app.log',
      context: '',
      ...options
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  /**
   * Log a message at debug level
   */
  public debug(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log a message at info level
   */
  public info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a message at warn level
   */
  public warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log a message at error level
   */
  public error(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log a message with the specified level
   */
  public log(level: LogLevel, message: string, data?: Record<string, any>): void {
    // Check if this level should be logged
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        context: this.options.context,
        data
      };

      // Add to history
      this.logHistory.push(entry);

      // Output to console if enabled
      if (this.options.outputToConsole) {
        this.writeToConsole(entry);
      }

      // Output to file if enabled
      if (this.options.outputToFile) {
        this.writeToFile(entry);
      }
    }
  }

  /**
   * Create a child logger with additional context
   */
  public createChildLogger(context: string, options?: Partial<LoggerOptions>): Logger {
    return new Logger({
      ...this.options,
      ...options,
      context: this.options.context
        ? `${this.options.context}:${context}`
        : context
    });
  }

  /**
   * Get log history
   */
  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  public clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Determine if a message at the given level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(this.options.minLevel || LogLevel.INFO);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Format a log entry as a string
   */
  private formatLogEntry(entry: LogEntry): string {
    const parts: string[] = [];
    
    // Add timestamp if enabled
    if (this.options.includeTimestamp) {
      parts.push(`[${formatDate(entry.timestamp, { format: 'YYYY-MM-DD HH:mm:ss' })}]`);
    }
    
    // Add level (uppercase)
    parts.push(`[${entry.level.toUpperCase()}]`);
    
    // Add context if available
    if (entry.context) {
      parts.push(`[${entry.context}]`);
    }
    
    // Add message
    parts.push(entry.message);
    
    // Add data if available and formatting is enabled
    if (entry.data && this.options.formatOutput) {
      parts.push(format('%o', entry.data));
    }
    
    return parts.join(' ');
  }

  /**
   * Write a log entry to the console
   */
  private writeToConsole(entry: LogEntry): void {
    const formattedEntry = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedEntry);
        break;
      case LogLevel.INFO:
        console.info(formattedEntry);
        break;
      case LogLevel.WARN:
        console.warn(formattedEntry);
        break;
      case LogLevel.ERROR:
        console.error(formattedEntry);
        break;
    }
  }

  /**
   * Write a log entry to a file
   */
  private writeToFile(entry: LogEntry): void {
    // In a real implementation, this would write to a file
    // For now, we'll just note that file logging is enabled but not implemented
    if (entry.level === LogLevel.WARN || entry.level === LogLevel.ERROR) {
      console.warn('File logging is enabled but not implemented in this version');
    }
  }
}

// Export a default logger instance
export const logger = Logger.getInstance(); 