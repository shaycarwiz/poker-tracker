/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "api",
      testMatch: ["<rootDir>/packages/api/tests/**/*.test.ts"],
      preset: "ts-jest",
      testEnvironment: "node",
      setupFilesAfterEnv: ["<rootDir>/packages/api/tests/setup.ts"],
      transform: {
        "^.+\\.ts$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/packages/api/tsconfig.jest.json",
          },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/packages/api/src/$1",
        "^@/model/(.*)$": "<rootDir>/packages/api/src/model/$1",
        "^@/api/(.*)$": "<rootDir>/packages/api/src/api/$1",
        "^@/application/(.*)$": "<rootDir>/packages/api/src/application/$1",
        "^@/infrastructure/(.*)$":
          "<rootDir>/packages/api/src/infrastructure/$1",
        "^@/shared/(.*)$": "<rootDir>/packages/api/src/shared/$1",
      },
      testTimeout: 10000,
      forceExit: true,
      detectOpenHandles: true,
    },
  ],
};
