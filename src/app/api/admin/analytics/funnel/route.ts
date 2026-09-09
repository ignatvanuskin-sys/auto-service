import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole(["owner", "admin"]);
    const [events, bookings, reviews] = await Promise.all([
      db.analyticsEvent.groupBy({ by: ["name"], _count: true }).catch(() => []),
      db.booking.groupBy({ by: ["status"], _count: true }).catch(() => []),
      db.review.count().catch(() => 0),
    ]);
    return NextResponse.json({ events, bookings, reviews });
  } catch {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
}
