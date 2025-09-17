# Testing Guide for Web Package

This document explains how to run and write tests for the Next.js web application.

## Setup

The Jest configuration is already set up with the following features:

- **Next.js integration** using `next/jest`
- **React Testing Library** for component testing
- **TypeScript support** with ts-jest
- **Module aliases** matching the tsconfig.json paths
- **Coverage reporting** with thresholds
- **Mock setup** for Next.js specific features

## Running Tests

### From the web package directory:

```bash
cd packages/web
npm test                 # Run all tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:ci         # Run tests in CI mode
```

### From the root directory:

```bash
npm run test            # Run all tests (API + Web)
npm run test:watch:web  # Run web tests in watch mode
npm run test:coverage   # Run all tests with coverage
```

## Writing Tests

### Component Tests

Create test files in the same directory as your components or in a `__tests__` folder:

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

### Utility/Service Tests

Test utility functions and services:

```typescript
// src/lib/__tests__/utils.test.ts
import { myUtilityFunction } from '../utils';

describe('utils', () => {
  it('should work correctly', () => {
    expect(myUtilityFunction('input')).toBe('expected output');
  });
});
```

### API Tests

Test API calls and data fetching:

```typescript
// src/lib/__tests__/api.test.ts
import { api } from '../api';

describe('API', () => {
  it('should make requests', async () => {
    const mockResponse = { data: 'test' };
    jest.mocked(api.get).mockResolvedValue(mockResponse);

    const result = await api.get('/test');
    expect(result).toEqual(mockResponse);
  });
});
```

## Test Structure

```
src/
├── components/
│   ├── MyComponent.tsx
│   └── __tests__/
│       └── MyComponent.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
└── hooks/
    ├── useMyHook.ts
    └── __tests__/
        └── useMyHook.test.ts

tests/
├── setup.ts           # Global test setup
└── __mocks__/         # Global mocks
```

## Available Mocks

The following are automatically mocked in the test environment:

- **Next.js Router** (`next/router` and `next/navigation`)
- **Next.js Image** component
- **Window APIs** (matchMedia, localStorage, sessionStorage)
- **IntersectionObserver** and **ResizeObserver**
- **Fetch API** (global fetch)

## Coverage

The project has coverage thresholds set at 70% for:

- Branches
- Functions
- Lines
- Statements

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Best Practices

1. **Test user behavior**, not implementation details
2. **Use semantic queries** (getByRole, getByLabelText, etc.)
3. **Mock external dependencies** appropriately
4. **Keep tests focused** and independent
5. **Use descriptive test names** that explain the expected behavior
6. **Clean up** after each test to avoid side effects

## Troubleshooting

### Common Issues

1. **Module not found errors**: Check that your import paths match the module aliases in jest.config.js
2. **Next.js specific errors**: Ensure you're using the mocked versions of Next.js components
3. **TypeScript errors**: Make sure your test files have the correct TypeScript configuration

### Debug Mode

Run tests with debug output:

```bash
npm test -- --verbose
```

### Watch Mode Issues

If watch mode isn't working properly:

```bash
npm run test:watch -- --no-cache
```


