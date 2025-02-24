# log-factory 🪵✨

<div align="center">

[![npm version](https://badge.fury.io/js/log-factory.svg)](https://badge.fury.io/js/log-factory)
[![Tests](https://github.com/patgpt/log-factory/actions/workflows/tests.yml/badge.svg)](https://github.com/patgpt/log-factory/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/patgpt/log-factory/branch/main/graph/badge.svg)](https://codecov.io/gh/patgpt/log-factory)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Winston](https://img.shields.io/badge/winston-logger-brightgreen)](https://github.com/winstonjs/winston)
[![Bun](https://img.shields.io/badge/Bun-compatible-black?logo=bun)](https://bun.sh)

</div>

<p align="center">
  <strong>A flexible and type-safe logging solution built with Winston, designed for Node.js and Bun applications.</strong>
</p>

<p align="center">
  <a href="https://x.com/AGIManifesto">
    <img src="https://img.shields.io/badge/Follow_@AGIManifesto-000000?style=for-the-badge&logo=x&logoColor=white" alt="Follow on X" />
  </a>
  <a href="https://linkedin.com/in/patgpt">
    <img src="https://img.shields.io/badge/Connect_on_LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Connect on LinkedIn" />
  </a>
</p>

---

## ✨ Features

- 🔒 **Type-Safe**: Built with TypeScript for complete type safety
- 🎯 **Environment-Aware**: Different configurations for development, production, and test
- 📁 **File Rotation**: Automatic log file rotation with size and date-based options
- 🎨 **Pretty Printing**: Optional pretty printing for JSON logs
- 🚨 **Error Handling**: Separate error and warning log files
- 🔄 **Daily Rotation**: Optional daily log file rotation
- 💾 **Path Safety**: Type-safe path handling for log files
- 🛡️ **Secure**: Proper file permissions and error handling

## 📦 Installation

```bash
# Using npm
npm install log-factory

# Using Bun
bun add log-factory

# Using yarn
yarn add log-factory
```

## 🚀 Quick Start

```typescript
import { createLogger } from 'log-factory';

// Create a logger with default settings
const logger = createLogger();

// Log messages
logger.info('Hello, World! 👋');
logger.error('Something went wrong 💥', { error: 'details' });
logger.warn('Warning message ⚠️');

// Log structured data
logger.info(JSON.stringify({
  userId: 123,
  action: 'login',
  timestamp: new Date().toISOString()
}));
```

## 🧩 Use Cases

### 🌐 Web API Logging

```typescript
// api/users.ts
import { createLogger } from 'log-factory';

const logger = createLogger({
  logName: 'users-api',
  logDirectory: './logs',
  prettyPrint: process.env.NODE_ENV !== 'production'
});

export async function getUser(userId: string) {
  logger.info(`Fetching user with ID: ${userId}`);
  
  try {
    // Fetch user logic here
    const user = await database.findUser(userId);
    
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return null;
    }
    
    logger.info(`Successfully retrieved user: ${userId}`);
    return user;
  } catch (error) {
    logger.error(`Failed to fetch user: ${userId}`, { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
```

### 🔄 Next.js Server Component

```tsx
// app/dashboard/page.tsx
import { createLogger } from 'log-factory';

const logger = createLogger({
  logName: 'dashboard',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

export default async function DashboardPage() {
  logger.info('Rendering dashboard page');
  
  try {
    const data = await fetchDashboardData();
    logger.debug('Dashboard data fetched successfully', { dataLength: data.length });
    
    return <DashboardComponent data={data} />;
  } catch (error) {
    logger.error('Failed to fetch dashboard data', { error });
    return <ErrorComponent message="Failed to load dashboard" />;
  }
}
```

### 🧪 Testing with Silent Logger

```typescript
// __tests__/user-service.test.ts
import { createLogger } from 'log-factory';
import { UserService } from '../services/user-service';

describe('UserService', () => {
  test('getUser returns user data', async () => {
    // Create a silent logger for tests
    const logger = createLogger({
      logName: 'test-user-service',
      silent: true,
      logDirectory: './test-logs'
    });
    
    const userService = new UserService(logger);
    const user = await userService.getUser('123');
    
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });
});
```

## ⚙️ Configuration

### Basic Configuration

```typescript
const logger = createLogger({
  logName: 'my-app',
  logDirectory: './logs',
  level: 'info',
  enableFileLogging: true,
  enableConsoleLogging: true
});
```

### 🌍 Environment-Specific Configuration

```typescript
import { MB } from 'log-factory/utils';

// Development (default)
const devLogger = createLogger({
  level: 'debug',
  prettyPrint: true,
  colorize: true
});

// Production
const prodLogger = createLogger({
  level: 'info',
  useDailyRotation: true,
  maxFileSize: MB(10), // 10MB
  maxFiles: 10
});

// Test
const testLogger = createLogger({
  level: 'debug',
  silent: true // Disable logging in tests
});
```

### 🔧 Advanced Features

```typescript
import { MB } from 'log-factory/utils';

const logger = createLogger({
  // Basic settings
  logName: 'my-app',
  logDirectory: './logs',
  level: 'info',

  // File handling
  enableFileLogging: true,
  maxFileSize: MB(5),
  maxFiles: 5,
  useDailyRotation: true,

  // Separate log files
  separateErrorLog: true,
  separateWarnLog: true,

  // Console output
  enableConsoleLogging: true,
  prettyPrint: true,
  colorize: true,

  // Formatting
  timestampFormat: 'YYYY-MM-DD HH:mm:ss',
  locale: 'en-US',

  // Error handling
  handleExceptions: true,
  handleRejections: true
});
```

## 🔐 Type Safety Features

log-factory provides strong type safety features:

```typescript
import { createLogger } from 'log-factory';
import { LogLevel } from 'log-factory/types';

// Type-safe log levels
const level: LogLevel = 'info'; // Only valid levels allowed

// Type-safe paths
const logger = createLogger({
  logDirectory: '/var/log/my-app', // Converted to SafePath internally
  logName: 'api-server'
});

// The logger guarantees that log files will be created with proper permissions
// and in the correct location with type safety throughout the codebase
```

## 📚 API Reference

### `createLogger(options?: LoggerOptions)`

Creates a new logger instance with the specified options.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logName` | `string` | `'app'` | Name of the logger instance |
| `logDirectory` | `string` | `'./logs'` | Base directory for log files |
| `level` | `LogLevel` | `'debug'` | Minimum log level to record |
| `enableFileLogging` | `boolean` | `true` | Enable file-based logging |
| `enableConsoleLogging` | `boolean` | `true` | Enable console logging |
| `maxFileSize` | `number` | `5MB` | Maximum size of each log file |
| `maxFiles` | `number` | `5` | Maximum number of log files to keep |
| `useDailyRotation` | `boolean` | `false` | Enable daily log rotation |
| `separateErrorLog` | `boolean` | `true` | Create separate error log file |
| `separateWarnLog` | `boolean` | `true` | Create separate warning log file |
| `prettyPrint` | `boolean` | `false` | Enable pretty printing of logs |
| `colorize` | `boolean` | `false` | Enable colorized output |
| `silent` | `boolean` | `false` | Disable all logging |
| `handleExceptions` | `boolean` | `false` | Handle uncaught exceptions |
| `handleRejections` | `boolean` | `false` | Handle unhandled rejections |
| `customTransports` | `Transport[]` | `undefined` | Additional Winston transports |
| `customFormat` | `Format` | `undefined` | Custom Winston format |
| `timestampFormat` | `string` | `undefined` | Custom timestamp format |
| `locale` | `string` | `'en-US'` | Locale for timestamp formatting |

### `createSimpleLogger(env?: Environment)`

Creates a simple logger with environment-specific defaults.

```typescript
import { createSimpleLogger } from 'log-factory';

const logger = createSimpleLogger('production');
// Creates a production-optimized logger with reasonable defaults
```

### Utility Functions

```typescript
import { MB, createSafePath, joinSafePaths } from 'log-factory/utils';

// Convert megabytes to bytes
const maxSize = MB(10); // 10MB in bytes

// Create a type-safe path
const logPath = createSafePath('/var/log/my-app');

// Join paths safely
const fullPath = joinSafePaths(logPath, 'errors');
```

## 📊 Log Format Examples

### Standard Log Entry

```
2023-02-24 21:45:12 INFO: User authenticated successfully
```

### JSON Structured Logging

```
2023-02-24 21:46:33 INFO: {"userId":123,"action":"login","ip":"192.168.1.1","browser":"Chrome"}
```

### Pretty Printed JSON (Development)

```
< wow "userId" such 123, "action" such "login", "ip" such "192.168.1.1", "browser" such "Chrome" >
```

## 💻 Environment Support

- Node.js >=16.0.0
- Bun >=1.0.0
- TypeScript >=4.5.0

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the license file for details.

## 👨‍💻 Author

**Patrick Kelly**
- X (Twitter): [@AGIManifesto](https://x.com/AGIManifesto)
- LinkedIn: [patgpt](https://linkedin.com/in/patgpt)

---

<div align="center">
  <sub>Built with ❤️ by Patrick Kelly</sub>
</div>
