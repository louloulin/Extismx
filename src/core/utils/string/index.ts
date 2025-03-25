/**
 * String Utilities
 * 
 * This module provides utilities for string manipulation.
 */

/**
 * Generate a random string with the specified length
 * 
 * @param length Length of the string to generate
 * @param includeSymbols Whether to include symbols in the random string
 * @returns Random string
 */
export function randomString(length: number, includeSymbols = false): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allowedChars = includeSymbols ? chars + symbols : chars;
  
  let result = '';
  const randomValues = new Uint8Array(length);
  
  // Use crypto.getRandomValues if available, otherwise use Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += allowedChars.charAt(randomValues[i] % allowedChars.length);
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }
  }
  
  return result;
}

/**
 * Generate a random identifier
 * 
 * @param prefix Optional prefix for the identifier
 * @returns Random identifier string
 */
export function randomId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomChars}`;
}

/**
 * Escape HTML special characters in a string
 * 
 * @param str String to escape
 * @returns Escaped string
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Unescape HTML special characters in a string
 * 
 * @param str String to unescape
 * @returns Unescaped string
 */
export function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Remove HTML tags from a string
 * 
 * @param str String to strip HTML from
 * @returns String without HTML tags
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Count the occurrences of a substring in a string
 * 
 * @param str String to search in
 * @param searchValue Substring to search for
 * @param caseSensitive Whether the search should be case sensitive
 * @returns Number of occurrences
 */
export function countOccurrences(str: string, searchValue: string, caseSensitive = true): number {
  if (!str || !searchValue) {
    return 0;
  }
  
  const normalizedStr = caseSensitive ? str : str.toLowerCase();
  const normalizedSearchValue = caseSensitive ? searchValue : searchValue.toLowerCase();
  
  let count = 0;
  let position = normalizedStr.indexOf(normalizedSearchValue);
  
  while (position !== -1) {
    count++;
    position = normalizedStr.indexOf(normalizedSearchValue, position + 1);
  }
  
  return count;
}

/**
 * Check if a string contains only ASCII characters
 * 
 * @param str String to check
 * @returns True if string contains only ASCII, false otherwise
 */
export function isAscii(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str);
}

/**
 * Generate a slug from a string (for URLs, IDs, etc.)
 * 
 * @param str String to convert to slug
 * @returns Slugified string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

/**
 * Extract the first paragraph from a text
 * 
 * @param text Text to extract from
 * @param maxLength Maximum length of the extract
 * @returns First paragraph
 */
export function extractFirstParagraph(text: string, maxLength = 0): string {
  if (!text) {
    return '';
  }
  
  // Find the first paragraph
  const paragraphs = text.split(/\n\s*\n/);
  let firstParagraph = paragraphs[0].trim();
  
  // Clean up any markdown or HTML
  firstParagraph = stripHtml(firstParagraph);
  
  // Limit length if specified
  if (maxLength > 0 && firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength) + '...';
  }
  
  return firstParagraph;
}

/**
 * Pluralize a word based on count
 * 
 * @param singular Singular form of the word
 * @param plural Plural form of the word (defaults to singular + 's')
 * @param count Count to determine plural or singular
 * @returns Pluralized or singular word
 */
export function pluralize(singular: string, count: number, plural?: string): string {
  // Use default plural (add 's') if not provided
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

/**
 * Format a byte size to a human-readable string
 * 
 * @param bytes Size in bytes
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
} 