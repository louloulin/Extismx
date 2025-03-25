/**
 * Number Format Utilities
 * 
 * This module provides utilities for number formatting.
 */

/**
 * Number format options
 */
export interface NumberFormatOptions {
  decimals?: number;
  decimalSeparator?: string;
  thousandsSeparator?: string;
  padZero?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Format a number with the specified options
 * 
 * @param value Number to format
 * @param options Format options
 * @returns Formatted number string
 */
export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  if (isNaN(value)) {
    return 'NaN';
  }

  const {
    decimals = 2,
    decimalSeparator = '.',
    thousandsSeparator = ',',
    padZero = false,
    prefix = '',
    suffix = ''
  } = options;

  // Format the number with fixed decimal places
  let formatted: string;
  
  if (padZero) {
    formatted = value.toFixed(decimals);
  } else {
    // Only show decimal places if needed
    const fixedValue = value.toFixed(decimals);
    const intValue = Math.floor(value).toString();
    
    if (parseFloat(fixedValue) === parseInt(intValue, 10)) {
      formatted = intValue;
    } else {
      formatted = fixedValue;
    }
  }

  // Replace decimal separator if needed
  if (decimalSeparator !== '.') {
    formatted = formatted.replace('.', decimalSeparator);
  }

  // Add thousands separator
  if (thousandsSeparator) {
    const parts = formatted.split(decimalSeparator);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    formatted = parts.join(decimalSeparator);
  }

  // Add prefix and suffix
  return prefix + formatted + suffix;
}

/**
 * Format a number as currency
 * 
 * @param value Number to format
 * @param currency Currency code (default: 'USD')
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format a number as percentage
 * 
 * @param value Number to format (0-1 range)
 * @param decimals Decimal places (default: 0)
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals = 0, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a number with SI prefix (e.g., 1.2k, 3.5M)
 * 
 * @param value Number to format
 * @param decimals Decimal places (default: 1)
 * @returns Formatted string with SI prefix
 */
export function formatWithSIPrefix(value: number, decimals = 1): string {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const units = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
  
  // Find appropriate unit
  const order = Math.min(Math.floor(Math.log10(absValue) / 3), units.length - 1);
  
  if (order === 0) {
    // If less than 1000, just return the number
    return sign + absValue.toFixed(decimals).replace(/\.0+$/, '');
  }
  
  // Format with SI prefix
  const num = (absValue / Math.pow(10, order * 3)).toFixed(decimals).replace(/\.0+$/, '');
  return sign + num + units[order];
}

/**
 * Format a file size (e.g., bytes to KB, MB, etc.)
 * 
 * @param bytes Size in bytes
 * @param decimals Decimal places (default: 2)
 * @param binary Use binary units (1024) instead of decimal (1000)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals = 2, binary = true): string {
  if (bytes === 0) return '0 Bytes';
  
  const base = binary ? 1024 : 1000;
  const units = binary 
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const order = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1);
  
  return (bytes / Math.pow(base, order)).toFixed(decimals) + ' ' + units[order];
}

/**
 * Round a number to the specified number of decimal places
 * 
 * @param value Number to round
 * @param decimals Decimal places (default: 0)
 * @returns Rounded number
 */
export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
} 