import * as fs from 'fs'
import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import type {
  DefaultOptions,
  Environment,
  LogFileName,
  LogFileNameSuffix,
  LoggerConfig,
  LoggerOptions,
  LogLevel,
  LogMessage,
  MergedLoggerOptions
} from './types'
import { createSafePath, createSafePathWithSuffix, getDefaultLogPath, joinSafePaths, MB } from './utils'

/**
 * Configuration object for Winston logger levels and colors
 * 
 * Defines the hierarchy of log levels (error being highest priority) and
 * associates colors with each level for console output
 * 
 * @remarks
 * This is marked as `const` to ensure immutability throughout the application
 */
const config: LoggerConfig = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'magenta',
    info: 'green',
    verbose: 'cyan',
    silly: 'grey',
  },
} as const

// Add colors to Winston
winston.addColors(config.colors)

/**
 * Default logger options for different environments
 * 
 * @remarks
 * Provides optimized configurations for development, production, and test environments:
 * - Development: Debug-focused with console output and pretty printing
 * - Production: Performance-focused with file rotation and minimal console output
 * - Test: Minimal configuration suitable for automated testing
 * 
 * All configurations use type assertion to ensure type safety
 */
const defaultOptions: DefaultOptions = {
  development: {
    level: 'debug' as LogLevel,
    enableConsoleLogging: true,
    enableFileLogging: true,
    prettyPrint: true,
    colorize: true,
    maxFileSize: MB(5), // 5MB
    maxFiles: 5,
    separateErrorLog: true,
    separateWarnLog: true,
    useDailyRotation: false,
  },
  production: {
    level: 'info' as LogLevel,
    enableConsoleLogging: false,
    enableFileLogging: true,
    prettyPrint: false,
    colorize: false,
    maxFileSize: MB(10), // 10MB
    maxFiles: 10,
    separateErrorLog: true,
    separateWarnLog: false,
    useDailyRotation: true,
  },
  test: {
    level: 'debug' as LogLevel,
    enableConsoleLogging: false,
    enableFileLogging: true,
    prettyPrint: false,
    colorize: false,
    maxFileSize: MB(1), // 1MB
    maxFiles: 2,
    separateErrorLog: true,
    separateWarnLog: false,
    useDailyRotation: false,
  },
} as const

/**
 * Type guard to check if a string is a valid environment
 * 
 * @param env - The environment string to validate
 * @returns True if the environment is valid ('development', 'production', or 'test')
 * 
 * @example
 * ```ts
 * if (isValidEnvironment('staging')) {
 *   // This won't execute as 'staging' is not a valid environment
 * }
 * ```
 */
const isValidEnvironment = (env: string): env is Environment => 
  ['development', 'production', 'test'].includes(env)

/**
 * Custom Winston format for pretty-printing JSON logs
 * 
 * @remarks
 * Transforms JSON log messages into a more readable "doge meme" format
 * Example: `{"user": "john"}` becomes `< wow "user" such "john" >`
 * 
 * If the message isn't valid JSON or doesn't start with '{', it remains unchanged
 */
const prettyConsoleFormat = winston.format((info) => {
  if (typeof info.message === 'string' && info.message.startsWith('{')) {
    try {
      const parsed = JSON.parse(info.message)
      info.message = `< wow ${Object.entries(parsed)
        .map(
          ([key, value]) =>
            `${JSON.stringify(key)} such ${JSON.stringify(value)}`
        )
        .join(', ')} >`
    } catch {
      // Leave message unchanged if parsing fails
    }
  }
  return info
})()

/**
 * Creates a Winston logger with the specified options
 * 
 * @param options - Configuration options for the logger
 * @returns A configured Winston logger instance
 * 
 * @remarks
 * This is the main function of the library. It creates a logger with:
 * - Environment-specific defaults (development, production, test)
 * - File and console transports based on configuration
 * - Optional daily log rotation
 * - Separate error and warning log files
 * - Type-safe path handling
 * 
 * The function will use environment-specific defaults based on NODE_ENV,
 * defaulting to 'development' if not specified.
 * 
 * @example
 * Basic usage:
 * ```ts
 * const logger = createLogger();
 * logger.info('Application started');
 * ```
 * 
 * @example
 * Custom configuration:
 * ```ts
 * const logger = createLogger({
 *   logName: 'api-server',
 *   logDirectory: '/var/logs',
 *   level: 'info',
 *   maxFileSize: MB(10),
 *   useDailyRotation: true
 * });
 * ```
 * 
 * @throws Will throw an error if the environment is invalid or if log directory creation fails
 */
export const createLogger = (
  options: Partial<LoggerOptions> = {}
): winston.Logger => {
  const env = process.env.NODE_ENV || 'development'
  if (!process.env.NODE_ENV) {
    console.warn('NODE_ENV not set, defaulting to development environment')
  }
  if (!isValidEnvironment(env)) {
    throw new Error(`Invalid environment: ${env}`)
  }

  const defaultEnvOptions = defaultOptions[env]
  const safeLogDirectory = options.logDirectory ? createSafePath(options.logDirectory) : getDefaultLogPath()

  const finalOptions: MergedLoggerOptions = {
    ...defaultEnvOptions,
    ...options,
    logName: options.logName ?? 'app',
    logDirectory: safeLogDirectory,
    maxFileSize: options.maxFileSize ?? defaultEnvOptions.maxFileSize ?? MB(5),
  }

  const {
    logName,
    level,
    logDirectory,
    enableFileLogging,
    enableConsoleLogging,
    prettyPrint,
    colorize,
    maxFileSize,
    maxFiles,
    separateErrorLog,
    separateWarnLog,
    useDailyRotation,
    timestampFormat,
    locale,
    silent,
    handleExceptions,
    handleRejections,
    customTransports,
    customFormat,
  } = finalOptions

  /**
   * Create the full log directory path by joining the base directory and logger name
   * This ensures logs for different loggers are stored in separate subdirectories
   */
  const logDir = joinSafePaths(logDirectory, logName)

  // Ensure log directory exists with error handling
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true, mode: 0o700 })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Failed to create log directory: ${errorMessage}`)
    throw error
  }

  /**
   * Format for timestamps with locale support
   * Uses the specified locale (defaults to 'en-US') and formats date/time components
   */
  const dateFormat = winston.format.timestamp({
    format: () =>
      new Date().toLocaleString(locale || 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
  })

  /**
   * Format for log files
   * Combines timestamp and formatted message with level in uppercase
   */
  const fileFormat = winston.format.combine(
    dateFormat,
    winston.format.printf(
      (info): LogMessage =>
        `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}` as LogMessage
    )
  )

  /**
   * Format for console output
   * Applies pretty printing and colorization based on configuration
   */
  const consoleFormat = winston.format.combine(
    prettyPrint ? prettyConsoleFormat : winston.format.simple(),
    colorize ? winston.format.colorize({ all: true }) : winston.format.simple(),
    winston.format.printf((info) => String(info.message))
  )

  const transports: winston.transport[] = []

  // Add console transport if enabled
  if (enableConsoleLogging) {
    transports.push(
      new winston.transports.Console({
        format: customFormat || consoleFormat,
      })
    )
  }

  // Add file transports if enabled
  if (enableFileLogging) {
    /**
     * Common options for all file transports
     */
    const baseFileOptions = {
      maxsize: maxFileSize,
      maxFiles,
      format: fileFormat,
      zippedArchive: true,
      tailable: true,
    }

    /**
     * Creates a type-safe log file path with the given suffix
     * 
     * @param suffix - The suffix to append to the log file name
     * @returns A type-safe log file path
     */
    const createLogPath = (suffix: LogFileNameSuffix): LogFileName => {
      const baseLogPath = joinSafePaths(logDir, logName)
      return createSafePathWithSuffix(baseLogPath, suffix)
    }

    // Add daily rotation transport or standard file transport
    if (useDailyRotation) {
      transports.push(
        new DailyRotateFile({
          ...baseFileOptions,
          filename: createLogPath('-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
        })
      )
    } else {
      transports.push(
        new winston.transports.File({
          ...baseFileOptions,
          filename: createLogPath('-All.log'),
        })
      )
    }

    // Add separate error log transport if enabled
    if (separateErrorLog) {
      transports.push(
        new winston.transports.File({
          ...baseFileOptions,
          filename: createLogPath('-error.log'),
          level: 'error',
        })
      )
    }

    // Add separate warning log transport if enabled
    if (separateWarnLog) {
      transports.push(
        new winston.transports.File({
          ...baseFileOptions,
          filename: createLogPath('-warn.log'),
          level: 'warn',
        })
      )
    }
  }

  // Add any custom transports
  if (customTransports) {
    transports.push(...customTransports)
  }

  // Create and return the configured Winston logger
  return winston.createLogger({
    levels: config.levels,
    level: level || 'info',
    silent,
    handleExceptions,
    handleRejections,
    transports,
    format: customFormat || winston.format.simple(),
  })
}

/**
 * Creates a simple logger with environment-specific defaults
 * 
 * @param env - The environment to use for configuration defaults
 * @returns A configured Winston logger instance
 * 
 * @remarks
 * This is a convenience function that creates a logger with the default options
 * for the specified environment. It's useful when you don't need custom configuration.
 * 
 * @example
 * ```ts
 * // Create a production logger with production defaults
 * const logger = createSimpleLogger('production');
 * 
 * // Create a logger with development defaults (default)
 * const devLogger = createSimpleLogger();
 * ```
 */
export const createSimpleLogger = (
  env: Environment = 'development'
): winston.Logger => {
  return createLogger(defaultOptions[env])
}

// Re-export types
export * from './types'
