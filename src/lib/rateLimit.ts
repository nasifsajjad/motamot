import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (per-IP, resets on cold start)
// For production, replace with Upstash Redis
const rateLimitMap = new Map<string, { count: number; reset: number }>();

export interface RateLimitConfig {
  windowMs: number; // time window in ms
  max: number; // max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1 minute
  max: 30,
};

export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1 };
  }

  entry.count++;
  if (entry.count > config.max) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: config.max - entry.count };
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    { status: 429 }
  );
}
