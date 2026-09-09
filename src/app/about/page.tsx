import Link from "next/link";
export const metadata = { title: "О компании GearFlow — 7+ лет, гарантия, цех | GearFlow", description: "Независимый автосервис: 2–6 постов, дилерское оборудование, мастера с опытом от 5 лет.", alternates: { canonical: "/about" } };
export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">О компании GearFlow Auto Service</h1>
      <p>Независимый мультибрендовый автосервис. Работаем 7+ лет, обслужили 12 000+ авто. Специализация — плановое ТО, диагностика, ремонт ходовой и двигателя, шиномонтаж, детейлинг.</p>
      <div className="grid md:grid-cols-4 gap-3">
        {[["7+", "лет на рынке"], ["12 000+", "обслуженных авто"], ["4.9", "рейтинг из 1 240 отзывов"], ["12 мес", "гарантия на работы"]].map(([n, l]) => (
          <div key={l} className="card p-4 text-center"><div className="text-2xl font-extrabold">{n}</div><div className="text-sm opacity-70">{l}</div></div>
        ))}
      </div>
      <div className="card p-5"><div className="font-extrabold mb-1">Гарантия и честность</div><p className="text-sm">Письменная смета до работ. Допработы — только с вашего подтверждения. Старые запчасти отдаём. Гарантия на работы — до 12 месяцев.</p></div>
      <Link href="/booking" className="btn-primary w-fit">Записаться онлайн</Link>
    </div>
  );
}
