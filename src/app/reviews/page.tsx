"use client";
import { useState } from "react";
const REVIEWS = [
  { r: 5, t: "Меняли рычаги и стойки на Camry 2018. Смета 86 000 ₸ — в неё и уложились за 1 день.", m: "Toyota Camry · ходовая · 86 000 ₸ · 1 день" },
  { r: 5, t: "ТО-60 с заменой масла АКПП на Tucson. Показали старое масло, отдали остаток. 3 часа.", m: "Hyundai Tucson · ТО · 54 000 ₸" },
  { r: 4, t: "Делали кондиционер: заправка + замена трубки. Холодит отлично, но ждал запчасть 2 дня — предупредили заранее, ок.", m: "Skoda Octavia · кондиционер · 47 000 ₸" },
  { r: 5, t: "Химчистка + полировка фар. Салон как новый, фары светят заметно лучше. Отдали точно в срок.", m: "Kia Rio · детейлинг · 42 000 ₸" },
];
export default function ReviewsPage() {
  const [filter, setFilter] = useState("");
  const list = REVIEWS.filter((r) => !filter || r.m.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">Отзывы — с деталями, а не «всё супер»</h1>
      <input className="input max-w-sm" placeholder="Фильтр: марка или услуга (например, Camry, ТО)" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((r, i) => (
          <div key={i} className="card p-5 grid gap-1"><div>{"★".repeat(r.r)}{"☆".repeat(5 - r.r)}</div><p className="text-sm">{r.t}</p><div className="text-[13px] font-bold opacity-60">{r.m}</div></div>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "AggregateRating", ratingValue: "4.9", reviewCount: String(REVIEWS.length) }) }} />
    </div>
  );
}
