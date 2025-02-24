# Contributing to log-factory 🤝

Thank you for considering contributing to log-factory! This document provides guidelines and instructions to help you get started.

## 🌱 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/yourusername/log-factory.git
   cd log-factory
   ```
3. **Install dependencies**
   ```bash
   bun install
   ```
4. **Create a branch** for your feature or fix
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 💻 Development Workflow

### Testing

We use Bun's built-in test runner for testing:

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage
```

### Building

Build the project using:

```bash
# Clean previous builds
bun run clean

# Build the package
bun run build
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Changes to the build process or auxiliary tools

Example:
```
feat: add daily rotation option to logger
```

## 🔄 Pull Request Process

1. Update the README.md with details of changes if appropriate
2. Make sure your code passes all tests
3. Ensure your PR description clearly describes the problem and solution
4. Reference any related issues in your PR description

## 🚀 Release Process

We use semantic-release for automated versioning and package publishing. When commits are merged to main:

1. semantic-release analyzes commit messages
2. Automatically determines the next version number
3. Generates release notes
4. Publishes the package to npm

## 📋 Code Style

- Use TypeScript for all code
- Follow established patterns in the codebase
- Include JSDoc comments for public APIs
- Ensure type safety (avoid any)

## 🔍 Code Review

All submissions require review before being merged:

1. All tests must pass
2. Code must be well-documented
3. New features should include tests
4. Follow the code style guidelines

## 📜 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

## 🙏 Thank You!

Your contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. 