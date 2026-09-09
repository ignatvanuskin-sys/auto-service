import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES } from "@/lib/services-data";
import { Analytics } from "@/components/Analytics";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: `${s.name} — цена, гарантия, запись онлайн | GearFlow`,
    description: `${s.shortDesc} Цена от ${s.priceMin.toLocaleString("ru-RU")} до ${s.priceMax.toLocaleString("ru-RU")} ₸. ${s.warrantyText}.`,
    alternates: { canonical: `/services/${s.slug}` },
  };
}

/** Цель страницы услуги: снять страх цены/сроков → CTA «Записаться». H1 — название услуги. */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return notFound();
  const related = SERVICES.filter((x) => x.category === s.category && x.slug !== s.slug).slice(0, 2);
  return (
    <>
      <Analytics page={`/services/${slug}`} name="service_view" />
      <div className="mx-auto max-w-4xl px-4 pt-10 grid gap-5">
        <div className="text-sm opacity-60"><Link href="/services" className="underline">Услуги</Link> / {s.category}</div>
        <h1 className="text-3xl font-extrabold">{s.name}</h1>
        <div className="flex flex-wrap gap-2">
          <span className="card px-3 py-1.5 font-bold">от {s.priceMin.toLocaleString("ru-RU")} до {s.priceMax.toLocaleString("ru-RU")} ₸</span>
          <span className="card px-3 py-1.5">~{s.durationMin} мин</span>
          <span className="badge-warranty">{s.warrantyText}</span>
        </div>
        <p>{s.description}</p>
        <div className="card p-5 grid gap-2">
          <div className="font-extrabold">Как мы работаем</div>
          <ol className="text-sm grid gap-1 list-decimal pl-5">
            <li>Диагностика и письменная смета до начала работ</li>
            <li>Допработы — только после вашего подтверждения в мессенджере</li>
            <li>Фотоотчёт этапов, старые запчасти отдаём вам</li>
            <li>Оплата после приёмки, гарантийный талон в заказ-наряде</li>
          </ol>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/booking?service=${s.slug}`} data-track="cta_click" data-label="service" className="btn-primary text-lg">Записаться онлайн</Link>
          <Link href="/prices" className="btn-secondary">Калькулятор цены</Link>
        </div>
        {related.length > 0 && (
          <div className="mt-4">
            <h2 className="font-extrabold mb-2">Часто заказывают вместе</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/services/${r.slug}`} className="card p-4 hover:shadow-lg">
                  <div className="font-bold">{r.name}</div>
                  <div className="text-sm opacity-70">от {r.priceMin.toLocaleString("ru-RU")} ₸</div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name: s.name, description: s.shortDesc, offers: { "@type": "Offer", priceCurrency: "KZT", price: s.priceMin } }) }} />
      </div>
    </>
  );
}
