import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createAdminSession, ensureSeedAdmin, warnOnDefaultSecrets } from "@/lib/auth";
import { rateLimited, clientIp } from "@/lib/ratelimit";
import { z } from "zod";

export async function POST(req: NextRequest) {
  warnOnDefaultSecrets();
  const ip = clientIp(req);
  // защита от перебора пароля: 10 попыток входа / 10 минут с IP
  if (rateLimited(`admin-login:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток входа. Подождите 10 минут." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1).max(200) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Введите email и пароль" }, { status: 400 });
  try {
    await ensureSeedAdmin();
    const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
    // одинаковое время ответа при неверном email и пароле — не раскрываем, есть ли такой email
    const ok = admin ? await verifyPassword(parsed.data.password, admin.passwordHash) : false;
    if (!admin || !ok) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }
    await createAdminSession(admin.id, admin.role);
    return NextResponse.json({ ok: true, role: admin.role });
  } catch {
    return NextResponse.json({ error: "БД недоступна. Проверьте DATABASE_URL и миграции (см. README)." }, { status: 500 });
  }
}
