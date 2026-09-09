import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

/** GET /api/admin/customers — клиенты с авто и числом визитов (owner/admin). PII — только своих ролей. */
export async function GET() {
  try {
    await requireRole(["owner", "admin"]);
    const items = await db.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { vehicles: true, _count: { select: { bookings: true, reviews: true } } },
    });
    return NextResponse.json({ items });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
