/**
 * Loggerama3000 - A flexible and type-safe logging solution
 * 
 * @packageDocumentation
 * 
 * This package provides a highly configurable, type-safe logging solution
 * built on Winston for Node.js and Bun applications.
 * 
 * @example Basic usage
 * ```ts
 * import createLogger from 'loggerama3000';
 * 
 * const logger = createLogger();
 * logger.info('Application started');
 * ```
 * 
 * @example Advanced configuration
 * ```ts
 * import createLogger from 'loggerama3000';
 * import { MB } from 'loggerama3000/utils';
 * 
 * const logger = createLogger({
 *   logName: 'api-server',
 *   logDirectory: '/var/logs',
 *   level: 'info',
 *   maxFileSize: MB(10),
 *   useDailyRotation: true
 * });
 * ```
 * @description This is a simple logger that uses the default options.
 */

// Export the default logger creation function
export { createSimpleLogger, createLogger as default } from "./log-facotry";

// Re-export types for TypeScript users
export * from "./types";

// Export utility functions
export * from "./utils";
 
