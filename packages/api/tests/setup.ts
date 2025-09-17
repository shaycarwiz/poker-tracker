import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";

// Global test setup
beforeAll(() => {
  // Setup any global test configuration here
  console.log("Setting up test environment...");
});

afterAll(() => {
  // Cleanup after all tests
  console.log("Cleaning up test environment...");
});

// Global test utilities
declare global {
  var testUtils: {
    // Add any global test utilities here
  };
}

global.testUtils = {
  // Add any global test utilities here
};
