/**
 * Date Format Utilities
 * 
 * This module provides utilities for date formatting.
 */

/**
 * Date format patterns
 */
export enum DateFormat {
  ISO = 'iso',
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  FULL = 'full',
  RELATIVE = 'relative'
}

/**
 * Date format options
 */
export interface DateFormatOptions {
  format?: DateFormat | string;
  includeTime?: boolean;
  timeZone?: string;
  locale?: string;
}

/**
 * Format a date according to the specified format
 * 
 * @param date Date to format
 * @param options Format options
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, options: DateFormatOptions = {}): string {
  const {
    format = DateFormat.MEDIUM,
    includeTime = false,
    timeZone = 'UTC',
    locale = 'en-US'
  } = options;

  // Convert input to Date object
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // Handle specific format types
  switch (format) {
    case DateFormat.ISO:
      return dateObj.toISOString();
    
    case DateFormat.RELATIVE:
      return formatRelativeDate(dateObj);
    
    case DateFormat.SHORT:
    case DateFormat.MEDIUM:
    case DateFormat.LONG:
    case DateFormat.FULL:
      return formatWithIntl(dateObj, format, includeTime, timeZone, locale);
    
    default:
      // Assume it's a custom format string
      return formatCustom(dateObj, format as string);
  }
}

/**
 * Format date using Intl.DateTimeFormat
 */
function formatWithIntl(
  date: Date, 
  format: DateFormat,
  includeTime: boolean,
  timeZone: string,
  locale: string
): string {
  // Map format enum to Intl options
  let dateStyle: 'short' | 'medium' | 'long' | 'full';
  
  switch (format) {
    case DateFormat.SHORT:
      dateStyle = 'short';
      break;
    case DateFormat.MEDIUM:
      dateStyle = 'medium';
      break;
    case DateFormat.LONG:
      dateStyle = 'long';
      break;
    case DateFormat.FULL:
      dateStyle = 'full';
      break;
    default:
      dateStyle = 'medium';
  }

  // Create formatter options
  const options: Intl.DateTimeFormatOptions = {
    dateStyle,
    timeZone
  };

  // Add time if requested
  if (includeTime) {
    options.timeStyle = 'medium';
  }

  // Format using Intl
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a date using a custom format string
 * Supported tokens:
 * - YYYY: 4-digit year
 * - MM: 2-digit month
 * - DD: 2-digit day
 * - HH: 2-digit hour (24-hour)
 * - mm: 2-digit minute
 * - ss: 2-digit second
 * - MMMM: Full month name
 * - MMM: Short month name
 * - dddd: Full day name
 * - ddd: Short day name
 */
function formatCustom(date: Date, formatString: string): string {
  const tokens: Record<string, string> = {
    'YYYY': date.getFullYear().toString(),
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'DD': date.getDate().toString().padStart(2, '0'),
    'HH': date.getHours().toString().padStart(2, '0'),
    'mm': date.getMinutes().toString().padStart(2, '0'),
    'ss': date.getSeconds().toString().padStart(2, '0'),
    'MMMM': date.toLocaleString('en-US', { month: 'long' }),
    'MMM': date.toLocaleString('en-US', { month: 'short' }),
    'dddd': date.toLocaleString('en-US', { weekday: 'long' }),
    'ddd': date.toLocaleString('en-US', { weekday: 'short' })
  };

  // Replace tokens in format string
  let result = formatString;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }

  return result;
}

/**
 * Format a date relative to now (e.g., "5 minutes ago")
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return diffSecs <= 5 ? 'just now' : `${diffSecs} seconds ago`;
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }
}

/**
 * Parse a date string using specified format
 * 
 * @param dateStr Date string to parse
 * @param format Format of the date string
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(dateStr: string, format = 'YYYY-MM-DD'): Date | null {
  // If it's ISO format, use built-in parser
  if (format === DateFormat.ISO || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z$/.test(dateStr)) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  // For custom format, we need to parse manually
  try {
    // Extract parts based on format
    const dateParts: Record<string, number> = {};
    const formatParts = format.match(/(YYYY|MM|DD|HH|mm|ss)/g) || [];
    
    for (const part of formatParts) {
      const index = format.indexOf(part);
      const value = dateStr.substring(index, index + part.length);
      dateParts[part] = parseInt(value, 10);
    }

    // Create date from parts
    const date = new Date(
      dateParts.YYYY || 0, 
      (dateParts.MM || 1) - 1, 
      dateParts.DD || 1,
      dateParts.HH || 0,
      dateParts.mm || 0,
      dateParts.ss || 0
    );

    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
} 