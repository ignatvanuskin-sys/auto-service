import Link from "next/link";
export const metadata = { title: "Кейсы и работы — до/после, сложные ремонты | GearFlow", description: "Реальные кейсы: капитальный ремонт, восстановление после ДТП, удаление стука подвески.", alternates: { canonical: "/cases" } };
const CASES = [
  { t: "Camry 2018: стук спереди → рычаги + стойки за 1 день", d: "Диагностика нашла люфт шаровых и потёкшие стойки. Замена, развал-схождение 3D. Итог 86 000 ₸, гарантия 12 месяцев.", tag: "Ходовая · 86 000 ₸" },
  { t: "Tucson: жор масла 1л/1000 → раскоксовка не помогла, капремонт", d: "Эндоскопия показала задиры. Капитальный ремонт с расточкой, фотоотчёт каждого этапа. Итог 640 000 ₸, гарантия 12 мес / 30 000 км.", tag: "Двигатель · 640 000 ₸" },
  { t: "Rio: не заводится во дворе → стартер в тот же вечер", d: "Эвакуатор + диагностика: втягивающее реле. Замена стартера под ключ 38 000 ₸ за 3 часа.", tag: "Электрика · 38 000 ₸" },
];
export default function Cases() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">Кейсы и выполненные работы</h1>
      {CASES.map((c) => (
        <div key={c.t} className="card p-5 grid gap-1"><div className="font-extrabold">{c.t}</div><p className="text-sm opacity-75">{c.d}</p><span className="badge-warranty w-fit">{c.tag}</span></div>
      ))}
      <Link href="/booking" className="btn-primary w-fit">Обсудить мою проблему</Link>
    </div>
  );
}
