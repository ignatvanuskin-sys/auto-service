import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/lib/services-data";
import { site } from "@/lib/site";
import { Analytics } from "@/components/Analytics";
import { TrustRow } from "@/components/Chrome";

export const metadata = {
  title: "Монстр Трек — автосервис в Алматы",
  description: "Диагностика, обслуживание и ремонт автомобилей в Алматы. Понятная смета, согласование работ и гарантия на результат.",
  alternates: { canonical: "/" },
};

const featuredServices = SERVICES.slice(0, 6);

export default function Home() {
  return (
    <>
      <Analytics page="/" />

      <section className="hero-grid relative overflow-hidden">
        <Image src="/brand/monster-truck-hero.jpg" alt="Красный monster truck в сервисном боксе" fill priority className="object-cover object-center opacity-50" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#08090bf5_0%,#08090be8_34%,#08090b7a_70%,#08090bd9_100%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
          <div className="max-w-3xl hero-reveal">
            <div className="eyebrow">Монстр Трек · Алматы · мультибрендовый сервис</div>
            <h1 className="display-title text-5xl md:text-8xl font-black mt-5 max-w-4xl">Автомобиль должен<br /><span className="text-[#d42b43]">работать на вас.</span></h1>
            <p className="text-lg md:text-xl text-[#c7c1bb] max-w-2xl mt-7">Диагностируем по фактам, ремонтируем по согласованию, выдаём автомобиль с понятным результатом.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/booking" data-track="cta_click" data-label="hero" className="btn-primary text-base md:text-lg">Записаться на сервис <span>↗</span></Link>
              <Link href="/services" className="btn-secondary text-base md:text-lg">Посмотреть услуги</Link>
            </div>
            <div className="mt-9 max-w-2xl"><TrustRow /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 -mt-8 relative z-10">
        <div className="grid sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          <div className="bg-[#15161a] p-6"><div className="eyebrow">01 · Диагностика</div><div className="font-black text-xl mt-2">Сначала находим причину</div><p className="text-sm text-[#aaa19a] mt-2">Подъёмник, сканер и проверка узлов — до обсуждения ремонта.</p></div>
          <div className="bg-[#15161a] p-6"><div className="eyebrow">02 · Согласование</div><div className="font-black text-xl mt-2">Смета до начала работ</div><p className="text-sm text-[#aaa19a] mt-2">Дополнительные работы только после вашего подтверждения.</p></div>
          <div className="bg-[#15161a] p-6"><div className="eyebrow">03 · Результат</div><div className="font-black text-xl mt-2">Проверяем перед выдачей</div><p className="text-sm text-[#aaa19a] mt-2">Финальный контроль, тест-драйв и гарантия в заказ-наряде.</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24 md:pt-32">
        <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-12 items-end">
          <div><div className="eyebrow">Что мы делаем</div><h2 className="text-4xl md:text-6xl font-black mt-3">От ежедневного ТО до сложного ремонта.</h2></div>
          <div className="flex items-end justify-between gap-5"><p className="text-[#aaa19a] max-w-lg">Один сервис для автомобиля на каждый день и для задач, где важна инженерная точность.</p><Link href="/prices" className="hidden sm:inline-flex btn-secondary shrink-0">Весь прайс →</Link></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-10">
          {featuredServices.map((service, index) => (
            <Link key={service.slug} href={`/services/${service.slug}`} className="card group p-6 md:p-7 grid grid-cols-[48px_1fr_auto] gap-5 items-start">
              <div className="text-[#c51f35] text-2xl font-black">{String(index + 1).padStart(2, "0")}</div>
              <div><div className="eyebrow">{service.category}</div><h3 className="font-black text-xl mt-2">{service.name}</h3><p className="text-sm text-[#aaa19a] mt-2 max-w-xl">{service.shortDesc}</p><div className="mt-5 font-black">от {service.priceMin.toLocaleString("ru-RU")} ₸ <span className="text-sm text-[#aaa19a] font-normal">· гарантия включена</span></div></div>
              <div className="text-xl text-[#777] group-hover:text-[#d42b43] group-hover:translate-x-1 transition-all">↗</div>
            </Link>
          ))}
        </div>
        <div className="mt-7"><Link href="/services" className="font-bold text-[#e87383]">Все направления сервиса →</Link></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24 md:pt-32">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
          <div className="card p-8 md:p-10 min-h-[360px] flex flex-col justify-between glow-frame"><div><div className="eyebrow">Почему Монстр Трек</div><h2 className="text-4xl md:text-5xl font-black mt-3">Никаких работ<br />«на глаз».</h2></div><p className="text-[#aaa19a] max-w-md">Мы объясняем, что нашли, показываем приоритеты и не превращаем обслуживание в лотерею.</p></div>
          <div className="grid gap-4">
            <div className="card p-7"><div className="text-4xl font-black text-[#d42b43]">до 12 мес.</div><div className="font-black text-xl mt-2">Гарантия на работы</div><p className="text-sm text-[#aaa19a] mt-2">Срок гарантии фиксируется в заказ-наряде для каждой услуги.</p></div>
            <div className="card p-7"><div className="text-4xl font-black text-[#d42b43]">100%</div><div className="font-black text-xl mt-2">Согласование допработ</div><p className="text-sm text-[#aaa19a] mt-2">Ничего сверх согласованной сметы без вашего решения.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24 md:pt-32">
        <div className="flex items-end justify-between gap-5"><div><div className="eyebrow">Как всё проходит</div><h2 className="text-4xl md:text-6xl font-black mt-3">Просто и по делу.</h2></div><Link href="/booking" className="hidden sm:inline-flex btn-primary">Выбрать визит →</Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[['01','Оставляете заявку','Выбираете услугу или приезжаете на диагностику.'],['02','Получаете план','Мастер объясняет причину и варианты решения.'],['03','Подтверждаете смету','Фиксируем стоимость и сроки до начала работ.'],['04','Забираете автомобиль','Проверяем результат и выдаём документы с гарантией.']].map(([number,title,text]) => <div key={number} className="card p-6 min-h-[210px] grid content-between"><div className="text-3xl font-black text-[#d42b43]">{number}</div><div><div className="font-black text-xl">{title}</div><p className="text-sm text-[#aaa19a] mt-2">{text}</p></div></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24 md:pt-32">
        <div className="card p-8 md:p-12 grid lg:grid-cols-[1fr_auto] gap-8 items-end bg-[linear-gradient(120deg,rgba(197,31,53,.18),rgba(255,255,255,.04)_45%,rgba(255,255,255,.02))]"><div><div className="eyebrow">Нужен совет?</div><h2 className="text-4xl md:text-5xl font-black mt-3">Начните с честной диагностики.</h2><p className="text-[#aaa19a] max-w-xl mt-4">Если не знаете, что именно сломалось, это нормально. Опишите симптомы — мастер поможет выбрать правильный формат визита.</p></div><div className="flex flex-wrap gap-3"><Link href="/booking?service=diagnostika-hodovoy" className="btn-primary">Записаться на диагностику</Link><a href={site.phoneHref} className="btn-secondary">Позвонить</a></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:py-32"><div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between gap-5"><div><div className="eyebrow">Монстр Трек</div><h2 className="text-3xl font-black mt-2">Сервис, куда хочется вернуться.</h2></div><div className="text-sm text-[#aaa19a] md:text-right"><p>{site.address}</p><p>{site.hours}</p><p className="mt-2 text-[#f4efe9] font-bold">{site.phone}</p><Link href="/reviews" className="inline-block mt-4 text-[#e87383]">Отзывы клиентов →</Link></div></div></section>
    </>
  );
}
