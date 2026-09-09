import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { queueNotification, deliverNotification } from "@/lib/notify";

/**
 * GET /api/cron/reminders — дёргать каждые 15 минут (cron/CI schedule).
 * ЗАЩИЩЁН секретом: Authorization: Bearer $CRON_SECRET (в dev без секрета — открыт для локальной проверки).
 * 1) reminder_24h / reminder_2h  2) review_request по done  3) maintenance_due  4) due scheduled-уведомления.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const out: Record<string, number> = { r24: 0, r2: 0, review: 0, maint: 0, due: 0, dormant: 0 };
  try {
    const now = new Date();
    const in24 = new Date(now.getTime() + 24 * 3600000);
    const in2 = new Date(now.getTime() + 2 * 3600000);

    const due24 = await db.booking.findMany({
      where: { status: { in: ["pending", "confirmed"] }, slotStart: { gte: new Date(in24.getTime() - 8 * 60000), lte: new Date(in24.getTime() + 8 * 60000) } },
      include: { customer: true, service: true },
    });
    for (const b of due24) {
      const n = await queueNotification({
        customerId: b.customerId, bookingId: b.id, channel: (b.customer.preferredChannel as "telegram") ?? "telegram",
        type: "reminder_24h",
        payload: { text: `Напоминаем: завтра в ${b.slotStart.toLocaleString("ru-RU")} ждём вас (${b.service?.name ?? "визит"}). Адрес: ул. Рыскулова, 62.` },
      });
      await deliverNotification(n.id);
      out.r24++;
    }

    const due2 = await db.booking.findMany({
      where: { status: { in: ["pending", "confirmed"] }, slotStart: { gte: new Date(in2.getTime() - 8 * 60000), lte: new Date(in2.getTime() + 8 * 60000) } },
      include: { customer: true },
    });
    for (const b of due2) {
      const n = await queueNotification({
        customerId: b.customerId, bookingId: b.id, channel: (b.customer.preferredChannel as "telegram") ?? "telegram",
        type: "reminder_2h",
        payload: { text: `Уже скоро: ждём вас в ${b.slotStart.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}. ул. Рыскулова, 62.` },
      });
      await deliverNotification(n.id);
      out.r2++;
    }

    const dueMaint = await db.vehicle.findMany({
      where: { nextServiceDueAt: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) } },
      include: { customer: true },
      take: 50,
    });
    for (const v of dueMaint) {
      // Идемпотентность без bookingId: не чаще одного напоминания о ТО на клиента в 7 дней
      const recent = await db.notification.findFirst({
        where: {
          customerId: v.customerId,
          type: "maintenance_due",
          status: { in: ["queued", "sent"] },
          createdAt: { gte: new Date(now.getTime() - 7 * 86400000) },
        },
      });
      if (recent) continue;
      const n = await queueNotification({
        customerId: v.customerId, channel: (v.customer.preferredChannel as "telegram") ?? "telegram",
        type: "maintenance_due",
        payload: { text: `Подходит срок ТО: ${v.make} ${v.model}. Запишитесь заранее — подберём удобный слот.` },
      });
      await deliverNotification(n.id);
      out.maint++;
    }

    // Отложенные уведомления, чьё время пришло (review_request +3ч, status_update и др.)
    const dueScheduled = await db.notification.findMany({
      where: { status: "queued", scheduledFor: { lte: now } },
      take: 100,
    });
    for (const n of dueScheduled) {
      if (await deliverNotification(n.id)) out.due++;
    }
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    console.error("[cron]", e);
    return NextResponse.json({ ok: false, ...out }, { status: 500 });
  }
}
