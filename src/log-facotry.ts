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

// Create immutable config object with type assertions
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

// Default options with strict environment mapping and size constants
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

// Type guard for environment
const isValidEnvironment = (env: string): env is Environment => 
  ['development', 'production', 'test'].includes(env)

// Custom pretty print format (optional)
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

// Main logger creation function
export const createLogger = (
  options: Partial<LoggerOptions> = {}
): winston.Logger => {
  const env = process.env.NODE_ENV || 'development'
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

  // Timestamp format with locale support
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

  const fileFormat = winston.format.combine(
    dateFormat,
    winston.format.printf(
      (info): LogMessage =>
        `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}` as LogMessage
    )
  )

  const consoleFormat = winston.format.combine(
    prettyPrint ? prettyConsoleFormat : winston.format.simple(),
    colorize ? winston.format.colorize({ all: true }) : winston.format.simple(),
    winston.format.printf((info) => String(info.message))
  )

  const transports: winston.transport[] = []

  if (enableConsoleLogging) {
    transports.push(
      new winston.transports.Console({
        format: customFormat || consoleFormat,
      })
    )
  }

  if (enableFileLogging) {
    const baseFileOptions = {
      maxsize: maxFileSize,
      maxFiles,
      format: fileFormat,
      zippedArchive: true,
      tailable: true,
    }

    const createLogPath = (suffix: LogFileNameSuffix): LogFileName => {
      const baseLogPath = joinSafePaths(logDir, logName)
      return createSafePathWithSuffix(baseLogPath, suffix)
    }

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

    if (separateErrorLog) {
      transports.push(
        new winston.transports.File({
          ...baseFileOptions,
          filename: createLogPath('-error.log'),
          level: 'error',
        })
      )
    }

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

  if (customTransports) {
    transports.push(...customTransports)
  }

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

// Simplified logger creation
export const createSimpleLogger = (
  env: Environment = 'development'
): winston.Logger => {
  return createLogger(defaultOptions[env])
}

// Re-export types
export * from './types'
