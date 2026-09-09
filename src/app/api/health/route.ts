import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/health — проверка для Docker HEALTHCHECK и мониторинга. Без секретов. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
