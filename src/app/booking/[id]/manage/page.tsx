"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function ManageBookingPage() {
  const params = useParams<{ id: string }>();
  void params.id; // запись ищется по токену из ссылки, id — часть URL
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const [data, setData] = useState<{ slotStart: string; status: string; serviceName?: string } | null>(null);
  const [msg, setMsg] = useState("");
  const [newSlot, setNewSlot] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/bookings/${token}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setMsg("Не удалось загрузить запись"));
  }, [token]);

  async function act(action: "cancel" | "reschedule") {
    setMsg("");
    const res = await fetch(`/api/bookings/${token}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(action === "cancel" ? { status: "cancelled" } : { slotStart: newSlot }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error ?? "Ошибка");
    setMsg(action === "cancel" ? "Запись отменена. Слот освобождён." : "Запись перенесена!");
    setData(d);
  }

  if (!token) return <div className="mx-auto max-w-xl px-4 pt-10">Нужна ссылка из SMS/мессенджера с токеном доступа.</div>;

  return (
    <div className="mx-auto max-w-xl px-4 pt-10 grid gap-4">
      <h1 className="text-2xl font-extrabold">Управление записью</h1>
      {data ? (
        <div className="card p-5 grid gap-2">
          <div><b>Услуга:</b> {data.serviceName ?? "—"}</div>
          <div><b>Время:</b> {new Date(data.slotStart).toLocaleString("ru-RU")}</div>
          <div><b>Статус:</b> {data.status}</div>
        </div>
      ) : <div className="card p-5">Загрузка…</div>}
      <div className="card p-5 grid gap-3">
        <div className="font-bold">Перенести</div>
        <input type="datetime-local" className="input" value={newSlot} onChange={(e) => setNewSlot(e.target.value)} />
        <button className="btn-secondary" disabled={!newSlot} onClick={() => act("reschedule")}>Перенести на новое время</button>
        <button className="btn-ghost text-red-700 font-bold" onClick={() => act("cancel")}>Отменить запись</button>
        {msg && <div className="font-bold">{msg}</div>}
      </div>
    </div>
  );
}
