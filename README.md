# Loggerama3000

A flexible and powerful logging solution for Node.js, Next.js, and Bun applications.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Winston](https://img.shields.io/badge/Winston-black?style=for-the-badge)](https://github.com/winstonjs/winston)

## Features

- 🚀 Environment-aware configuration (development, production, test)
- 📝 Multiple log levels (error, debug, warn, data, info, verbose, silly)
- 🎨 Colorized console output
- 📁 File-based logging with rotation
- 🔄 Automatic log file rotation and cleanup
- 🎯 Separate error and warning log files
- 🌈 Pretty printing for JSON objects
- ⚡ Optimized for Next.js and Bun
- 🔧 Highly configurable

## Installation

```bash
# Using npm
npm install loggerama3000

# Using Bun
bun add loggerama3000

# Using yarn
yarn add loggerama3000
```

## Quick Start

```typescript
import { logger } from 'loggerama3000';

// Use the default logger
logger.info('Hello, World!');
logger.error('Something went wrong!');
logger.debug({ message: 'Debug info', data: { foo: 'bar' } });
```

## Usage with Next.js

```typescript
// app/lib/logger.ts
import { createNextLogger } from 'loggerama3000';

export const logger = createNextLogger();

// In your components/pages
import { logger } from '@/lib/logger';

logger.info('Page loaded');
logger.error('API call failed', { status: 500 });
```

## Usage with Bun

```typescript
import { createBunLogger } from 'loggerama3000';

const logger = createBunLogger({
  logName: 'my-bun-app'
});

logger.info('Server started');
```

## Custom Configuration

```typescript
import { createLogger } from 'loggerama3000';

const logger = createLogger({
  // Basic configuration
  logName: 'my-app',
  level: 'debug',
  logDirectory: './logs',
  
  // File logging options
  enableFileLogging: true,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
  separateErrorLog: true,
  separateWarnLog: true,
  
  // Console logging options
  enableConsoleLogging: true,
  prettyPrint: true,
  colorize: true,
  
  // Date formatting
  timestampFormat: 'YYYY-MM-DD HH:mm:ss',
  locale: 'en-US',
  
  // Additional options
  silent: false,
  handleExceptions: true,
  handleRejections: true
});
```

## Module-specific Loggers

```typescript
import { createModuleLogger } from 'loggerama3000';

const authLogger = createModuleLogger('auth');
const dbLogger = createModuleLogger('database');

authLogger.info('User logged in');
dbLogger.error('Connection failed');
```

## Environment-specific Defaults

The logger automatically uses different defaults based on your `NODE_ENV`:

### Development
- Debug level enabled
- Console logging with colors
- Pretty printing
- 5MB max file size
- 5 log files retained

### Production
- Info level
- File logging only
- No pretty printing
- 10MB max file size
- 10 log files retained

### Test
- Debug level
- File logging only
- 1MB max file size
- 2 log files retained

## Log Levels

From highest to lowest priority:
1. error (0)
2. debug (1)
3. warn (2)
4. data (3)
5. info (4)
6. verbose (5)
7. silly (6)

## Log Directory Structure

```
logs/
├── my-app/
│   ├── my-app-All.log
│   ├── my-app-Error.log
│   └── my-app-Warn.log
└── globalLog.log
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Dependencies

- [winston](https://github.com/winstonjs/winston) - A logger for just about everything.
