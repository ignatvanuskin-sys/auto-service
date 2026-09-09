import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/validation";
import { rateLimited, clientIp } from "@/lib/ratelimit";
import { generateOtp, hashOtp } from "@/lib/account-auth";
import { z } from "zod";

/** POST /api/account/request-code {phone} — отправка одноразового кода (5 мин, 5 попыток). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ phone: z.string().min(6).max(20) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Укажите номер телефона" }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  const ip = clientIp(req);
  if (rateLimited(`otp-req:${ip}`, 10, 10 * 60 * 1000) || rateLimited(`otp-req:${phone}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много запросов кода. Подождите 10 минут." }, { status: 429 });
  }

  const customer = await db.customer.findUnique({ where: { phone } }).catch(() => null);
  if (!customer) {
    // не раскрываем, есть ли такой номер, но код не отправляем чужому номеру
    return NextResponse.json({ error: "Клиент с таким номером не найден. Сначала создайте запись через онлайн-запись." }, { status: 404 });
  }

  const code = generateOtp();
  await db.otpCode.create({
    data: { phone, codeHash: await hashOtp(code), expiresAt: new Date(Date.now() + 5 * 60000) },
  });

  // Доставка кода: SMS-провайдер (если настроен) — иначе dev-лог.
  const smsUrl = process.env.SMS_PROVIDER_SEND_URL ?? "";
  const smsKey = process.env.SMS_PROVIDER_API_KEY ?? "";
  if (smsUrl && smsKey) {
    try {
      await fetch(smsUrl, {
        method: "POST",
        headers: { "content-type": "application/json", "x-provider-key": smsKey },
        body: JSON.stringify({ to: phone, text: `GearFlow: код входа ${code}. Никому не сообщайте.` }),
      });
    } catch (e) {
      console.error("[otp] sms send failed", e);
    }
    return NextResponse.json({ ok: true });
  }
  if (process.env.NODE_ENV !== "production") {
    console.log(`[otp:dev] код для ${phone}: ${code}`);
    return NextResponse.json({ ok: true, devCode: code });
  }
  return NextResponse.json(
    { error: "Вход по коду недоступен: не настроен SMS-провайдер. Позвоните нам — найдём вашу запись." },
    { status: 503 }
  );
}
