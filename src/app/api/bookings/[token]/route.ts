import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { slotCapacity, validateSlotTime, defaultWorkingHours } from "@/lib/slots";
import { trackEvent } from "@/lib/analytics";

/** GET /api/bookings/:manageToken — детали записи без логина, по токену. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!token || token.length > 100) return NextResponse.json({ error: "Некорректная ссылка" }, { status: 400 });
  const b = await db.booking.findUnique({
    where: { manageToken: token },
    include: { service: true },
  }).catch(() => null);
  if (!b) return NextResponse.json({ error: "Запись не найдена. Проверьте ссылку из сообщения." }, { status: 404 });
  // id не отдаём наружу сверх необходимого: управлять можно только по токену
  return NextResponse.json({ slotStart: b.slotStart, slotEnd: b.slotEnd, status: b.status, serviceName: b.service?.name });
}

/** PATCH /api/bookings/:manageToken — перенос/отмена без логина. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!token || token.length > 100) return NextResponse.json({ error: "Некорректная ссылка" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const schema = z.object({ status: z.enum(["cancelled"]).optional(), slotStart: z.string().max(40).optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });

  const b = await db.booking.findUnique({ where: { manageToken: token } }).catch(() => null);
  if (!b) return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  if (["done", "cancelled"].includes(b.status)) {
    return NextResponse.json({ error: "Запись уже завершена, перенос невозможен" }, { status: 409 });
  }

  try {
    if (parsed.data.status === "cancelled") {
      const updated = await db.booking.update({ where: { id: b.id }, data: { status: "cancelled" } });
      trackEvent("booking_cancelled", {}).catch(() => {});
      return NextResponse.json({ slotStart: updated.slotStart, status: updated.status });
    }
    if (parsed.data.slotStart) {
      const slotStart = new Date(parsed.data.slotStart);
      const durationMin = Math.max(30, Math.round((b.slotEnd.getTime() - b.slotStart.getTime()) / 60000));
      const slotErr = validateSlotTime(slotStart, durationMin, defaultWorkingHours());
      if (slotErr) return NextResponse.json({ error: slotErr }, { status: 400 });
      const slotEnd = new Date(slotStart.getTime() + (b.slotEnd.getTime() - b.slotStart.getTime()));
      const capacity = slotCapacity(await db.master.count());
      // перенос с той же защитой, что и создание: слот должен быть свободен (кроме самой записи)
      const overlapping = await db.booking.count({
        where: {
          id: { not: b.id },
          status: { in: ["pending", "confirmed", "in_progress"] },
          slotStart: { lt: slotEnd },
          slotEnd: { gt: slotStart },
        },
      });
      if (overlapping >= capacity) {
        return NextResponse.json({ error: "Это время уже занято. Выберите другое." }, { status: 409 });
      }
      const updated = await db.booking.update({ where: { id: b.id }, data: { slotStart, slotEnd, status: "pending" } });
      return NextResponse.json({ slotStart: updated.slotStart, status: updated.status });
    }
    return NextResponse.json({ error: "Укажите slotStart или status=cancelled" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Слот занят, выберите другое время" }, { status: 409 });
  }
}
