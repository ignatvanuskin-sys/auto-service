import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  // Верификация вебхука Meta (hub.challenge)
  const { searchParams } = new URL(req.url);
  if (searchParams.get("hub.verify_token") === (process.env.WHATSAPP_VERIFY_TOKEN ?? "change-me-whatsapp-verify")) {
    return new NextResponse(searchParams.get("hub.challenge") ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "bad verify token" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-hub-signature-256") ?? "";
  const secret = process.env.WHATSAPP_VERIFY_TOKEN ?? "";
  if (secret && process.env.WHATSAPP_ACCESS_TOKEN) {
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (sig !== expected) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }
  console.log("[webhook:whatsapp]", raw.slice(0, 500));
  return NextResponse.json({ ok: true });
}
