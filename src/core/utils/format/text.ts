/**
 * Text Format Utilities
 * 
 * This module provides utilities for text formatting.
 */

/**
 * Convert a string to camelCase
 * 
 * @param str String to convert
 * @returns camelCase string
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+|[-_]/g, '');
}

/**
 * Convert a string to PascalCase
 * 
 * @param str String to convert
 * @returns PascalCase string
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+|[-_]/g, '');
}

/**
 * Convert a string to snake_case
 * 
 * @param str String to convert
 * @returns snake_case string
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+|[-]/g, '_')
    .toLowerCase();
}

/**
 * Convert a string to kebab-case
 * 
 * @param str String to convert
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+|[_]/g, '-')
    .toLowerCase();
}

/**
 * Truncate a string to a maximum length with an optional suffix
 * 
 * @param str String to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add if truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Pad a string to the left to reach the specified length
 * 
 * @param str String to pad
 * @param length Target length
 * @param char Character to use for padding (default: ' ')
 * @returns Padded string
 */
export function padLeft(str: string, length: number, char = ' '): string {
  return str.padStart(length, char);
}

/**
 * Pad a string to the right to reach the specified length
 * 
 * @param str String to pad
 * @param length Target length
 * @param char Character to use for padding (default: ' ')
 * @returns Padded string
 */
export function padRight(str: string, length: number, char = ' '): string {
  return str.padEnd(length, char);
}

/**
 * Format text as a code block with syntax highlighting hint
 * 
 * @param text Text to format
 * @param language Language for syntax highlighting
 * @returns Formatted code block
 */
export function formatCodeBlock(text: string, language = ''): string {
  return '```' + language + '\n' + text + '\n```';
}

/**
 * Format text as an indented block
 * 
 * @param text Text to indent
 * @param indent Number of spaces for indentation
 * @returns Indented text
 */
export function indent(text: string, indent = 2): string {
  const spaces = ' '.repeat(indent);
  return text
    .split('\n')
    .map(line => spaces + line)
    .join('\n');
} 