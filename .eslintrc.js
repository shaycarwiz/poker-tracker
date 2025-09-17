module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/explicit-function-return-type": "off", // Let TypeScript infer
    "@typescript-eslint/explicit-module-boundary-types": "off", // Let TypeScript infer
    "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for clarity

    // General JavaScript/Node.js rules
    "no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "arrow-spacing": "error",
    "prefer-template": "error",
    "template-curly-spacing": "error",
    "object-shorthand": "error",
    "prefer-destructuring": [
      "error",
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    "no-duplicate-imports": "error",
    "no-useless-rename": "error",
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "comma-dangle": ["error", "always-multiline"],
    quotes: ["error", "double", { avoidEscape: true }],
    semi: ["error", "always"],
    indent: ["error", 2, { SwitchCase: 1 }],
    "max-len": [
      "warn",
      {
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    "no-trailing-spaces": "error",
    "eol-last": "error",
    "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"],
      },
    ],

    // Security and best practices
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    "no-sequences": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "error",
    "no-unused-expressions": "error",
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-useless-return": "error",
    "prefer-promise-reject-errors": "error",
    radix: "error",
    yoda: "error",

    // Node.js specific
    "no-process-exit": "error",
    "no-path-concat": "error",
    "no-sync": "warn",

    // Import/Export rules
    "sort-imports": [
      "error",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
  },
  overrides: [
    {
      // Test files
      files: ["**/*.test.ts", "**/*.spec.ts", "**/tests/**/*.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "no-console": "off",
        "max-len": "off",
      },
    },
    {
      // Configuration files
      files: ["*.config.js", "*.config.ts", "scripts/**/*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "no-console": "off",
      },
    },
    {
      // Migration files
      files: ["**/migrations/**/*.ts", "**/migrations/**/*.js"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
  ignorePatterns: [
    "dist/",
    "node_modules/",
    "coverage/",
    "*.d.ts",
    "generated/",
    "test-swagger.js",
    "tests/",
    "scripts/",
    "jest.config.js",
    ".eslintrc.js",
  ],
};
