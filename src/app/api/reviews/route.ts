import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewSchema, normalizePhone } from "@/lib/validation";
import { rateLimited, clientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  if (rateLimited(`reviews:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много отзывов подряд. Попробуйте позже." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const phone = normalizePhone(parsed.data.phone);
    const customer = await db.customer.upsert({
      where: { phone },
      update: {},
      create: { phone, status: "active" },
    });
    const r = await db.review.create({
      data: {
        customerId: customer.id,
        rating: parsed.data.rating,
        text: parsed.data.text,
        vehicleInfo: parsed.data.vehicleInfo,
        serviceName: parsed.data.serviceName,
        published: false,
      },
    });
    return NextResponse.json({ id: r.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Не получилось отправить отзыв" }, { status: 500 });
  }
}
