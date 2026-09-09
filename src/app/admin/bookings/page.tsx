"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type B = { id: string; slotStart: string; status: string; customer: { name?: string; phone: string }; service?: { name: string } };
export default function AdminBookings() {
  const [list, setList] = useState<B[]>([]);
  const [note, setNote] = useState("");
  useEffect(() => { fetch("/api/admin/bookings").then((r) => r.json()).then((d) => { setList(d.items ?? []); setNote(d.note ?? ""); }).catch(() => {}); }, []);
  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.status === 403) return alert("Нет доступа: мастер меняет только свои записи и только статусы работ.");
    setList((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 grid gap-3 pb-10">
      <Link href="/admin" className="underline text-sm">← Дашборд</Link>
      <h1 className="text-2xl font-extrabold">Записи</h1>
      {note && <p className="text-sm text-red-700 font-bold">{note}</p>}
      {list.map((b) => (
        <div key={b.id} className="card p-4 flex flex-wrap items-center gap-3 text-sm">
          <b>{new Date(b.slotStart).toLocaleString("ru-RU")}</b>
          <span>{b.service?.name ?? "—"}</span>
          <span>{b.customer?.name} · {b.customer?.phone}</span>
          <span className="badge-warranty">{b.status}</span>
          <span className="flex gap-1 ml-auto">
            {(["confirmed", "in_progress", "done", "cancelled", "no_show"] as const).map((st) => (
              <button key={st} onClick={() => setStatus(b.id, st)} className="underline text-[13px]">{st}</button>
            ))}
          </span>
        </div>
      ))}
      {list.length === 0 && <p className="opacity-60 text-sm">Нет записей (или БД не подключена — см. README «Запуск»).</p>}
    </div>
  );
}
