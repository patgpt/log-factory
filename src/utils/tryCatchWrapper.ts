type Result<T, E extends Error = Error> = 
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E }

/**
 * Type-safe wrapper for async operations that may fail
 * @param operation - Async operation to execute
 * @param errorHandler - Optional custom error handler
 * @returns Result object with success status, data, and error
 */
export const tryCatch = async <T, E extends Error = Error>(
  operation: () => Promise<T>,
  errorHandler?: (error: unknown) => E
): Promise<Result<T, E>> => {
  try {
    const data = await operation()
    return { success: true, data, error: null }
  } catch (error) {
    const handledError = errorHandler 
      ? errorHandler(error)
      : (error instanceof Error ? error : new Error(String(error))) as E
      
    return { success: false, data: null, error: handledError }
  }
}

/**
 * Type-safe wrapper for synchronous operations that may fail
 * @param operation - Sync operation to execute
 * @param errorHandler - Optional custom error handler
 * @returns Result object with success status, data, and error
 */
export const tryCatchSync = <T, E extends Error = Error>(
  operation: () => T,
  errorHandler?: (error: unknown) => E
): Result<T, E> => {
  try {
    const data = operation()
    return { success: true, data, error: null }
  } catch (error) {
    const handledError = errorHandler 
      ? errorHandler(error)
      : (error instanceof Error ? error : new Error(String(error))) as E
      
    return { success: false, data: null, error: handledError }
  }
}
