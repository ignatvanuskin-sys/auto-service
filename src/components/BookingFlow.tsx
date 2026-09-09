"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CAR_MAKES, SERVICES } from "@/lib/services-data";
import { track } from "@/components/Analytics";

/**
 * <BookingFlow /> — 4 шага записи, step state в URL query (работает back-button).
 * Шаг 1: услуга/проблема, Шаг 2: авто, Шаг 3: дата/время, Шаг 4: контакт.
 */
export function BookingFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const step = Math.min(4, Math.max(1, Number(params.get("step") ?? 1)));

  const [serviceSlug, setServiceSlug] = useState(params.get("service") ?? "");
  const [problemText, setProblemText] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotStart, setSlotStart] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("telegram");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; manageToken: string; slotStart: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function go(n: number) {
    track("booking_step_completed", { step: n });
    const q = new URLSearchParams(params.toString());
    q.set("step", String(n));
    if (serviceSlug) q.set("service", serviceSlug);
    router.push(`/booking?${q.toString()}`);
  }

  const days = useMemo(() => {
    const out: string[] = [];
    const t = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(t.getTime() + i * 86400000);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, []);

  useEffect(() => {
    track("booking_started", {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === 3 && date) {
      fetch(`/api/availability?date=${date}${serviceSlug ? `&serviceSlug=${serviceSlug}` : ""}`)
        .then((r) => r.json())
        .then((d) => setSlots(d.slots ?? []))
        .catch(() => setSlots([]));
    }
  }, [step, date, serviceSlug]);

  const makes = CAR_MAKES.filter((m) => m.toLowerCase().includes(make.toLowerCase())).slice(0, 6);

  async function submit() {
    setError("");
    if (!slotStart) return setError("Выберите дату и время");
    if (name.trim().length < 2) return setError("Представьтесь, пожалуйста — минимум 2 буквы");
    if (phone.replace(/\D/g, "").length < 10) return setError("Проверьте номер телефона — не хватает цифр");
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceSlug: serviceSlug || undefined,
          problemText: problemText || undefined,
          make: make || "Не указана",
          model: model || "Не указана",
          year: year ? Number(year) : undefined,
          vin: vin || undefined,
          slotStart,
          name,
          phone,
          channel,
          source: "site",
          website: "", // honeypot: всегда пустое у человека
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setError("Этот слот только что заняли. Выберите другое время — календарь уже обновлён.");
          if (date) {
            const r = await fetch(`/api/availability?date=${date}`);
            const d = await r.json().catch(() => ({}));
            setSlots(d.slots ?? []);
          }
          return;
        }
        return setError(data.error ?? "Не получилось создать запись, попробуйте ещё раз");
      }
      setDone(data);
    } catch {
      setError("Нет соединения. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${done.slotStart.replace(/[-:]/g, "").split(".")[0]}Z\r\nSUMMARY:GearFlow Auto Service — запись\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    return (
      <div className="card p-6 text-center grid gap-3">
        <div className="text-4xl">✅</div>
        <h2 className="text-2xl font-extrabold">Запись подтверждена!</h2>
        <p>Ждём вас {new Date(done.slotStart).toLocaleString("ru-RU")}. Подтверждение уже отправлено в {channel}.</p>
        <a className="btn-secondary" href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download="gearflow-booking.ics">
          Добавить в календарь (.ics)
        </a>
        <a className="btn-ghost" href={`/booking/${done.id}/manage?token=${done.manageToken}`}>
          Управлять записью (перенос/отмена)
        </a>
      </div>
    );
  }

  return (
    <div className="card p-5 md:p-8">
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex-1 h-2 rounded-full" style={{ background: n <= step ? "var(--gf-accent)" : "#eee5d8" }} />
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-extrabold">Что беспокоит?</h2>
          <div className="grid gap-2">
            <label className="font-semibold">Услуга (необязательно)</label>
            <select className="input" value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)}>
              <option value="">Не знаю / просто опишу проблему</option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} — от {s.priceMin.toLocaleString("ru-RU")} ₸
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="font-semibold">Опишите проблему одной строкой</label>
            <textarea className="input" rows={3} placeholder="Например: стук спереди на кочках, Kia Rio 2019" value={problemText} onChange={(e) => setProblemText(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => go(2)}>Далее →</button>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-extrabold">Ваш автомобиль</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="font-semibold">Марка *</label>
              <input className="input" list="makes" placeholder="Toyota" value={make} onChange={(e) => setMake(e.target.value)} />
              <datalist id="makes">{makes.map((m) => <option key={m} value={m} />)}</datalist>
            </div>
            <div className="grid gap-1">
              <label className="font-semibold">Модель *</label>
              <input className="input" placeholder="Camry" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="font-semibold">Год</label>
              <input className="input" inputMode="numeric" placeholder="2019" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="font-semibold">VIN (необязательно)</label>
              <input className="input" placeholder="XTA…" value={vin} onChange={(e) => setVin(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => go(1)}>← Назад</button>
            <button className="btn-primary flex-1" disabled={!make || !model} onClick={() => go(3)}>Далее →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-extrabold">Дата и время</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => { setDate(d); setSlotStart(""); }}
                className={`shrink-0 px-4 py-3 rounded-xl border-2 font-bold ${date === d ? "border-[#e8590c] bg-[#fff4ec]" : "border-[#eee5d8]"}`}
              >
                {d.slice(8, 10)}.{d.slice(5, 7)}
              </button>
            ))}
          </div>
          {date && slots.length === 0 && (
            <div className="card p-4 bg-[#fff8e6]">
              На этот день всё занято. Попробуйте соседний день — или <button className="underline font-bold" onClick={() => alert("Вы в листе ожидания! Администратор свяжется с вами.")}>встаньте в лист ожидания</button>.
            </div>
          )}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSlotStart(s)}
                className={`py-3 rounded-xl border-2 font-bold min-h-[44px] ${slotStart === s ? "border-[#e8590c] bg-[#fff4ec]" : "border-[#eee5d8]"}`}
              >
                {new Date(s).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => go(2)}>← Назад</button>
            <button className="btn-primary flex-1" disabled={!slotStart} onClick={() => go(4)}>Далее →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-extrabold">Контакт для подтверждения</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input className="input" placeholder="Ваше имя *" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="+7 700 123-45-67 *" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <label className="font-semibold">Куда слать подтверждение и напоминания?</label>
            <div className="flex gap-2">
              {(["telegram", "whatsapp", "sms"] as const).map((c) => (
                <button key={c} onClick={() => setChannel(c)} className={`flex-1 py-3 rounded-xl border-2 font-bold capitalize ${channel === c ? "border-[#e8590c] bg-[#fff4ec]" : "border-[#eee5d8]"}`}>
                  {c === "telegram" ? "Telegram" : c === "whatsapp" ? "WhatsApp" : "SMS"}
                </button>
              ))}
            </div>
          </div>
          <label className="text-sm flex gap-2 items-start">
            <input type="checkbox" id="agree" className="mt-1" /> <span>Согласен на обработку персональных данных для организации записи</span>
          </label>
          <p className="text-sm opacity-70">Что дальше: пришлём подтверждение в мессенджер со ссылкой на перенос/отмену и напомним за 24 и за 2 часа до визита.</p>
          {error && <div className="field-error font-semibold">{error}</div>}
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => go(3)}>← Назад</button>
            <button
              className="btn-primary flex-1"
              disabled={loading}
              onClick={() => {
                const agree = (document.getElementById("agree") as HTMLInputElement)?.checked;
                if (!agree) return setError("Нужно согласие на обработку данных");
                submit();
              }}
            >
              {loading ? "Записываем…" : "Подтвердить запись"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
