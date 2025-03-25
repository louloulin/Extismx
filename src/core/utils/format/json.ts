/**
 * JSON Format Utilities
 * 
 * This module provides utilities for formatting JSON data.
 */

/**
 * Options for JSON formatting
 */
export interface JsonFormatOptions {
  indent?: number;
  sortKeys?: boolean;
  maxDepth?: number;
}

/**
 * Format a JSON object as a string with customizable formatting options
 * 
 * @param data The object to format as JSON
 * @param options Formatting options
 * @returns Formatted JSON string
 */
export function formatJson(data: unknown, options: JsonFormatOptions = {}): string {
  const {
    indent = 2,
    sortKeys = false,
    maxDepth = Infinity
  } = options;

  // Handle case where maxDepth is set
  if (maxDepth < Infinity) {
    return formatWithMaxDepth(data, indent, sortKeys, maxDepth);
  }

  // Use JSON.stringify with sorting if needed
  return JSON.stringify(
    data,
    sortKeys ? getSortReplacer() : undefined,
    indent
  );
}

/**
 * Format JSON with a maximum depth limit
 */
function formatWithMaxDepth(
  data: unknown,
  indent: number,
  sortKeys: boolean,
  maxDepth: number
): string {
  let currentDepth = 0;

  // Custom replacer function that handles max depth
  const replacer = (key: string, value: unknown) => {
    // For the root object, reset the depth
    if (key === '') {
      currentDepth = 0;
      return value;
    }

    // Increment depth for nested objects/arrays
    if (typeof value === 'object' && value !== null) {
      currentDepth++;
      
      // If max depth reached, return a placeholder
      if (currentDepth > maxDepth) {
        return Array.isArray(value) ? '[...]' : '{...}';
      }
      
      // Decrement for the way back up
      currentDepth--;
    }

    return value;
  };

  // Use the depth-aware replacer with sorting if needed
  return JSON.stringify(
    data,
    sortKeys ? 
      (key: string, value: any) => getSortReplacer()(key, replacer(key, value)) : 
      replacer,
    indent
  );
}

/**
 * Create a replacer function that sorts object keys
 */
function getSortReplacer() {
  return (key: string, value: any): any => {
    // Only sort if it's an object and not an array
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce((result: Record<string, any>, key) => {
          result[key] = value[key];
          return result;
        }, {});
    }
    return value;
  };
}

/**
 * Minify a JSON string by removing whitespace
 * 
 * @param jsonString The JSON string to minify
 * @returns Minified JSON string
 */
export function minifyJson(jsonString: string): string {
  try {
    // Parse and re-stringify without indentation
    return JSON.stringify(JSON.parse(jsonString));
  } catch (error) {
    // Return original if invalid JSON
    console.error('Error minifying JSON:', error);
    return jsonString;
  }
}

/**
 * Check if a string is valid JSON
 * 
 * @param str The string to check
 * @returns True if valid JSON, false otherwise
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
} 