"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SERVICES } from "@/lib/services-data";

/** Цель /prices: снять возражение «сколько стоит» → CTA «Записаться / Узнать точную цену». */
export default function PricesPage() {
  const [selected, setSelected] = useState<string[]>(["to-10k"]);
  const total = useMemo(() => {
    const items = SERVICES.filter((s) => selected.includes(s.slug));
    return {
      min: items.reduce((a, s) => a + s.priceMin, 0),
      max: items.reduce((a, s) => a + s.priceMax, 0),
      items,
    };
  }, [selected]);

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 grid gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">Прайс-лист и калькулятор стоимости</h1>
        <p className="opacity-75 mt-2">Вилки честные, без «звоните — узнавайте». Точная цена фиксируется после диагностики.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="font-extrabold mb-3">Калькулятор: выберите услуги</div>
          <div className="grid gap-2 max-h-[420px] overflow-y-auto">
            {SERVICES.map((s) => (
              <label key={s.slug} className="flex items-start gap-2 text-sm border-b border-[#f0e8da] pb-2">
                <input type="checkbox" className="mt-1" checked={selected.includes(s.slug)} onChange={() => toggle(s.slug)} />
                <span><b>{s.name}</b><br /><span className="opacity-70">от {s.priceMin.toLocaleString("ru-RU")} до {s.priceMax.toLocaleString("ru-RU")} ₸</span></span>
              </label>
            ))}
          </div>
        </div>
        <div className="card p-5 h-fit md:sticky md:top-20">
          <div className="font-extrabold">Ваш ориентир</div>
          <div className="text-3xl font-extrabold mt-2">
            {total.min.toLocaleString("ru-RU")} – {total.max.toLocaleString("ru-RU")} ₸
          </div>
          <p className="text-sm opacity-70 mt-1">Выбрано услуг: {total.items.length}. Точную смету назовём после диагностики — и зафиксируем письменно.</p>
          <Link href="/booking" className="btn-primary w-full mt-4">Записаться с этим набором →</Link>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left bg-[#faf7f2]"><th className="p-3">Услуга</th><th className="p-3">Цена</th><th className="p-3 hidden md:table-cell">Срок</th><th className="p-3"></th></tr></thead>
          <tbody>
            {SERVICES.map((s) => (
              <tr key={s.slug} className="border-t border-[#f0e8da]">
                <td className="p-3 font-bold">{s.name}<div className="font-normal opacity-60">{s.category}</div></td>
                <td className="p-3 whitespace-nowrap">от {s.priceMin.toLocaleString("ru-RU")} ₸</td>
                <td className="p-3 hidden md:table-cell">~{s.durationMin} мин</td>
                <td className="p-3"><Link href={`/booking?service=${s.slug}`} className="underline font-bold">Записаться</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
