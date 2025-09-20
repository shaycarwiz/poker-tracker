# Unit Tests Structure

This directory contains unit tests organized by architectural layers and functionality to improve maintainability and discoverability.

## Directory Structure

```
tests/unit/
├── api/                          # API Layer Tests
│   ├── controllers/              # Controller tests
│   │   ├── player-controller.test.ts
│   │   └── session-controller.test.ts
│   ├── middleware/               # Middleware tests
│   │   └── middleware.test.ts
│   └── validators/               # Validation tests
│       └── validators.test.ts
├── application/                  # Application Layer Tests
│   ├── services/                 # Service tests
│   │   ├── player-service.test.ts
│   │   └── session-service.test.ts
│   └── use-cases/                # Use case tests
│       └── use-cases.test.ts
├── model/                        # Domain Model Tests
│   ├── entities/                 # Entity tests
│   │   └── entities.test.ts
│   ├── value-objects/            # Value object tests
│   │   └── value-objects.test.ts
│   ├── domain-services/          # Domain service tests
│   │   └── domain-services.test.ts
│   └── events/                   # Domain event tests
│       └── events.test.ts
├── infrastructure/               # Infrastructure Layer Tests
│   └── unit-of-work.test.ts
└── shared/                       # Shared Utility Tests
    └── health.test.ts
```

## Organization Principles

### 1. **Layered Architecture**

Tests are organized to mirror the application's layered architecture:

- **API Layer**: Controllers, middleware, and validators
- **Application Layer**: Services and use cases
- **Domain Layer**: Entities, value objects, domain services, and events
- **Infrastructure Layer**: Database and external service implementations
- **Shared Layer**: Common utilities and cross-cutting concerns

### 2. **Functional Grouping**

Within each layer, tests are grouped by functionality:

- Controllers are grouped together
- Services are grouped together
- Domain concepts are separated by type

### 3. **Clear Naming**

- Test files follow the pattern: `{component-name}.test.ts`
- Directory names match the source code structure
- Easy to locate tests for specific components

## Benefits

1. **Improved Discoverability**: Easy to find tests for specific components
2. **Better Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new tests in the appropriate location
4. **Team Collaboration**: Consistent structure that all team members can follow
5. **CI/CD Integration**: Clear test organization for reporting and debugging

## Running Tests

All tests can be run using the standard Jest commands:

```bash
# Run all tests
npm test

# Run tests in a specific layer
npm test -- --testPathPattern="api/"
npm test -- --testPathPattern="application/"
npm test -- --testPathPattern="model/"
npm test -- --testPathPattern="infrastructure/"

# Run tests for a specific component
npm test -- --testPathPattern="player-controller"
```

## Adding New Tests

When adding new tests:

1. **Identify the layer**: Determine which architectural layer the component belongs to
2. **Choose the appropriate directory**: Place the test in the corresponding subdirectory
3. **Follow naming conventions**: Use `{component-name}.test.ts` format
4. **Update this README**: If adding new directories or changing structure

## Migration Notes

This structure was created by reorganizing the previously flat test directory structure. All import paths remain the same as they use absolute imports with the `@/` prefix, so no code changes were required.
