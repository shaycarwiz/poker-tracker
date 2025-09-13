import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

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
global.testUtils = {
  // Add any global test utilities here
};
