# API Documentation

This directory contains external Swagger/OpenAPI documentation files to keep controller code clean and focused on business logic.

## Structure

- `auth-swagger.ts` - Authentication endpoints documentation
- `README.md` - This file

## Integration

To use these external documentation files with your existing Swagger setup, you can:

### Option 1: Import and merge with existing Swagger config

```typescript
import { authSwaggerDocs } from "./docs/auth-swagger";

// In your swagger configuration
const swaggerConfig = {
  // ... your existing config
  ...authSwaggerDocs,
  // ... other endpoint docs
};
```

### Option 2: Use with swagger-jsdoc

```typescript
import { authSwaggerDocs } from "./docs/auth-swagger";

// Add to your swagger-jsdoc options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Poker Tracker API",
      version: "1.0.0",
    },
    ...authSwaggerDocs,
  },
  apis: ["./src/api/controllers/*.ts"], // Your controller files
};
```

### Option 3: Generate separate documentation files

You can also generate separate OpenAPI JSON files for each controller:

```typescript
import { authSwaggerDocs } from "./docs/auth-swagger";
import fs from "fs";

// Generate auth-specific OpenAPI spec
fs.writeFileSync(
  "./docs/auth-openapi.json",
  JSON.stringify(authSwaggerDocs, null, 2)
);
```

## Benefits

- **Cleaner controllers**: Business logic is separated from documentation
- **Better maintainability**: Documentation changes don't require touching controller code
- **Reusability**: Documentation can be shared across different parts of the application
- **Version control**: Easier to track documentation changes separately

## Adding New Documentation

When adding new controller documentation:

1. Create a new file: `{controller-name}-swagger.ts`
2. Export a structured object with `components` and `paths`
3. Reference the file in your controller with `@see` comments
4. Update this README with integration instructions
