/**
 * Enterprise Module
 * 
 * This module provides enterprise-level features for the platform.
 */

import { EnterpriseSupport } from './features/support';
import { EnterpriseIntegration } from './features/integration';

// Export all types
export * from './types';

// Export all feature modules
export { EnterpriseSupport } from './features/support';
export { EnterpriseIntegration } from './features/integration';

// Create singleton instances
const enterpriseSupport = new EnterpriseSupport();
const enterpriseIntegration = new EnterpriseIntegration();

/**
 * Enterprise Services
 */
export const enterprise = {
  support: enterpriseSupport,
  integration: enterpriseIntegration
};

export default enterprise; 