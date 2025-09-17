const path = require("path");

/** @type {import('jest').Config} */
module.exports = {
  rootDir: path.resolve(__dirname, ".."),
  projects: [
    {
      displayName: "API",
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
    },
    {
      displayName: "Web",
      testMatch: [
        "<rootDir>/packages/web/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
        "<rootDir>/packages/web/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
        "<rootDir>/packages/web/tests/**/*.{test,spec}.{js,jsx,ts,tsx}",
      ],
      testEnvironment: "jsdom",
      setupFilesAfterEnv: [
        "<rootDir>/packages/web/jest.setup.js",
        "<rootDir>/packages/web/tests/setup.ts",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/packages/web/src/$1",
        "^@/components/(.*)$": "<rootDir>/packages/web/src/components/$1",
        "^@/lib/(.*)$": "<rootDir>/packages/web/src/lib/$1",
        "^@/utils/(.*)$": "<rootDir>/packages/web/src/utils/$1",
        "^@/types/(.*)$": "<rootDir>/packages/web/src/types/$1",
        "^@/hooks/(.*)$": "<rootDir>/packages/web/src/hooks/$1",
      },
      transform: {
        "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
      },
      transformIgnorePatterns: [
        "/node_modules/",
        "^.+\\.module\\.(css|sass|scss)$",
      ],
      testPathIgnorePatterns: [
        "<rootDir>/packages/web/.next/",
        "<rootDir>/packages/web/node_modules/",
      ],
    },
  ],
};
