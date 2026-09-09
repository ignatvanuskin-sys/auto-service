export type QualifiedLead = {
  make?: string;
  model?: string;
  year?: number;
  symptom: string;
  urgency: "low" | "medium" | "high";
  suggestedServiceSlug?: string;
  confidence: number;
};

const URGENT_WORDS = ["не заводится", "заглох", "дым", "течёт", "тормоз", "стук сильный", "авария", "эвакуатор", "горит чек и троит", "перегрев"];
const SERVICE_HINTS: Array<{ slug: string; words: string[] }> = [
  { slug: "shinomontazh", words: ["шин", "колёс", "переобуть", "балансир"] },
  { slug: "zamena-tormoznyh-kolodok", words: ["тормоз", "скрип при торможении", "колодк"] },
  { slug: "remont-podveski", words: ["стук", "подвеск", "гремит", "скрипит на кочках"] },
  { slug: "kondicioner", words: ["кондиционер", "печка дует тёплым", "фреон", "не холодит"] },
  { slug: "to-10k", words: ["масло", "то ", "техобслуживание", "фильтр"] },
  { slug: "elektrika", words: ["аккумулятор", "стартер", "генератор", "не крутит", "электрик"] },
  { slug: "remont-dvigatelya", words: ["двигатель", "грм", "масло жрёт", "дымит", "капиталк"] },
  { slug: "detailing", words: ["химчистка", "полировка", "керамика", "детейлинг"] },
];

/**
 * AI-квалификация заявки. При наличии ANTHROPIC_API_KEY — вызов Claude с structured output,
 * иначе — детерминированный эвристический фолбэк (чтобы виджет работал без ключа в демо).
 * ВАЖНО: результат — только Lead, AI никогда не создаёт Booking самостоятельно.
 * Любой сбой AI (timeout/сеть/429/мусор в ответе) → тихий фолбэк на эвристику, лид создаётся всегда.
 */
export async function qualifyLead(message: string, history: string[] = []): Promise<QualifiedLead> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 400,
          system:
            "Ты — квалификатор заявок автосервиса. Верни СТРОГО JSON: {make,model,year,symptom,urgency,suggestedServiceSlug,confidence}. urgency: high если машина не на ходу/тормоза/дым/перегрев, иначе medium/low. Никакого текста вне JSON.",
          messages: [
            ...history.map((h) => ({ role: "user" as const, content: h })),
            { role: "user", content: message },
          ],
        }),
      });
      if (!res.ok) throw new Error(`anthropic HTTP ${res.status}`);
      const data = await res.json();
      const text: string = data?.content?.[0]?.text ?? "{}";
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const slug = typeof parsed.suggestedServiceSlug === "string" ? parsed.suggestedServiceSlug : undefined;
      return {
        symptom: String(parsed.symptom ?? message).slice(0, 500),
        urgency: parsed.urgency === "low" || parsed.urgency === "high" ? parsed.urgency : "medium",
        make: typeof parsed.make === "string" ? parsed.make.slice(0, 60) : undefined,
        model: typeof parsed.model === "string" ? parsed.model.slice(0, 60) : undefined,
        year:
          typeof parsed.year === "number" && Number.isInteger(parsed.year) && parsed.year >= 1980 && parsed.year <= new Date().getFullYear() + 1
            ? parsed.year
            : undefined,
        // принимаем только известные slug — мусор от модели не утекает в UI/БД
        suggestedServiceSlug: slug && SERVICE_HINTS.some((h) => h.slug === slug) ? slug : undefined,
        confidence: typeof parsed.confidence === "number" && parsed.confidence >= 0 && parsed.confidence <= 1 ? parsed.confidence : 0.6,
      };
    } catch (e) {
      console.error("[ai] anthropic call failed, fallback to heuristics", e instanceof Error ? e.message : e);
    } finally {
      clearTimeout(timer);
    }
  }
  return heuristicQualify(message);
}

/** Детерминированный фолбэк: срочность, подсказка услуги, марка. Используется без ключа и при любом сбое AI. */
export function heuristicQualify(message: string): QualifiedLead {
  const lower = message.toLowerCase();
  const urgency: QualifiedLead["urgency"] = URGENT_WORDS.some((w) => lower.includes(w)) ? "high" : "medium";
  const hint = SERVICE_HINTS.find((h) => h.words.some((w) => lower.includes(w)));
  // Грубое извлечение марки из справочника
  const makes = ["toyota", "hyundai", "kia", "nissan", "lada", "bmw", "mercedes", "audi", "skoda", "volkswagen", "mazda", "honda", "ford", "chery", "haval", "geely", "lexus", "renault", "chevrolet"];
  const found = makes.find((m) => lower.includes(m));
  return {
    symptom: message.slice(0, 500),
    urgency,
    suggestedServiceSlug: hint?.slug,
    make: found,
    confidence: 0.45,
  };
}
