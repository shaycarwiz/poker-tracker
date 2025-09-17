#!/usr/bin/env node

/**
 * Script to generate secure environment variables for development
 * Usage: node scripts/generate-env.js
 */

const crypto = require("crypto");

console.log("🔐 Generating secure environment variables for development...\n");

// Generate a secure JWT secret (64 characters)
const jwtSecret = crypto.randomBytes(32).toString("base64");
console.log("JWT_SECRET=" + jwtSecret);

// Generate a secure database password
const dbPassword = crypto.randomBytes(16).toString("hex");
console.log("DB_PASSWORD=" + dbPassword);

console.log("\n✅ Generated secure environment variables!");
console.log("📝 Copy these values to your .env file");
console.log(
  "⚠️  Keep these values secure and never commit them to version control"
);
