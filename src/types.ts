import type { Logform, transport } from 'winston'

/**
 * Symbol used for branding path strings for type safety
 * @internal
 */
declare const PathBrand: unique symbol

/**
 * Type-safe path string
 * 
 * @remarks
 * This is a branded type that ensures paths have been properly validated
 * through the appropriate utility functions before being used in logging operations.
 * It prevents raw strings from being used where safe paths are required.
 */
export type SafePath = string & { readonly [PathBrand]: typeof PathBrand }

/**
 * Symbol used for branding byte numbers for type safety
 * @internal
 */
declare const BytesBrand: unique symbol

/**
 * Type-safe byte size
 * 
 * @remarks
 * This is a branded type that ensures byte values have been properly validated
 * through the appropriate utility functions before being used in configuration.
 * It prevents raw numbers from being used where byte sizes are required.
 */
export type Bytes = number & { readonly [BytesBrand]: typeof BytesBrand }

/**
 * Available log level names
 * 
 * @remarks
 * Defines all possible log levels in order of decreasing priority:
 * - error: Critical failures requiring immediate attention
 * - debug: Information useful for debugging
 * - warn: Warning conditions that don't prevent operation
 * - data: Raw data output 
 * - info: Normal operational messages
 * - verbose: Detailed information beyond info level
 * - silly: Extremely detailed diagnostic information
 */
export type LogLevelLiteral = 'error' | 'debug' | 'warn' | 'data' | 'info' | 'verbose' | 'silly'

/**
 * Uppercase versions of log level names
 * Used for formatting log output with consistent capitalization
 */
export type LogLevelUppercase = Uppercase<LogLevelLiteral>

/**
 * Format for log messages with timestamp, level and message content
 */
export type LogMessage = `${string} ${LogLevelUppercase}: ${string}`

/**
 * Color type for error level logs
 */
export type ErrorColor = 'red'

/**
 * Color type for debug level logs
 */
export type DebugColor = 'blue'

/**
 * Color type for warning level logs
 */
export type WarnColor = 'yellow'

/**
 * Color type for data level logs
 */
export type DataColor = 'magenta'

/**
 * Color type for info level logs
 */
export type InfoColor = 'green'

/**
 * Color type for verbose level logs
 */
export type VerboseColor = 'cyan'

/**
 * Color type for silly level logs
 */
export type SillyColor = 'grey'

/**
 * All available colors for log levels
 */
export type LevelColor = ErrorColor | DebugColor | WarnColor | DataColor | InfoColor | VerboseColor | SillyColor

/**
 * Supported application environments
 */
export type Environment = 'development' | 'production' | 'test'

/**
 * Standard suffixes for log file names
 */
export type LogFileNameSuffix = '-error.log' | '-warn.log' | '-All.log' | '-%DATE%.log'

/**
 * Log file name can be either a SafePath or a path with a standard suffix
 */
export type LogFileName = SafePath | `${string}${LogFileNameSuffix}`

/**
 * Enum for log level values
 * 
 * @remarks
 * Numeric values for log levels, with lower numbers indicating higher priority.
 * These match Winston's internal level values.
 */
export const enum LogLevelValue {
  error = 0,
  debug = 1,
  warn = 2,
  data = 3,
  info = 4,
  verbose = 5,
  silly = 6,
}

/**
 * Type representing a valid log level key
 */
export type LogLevel = keyof typeof LogLevelValue

/**
 * Logger configuration type
 * 
 * @remarks
 * Defines the structure of the logger configuration object,
 * mapping log levels to their numeric values and colors.
 */
export type LoggerConfig = Readonly<{
  /** Mapping of log level names to their numeric values */
  levels: Record<LogLevel, LogLevelValue>
  /** Mapping of log level names to their display colors */
  colors: Record<LogLevel, LevelColor>
}>

/**
 * Logger options interface
 * 
 * @remarks
 * Comprehensive configuration options for creating a logger instance.
 * Provides options for file logging, console output, rotation, formatting, etc.
 */
export interface LoggerOptions {
  /** Name of the logger instance */
  logName?: string
  /** Minimum log level to record */
  level?: LogLevel
  /** Base directory for log files */
  logDirectory: string
  /** Enable file-based logging */
  enableFileLogging?: boolean
  /** Maximum size of each log file in bytes */
  maxFileSize?: Bytes
  /** Maximum number of log files to keep */
  maxFiles?: number
  /** Create separate file for error logs */
  separateErrorLog?: boolean
  /** Create separate file for warning logs */
  separateWarnLog?: boolean
  /** Use daily rotation for log files */
  useDailyRotation?: boolean
  /** Enable console logging */
  enableConsoleLogging?: boolean
  /** Enable pretty printing of logs */
  prettyPrint?: boolean
  /** Enable colorized output */
  colorize?: boolean
  /** Custom timestamp format */
  timestampFormat?: string
  /** Locale for timestamp formatting */
  locale?: string
  /** Disable all logging */
  silent?: boolean
  /** Handle uncaught exceptions */
  handleExceptions?: boolean
  /** Handle unhandled rejections */
  handleRejections?: boolean
  /** Additional custom transports */
  customTransports?: readonly transport[]
  /** Custom log format */
  customFormat?: Logform.Format
}

/**
 * Required properties for logger options
 * 
 * @remarks
 * These properties must be provided or have defaults assigned
 * before the logger can be instantiated.
 */
export type RequiredLoggerOptions = Required<{
  /** Name of the logger instance */
  logName: string
  /** Safe base directory for log files */
  logDirectory: SafePath
}>

/**
 * Combined logger options with required fields
 * 
 * @remarks
 * This type ensures that required properties are present while
 * making all other properties optional.
 */
export type MergedLoggerOptions = RequiredLoggerOptions & Partial<LoggerOptions>

/**
 * Default options for different environments
 * 
 * @remarks
 * Provides default configurations for development, production, and test environments.
 * These are readonly to prevent accidental modification.
 */
export type DefaultOptions = Readonly<{
  [K in Environment]: Readonly<Partial<LoggerOptions>>
}>

/**
 * Extended Error type with optional code property
 * 
 * @remarks
 * Used for handling file system errors that typically include an error code.
 */
export type TypedError = Error & { code?: string } 