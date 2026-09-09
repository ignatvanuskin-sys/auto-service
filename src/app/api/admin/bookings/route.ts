import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { queueNotification, deliverNotification } from "@/lib/notify";

async function ownMasterId(adminId: string): Promise<string | null> {
  const admin = await db.adminUser.findUnique({ where: { id: adminId } }).catch(() => null);
  return admin?.masterId ?? null;
}

export async function GET() {
  try {
    const s = await requireRole(["owner", "admin", "master"]);
    // мастер видит только свои записи
    const where = s.role === "master" ? { masterId: await ownMasterId(s.adminId) } : {};
    if (s.role === "master" && !where.masterId) {
      return NextResponse.json({ items: [], note: "Учётка мастера не привязана к мастеру" });
    }
    const items = await db.booking.findMany({
      where,
      orderBy: { slotStart: "desc" },
      take: 100,
      include: { customer: true, service: true },
    });
    return NextResponse.json({ items });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ items: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const s = await requireRole(["owner", "admin", "master"]);
    const { id, status } = await req.json();
    const prev = await db.booking.findUnique({ where: { id } });
    if (!prev) return NextResponse.json({ error: "Не найдена" }, { status: 404 });
    if (s.role === "master") {
      const own = await ownMasterId(s.adminId);
      // мастер: только свои записи и только статусы работ, без финансов/настроек
      if (!own || prev.masterId !== own) return NextResponse.json({ error: "Чужие записи недоступны" }, { status: 403 });
      if (!["in_progress", "done"].includes(status)) {
        return NextResponse.json({ error: "Мастер может менять только статус работ" }, { status: 403 });
      }
    }
    const updated = await db.booking.update({ where: { id }, data: { status } });
    if (status === "done") {
      // review_request через 3 часа (идемпотентно — повтор не создаст дубль)
      await queueNotification({
        customerId: updated.customerId,
        bookingId: updated.id,
        channel: "telegram",
        type: "review_request",
        payload: { text: "Спасибо, что были у нас! Оцените визит — это займёт минуту." },
        scheduledFor: new Date(Date.now() + 3 * 3600000),
      });
    }
    if (["in_progress", "done"].includes(status)) {
      const n = await queueNotification({
        customerId: updated.customerId,
        bookingId: updated.id,
        channel: "telegram",
        type: "status_update",
        payload: { text: `Статус вашего авто: ${status === "done" ? "готово, можно забирать!" : "в работе"}.` },
      });
      // ошибка доставки не роняет смену статуса
      deliverNotification(n.id).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
