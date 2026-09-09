"use client";
import { useState } from "react";

/** Цель /account: повторные визиты. Вход — по одноразовому коду (OTP), без пароля. */
export default function AccountPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [data, setData] = useState<{ name?: string; vehicles: { make: string; model: string; year?: number | null; nextServiceDueAt?: string | null }[]; bookings: { slotStart: string; status: string }[] } | null>(null);
  const [msg, setMsg] = useState("");

  async function requestCode() {
    setMsg("");
    const res = await fetch("/api/account/request-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(d.error ?? "Не получилось отправить код");
    setStep("code");
  }

  async function verify() {
    setMsg("");
    const res = await fetch("/api/account/verify-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(d.error ?? "Неверный код");
    await load();
  }

  async function load() {
    const res = await fetch("/api/account");
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStep("phone");
      return setMsg(d.error ?? "Войдите заново");
    }
    setData(d);
    setStep("done");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">Личный кабинет</h1>
      <p className="opacity-75 text-sm">Аккаунт создаётся автоматически при первой записи. Вход — по одноразовому коду, без пароля.</p>

      {step === "phone" && (
        <div className="card p-5 flex gap-2">
          <input className="input" placeholder="+7 700 123-45-67" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="btn-primary whitespace-nowrap" onClick={requestCode}>Получить код</button>
        </div>
      )}
      {step === "code" && (
        <div className="card p-5 grid gap-3">
          <p className="text-sm">Отправили 6-значный код на {phone}. Действует 5 минут.</p>
          <div className="flex gap-2">
            <input className="input" placeholder="123456" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn-primary whitespace-nowrap" onClick={verify}>Войти</button>
          </div>
          <button className="btn-ghost text-sm w-fit" onClick={() => setStep("phone")}>← другой номер</button>
        </div>
      )}
      {msg && <div className="field-error font-bold">{msg}</div>}
      {step === "done" && data && (
        <>
          <div className="card p-5 grid gap-2">
            <div className="font-extrabold">Мои автомобили{data.name ? ` — ${data.name}` : ""}</div>
            {data.vehicles.length === 0 ? <p className="text-sm opacity-60">Пока нет сохранённых авто</p> : data.vehicles.map((v, i) => <div key={i} className="text-sm"><b>{v.make} {v.model}</b> {v.year ?? ""}{v.nextServiceDueAt ? ` · следующее ТО: ${new Date(v.nextServiceDueAt).toLocaleDateString("ru-RU")}` : ""}</div>)}
          </div>
          <div className="card p-5 grid gap-2">
            <div className="font-extrabold">Записи</div>
            {data.bookings.length === 0 ? <p className="text-sm opacity-60">Нет записей</p> : data.bookings.map((b, i) => <div key={i} className="text-sm">{new Date(b.slotStart).toLocaleString("ru-RU")} · {b.status}</div>)}
          </div>
        </>
      )}
    </div>
  );
}
