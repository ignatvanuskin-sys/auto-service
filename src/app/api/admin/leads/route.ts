import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

/** GET /api/admin/leads — список лидов (owner/admin). */
export async function GET() {
  try {
    await requireRole(["owner", "admin"]);
    const items = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ items });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

/** PATCH /api/admin/leads {id, status} — new|qualified|converted|discarded (owner/admin). */
export async function PATCH(req: NextRequest) {
  try {
    await requireRole(["owner", "admin"]);
    const parsed = z.object({ id: z.string(), status: z.enum(["new", "qualified", "converted", "discarded"]) }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    const updated = await db.lead.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
    return NextResponse.json({ ok: true, status: updated.status });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Лид не найден" }, { status: 404 });
  }
}
