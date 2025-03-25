/**
 * Network Utilities
 * 
 * This module provides utilities for network operations like HTTP requests.
 */

import { logger } from '../logging';

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retry?: {
    attempts: number;
    delay: number;
    backoffFactor?: number;
  };
  validateStatus?: (status: number) => boolean;
}

/**
 * HTTP response
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };
}

/**
 * Default request options
 */
const defaultOptions: HttpRequestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
  retry: {
    attempts: 3,
    delay: 1000,
    backoffFactor: 2,
  },
  validateStatus: (status) => status >= 200 && status < 300,
};

/**
 * Check if a URL is reachable
 * 
 * @param url URL to check
 * @param timeout Timeout in milliseconds
 * @returns Promise resolving to boolean indicating if the URL is reachable
 */
export async function isReachable(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    logger.warn(`Failed to reach ${url}`, { error });
    return false;
  }
}

/**
 * Make an HTTP request with customizable options and retry logic
 * 
 * @param url URL to request
 * @param options Request options
 * @returns Promise resolving to HTTP response
 */
export async function request<T = any>(url: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
  // Create a new options object with defaults and user options
  const mergedOptions: HttpRequestOptions = {
    method: options.method || defaultOptions.method,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    },
    body: options.body,
    timeout: options.timeout !== undefined ? options.timeout : defaultOptions.timeout,
    validateStatus: options.validateStatus || defaultOptions.validateStatus,
  };

  // Handle retry separately to avoid type issues
  if (options.retry) {
    mergedOptions.retry = {
      attempts: options.retry.attempts,
      delay: options.retry.delay,
      backoffFactor: options.retry.backoffFactor
    };
  } else {
    mergedOptions.retry = { ...defaultOptions.retry! };
  }

  const { method, headers, body, timeout, retry, validateStatus } = mergedOptions;

  // Set up retry loop
  let lastError: Error | null = null;
  let currentDelay = retry!.delay;

  for (let attempt = 0; attempt <= retry!.attempts; attempt++) {
    try {
      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Prepare request options
      const fetchOptions: RequestInit = {
        method,
        headers: headers as HeadersInit,
        signal: controller.signal,
      };

      // Add body if provided
      if (body) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(url, fetchOptions);
      
      // Clear timeout
      clearTimeout(timeoutId);

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Process response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      // Check if response status is valid
      if (validateStatus!(response.status)) {
        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          request: {
            url,
            method: method!,
            headers: headers as Record<string, string>,
          },
        };
      } else {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      lastError = error as Error;
      
      // Log the error
      logger.warn(`Request to ${url} failed on attempt ${attempt + 1}/${retry!.attempts + 1}`, {
        error: lastError,
        attempt,
      });

      // If this was the last attempt, throw the error
      if (attempt === retry!.attempts) {
        throw lastError;
      }

      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Increase delay for next retry using backoff factor
      currentDelay *= retry!.backoffFactor || 1;
    }
  }

  // This should never be reached, but TypeScript requires a return
  throw lastError || new Error(`Request to ${url} failed`);
}

/**
 * Shorthand for GET requests
 */
export async function get<T = any>(url: string, options: Omit<HttpRequestOptions, 'method'> = {}): Promise<HttpResponse<T>> {
  return request<T>(url, { ...options, method: 'GET' });
}

/**
 * Shorthand for POST requests
 */
export async function post<T = any>(url: string, data: any, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
  return request<T>(url, { ...options, method: 'POST', body: data });
}

/**
 * Shorthand for PUT requests
 */
export async function put<T = any>(url: string, data: any, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
  return request<T>(url, { ...options, method: 'PUT', body: data });
}

/**
 * Shorthand for DELETE requests
 */
export async function del<T = any>(url: string, options: Omit<HttpRequestOptions, 'method'> = {}): Promise<HttpResponse<T>> {
  return request<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Shorthand for PATCH requests
 */
export async function patch<T = any>(url: string, data: any, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
  return request<T>(url, { ...options, method: 'PATCH', body: data });
}

/**
 * Fetch JSON data with improved error handling
 * 
 * @param url URL to fetch JSON from
 * @param options Fetch options
 * @returns Promise resolving to parsed JSON data
 */
export async function fetchJSON<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error(`Failed to fetch JSON from ${url}`, { error });
    throw error;
  }
}

/**
 * Fetch with retry functionality
 * 
 * @param url URL to fetch
 * @param options Fetch options
 * @param retryOptions Retry options
 * @returns Promise resolving to fetch response
 */
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retryOptions = { attempts: 3, delay: 1000, backoffFactor: 2 }
): Promise<Response> {
  let lastError: Error | null = null;
  let currentDelay = retryOptions.delay;

  for (let attempt = 0; attempt <= retryOptions.attempts; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
      logger.warn(`Fetch to ${url} failed on attempt ${attempt + 1}/${retryOptions.attempts + 1}`, {
        error: lastError,
        attempt,
      });

      // If this was the last attempt, throw the error
      if (attempt === retryOptions.attempts) {
        throw lastError;
      }

      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Increase delay for next retry
      currentDelay *= retryOptions.backoffFactor;
    }
  }

  // This should never be reached
  throw lastError || new Error(`Fetch to ${url} failed`);
} 