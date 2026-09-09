import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBookingSchema, normalizePhone } from "@/lib/validation";
import { queueNotification, bookingConfirmationText, deliverNotification } from "@/lib/notify";
import { trackEvent } from "@/lib/analytics";
import { rateLimited, clientIp } from "@/lib/ratelimit";
import { slotCapacity, validateSlotTime, defaultWorkingHours } from "@/lib/slots";

/** POST /api/bookings — транзакционное создание записи, защита от double-booking. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(`bookings:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток. Подождите 10 минут." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (body !== null && typeof body !== "object") {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте данные формы" }, { status: 400 });
  }
  const d = parsed.data;
  if (d.website && d.website.length > 0) {
    // honeypot против спам-ботов: тихо "успешно", запись не создаём
    return NextResponse.json({ error: "Не получилось создать запись" }, { status: 400 });
  }
  const phone = normalizePhone(d.phone);
  const slotStart = new Date(d.slotStart);

  try {
    let service: { id: string; name: string; durationMin: number } | null = null;
    if (d.serviceSlug) {
      service = await db.service.findUnique({ where: { slug: d.serviceSlug } });
      if (!service) return NextResponse.json({ error: "Такой услуги нет — обновите страницу и выберите заново" }, { status: 400 });
    }
    if (d.masterId) {
      const master = await db.master.findUnique({ where: { id: d.masterId } });
      if (!master) return NextResponse.json({ error: "Мастер не найден — обновите страницу" }, { status: 400 });
    }
    const durationMin = service?.durationMin ?? 60;
    const slotErr = validateSlotTime(slotStart, durationMin, defaultWorkingHours());
    if (slotErr) return NextResponse.json({ error: slotErr }, { status: 400 });
    const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);
    const mastersCount = await db.master.count();
    const capacity = slotCapacity(mastersCount);

    const result = await db.$transaction(async (tx) => {
      // Сериализация конкурентных броней одного слота: advisory lock на транзакцию.
      // Без него две параллельные транзакции обе насчитают 0 пересечений и создадут дубль.
      await tx.$executeRawUnsafe(
        "SELECT pg_advisory_xact_lock(hashtext($1))",
        slotStart.toISOString()
      );

      // 1) Вместимость цеха: не больше capacity активных записей в этом окне (любой клиент).
      const overlapping = await tx.booking.count({
        where: {
          status: { in: ["pending", "confirmed", "in_progress"] },
          slotStart: { lt: slotEnd },
          slotEnd: { gt: slotStart },
        },
      });
      if (overlapping >= capacity) {
        const e = new Error("SLOT_TAKEN") as Error & { code?: string };
        e.code = "SLOT_TAKEN";
        throw e;
      }

      const customer = await tx.customer.upsert({
        where: { phone },
        update: { name: d.name, preferredChannel: d.channel },
        create: { phone, name: d.name, preferredChannel: d.channel, status: "new" },
      });

      // 2) Один клиент — одна активная запись в окне (защита от даблкликов/повторов).
      const ownOverlap = await tx.booking.findFirst({
        where: {
          customerId: customer.id,
          status: { in: ["pending", "confirmed"] },
          slotStart: { lt: slotEnd },
          slotEnd: { gt: slotStart },
        },
      });
      if (ownOverlap) {
        const e = new Error("SLOT_TAKEN") as Error & { code?: string };
        e.code = "SLOT_TAKEN";
        throw e;
      }

      const vehicle = await tx.vehicle.create({
        data: {
          customerId: customer.id,
          make: d.make,
          model: d.model,
          year: d.year,
          vin: d.vin,
          mileage: d.mileage,
          nextServiceDueAt: new Date(Date.now() + 90 * 86400000),
        },
      });
      // 3) Тот же мастер в пересекающееся время — запрет (дополняет UNIQUE(masterId, slotStart),
      //    который ловит только точное совпадение старта; NULL-masterId constraint не покрывает).
      if (d.masterId) {
        const masterBusy = await tx.booking.findFirst({
          where: {
            masterId: d.masterId,
            status: { in: ["pending", "confirmed", "in_progress"] },
            slotStart: { lt: slotEnd },
            slotEnd: { gt: slotStart },
          },
        });
        if (masterBusy) {
          const e = new Error("SLOT_TAKEN") as Error & { code?: string };
          e.code = "SLOT_TAKEN";
          throw e;
        }
      }
      const booking = await tx.booking.create({
        data: {
          customerId: customer.id,
          vehicleId: vehicle.id,
          serviceId: service?.id,
          masterId: d.masterId,
          problemText: d.problemText,
          slotStart,
          slotEnd,
          status: "pending",
          source: d.source,
        },
      });
      return { customer, booking, service };
    });

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const manageUrl = `${base}/booking/${result.booking.id}/manage?token=${result.booking.manageToken}`;
    const n = await queueNotification({
      customerId: result.customer.id,
      bookingId: result.booking.id,
      channel: d.channel,
      type: "confirmation",
      payload: {
        text: bookingConfirmationText({ slotStart, serviceName: result.service?.name, manageUrl }),
        phone,
        manageUrl,
      },
    });
    // Пытаемся доставить сразу; ошибка доставки НЕ роняет бронь.
    deliverNotification(n.id).catch(() => {});
    console.log(`[admin-notify] Новая запись: ${d.name} ${phone}, ${slotStart.toLocaleString("ru-RU")}, ${result.service?.name ?? d.problemText ?? "—"}`);
    trackEvent("booking_complete", { serviceSlug: d.serviceSlug, channel: d.channel }).catch(() => {});

    return NextResponse.json(
      { id: result.booking.id, manageToken: result.booking.manageToken, slotStart: result.booking.slotStart },
      { status: 201 }
    );
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "SLOT_TAKEN" || String(e).includes("Unique constraint")) {
      return NextResponse.json({ error: "Этот слот только что заняли. Выберите другое время." }, { status: 409 });
    }
    console.error("[bookings] create failed", e);
    return NextResponse.json({ error: "Не получилось создать запись. Попробуйте ещё раз или позвоните нам." }, { status: 500 });
  }
}
