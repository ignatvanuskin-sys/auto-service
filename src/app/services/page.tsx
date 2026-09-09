import Link from "next/link";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services-data";
import { Analytics } from "@/components/Analytics";

/** Цель: выбор услуги → переход на страницу услуги или сразу в запись. CTA: «Записаться». */
export const metadata = {
  title: "Услуги автосервиса — цены-вилки и гарантия | GearFlow",
  description: "ТО, диагностика, двигатель, ходовая, тормоза, шиномонтаж, кузовной, электрика, кондиционер, детейлинг. Цены заранее, гарантия до 12 месяцев.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <Analytics page="/services" />
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <h1 className="text-3xl font-extrabold">Услуги автосервиса</h1>
        <p className="opacity-75 mt-2">Цена-вилка заранее. Точная цена — после диагностики и только с вашего согласия.</p>
        {SERVICE_CATEGORIES.map((cat) => {
          const items = SERVICES.filter((s) => s.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat} className="mt-8">
              <h2 className="text-xl font-extrabold mb-3">{cat}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {items.map((s) => (
                  <div key={s.slug} className="card p-5 grid gap-2">
                    <Link href={`/services/${s.slug}`} className="font-extrabold text-lg hover:underline">{s.name}</Link>
                    <p className="text-sm opacity-75">{s.shortDesc}</p>
                    <div className="font-extrabold">от {s.priceMin.toLocaleString("ru-RU")} до {s.priceMax.toLocaleString("ru-RU")} ₸ · ~{s.durationMin >= 60 ? `${Math.round(s.durationMin / 60)} ч` : `${s.durationMin} мин`}</div>
                    <span className="badge-warranty w-fit">{s.warrantyText}</span>
                    <div className="flex gap-2 mt-1">
                      <Link href={`/booking?service=${s.slug}`} className="btn-primary !py-2 !px-4 text-sm">Записаться</Link>
                      <Link href={`/services/${s.slug}`} className="btn-ghost text-sm">Подробнее →</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
