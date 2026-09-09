import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildDaySlotsCapacity, parseWorkingHours, slotCapacity, defaultWorkingHours } from "@/lib/slots";

/** GET /api/availability?date=YYYY-MM-DD&serviceSlug=&masterId= — только свободные слоты. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "Укажите date=YYYY-MM-DD" }, { status: 400 });
  }
  const day = new Date(`${dateStr}T00:00:00`);
  if (isNaN(day.getTime())) return NextResponse.json({ error: "Некорректная дата" }, { status: 400 });
  const dayEnd = new Date(day.getTime() + 86400000);
  const serviceSlug = searchParams.get("serviceSlug") ?? undefined;
  const masterId = searchParams.get("masterId") ?? undefined;

  let durationMin = 60;
  let workingHours = defaultWorkingHours();
  let capacity = slotCapacity(0);
  try {
    if (serviceSlug) {
      const s = await db.service.findUnique({ where: { slug: serviceSlug } });
      if (s) durationMin = s.durationMin;
    }
    if (masterId) {
      const m = await db.master.findUnique({ where: { id: masterId } });
      if (!m) return NextResponse.json({ error: "Мастер не найден" }, { status: 400 });
      workingHours = parseWorkingHours(m.workingHours);
      capacity = 1; // у конкретного мастера — один слот на окно
    } else {
      capacity = slotCapacity(await db.master.count());
    }
  } catch {
    // без БД — дефолтные 60 мин / capacity по умолчанию
  }

  let busy: { start: Date; end: Date }[] = [];
  try {
    const bookings = await db.booking.findMany({
      where: {
        slotStart: { gte: day, lt: dayEnd },
        status: { in: ["pending", "confirmed", "in_progress"] },
        ...(masterId ? { masterId } : {}),
      },
      select: { slotStart: true, slotEnd: true },
    });
    busy = bookings.map((b) => ({ start: b.slotStart, end: b.slotEnd }));
    const blocked = await db.blockedSlot.findMany({
      where: masterId ? { masterId, start: { lt: dayEnd }, end: { gt: day } } : { start: { lt: dayEnd }, end: { gt: day } },
      select: { start: true, end: true },
    });
    busy = busy.concat(blocked);
  } catch {
    // без БД — считаем всё свободным, страница всё равно отрендерится
  }

  const slots = buildDaySlotsCapacity(day, busy, durationMin, capacity, workingHours);
  return NextResponse.json({ date: dateStr, slots: slots.map((s) => s.toISOString()), capacity });
}
