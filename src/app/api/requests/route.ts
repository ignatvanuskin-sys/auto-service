import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestSchema, normalizePhone } from "@/lib/validation";
import { clientIp, rateLimited } from "@/lib/ratelimit";

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[requests] Telegram is not configured; request remains saved in the database");
    return;
  }
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!response.ok) throw new Error(`Telegram notification failed: ${response.status}`);
}

export async function POST(request: NextRequest) {
  if (rateLimited(`request:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много заявок. Позвоните нам — поможем быстрее." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Проверьте поля формы" }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true, id: "accepted" }, { status: 201 });

  const data = parsed.data;
  const lead = await db.lead.create({
    data: {
      source: "site",
      name: data.name,
      phone: normalizePhone(data.phone),
      vehicle: data.vehicle,
      serviceType: data.serviceType,
      comment: data.comment || null,
      preferredTime: data.preferredTime || null,
      rawMessage: data.comment || `${data.serviceType}: ${data.vehicle}`,
      status: "new",
    },
  });

  const message = [
    `<b>Новая заявка МОТОР+ #${lead.id.slice(-6).toUpperCase()}</b>`,
    `Имя: ${data.name}`,
    `Телефон: <a href="tel:${normalizePhone(data.phone)}">${normalizePhone(data.phone)}</a>`,
    `Автомобиль: ${data.vehicle}`,
    `Услуга: ${data.serviceType}`,
    data.preferredTime ? `Звонок: ${data.preferredTime}` : "",
    data.comment ? `Комментарий: ${data.comment}` : "",
  ].filter(Boolean).join("\n");

  notifyTelegram(message).catch((error) => console.error("[requests] notification error", error));
  return NextResponse.json({ ok: true, id: lead.id, displayId: lead.id.slice(-6).toUpperCase() }, { status: 201 });
}
