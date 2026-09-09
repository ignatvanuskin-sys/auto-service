import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { deliverNotification } from "@/lib/notify";
import { z } from "zod";

/** GET /api/admin/notifications — журнал отправок (owner/admin). */
export async function GET() {
  try {
    await requireRole(["owner", "admin"]);
    const items = await db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ items });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

/** POST /api/admin/notifications {id} — ручной resend (owner/admin). */
export async function POST(req: NextRequest) {
  try {
    await requireRole(["owner", "admin"]);
    const parsed = z.object({ id: z.string() }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Укажите id" }, { status: 400 });
    await db.notification.update({ where: { id: parsed.data.id }, data: { status: "queued", sentAt: null } }).catch(() => null);
    const ok = await deliverNotification(parsed.data.id);
    return NextResponse.json({ ok });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Уведомление не найдено" }, { status: 404 });
  }
}
