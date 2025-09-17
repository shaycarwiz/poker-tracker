#!/usr/bin/env node

/**
 * Script to test configuration validation
 * Usage: node scripts/test-config.js
 */

console.log("🧪 Testing configuration validation...\n");

// Test 1: Missing required environment variables
console.log("Test 1: Missing required environment variables");
process.env.NODE_ENV = "test";
delete process.env.DB_PASSWORD;
delete process.env.JWT_SECRET;
delete process.env.DB_NAME;
delete process.env.DB_USERNAME;
delete process.env.DEFAULT_CURRENCY;

try {
  require("../src/infrastructure/config/index.ts");
  console.log("❌ Should have thrown an error for missing variables");
} catch (error) {
  console.log(
    "✅ Correctly caught missing environment variables:",
    error.message
  );
}

// Test 2: Invalid JWT secret (too short)
console.log("\nTest 2: Invalid JWT secret (too short)");
process.env.JWT_SECRET = "short";
process.env.DB_PASSWORD = "validpassword123";
process.env.DB_NAME = "testdb";
process.env.DB_USERNAME = "testuser";
process.env.DEFAULT_CURRENCY = "USD";

try {
  require("../src/infrastructure/config/index.ts");
  console.log("❌ Should have thrown an error for short JWT secret");
} catch (error) {
  console.log("✅ Correctly caught short JWT secret:", error.message);
}

// Test 3: Invalid currency code
console.log("\nTest 3: Invalid currency code");
process.env.JWT_SECRET = "a".repeat(32);
process.env.DEFAULT_CURRENCY = "INVALID";

try {
  require("../src/infrastructure/config/index.ts");
  console.log("❌ Should have thrown an error for invalid currency");
} catch (error) {
  console.log("✅ Correctly caught invalid currency code:", error.message);
}

// Test 4: Valid configuration
console.log("\nTest 4: Valid configuration");
process.env.DEFAULT_CURRENCY = "USD";

try {
  const config = require("../src/infrastructure/config/index.ts");
  console.log("✅ Configuration loaded successfully");
  console.log("   - JWT Secret length:", config.config.jwt.secret.length);
  console.log(
    "   - DB Password length:",
    config.config.database.password.length
  );
  console.log("   - Default Currency:", config.config.poker.defaultCurrency);
} catch (error) {
  console.log("❌ Unexpected error with valid configuration:", error.message);
}

console.log("\n🎉 Configuration validation tests completed!");
