/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/model/(.*)$": "<rootDir>/src/model/$1",
    "^@/api/(.*)$": "<rootDir>/src/api/$1",
    "^@/application/(.*)$": "<rootDir>/src/application/$1",
    "^@/infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
  },
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true,
};
