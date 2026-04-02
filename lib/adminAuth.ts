import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "crypto";

export const COOKIE_NAME = "dc-admin-token";

function secret() {
  const s = process.env.JWT_SECRET ?? "insecure-dev-secret-change-me-32x";
  return new TextEncoder().encode(s);
}

export async function createToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

/** Timing-safe password comparison */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  // Pad both to same length to prevent length-based timing leaks
  const len = Math.max(input.length, expected.length, 32);
  const a = Buffer.alloc(len, 0);
  const b = Buffer.alloc(len, 0);
  a.write(input);
  b.write(expected);
  return timingSafeEqual(a, b) && input === expected;
}

// Simple in-memory rate limiter — resets on cold start, good enough for single admin
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}
