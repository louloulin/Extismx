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

// Export language-specific PDKs
export * as typescript from './typescript';
export * as python from './python';
export * as rust from './rust';

// TODO: Export other language PDKs when implemented
// export * as go from './go';
// export * as cpp from './cpp'; 