import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/services-data";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.service.findMany({ orderBy: { category: "asc" } });
    if (items.length) return NextResponse.json({ items });
  } catch { /* fallback на статический каталог */ }
  return NextResponse.json({ items: SERVICES });
}
