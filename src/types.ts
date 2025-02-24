import type { Logform, transport } from 'winston'

// Branded type for file paths
declare const PathBrand: unique symbol
export type SafePath = string & { readonly [PathBrand]: typeof PathBrand }

// Branded type for file sizes
declare const BytesBrand: unique symbol
export type Bytes = number & { readonly [BytesBrand]: typeof BytesBrand }

// Log level definitions
export type LogLevelLiteral = 'error' | 'debug' | 'warn' | 'data' | 'info' | 'verbose' | 'silly'
export type LogLevelUppercase = Uppercase<LogLevelLiteral>
export type LogMessage = `${string} ${LogLevelUppercase}: ${string}`

// Color definitions
export type ErrorColor = 'red'
export type DebugColor = 'blue'
export type WarnColor = 'yellow'
export type DataColor = 'magenta'
export type InfoColor = 'green'
export type VerboseColor = 'cyan'
export type SillyColor = 'grey'

export type LevelColor = ErrorColor | DebugColor | WarnColor | DataColor | InfoColor | VerboseColor | SillyColor

// Environment and file naming
export type Environment = 'development' | 'production' | 'test'
export type LogFileNameSuffix = '-error.log' | '-warn.log' | '-All.log' | '-%DATE%.log'
export type LogFileName = SafePath | `${string}${LogFileNameSuffix}`

// Log level enum
export const enum LogLevelValue {
  error = 0,
  debug = 1,
  warn = 2,
  data = 3,
  info = 4,
  verbose = 5,
  silly = 6,
}

export type LogLevel = keyof typeof LogLevelValue

// Logger configuration
export type LoggerConfig = Readonly<{
  levels: Record<LogLevel, LogLevelValue>
  colors: Record<LogLevel, LevelColor>
}>

// Logger options interface
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

// Required logger options
export type RequiredLoggerOptions = Required<{
  logName: string
  logDirectory: SafePath
}>

// Merged logger options
export type MergedLoggerOptions = RequiredLoggerOptions & Partial<LoggerOptions>

// Environment options
export type DefaultOptions = Readonly<{
  [K in Environment]: Readonly<Partial<LoggerOptions>>
}>

// Type helpers
export type TypedError = Error & { code?: string } 