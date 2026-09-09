import Link from "next/link";
import { SERVICES } from "@/lib/services-data";
import { site } from "@/lib/site";
import { TrustRow } from "@/components/Chrome";
import { Analytics } from "@/components/Analytics";

/**
 * Цель страницы: конверсия в запись/звонок.
 * Основное целевое действие: «Записаться онлайн».
 * SEO: title/description/H1 под интент «автосервис + запись онлайн + гарантия».
 */
export const metadata = {
  title: "GearFlow Auto Service — диагностика и ремонт, запись на сегодня без звонков",
  description: "ТО, диагностика, ходовая, тормоза за 1 день. Цены-вилки заранее, гарантия до 12 месяцев, онлайн-запись за 60 секунд.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Analytics page="/" />
      <section className="mx-auto max-w-6xl px-4 pt-10 md:pt-16 grid md:grid-cols-2 gap-8 items-center">
        <div className="grid gap-4">
          <div className="inline-flex items-center gap-2 text-[13px] font-bold bg-[#e7f5e9] text-[#1e6f2e] rounded-full px-3 py-1.5 w-fit">
            ● Сегодня есть свободные слоты — запись на сегодня/завтра
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Диагностика и ремонт — запись на сегодня, без звонков
          </h1>
          <p className="text-lg opacity-80">
            Прозрачная цена-вилка заранее, гарантия до 12 месяцев, фотоотчёт каждого этапа. Онлайн-запись за 60 секунд.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/booking" data-track="cta_click" data-label="hero" className="btn-primary text-lg">Записаться онлайн</Link>
            <a href={site.phoneHref} data-track="phone_click" data-label="hero" className="btn-secondary text-lg">📞 Позвонить</a>
          </div>
          <TrustRow />
        </div>
        <div className="card p-6 grid gap-3">
          <div className="font-extrabold text-lg">Ближайшие свободные слоты</div>
          <div className="grid grid-cols-3 gap-2 text-center font-bold">
            {["10:00", "12:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
              <Link key={t} href={`/booking?step=3`} className="border-2 border-[#eee5d8] rounded-xl py-3 hover:border-[#e8590c]">
                Сегодня {t}
              </Link>
            ))}
          </div>
          <p className="text-sm opacity-70">Живой календарь — на шаге 3 записи видно только реально свободное время.</p>
          <Link href="/booking" className="btn-primary">Выбрать время →</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-extrabold">Услуги и цены-вилки</h2>
          <Link href="/prices" className="font-bold underline">Весь прайс →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {SERVICES.slice(0, 6).map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="card p-5 grid gap-2 hover:shadow-lg">
              <div className="text-[13px] font-bold opacity-60">{s.category}</div>
              <div className="font-extrabold">{s.name}</div>
              <div className="text-sm opacity-75">{s.shortDesc}</div>
              <div className="font-extrabold">от {s.priceMin.toLocaleString("ru-RU")} до {s.priceMax.toLocaleString("ru-RU")} ₸</div>
              <span className="badge-warranty w-fit">{s.warrantyText}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/booking" className="btn-primary">Записаться онлайн — 60 секунд</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14 grid md:grid-cols-3 gap-4">
        <div className="card p-5"><div className="font-extrabold mb-1">Фиксируем цену до начала работ</div><p className="text-sm opacity-75">Смета письменно. Работы сверх согласованного — только с вашего подтверждения. Никаких «вскрыли — там ещё на 200 тысяч».</p></div>
        <div className="card p-5"><div className="font-extrabold mb-1">Гарантия до 12 месяцев</div><p className="text-sm opacity-75">На работы и установленные запчасти. Гарантийный талон — в заказ-наряде.</p></div>
        <div className="card p-5"><div className="font-extrabold mb-1">Напоминаем о ТО сами</div><p className="text-sm opacity-75">Придёт сообщение в Telegram/WhatsApp за 24 и за 2 часа до визита, а потом — о следующем регламентном ТО.</p></div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14">
        <h2 className="text-2xl font-extrabold mb-4">Отзывы с деталями</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Меняли рычаги и стойки на Camry 2018. Смета 86 000 ₸ — в неё и уложились за 1 день. Стук ушёл.", m: "Toyota Camry · ходовая · 86 000 ₸" },
            { t: "Делали ТО-60 с заменой масла АКПП на Tucson. Показали старое масло, отдали канистру остатка. Пригнали за 3 часа.", m: "Hyundai Tucson · ТО · 54 000 ₸" },
            { t: "Перестала заводиться во дворе — эвакуатор и диагностика в тот же вечер. Оказался стартер, 38 000 ₸ под ключ.", m: "Kia Rio · электрика · 38 000 ₸" },
          ].map((r, i) => (
            <div key={i} className="card p-5 grid gap-2">
              <div>★★★★★</div>
              <p className="text-sm">{r.t}</p>
              <div className="text-[13px] font-bold opacity-60">{r.m}</div>
            </div>
          ))}
        </div>
        <div className="mt-4"><Link href="/reviews" className="font-bold underline">Все отзывы →</Link></div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14 card p-6 grid md:grid-cols-2 gap-4 items-center">
        <div>
          <h2 className="text-2xl font-extrabold">Не знаете, что сломалось? Начните с диагностики за 5 000 ₸</h2>
          <p className="opacity-75 mt-2">Подъёмник + сканер + письменный отчёт. При ремонте у нас — диагностика бесплатно.</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link href="/booking?service=diagnostika-hodovoy" className="btn-primary">Записаться на диагностику</Link>
          <Link href="/prices" className="btn-secondary">Узнать точную цену</Link>
        </div>
      </section>
    </>
  );
}
