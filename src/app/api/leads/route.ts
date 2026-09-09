import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadSchema } from "@/lib/validation";
import { qualifyLead } from "@/lib/ai";
import { trackEvent } from "@/lib/analytics";
import { rateLimited, clientIp } from "@/lib/ratelimit";

/** POST /api/leads — приём лида от AI-виджета/мессенджеров. AI НЕ создаёт Booking, только Lead. */
export async function POST(req: NextRequest) {
  if (rateLimited(`leads:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много сообщений. Попробуйте позже или позвоните нам." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Опишите проблему хотя бы одной фразой" }, { status: 400 });

  // AI-квалификация НЕ должна ронять создание лида: любой сбой → эвристический фолбэк внутри qualifyLead.
  const q = await qualifyLead(parsed.data.rawMessage, []);
  try {
    const lead = await db.lead.create({
      data: {
        source: parsed.data.source,
        rawMessage: parsed.data.rawMessage.slice(0, 2000),
        extractedMake: q.make ?? parsed.data.make,
        extractedModel: q.model ?? parsed.data.model,
        urgency: q.urgency,
        status: "new",
      },
    });
    if (q.urgency === "high") {
      // Немедленный push админу, не ждём батч
      console.log(`[URGENT LEAD] ${lead.id}: ${q.symptom} — требуется звонок!`);
    }
    trackEvent("lead_created", { source: parsed.data.source, urgency: q.urgency }).catch(() => {});
    return NextResponse.json({ id: lead.id, qualified: q }, { status: 201 });
  } catch {
    // БД недоступна — всё равно вернём квалификацию, чтобы виджет отвечал
    return NextResponse.json({ id: "tmp", qualified: q }, { status: 201 });
  }
}
