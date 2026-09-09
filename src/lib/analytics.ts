import { db } from "./db";

export async function trackEvent(name: string, payload?: Record<string, unknown>, sessionId?: string) {
  try {
    await db.analyticsEvent.create({ data: { name, payload: (payload ?? {}) as object, sessionId } });
  } catch {
    // аналитика не должна ронять основной флоу
  }
}
