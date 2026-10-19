import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { rateLimits } from "./db/schema";

export type LimitedAction = "submit" | "vote";

const LIMITS: Record<LimitedAction, number> = { submit: 10, vote: 60 };

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip") || "unknown";
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set");
  return createHmac("sha256", salt).update(ip).digest("hex");
}

/** Increments the hourly bucket atomically; returns true if still within the limit. */
export async function withinLimit(req: Request, action: LimitedAction): Promise<boolean> {
  const ipHash = hashIp(getClientIp(req));
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  const [row] = await db
    .insert(rateLimits)
    .values({ ipHash, action, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.ipHash, rateLimits.action, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  return row.count <= LIMITS[action];
}
