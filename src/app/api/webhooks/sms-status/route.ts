import { NextRequest, NextResponse } from "next/server";

/** POST /api/webhooks/sms-status — статусы доставки SMS-провайдера. */
export async function POST(req: NextRequest) {
  const apiKey = process.env.SMS_PROVIDER_API_KEY ?? "";
  if (apiKey && req.headers.get("x-provider-key") !== apiKey) {
    return NextResponse.json({ error: "bad key" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  console.log("[webhook:sms-status]", JSON.stringify(body).slice(0, 300));
  return NextResponse.json({ ok: true });
}
