import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

/** GET /api/admin/reviews — модерация отзывов (owner/admin). */
export async function GET() {
  try {
    await requireRole(["owner", "admin"]);
    const items = await db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { customer: { select: { phone: true, name: true } } },
    });
    return NextResponse.json({ items });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

/** PATCH {id, published} — публикация/скрытие (owner/admin). */
export async function PATCH(req: NextRequest) {
  try {
    await requireRole(["owner", "admin"]);
    const parsed = z.object({ id: z.string(), published: z.boolean() }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    await db.review.update({ where: { id: parsed.data.id }, data: { published: parsed.data.published } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 403) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
  }
}
