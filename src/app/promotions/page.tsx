import Link from "next/link";
export const metadata = { title: "Акции автосервиса — сезонные предложения | GearFlow", description: "Диагностика бесплатно при ремонте, шиномонтаж по сезону, кондиционер перед летом.", alternates: { canonical: "/promotions" } };
export default function Promotions() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">Акции</h1>
      {[["Диагностика — бесплатно при ремонте", "Запишитесь на диагностику за 5 000–9 000 ₸: при ремонте у нас вычтем её из счёта."], ["Кондиционер перед летом", "Диагностика + заправка с красителем — 15 000 ₸ вместо 20 000 ₸ до конца июня."], ["Шиномонтаж без очередей", "Слоты каждые 40 минут, хранение комплекта — от 5 000 ₸/сезон."]].map(([t, d]) => (
        <div key={t} className="card p-5"><div className="font-extrabold">{t}</div><p className="text-sm opacity-75">{d}</p><Link href="/booking" className="btn-primary !py-2 !px-4 text-sm mt-2 inline-flex">Записаться</Link></div>
      ))}
    </div>
  );
}
