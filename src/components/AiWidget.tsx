"use client";

import { useState } from "react";

/**
 * Цель страницы: квалифицировать внеурочную заявку, НЕ подтверждать запись.
 * AI собирает марку/симптом/срочность → создаёт Lead → администратор подтверждает.
 */
export function AiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    { role: "bot", text: "Здравствуйте! Я помощник GearFlow. Опишите проблему с авто — марка, модель и что беспокоит. Сейчас нерабочее время? Всё равно помогу: заявка уйдёт администратору." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const next = [...messages, { role: "user", text: userText }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "ai_widget", rawMessage: userText }),
      });
      const data = await res.json();
      const q = data.qualified;
      let reply = "Спасибо! Передал заявку администратору — он свяжется с вами в начале рабочего дня (Пн–Сб с 9:00).";
      if (q?.urgency === "high") {
        reply = `Похоже на срочную проблему («${q.symptom?.slice(0, 80)}»). Рекомендую не откладывать: позвоните нам или напишите в WhatsApp. Заявку я уже передал администратору как срочную.`;
      } else if (q?.suggestedServiceSlug) {
        reply += ` Предварительно похоже на услугу «${q.suggestedServiceSlug}». Точную цену назовём после диагностики.`;
      }
      setMessages([...next, { role: "bot", text: reply }]);
    } catch {
      setMessages([...next, { role: "bot", text: "Не получилось отправить, попробуйте позвонить нам напрямую." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`fixed z-50 right-4 bottom-20 md:bottom-6 ${
        open ? "w-[calc(100vw-2rem)] max-w-sm left-4 md:left-auto" : "w-auto"
      }`}
    >
      {open && (
        <div className="card p-4 mb-2 flex flex-col gap-2 max-h-[60vh]">
          <div className="font-bold">AI-помощник GearFlow</div>
          <div className="overflow-y-auto grid gap-2 max-h-[40vh]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-2.5 rounded-xl ${m.role === "bot" ? "bg-[#faf7f2]" : "bg-[#141210] text-white justify-self-end"}`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-sm opacity-60">Думаю…</div>}
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Например: Kia Rio 2019, стук спереди…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn-primary !px-4" onClick={send}>
              →
            </button>
          </div>
          <div className="text-[12px] opacity-60">AI только квалифицирует заявку, запись подтверждает администратор.</div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="btn-primary whitespace-nowrap !px-5 shadow-lg" aria-label="Открыть AI-помощник">
        {open ? "Скрыть помощника" : "🤖 AI-помощник"}
      </button>
    </div>
  );
}
