"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Item = Record<string, unknown>;

const META: Record<string, { title: string; endpoint: string; desc: string }> = {
  leads: { title: "Заявки и лиды", endpoint: "/api/admin/leads", desc: "AI-лиды со срочностью. Статус qualified/converted — после проверки человеком. AI запись не подтверждает." },
  customers: { title: "Клиенты и автомобили", endpoint: "/api/admin/customers", desc: "Карточки: контакты, авто, число визитов. Статусы new/active/dormant." },
  services: { title: "Услуги и цены", endpoint: "/api/admin/services", desc: "Цены-вилки и длительность слотов. Удаление услуги с записями запрещено (только owner)." },
  reviews: { title: "Отзывы — модерация", endpoint: "/api/admin/reviews", desc: "Публикация вручную: published=false по умолчанию." },
  notifications: { title: "Уведомления", endpoint: "/api/admin/notifications", desc: "Журнал отправок и ручной resend. Все отправки идемпотентны." },
};

function str(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v.length > 120 ? v.slice(0, 120) + "…" : v;
  if (typeof v === "object") return JSON.stringify(v).slice(0, 120);
  return String(v);
}

export default function AdminSectionPage() {
  const { section } = useParams<{ section: string }>();
  const meta = META[section];
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  async function load() {
    if (!meta) return;
    setLoading(true);
    try {
      const res = await fetch(meta.endpoint);
      if (res.status === 403) {
        setDenied(true);
        return;
      }
      const d = await res.json();
      setItems(d.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(meta.endpoint);
        if (cancelled) return;
        if (res.status === 403) {
          setDenied(true);
          return;
        }
        const d = await res.json();
        if (!cancelled) setItems(d.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  async function act(url: string, body: unknown) {
    const isDelete = url.includes("?id=");
    await fetch(url, {
      method: isDelete ? "DELETE" : "PATCH",
      headers: { "content-type": "application/json" },
      body: isDelete ? undefined : JSON.stringify(body),
    });
    load();
  }

  async function resend(id: string) {
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-10">
        <Link href="/admin" className="underline text-sm">← Дашборд</Link>
        <h1 className="text-2xl font-extrabold mt-2">Раздел не найден</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 grid gap-3 pb-10">
      <Link href="/admin" className="underline text-sm">← Дашборд</Link>
      <h1 className="text-2xl font-extrabold">{meta.title}</h1>
      <p className="text-sm opacity-70">{meta.desc}</p>
      {denied && <div className="card p-4 font-bold text-red-700">Нет доступа для вашей роли. Мастер видит только свои записи.</div>}
      {loading ? (
        <div className="card p-4 text-sm opacity-60">Загрузка…</div>
      ) : (
        items.map((it, i) => {
          const id = String(it.id ?? i);
          return (
            <div key={id} className="card p-4 text-sm grid gap-1">
              {section === "leads" && (
                <>
                  <div><b>{str(it.rawMessage)}</b></div>
                  <div className="opacity-70">Источник: {str(it.source)} · {str(it.extractedMake)} {str(it.extractedModel)} · срочность: <b>{str(it.urgency)}</b> · статус: <b>{str(it.status)}</b></div>
                  <div className="flex gap-2 flex-wrap">
                    {(["qualified", "converted", "discarded"] as const).map((st) => (
                      <button key={st} className="underline font-bold" onClick={() => act("/api/admin/leads", { id, status: st })}>{st}</button>
                    ))}
                  </div>
                </>
              )}
              {section === "customers" && (
                <>
                  <div><b>{str(it.name)}</b> · {str(it.phone)} · {str(it.status)} · визитов: {str((it._count as Item)?.bookings)}</div>
                  <div className="opacity-70">Авто: {((it.vehicles as Item[]) ?? []).map((v) => `${str(v.make)} ${str(v.model)}`).join(", ") || "—"}</div>
                </>
              )}
              {section === "services" && (
                <>
                  <div><b>{str(it.name)}</b> · {str(it.category)}</div>
                  <div className="opacity-70">от {str(it.priceMin)} до {str(it.priceMax)} ₸ · {str(it.durationMin)} мин · {str(it.slug)}</div>
                </>
              )}
              {section === "reviews" && (
                <>
                  <div>{"★".repeat(Number(it.rating ?? 5))} — {str(it.text)}</div>
                  <div className="opacity-70">{str(it.vehicleInfo)} · {str(it.serviceName)} · {str((it.customer as Item)?.phone)} · {it.published ? "опубликован" : "на модерации"}</div>
                  <button className="underline font-bold w-fit" onClick={() => act("/api/admin/reviews", { id, published: !it.published })}>
                    {it.published ? "Скрыть" : "Опубликовать"}
                  </button>
                </>
              )}
              {section === "notifications" && (
                <>
                  <div><b>{str(it.type)}</b> · {str(it.channel)} · <b>{str(it.status)}</b> · {str(it.createdAt)}</div>
                  <div className="opacity-70">бронь: {str(it.bookingId)}</div>
                  <button className="underline font-bold w-fit" onClick={() => resend(id)}>Отправить повторно</button>
                </>
              )}
            </div>
          );
        })
      )}
      {!loading && !denied && items.length === 0 && <p className="opacity-60 text-sm">Пока пусто.</p>}
    </div>
  );
}
