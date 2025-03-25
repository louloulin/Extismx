/**
 * Validation Utilities
 * 
 * This module provides utilities for data validation.
 */

/**
 * Email validation options
 */
export interface EmailValidationOptions {
  allowDisplayName?: boolean;
  requireTLD?: boolean;
  allowIPDomain?: boolean;
}

/**
 * Validate an email address
 * 
 * @param email Email to validate
 * @param options Validation options
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string, options: EmailValidationOptions = {}): boolean {
  const {
    allowDisplayName = false,
    requireTLD = true,
    allowIPDomain = false,
  } = options;

  if (!email || typeof email !== 'string') {
    return false;
  }

  // Handle display name format: "Display Name <email@domain.com>"
  if (allowDisplayName) {
    const matches = email.match(/^(.+)\s<(.+)>$/);
    if (matches) {
      email = matches[2];
    }
  }

  // Basic email pattern
  const emailPattern = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  
  // More complex check if we need special cases
  if (requireTLD || allowIPDomain) {
    // Split into local and domain parts
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }
    
    const [local, domain] = parts;
    
    // Check local part is not empty
    if (!local || local.length > 64) {
      return false;
    }
    
    // Check domain part is valid
    if (!domain) {
      return false;
    }
    
    // If domain is IP address
    if (allowIPDomain && isValidIPAddress(domain)) {
      return true;
    }
    
    // Check domain has a TLD if required
    if (requireTLD) {
      const domainParts = domain.split('.');
      if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
        return false;
      }
    }
  }
  
  return emailPattern.test(email);
}

/**
 * Validate a URL
 * 
 * @param url URL to validate
 * @param requireProtocol Whether protocol is required
 * @returns True if valid, false otherwise
 */
export function isValidUrl(url: string, requireProtocol = true): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // If protocol is required, check for it
  if (requireProtocol && !/^(https?|ftp):\/\//i.test(url)) {
    return false;
  }

  try {
    // Try to create a URL object, which will throw if invalid
    new URL(requireProtocol ? url : `http://${url}`);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validate an IP address (IPv4 or IPv6)
 * 
 * @param ip IP address to validate
 * @returns True if valid, false otherwise
 */
export function isValidIPAddress(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

/**
 * Validate an IPv4 address
 * 
 * @param ip IPv4 address to validate
 * @returns True if valid, false otherwise
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // IPv4 pattern: 4 numbers between 0-255 separated by dots
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Pattern.test(ip);
}

/**
 * Validate an IPv6 address
 * 
 * @param ip IPv6 address to validate
 * @returns True if valid, false otherwise
 */
export function isValidIPv6(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // IPv6 pattern: 8 groups of 1-4 hexadecimal digits separated by colons
  // Also allows for the :: notation for consecutive zeros
  const ipv6Pattern = /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))$/;
  return ipv6Pattern.test(ip);
}

/**
 * Validate a UUID (v4)
 * 
 * @param uuid UUID to validate
 * @returns True if valid, false otherwise
 */
export function isValidUuid(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // UUID v4 pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
}

/**
 * Validate a semantic version string
 * 
 * @param version Version string to validate
 * @param allowPreRelease Allow pre-release versions
 * @returns True if valid, false otherwise
 */
export function isValidSemVer(version: string, allowPreRelease = true): boolean {
  if (!version || typeof version !== 'string') {
    return false;
  }
  
  const semverPattern = allowPreRelease
    ? /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    : /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
    
  return semverPattern.test(version);
}

/**
 * Validation result with error message
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Data validator for complex validation with custom rules
 */
export class Validator {
  private rules: Array<{ test: (value: any) => boolean, message: string }> = [];
  
  /**
   * Add a validation rule
   * 
   * @param test Function that tests the value
   * @param message Error message if validation fails
   * @returns this for chaining
   */
  public addRule(test: (value: any) => boolean, message: string): Validator {
    this.rules.push({ test, message });
    return this;
  }
  
  /**
   * Validate a value against all rules
   * 
   * @param value Value to validate
   * @returns Validation result
   */
  public validate(value: any): ValidationResult {
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        return {
          valid: false,
          message: rule.message
        };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Create a validator that requires a value to be defined and not empty
   */
  public static required(message = 'Value is required'): Validator {
    return new Validator().addRule(value => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value !== undefined && value !== null;
    }, message);
  }
  
  /**
   * Create a validator for email addresses
   */
  public static email(message = 'Invalid email address'): Validator {
    return new Validator().addRule(value => isValidEmail(value), message);
  }
  
  /**
   * Create a validator for URLs
   */
  public static url(message = 'Invalid URL'): Validator {
    return new Validator().addRule(value => isValidUrl(value), message);
  }
  
  /**
   * Create a validator for minimum length
   */
  public static minLength(min: number, message = `Must be at least ${min} characters`): Validator {
    return new Validator().addRule(value => {
      if (typeof value !== 'string') return false;
      return value.length >= min;
    }, message);
  }
  
  /**
   * Create a validator for maximum length
   */
  public static maxLength(max: number, message = `Must be no more than ${max} characters`): Validator {
    return new Validator().addRule(value => {
      if (typeof value !== 'string') return false;
      return value.length <= max;
    }, message);
  }
} 