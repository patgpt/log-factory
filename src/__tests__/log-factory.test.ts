import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import * as winston from 'winston';
import {
    createLogger,
    createSimpleLogger
} from "../log-facotry";
import type { Environment } from '../types';
import { MB } from '../utils';

const environments: Environment[] = ['development', 'production', 'test'];

// Use LOG_DIR environment variable or fallback to test-logs
const TEST_LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'test-logs');

describe("Logger Factory", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
    // Clean up test directory before each test
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_LOG_DIR, { recursive: true });
  });

  afterAll(() => {
    // Clean up after all tests
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true, force: true });
    }
  });

  test("default logger is created with development settings", () => {
    const defaultLogger = createSimpleLogger();
    expect(defaultLogger).toBeDefined();
    expect(defaultLogger.level).toBe("debug");
  });

  test("creates logger with correct options", () => {
    const logName = 'test-options'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName,
      level: 'info'
    });
    expect(logger).toBeDefined();
    expect(logger.level).toBe("info");
  });

  test("respects environment-specific defaults", () => {
    process.env.NODE_ENV = "production";
    const prodLogger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName: 'test-prod'
    });
    expect(prodLogger.level).toBe("info");

    process.env.NODE_ENV = "development";
    const devLogger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName: 'test-dev'
    });
    expect(devLogger.level).toBe("debug");

    process.env.NODE_ENV = "test";
    const testLogger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName: 'test-test'
    });
    expect(testLogger.level).toBe("debug");
  });

  test("writes to log files", async () => {
    const logName = 'test-write'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName,
      enableFileLogging: true,
      separateErrorLog: true,
      separateWarnLog: true,
      level: 'info'
    })

    // Write messages
    logger.error('Error message')
    logger.warn('Warning message')
    logger.info('Info message')

    // Wait longer for file writes to complete
    await new Promise(resolve => setTimeout(resolve, 500))

    // Construct correct file paths
    const logDir = path.join(TEST_LOG_DIR, logName)
    const errorLogPath = path.join(logDir, `${logName}-error.log`)
    const warnLogPath = path.join(logDir, `${logName}-warn.log`)
    const allLogsPath = path.join(logDir, `${logName}-All.log`)

    // Check file existence
    expect(fs.existsSync(errorLogPath)).toBe(true)
    expect(fs.existsSync(warnLogPath)).toBe(true)
    expect(fs.existsSync(allLogsPath)).toBe(true)

    // Read and verify file contents
    const errorContent = fs.readFileSync(errorLogPath, 'utf8')
    const warnContent = fs.readFileSync(warnLogPath, 'utf8')
    const allContent = fs.readFileSync(allLogsPath, 'utf8')

    expect(errorContent).toContain('ERROR: Error message')
    expect(warnContent).toContain('WARN: Warning message')
    expect(allContent).toContain('ERROR: Error message')
    expect(allContent).toContain('WARN: Warning message')
    expect(allContent).toContain('INFO: Info message')
  });

  test("respects log levels", async () => {
    const logName = 'test-levels'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName,
      enableFileLogging: true,
      separateErrorLog: true,
      level: "error"
    });

    logger.info("This should not be logged");
    logger.error("This should be logged");

    // Wait for file writes to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Construct correct file paths
    const logDir = path.join(TEST_LOG_DIR, logName)
    const errorLogPath = path.join(logDir, `${logName}-error.log`)
    const allLogsPath = path.join(logDir, `${logName}-All.log`)

    // Read and verify file contents
    const allLogs = fs.readFileSync(allLogsPath, "utf-8");
    const errorLogs = fs.readFileSync(errorLogPath, "utf-8");

    // Info message should not be in any log file
    expect(allLogs).not.toContain("This should not be logged");
    expect(errorLogs).not.toContain("This should not be logged");

    // Error message should be in both files
    expect(allLogs).toContain("This should be logged");
    expect(errorLogs).toContain("This should be logged");
  });

  test("custom pretty print format works", async () => {
    const logName = 'test-pretty'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName,
      prettyPrint: true,
      enableConsoleLogging: true,
      level: 'info'
    });

    const testObject = { test: "value" };
    let capturedOutput = "";

    // Capture console output
    const originalWrite = process.stdout.write;
    process.stdout.write = (str: string | Uint8Array) => {
      capturedOutput += str;
      return true;
    };

    logger.info(JSON.stringify(testObject));

    // Restore console output
    process.stdout.write = originalWrite;

    expect(capturedOutput).toContain('< wow "test" such "value"');
  });

  test("Next.js logger configuration", () => {
    process.env.NODE_ENV = 'development'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName: 'next',
      level: 'info'
    })
    expect(logger.level).toBe('info')
    
    process.env.NODE_ENV = 'production'
    const prodLogger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName: 'next-prod'
    })
    expect(prodLogger.level).toBe('info')
  });

  test("Bun logger configuration", () => {
    const bunLogger = createSimpleLogger();
    expect(bunLogger.level).toBe("debug");
  });

  test("Module logger configuration", () => {
    const moduleLogger = createSimpleLogger();
    expect(moduleLogger).toBeDefined();
    expect(moduleLogger.level).toBe("debug");
  });

  test("handles file system errors gracefully", () => {
    const logName = 'test-errors'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName,
      enableFileLogging: false,
      enableConsoleLogging: true,
      level: 'info'
    });

    // This should not throw an error
    expect(() => {
      logger.info("Test message");
    }).not.toThrow();
  });

  test("respects silent mode", () => {
    const logName = 'test-silent'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName,
      silent: true,
      level: 'info'
    });

    let capturedOutput = "";
    const originalWrite = process.stdout.write;
    process.stdout.write = (str: string | Uint8Array) => {
      capturedOutput += str;
      return true;
    };

    logger.info("This should not be logged");
    process.stdout.write = originalWrite;

    expect(capturedOutput).toBe("");
  });

  test("handles JSON logging correctly", async () => {
    const logName = 'test-json'
    const logger = createLogger({
      logDirectory: TEST_LOG_DIR,
      logName,
      enableFileLogging: true,
      level: 'info'
    });

    const testData = {
      userId: 123,
      action: "login",
      timestamp: new Date().toISOString()
    };

    logger.info(JSON.stringify(testData));

    // Wait for file writes to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Construct correct file paths
    const logDir = path.join(TEST_LOG_DIR, logName)
    const allLogsPath = path.join(logDir, `${logName}-All.log`)

    // Read and verify file contents
    const logContent = fs.readFileSync(allLogsPath, "utf-8");

    expect(logContent).toContain("userId");
    expect(logContent).toContain("123");
    expect(logContent).toContain("login");
  });

  describe('Path Safety', () => {
    test('handles relative paths correctly', () => {
      const logger = createLogger({
        logDirectory: './logs',
        logName: 'test-relative'
      })
      expect(fs.existsSync(path.join(process.cwd(), 'logs', 'test-relative'))).toBe(true)
    })

    test('handles absolute paths correctly', () => {
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR,
        logName: 'test-absolute'
      })
      expect(fs.existsSync(path.join(TEST_LOG_DIR, 'test-absolute'))).toBe(true)
    })

    test('handles path with special characters', () => {
      const specialName = 'test!@#$%^&*()_+'
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR,
        logName: specialName
      })
      expect(fs.existsSync(path.join(TEST_LOG_DIR, specialName))).toBe(true)
    })

    test('handles nested paths correctly', () => {
      const nestedPath = path.join(TEST_LOG_DIR, 'nested', 'deeply', 'path')
      const logger = createLogger({
        logDirectory: nestedPath,
        logName: 'test-nested'
      })
      expect(fs.existsSync(path.join(nestedPath, 'test-nested'))).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    test('handles undefined logDirectory', () => {
      const logger = createLogger({
        logName: 'test-undefined-dir'
      })
      expect(fs.existsSync(path.join(process.cwd(), 'logs', 'test-undefined-dir'))).toBe(true)
    })

    test('handles undefined logName', () => {
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR
      })
      expect(fs.existsSync(path.join(TEST_LOG_DIR, 'app'))).toBe(true)
    })

    test('handles empty string logName', () => {
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR,
        logName: ''
      })
      expect(fs.existsSync(path.join(TEST_LOG_DIR, ''))).toBe(true)
    })

    test('handles invalid environment', () => {
      process.env.NODE_ENV = 'invalid'
      expect(() => createLogger({
        logDirectory: TEST_LOG_DIR
      })).toThrow('Invalid environment: invalid')
    })

    test('handles file size limits', () => {
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR,
        logName: 'test-size',
        maxFileSize: MB(1)
      })
      expect(logger.transports.length).toBeGreaterThan(0)
    })
  })

  describe('Environment Specific', () => {
    test.each(environments)('creates logger for %s environment', (env) => {
      process.env.NODE_ENV = env
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR,
        logName: `test-${env}`
      })
      expect(fs.existsSync(path.join(TEST_LOG_DIR, `test-${env}`))).toBe(true)
    })

    test('development environment enables console logging by default', () => {
      process.env.NODE_ENV = 'development'
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR
      })
      const hasConsoleTransport = logger.transports.some(t => 
        t instanceof winston.transports.Console
      )
      expect(hasConsoleTransport).toBe(true)
    })

    test('production environment enables file rotation by default', () => {
      process.env.NODE_ENV = 'production'
      const logger = createLogger({
        logDirectory: TEST_LOG_DIR
      })
      const hasRotationTransport = logger.transports.some(t => t.constructor.name === 'DailyRotateFile')
      expect(hasRotationTransport).toBe(true)
    })
  })

  describe('Simple Logger', () => {
    test.each(environments)('creates simple logger for %s environment', (env) => {
      const logger = createSimpleLogger(env)
      expect(logger).toBeDefined()
      expect(logger.transports.length).toBeGreaterThan(0)
    })
  })
}) 