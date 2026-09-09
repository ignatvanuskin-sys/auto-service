import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/validation";
import { rateLimited, clientIp } from "@/lib/ratelimit";
import { createAccountSession, hashOtp } from "@/lib/account-auth";
import { z } from "zod";

/** POST /api/account/verify-code {phone, code} — проверка кода, выдача сессии кабинета. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ phone: z.string().min(6).max(20), code: z.string().regex(/^\d{6}$/, "Код — 6 цифр") }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Введите 6-значный код" }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  if (rateLimited(`otp-verify:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток. Запросите новый код позже." }, { status: 429 });
  }

  const row = await db.otpCode.findFirst({
    where: { phone, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);
  if (!row) return NextResponse.json({ error: "Код истёк или не запрашивался. Запросите новый." }, { status: 401 });
  if (row.attempts >= 5) return NextResponse.json({ error: "Превышено число попыток. Запросите новый код." }, { status: 429 });

  const ok = (await hashOtp(parsed.data.code)) === row.codeHash;
  await db.otpCode.update({ where: { id: row.id }, data: { attempts: row.attempts + 1 } }).catch(() => {});
  if (!ok) return NextResponse.json({ error: "Неверный код" }, { status: 401 });

  await db.otpCode.deleteMany({ where: { phone } }).catch(() => {});
  await createAccountSession(phone);
  return NextResponse.json({ ok: true });
}
