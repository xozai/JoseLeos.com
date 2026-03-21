import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sliding-window rate limiter backed by Vercel KV.
 *
 * @param identifier  Unique key (e.g. IP + route slug)
 * @param limit       Max requests allowed in the window
 * @param windowSecs  Window size in seconds
 * @returns           { success, remaining, resetIn }
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSecs: number
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  const key = `rl:${identifier}`;
  const now = Date.now();
  const windowMs = windowSecs * 1000;
  const windowStart = now - windowMs;

  try {
    // Remove expired entries, add this request, count total — all atomically
    const pipe = kv.pipeline();
    pipe.zremrangebyscore(key, 0, windowStart);
    // member must be unique; combine timestamp + random suffix
    pipe.zadd(key, { score: now, member: `${now}:${Math.random().toString(36).slice(2)}` });
    pipe.zcard(key);
    pipe.expire(key, windowSecs);

    const results = await pipe.exec<[number, number, number, number]>();
    const count = results[2];
    const remaining = Math.max(0, limit - count);

    return { success: count <= limit, remaining, resetIn: windowSecs };
  } catch {
    // If KV is unavailable, fail open (don't block the request)
    return { success: true, remaining: limit, resetIn: windowSecs };
  }
}

/**
 * Convenience helper: returns a 429 Response if the caller is rate-limited,
 * or null if the request should proceed.
 *
 * Usage:
 *   const limited = await checkRateLimit(req, "contact", 5, 60);
 *   if (limited) return limited;
 */
export async function checkRateLimit(
  req: NextRequest,
  route: string,
  limit: number,
  windowSecs: number
): Promise<NextResponse | null> {
  // Use the forwarded IP, falling back to a generic identifier
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const { success, remaining, resetIn } = await rateLimit(`${route}:${ip}`, limit, windowSecs);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(resetIn),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + resetIn),
        },
      }
    );
  }

  return null;
}
