import * as path from 'path'
import type { Bytes, SafePath } from './types'

/**
 * Creates a type-safe path from a string
 * 
 * @param filePath - The path string to convert to a SafePath
 * @returns A branded SafePath that has been normalized and validated
 * 
 * @remarks
 * This function performs several safety operations:
 * 1. Normalizes the path to handle any platform-specific separators
 * 2. Converts relative paths to absolute paths based on the current working directory
 * 3. Applies type branding to ensure type safety throughout the application
 * 
 * @example
 * ```ts
 * const logDir = createSafePath('./logs');
 * // Returns an absolute path like /current/working/dir/logs
 * ```
 */
export const createSafePath = (filePath: string): SafePath => {
  // Normalize the path to handle any platform-specific separators
  const normalizedPath = path.normalize(filePath)
  // Ensure absolute paths are handled correctly
  const safePath = path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(process.cwd(), normalizedPath)
  return safePath as SafePath
}

/**
 * Gets the default log directory path
 * 
 * @returns A SafePath pointing to the 'logs' subdirectory in the current working directory
 * 
 * @example
 * ```ts
 * const defaultPath = getDefaultLogPath();
 * // Returns something like /current/working/dir/logs
 * ```
 */
export const getDefaultLogPath = (): SafePath => {
  const cwd = createSafePath(process.cwd())
  return joinSafePaths(cwd, 'logs')
}

/**
 * Joins multiple path segments into a single SafePath
 * 
 * @param paths - The path segments to join
 * @returns A single SafePath combining all segments
 * 
 * @remarks
 * This function safely combines multiple path segments, handling both
 * string paths and already validated SafePath instances.
 * 
 * @example
 * ```ts
 * const fullPath = joinSafePaths('/var/log', 'app', 'errors');
 * // Returns /var/log/app/errors as a SafePath
 * ```
 */
export const joinSafePaths = (...paths: (string | SafePath)[]): SafePath => {
  return createSafePath(path.join(...paths.map(p => p.toString())))
}

/**
 * Creates a SafePath by appending a suffix to a base path
 * 
 * @param basePath - The base path to which the suffix will be appended
 * @param suffix - The string suffix to append
 * @returns A new SafePath with the suffix appended
 * 
 * @example
 * ```ts
 * const logPath = createSafePath('/var/log/app');
 * const errorLogPath = createSafePathWithSuffix(logPath, '-error.log');
 * // Returns /var/log/app-error.log as a SafePath
 * ```
 */
export const createSafePathWithSuffix = (basePath: SafePath, suffix: string): SafePath => {
  return createSafePath(`${basePath}${suffix}`)
}

/**
 * Creates a type-safe byte size value
 * 
 * @param bytes - The number of bytes
 * @returns A branded Bytes value
 * @throws If the byte count is negative
 * 
 * @remarks
 * This function validates that the byte count is non-negative
 * and applies type branding to ensure type safety.
 * 
 * @example
 * ```ts
 * const fileSize = createBytes(1024);
 * // Returns a branded Bytes value of 1024
 * ```
 */
export const createBytes = (bytes: number): Bytes => {
  if (bytes < 0) {
    throw new Error('Bytes cannot be negative')
  }
  return bytes as Bytes
}

/**
 * Converts megabytes to bytes with type safety
 * 
 * @param size - The size in megabytes
 * @returns The equivalent size in bytes as a branded Bytes value
 * 
 * @remarks
 * This is a convenience function for creating byte sizes in a more readable format
 * 
 * @example
 * ```ts
 * const tenMB = MB(10);
 * // Returns a branded Bytes value of 10485760 (10 * 1024 * 1024)
 * ```
 */
export const MB = (size: number): Bytes => createBytes(size * 1024 * 1024) 