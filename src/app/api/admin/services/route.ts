import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

const serviceSchema = z.object({
  slug: z.string().min(2).max(80),
  category: z.string().min(2).max(60),
  name: z.string().min(3).max(160),
  shortDesc: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  priceMin: z.number().int().min(0),
  priceMax: z.number().int().min(0),
  durationMin: z.number().int().min(15).max(1440),
  warrantyText: z.string().max(300).optional(),
});

/** GET /api/admin/services — полный список (owner/admin). */
export async function GET() {
  try {
    await requireRole(["owner", "admin"]);
    return NextResponse.json({ items: await db.service.findMany({ orderBy: { category: "asc" } }) });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

/** POST — создать услугу. PATCH {id, ...fields} — обновить цены/сроки. DELETE?id= — удалить (если нет броней). */
export async function POST(req: NextRequest) {
  try {
    await requireRole(["owner", "admin"]);
    const parsed = serviceSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const created = await db.service.create({ data: { ...parsed.data, currency: "KZT" } });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Такой slug уже существует" }, { status: 409 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole(["owner", "admin"]);
    const body = await req.json();
    const parsed = serviceSchema.partial().extend({ id: z.string() }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    const { id, ...fields } = parsed.data;
    const updated = await db.service.update({ where: { id }, data: fields });
    return NextResponse.json({ ok: true, id: updated.id });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(["owner"]); // удаление услуг — только владелец
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Укажите id" }, { status: 400 });
    const used = await db.booking.count({ where: { serviceId: id } });
    if (used > 0) return NextResponse.json({ error: "Услуга используется в записях — удаление запрещено" }, { status: 409 });
    await db.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }
}
