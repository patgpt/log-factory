# Loggerama3000 🪵✨

<div align="center">

[![npm version](https://badge.fury.io/js/loggerama3000.svg)](https://badge.fury.io/js/loggerama3000)
[![Tests](https://github.com/yourusername/loggerama3000/actions/workflows/tests.yml/badge.svg)](https://github.com/yourusername/loggerama3000/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/yourusername/loggerama3000/branch/main/graph/badge.svg?token=your-token)](https://codecov.io/gh/yourusername/loggerama3000)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
npm install loggerama3000

# Using Bun
bun add loggerama3000

# Using yarn
yarn add loggerama3000
```

## 🚀 Quick Start

```typescript
import { createLogger } from 'loggerama3000';

// Create a logger with default settings
const logger = createLogger();

// Log messages
logger.info('Hello, World! 👋');
logger.error('Something went wrong 💥', { error: 'details' });
logger.warn('Warning message ⚠️');
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
  maxFileSize: MB(10),
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

### `createSimpleLogger(env?: Environment)`

Creates a simple logger with environment-specific defaults.

```typescript
const logger = createSimpleLogger('production');
```

## 💻 Environment Support

- Node.js >=16.0.0
- Bun >=1.0.0

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details

## 👨‍💻 Author

**Patrick Kelly**
- X (Twitter): [@AGIManifesto](https://x.com/AGIManifesto)
- LinkedIn: [patgpt](https://linkedin.com/in/patgpt)

---

<div align="center">
  <sub>Built with ❤️ by Patrick Kelly</sub>
</div>
