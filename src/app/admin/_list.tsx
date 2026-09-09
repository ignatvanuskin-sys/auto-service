"use client";
import { useEffect, useState } from "react";

export function GenericAdminList({ endpoint, title }: { endpoint: string; title: string }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : d.items ?? []))
      .catch(() => {});
  }, [endpoint]);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 grid gap-3">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      {items.map((it, i) => (
        <pre key={i} className="card p-3 text-[12px] overflow-x-auto">
          {JSON.stringify(it, null, 2)}
        </pre>
      ))}
      {items.length === 0 && <p className="opacity-60 text-sm">Пусто (или БД не подключена).</p>}
    </div>
  );
}
