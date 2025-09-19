// src/authentication.ts
import type { Request } from "express";

export async function expressAuthentication(
  request: Request,
  securityName: string,
  _?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    const token = request.headers["authorization"];
    if (!token) {
      throw new Error("No token");
    }
    // validate token...
    return { userId: "123" };
  }
  throw new Error("Unsupported auth scheme");
}
