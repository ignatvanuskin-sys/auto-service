"use client";

import { FormEvent, useState } from "react";

const services = ["Диагностика", "Ходовая часть", "Двигатель и АКПП", "Шиномонтаж", "Кузовной ремонт", "ТО", "Другое"];

export function RequestForm() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [displayId, setDisplayId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.agree = form.get("agree") === "on" ? "true" : "false";
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Проверьте форму");
      setDisplayId(result.displayId || result.id);
      setState("success");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось отправить заявку");
      setState("error");
    }
  }

  if (state === "success") return <div className="request-success" role="status"><div className="success-mark">✓</div><div className="eyebrow">Заявка принята</div><h3>Номер заявки #{displayId}</h3><p>Мы свяжемся с вами в течение 15 минут в выбранный интервал. Если удобнее — позвоните нам напрямую.</p><a className="btn-primary" href="tel:+77273102020">Позвонить в сервис</a><button className="btn-ghost" onClick={() => setState("idle")}>Отправить ещё одну заявку</button></div>;

  return (
    <form onSubmit={submit} className="request-form" noValidate>
      <div className="form-grid">
        <label>Имя<input name="name" className="input" placeholder="Как к вам обращаться" required /></label>
        <label>Телефон<input name="phone" className="input" placeholder="+7 700 123 45 67" inputMode="tel" required /></label>
        <label>Автомобиль<input name="vehicle" className="input" placeholder="Toyota Camry, 2019" required /></label>
        <label>Что нужно сделать<select name="serviceType" className="input" defaultValue="Диагностика">{services.map((service) => <option key={service}>{service}</option>)}</select></label>
        <label>Когда удобно позвонить<select name="preferredTime" className="input" defaultValue="День"><option>Утро</option><option>День</option><option>Вечер</option></select></label>
        <label className="wide">Что случилось?<textarea name="comment" className="input min-h-28" placeholder="Например: появился стук при повороте налево" /></label>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
      <label className="consent"><input type="checkbox" name="agree" required /> <span>Соглашаюсь на обработку персональных данных и принимаю <a href="/privacy">политику конфиденциальности</a>.</span></label>
      {state === "error" && <p className="form-error" role="alert">{message}</p>}
      <button className="btn-primary form-submit" disabled={state === "sending"}>{state === "sending" ? "Передаём мастеру…" : "Отправить заявку"}</button>
      <p className="form-note">Ответим в рабочее время: Пн–Сб, 9:00–20:00. Заявка сохраняется в системе сервиса.</p>
    </form>
  );
}
