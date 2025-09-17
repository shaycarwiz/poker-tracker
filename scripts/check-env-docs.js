#!/usr/bin/env node

/**
 * Script to verify that all environment variables are properly documented
 * Usage: node scripts/check-env-docs.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking environment variable documentation...\n");

// Read the env.example file
const envExamplePath = path.join(__dirname, "..", "env.example");
const envExample = fs.readFileSync(envExamplePath, "utf8");

// Read the TypeScript env types
const envTypesPath = path.join(
  __dirname,
  "..",
  "src",
  "shared",
  "types",
  "env.d.ts"
);
const envTypes = fs.readFileSync(envTypesPath, "utf8");

// Extract environment variables from env.example
const envExampleVars = new Set();
const envExampleLines = envExample.split("\n");
envExampleLines.forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const varName = trimmed.split("=")[0];
    envExampleVars.add(varName);
  }
});

// Extract environment variables from TypeScript types
const envTypeVars = new Set();
const envTypeLines = envTypes.split("\n");
envTypeLines.forEach((line) => {
  // Match TypeScript interface properties with optional syntax
  const match = line.match(/(\w+)\?\s*:/);
  if (match) {
    envTypeVars.add(match[1]);
  }
});

// Find variables used in the codebase
const codebaseVars = new Set();
const srcDir = path.join(__dirname, "..", "src");
const files = getAllFiles(srcDir, [".ts", ".js"]);

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const matches = content.match(/process\.env\["([^"]+)"\]/g);
  if (matches) {
    matches.forEach((match) => {
      const varName = match.match(/process\.env\["([^"]+)"\]/)[1];
      codebaseVars.add(varName);
    });
  }
});

console.log("📊 Environment Variable Analysis:");
console.log("================================\n");

console.log(`Variables in env.example: ${envExampleVars.size}`);
console.log(`Variables in TypeScript types: ${envTypeVars.size}`);
console.log(`Variables used in codebase: ${codebaseVars.size}\n`);

// Check for missing variables
const missingFromExample = [...codebaseVars].filter(
  (v) => !envExampleVars.has(v)
);
const missingFromTypes = [...codebaseVars].filter((v) => !envTypeVars.has(v));
const extraInExample = [...envExampleVars].filter((v) => !codebaseVars.has(v));
const extraInTypes = [...envTypeVars].filter((v) => !codebaseVars.has(v));

console.log("🔍 Missing Variables:");
console.log("====================");

if (missingFromExample.length === 0) {
  console.log("✅ All codebase variables are documented in env.example");
} else {
  console.log("❌ Variables missing from env.example:");
  missingFromExample.forEach((v) => console.log(`   - ${v}`));
}

if (missingFromTypes.length === 0) {
  console.log("✅ All codebase variables have TypeScript types");
} else {
  console.log("❌ Variables missing from TypeScript types:");
  missingFromTypes.forEach((v) => console.log(`   - ${v}`));
}

console.log("\n📋 Extra Variables:");
console.log("==================");

if (extraInExample.length === 0) {
  console.log("✅ No extra variables in env.example");
} else {
  console.log("ℹ️  Extra variables in env.example (not used in code):");
  extraInExample.forEach((v) => console.log(`   - ${v}`));
}

if (extraInTypes.length === 0) {
  console.log("✅ No extra variables in TypeScript types");
} else {
  console.log("ℹ️  Extra variables in TypeScript types (not used in code):");
  extraInTypes.forEach((v) => console.log(`   - ${v}`));
}

console.log("\n📝 All Environment Variables:");
console.log("============================");
console.log("Codebase variables:", [...codebaseVars].sort().join(", "));
console.log("env.example variables:", [...envExampleVars].sort().join(", "));
console.log("TypeScript type variables:", [...envTypeVars].sort().join(", "));

console.log("\n🎉 Environment variable documentation check completed!");

// Helper function to get all files recursively
function getAllFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}
