import { NextRequest, NextResponse } from "next/server";

function telegramAuth(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true; // dev-режим без секрета
  return req.headers.get("x-telegram-bot-api-secret-token") === secret;
}

export async function POST(req: NextRequest) {
  if (!telegramAuth(req)) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const update = await req.json().catch(() => ({}));
  console.log("[webhook:telegram]", JSON.stringify(update).slice(0, 500));
  // TODO: picks text → qualifyLead → Lead; команды /start, /status.
  return NextResponse.json({ ok: true });
}
