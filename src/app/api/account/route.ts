import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccountPhone } from "@/lib/account-auth";

/** GET /api/account — только по OTP-сессии. Номер из query больше не принимается (защита PII). */
export async function GET() {
  const phone = await getAccountPhone();
  if (!phone) {
    return NextResponse.json({ error: "Войдите по коду из SMS", needCode: true }, { status: 401 });
  }
  try {
    const c = await db.customer.findUnique({
      where: { phone },
      include: { vehicles: true, bookings: { orderBy: { slotStart: "desc" }, take: 10 } },
    });
    if (!c) return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    return NextResponse.json({
      name: c.name,
      vehicles: c.vehicles,
      bookings: c.bookings.map((b) => ({ slotStart: b.slotStart, status: b.status })),
    });
  } catch {
    return NextResponse.json({ error: "Сервис временно недоступен" }, { status: 500 });
  }
}
