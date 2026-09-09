import Link from "next/link";
export const metadata = { title: "Мастера GearFlow — опыт, специализация | GearFlow", description: "Мастера с опытом от 5 лет: двигатели, ходовая, электрика, кузовной ремонт.", alternates: { canonical: "/team" } };
const TEAM = [
  { n: "Асхат К.", s: "Моторист · 11 лет", d: "ГРМ, капитальный ремонт, диагностика. Toyota, Lexus, Hyundai." },
  { n: "Дмитрий С.", s: "Ходовая и тормоза · 9 лет", d: "Подвеска, развал-схождение 3D, тормозные системы." },
  { n: "Ерлан М.", s: "Автоэлектрик · 8 лет", d: "Стартеры, генераторы, утечки тока, сигнализации." },
  { n: "Игорь В.", s: "Кузовной и покраска · 12 лет", d: "Рихтовка, локальная покраска, полировка, керамика." },
  { n: "Мадина А.", s: "Администратор · 5 лет", d: "Запись, смета, статусы ремонта, напоминания о ТО." },
];
export default function Team() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">Команда мастеров</h1>
      <p className="opacity-75">Живые люди, а не «команда профессионалов» со стока. У каждого — специализация и допуски.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {TEAM.map((t) => (
          <div key={t.n} className="card p-5"><div className="font-extrabold text-lg">{t.n}</div><div className="text-sm font-bold" style={{ color: "var(--gf-accent)" }}>{t.s}</div><p className="text-sm opacity-75 mt-1">{t.d}</p></div>
        ))}
      </div>
      <Link href="/booking" className="btn-primary w-fit">Записаться к мастеру</Link>
    </div>
  );
}
