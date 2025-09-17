# VS Code Configuration for Poker Tracker

This directory contains VS Code workspace settings and configurations optimized for the Poker Tracker monorepo.

## Files Overview

- `settings.json` - Workspace settings including Jest configuration
- `launch.json` - Debug configurations for tests
- `tasks.json` - Predefined tasks for running tests
- Uses root `jest.config.js` for Jest configuration
- `extensions.json` - Recommended extensions

## Jest Extension Setup

The Jest extension is configured to work with both API and Web packages:

### Features Enabled:

- ✅ Test discovery and running
- ✅ Test result display in gutter
- ✅ Debug support for individual tests
- ✅ Coverage reporting
- ✅ Watch mode support

### How to Use:

1. **Run All Tests**: Use `Ctrl+Shift+P` → "Test: Run All Tests"
2. **Run Individual Test**: Click the "Run" button in the gutter next to test functions
3. **Debug Test**: Click the "Debug" button in the gutter next to test functions
4. **Watch Mode**: Use `Ctrl+Shift+P` → "Test: Toggle Watch Mode"

### Debug Configurations:

- **Debug Jest Tests**: Run all tests in debug mode
- **Debug Current Jest Test**: Debug the currently open test file
- **Debug API Tests**: Debug only API package tests
- **Debug Web Tests**: Debug only Web package tests

### Tasks Available:

- **Test: All** - Run all tests
- **Test: API** - Run API tests only
- **Test: Web** - Run Web tests only
- **Test: Watch All** - Run tests in watch mode
- **Test: Watch Web** - Run Web tests in watch mode
- **Test: Coverage** - Run tests with coverage report

## Troubleshooting

### Jest Extension Not Detecting Tests

1. **Reload VS Code**: `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Check Jest Extension**: Ensure "Jest" extension is installed and enabled
3. **Verify Configuration**: Check that `jest.jestConfigPath` points to `jest.config.js`
4. **Check Output**: Look at "Jest" output panel for error messages

### Common Issues:

1. **Tests not running**: Make sure you're in the correct workspace root
2. **Module resolution errors**: Check that TypeScript paths are correctly configured
3. **Coverage not showing**: Ensure `jest.showCoverageOnLoad` is set to `true` if desired

### Manual Test Commands:

```bash
# Run all tests
npm test

# Run API tests only
npm test --workspace=@poker-tracker/api

# Run Web tests only
npm test --workspace=@poker-tracker/web

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Recommended Extensions

Install the recommended extensions for the best development experience:

- **Jest** - Test runner integration
- **Tailwind CSS IntelliSense** - CSS class autocomplete
- **Prettier** - Code formatting
- **TypeScript Importer** - Auto import management
- **ESLint** - Code linting

## Workspace Structure

```
.vscode/
├── settings.json      # Workspace settings
├── launch.json        # Debug configurations
├── tasks.json         # Task definitions
├── jest.config.js     # Jest configuration for VS Code
├── extensions.json    # Recommended extensions
└── README.md          # This file
```
