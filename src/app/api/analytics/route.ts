import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { rateLimited, clientIp } from "@/lib/ratelimit";

const eventSchema = z.object({
  name: z.string().min(1).max(64),
  sessionId: z.string().max(64).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  // аналитика открыта фронту, но с лимитом и капой на размер — чтобы не залить БД мусором
  if (rateLimited(`analytics:${clientIp(req)}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "bad event" }, { status: 400 });
  try {
    const payloadStr = JSON.stringify(parsed.data.payload ?? {});
    if (payloadStr.length > 2048) return NextResponse.json({ error: "payload too large" }, { status: 413 });
    await db.analyticsEvent.create({
      data: { name: parsed.data.name, sessionId: parsed.data.sessionId, payload: (parsed.data.payload ?? {}) as object },
    });
  } catch {
    // аналитика не роняет флоу
  }
  return NextResponse.json({ ok: true });
}
