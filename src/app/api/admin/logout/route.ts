import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth";

/** POST /api/admin/logout — выход из админки. */
export async function POST() {
  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}
