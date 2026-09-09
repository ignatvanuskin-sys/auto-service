import { db } from "./db";

export type NotifyChannel = "telegram" | "whatsapp" | "sms" | "email";
export type NotifyType =
  | "confirmation"
  | "reminder_24h"
  | "reminder_2h"
  | "status_update"
  | "review_request"
  | "maintenance_due";

/** Идемпотентная постановка уведомления в очередь (проверка дубля того же type для той же брони). */
export async function queueNotification(opts: {
  customerId?: string;
  bookingId?: string;
  channel: NotifyChannel;
  type: NotifyType;
  payload: Record<string, unknown>;
  scheduledFor?: Date;
}) {
  if (opts.bookingId) {
    const existing = await db.notification.findFirst({
      where: { bookingId: opts.bookingId, type: opts.type, status: { in: ["queued", "sent"] } },
    });
    if (existing) return existing; // идемпотентность
  }
  return db.notification.create({
    data: {
      customerId: opts.customerId,
      bookingId: opts.bookingId,
      channel: opts.channel,
      type: opts.type,
      status: "queued",
      payload: opts.payload as object,
      scheduledFor: opts.scheduledFor,
    },
  });
}

/** Доставка одного уведомления: Telegram Bot API → фолбэк в лог при отсутствии токена. */
export async function deliverNotification(id: string): Promise<boolean> {
  const n = await db.notification.findUnique({ where: { id } });
  if (!n || n.status === "sent") return true;
  try {
    const payload = n.payload as Record<string, unknown>;
    const text =
      (payload.text as string) ??
      `GearFlow: ${n.type} — запись ${n.bookingId ?? ""}`.trim();

    if (n.channel === "telegram" && process.env.TELEGRAM_BOT_TOKEN) {
      const chatId = (payload.chatId as string) ?? (payload.phone as string);
      if (chatId) {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text }),
        });
      }
    } else if (n.channel === "whatsapp" && process.env.WHATSAPP_ACCESS_TOKEN) {
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
      await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: payload.phone,
          type: "text",
          text: { body: text },
        }),
      });
    } else {
      // Нет токена провайдера / SMS / email — фиксируем в лог, бронь при этом уже создана.
      console.log(`[notify:${n.channel}:${n.type}]`, text);
    }
    await db.notification.update({
      where: { id },
      data: { status: "sent", sentAt: new Date() },
    });
    return true;
  } catch (e) {
    console.error("[notify] delivery failed", id, e);
    await db.notification.update({ where: { id }, data: { status: "failed" } });
    return false;
  }
}

export function bookingConfirmationText(b: {
  slotStart: Date;
  serviceName?: string;
  manageUrl: string;
}): string {
  return (
    `GearFlow Auto Service: запись подтверждена!\n` +
    `${b.serviceName ?? "Диагностика/ремонт"} — ${b.slotStart.toLocaleString("ru-RU")}\n` +
    `Перенести/отменить: ${b.manageUrl}`
  );
}
