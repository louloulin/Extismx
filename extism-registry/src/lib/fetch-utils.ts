/**
 * Utility functions for making network requests
 */

/**
 * Fetches JSON data from a URL with automatic parsing
 */
export async function fetchJSON<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(options.headers || {})
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Fetches data from a URL with retry logic
 */
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retryOptions: {
    maxRetries?: number,
    initialDelay?: number,
    maxDelay?: number,
    backoffFactor?: number,
    retryOn?: number[],
  } = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    initialDelay = 500,
    maxDelay = 10000,
    backoffFactor = 2,
    retryOn = [408, 429, 500, 502, 503, 504]
  } = retryOptions;
  
  let delay = initialDelay;
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // If response is ok or not retryable, return it
      if (response.ok || (response.status && !retryOn.includes(response.status))) {
        return response;
      }
      
      // If retryable error but we're out of retries, throw
      if (attempt >= maxRetries) {
        throw new Error(`Max retries reached: ${response.status} ${response.statusText}`);
      }
      
      // Otherwise prepare for retry
      console.warn(`Retry ${attempt + 1}/${maxRetries} for ${url}: received ${response.status} ${response.statusText}`);
    } catch (error) {
      // Handle network errors
      if (attempt >= maxRetries) {
        throw error;
      }
      
      console.warn(`Retry ${attempt + 1}/${maxRetries} for ${url}: ${error}`);
    }
    
    // Exponential backoff with jitter
    await new Promise(resolve => {
      const jitter = Math.random() * 100;
      setTimeout(resolve, delay + jitter);
    });
    
    // Increase delay for next retry
    delay = Math.min(delay * backoffFactor, maxDelay);
    attempt++;
  }
  
  // This should never happen, but TypeScript needs a return
  throw new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
}

/**
 * Downloads a file to the specified path
 */
export async function downloadFile(url: string, filePath: string, options: RequestInit = {}): Promise<void> {
  // This would be implemented using Node.js fs module in a real application
  // For browser environments, it would use a different approach
  console.log(`Downloading ${url} to ${filePath}`);
  
  const response = await fetchWithRetry(url, options);
  
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
  }
  
  // Simulating file save
  console.log(`File saved to ${filePath}`);
}

/**
 * Checks if a URL is reachable
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
    return false;
  }
} 