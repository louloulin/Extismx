/**
 * Plugin Development Kit (PDK)
 * 
 * This module provides a unified interface for building, testing, and publishing plugins
 * for various programming languages.
 */

// Export common PDK interfaces and classes
export * from './common/builder';
export * from './common/template';
export * from './common/tester';
export * from './common/publisher';
export * from './common/types';

// Export language-specific PDKs
export * as typescript from './typescript';
export * as python from './python';
export * as rust from './rust';
export * as go from './go';
export * as cpp from './cpp';

// TODO: Export other language PDKs when implemented 