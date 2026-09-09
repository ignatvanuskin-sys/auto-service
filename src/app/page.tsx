import Image from "next/image";
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
      <section className="hero-grid relative overflow-hidden">
        <Image src="/brand/monster-truck-hero.jpg" alt="Красный monster truck в премиальном сервисном боксе" fill priority className="object-cover object-center opacity-55" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0b0b0df2_0%,#0b0b0dcc_38%,#0b0b0d55_72%,#0b0b0d99_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-24 grid md:grid-cols-[1.08fr_.92fr] gap-12 items-center">
        <div className="grid gap-5 hero-reveal">
          <div className="eyebrow">Монстр Трек · Алматы · с 2018 года</div>
          <div className="inline-flex items-center gap-2 text-[13px] font-bold bg-[#78b8831c] text-[#9bd6a2] border border-[#78b88340] rounded-full px-3 py-1.5 w-fit">
            <span className="h-2 w-2 rounded-full bg-[#78b883] shadow-[0_0_12px_#78b883]" /> Онлайн-запись · без звонков
          </div>
          <h1 className="display-title text-5xl md:text-7xl font-black">
            Уверенность<br /><span className="text-[#c51f35]">за рулём.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#aaa19a] max-w-xl">
            Премиальный сервис для тех, кто ценит свой автомобиль и своё время. Диагностика, ремонт и обслуживание с прозрачной сметой до начала работ.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/booking" data-track="cta_click" data-label="hero" className="btn-primary text-lg">Записаться за 60 секунд <span>↗</span></Link>
            <a href={site.phoneHref} data-track="phone_click" data-label="hero" className="btn-secondary text-lg">Позвонить</a>
          </div>
          <TrustRow />
        </div>
        <div className="card p-7 grid gap-4 hero-reveal-delay">
          <div className="flex items-start justify-between gap-4"><div><div className="eyebrow">Онлайн-запись</div><div className="font-black text-2xl mt-1">Три шага до визита</div></div><div className="text-3xl">✦</div></div>
          <ol className="grid gap-2 text-[15px] font-medium">
            <li><b>1.</b> Опишите проблему или выберите услугу</li>
            <li><b>2.</b> Укажите авто — марка, модель, год</li>
            <li><b>3.</b> Выберите свободное окно в живом календаре</li>
          </ol>
          <p className="text-sm text-[#aaa19a]">Календарь показывает только реально свободное время. Подтверждение и напоминания — в мессенджер.</p>
          <Link href="/booking" className="btn-primary">Выбрать время →</Link>
        </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14">
        <div className="flex items-end justify-between mb-4">
          <div><div className="eyebrow">Экспертиза без компромиссов</div><h2 className="text-3xl md:text-4xl font-black mt-1">Сервис, которому доверяют</h2></div>
          <Link href="/prices" className="font-bold text-[#e87383]">Весь прайс →</Link>
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

      <section className="mx-auto max-w-6xl px-4 mt-20">
        <div className="grid md:grid-cols-[.72fr_1.28fr] gap-10 items-start">
          <div className="md:sticky md:top-28">
            <div className="eyebrow">Без сюрпризов</div>
            <h2 className="text-3xl md:text-4xl font-black mt-2">Вся работа — по понятному плану</h2>
            <p className="text-[#aaa19a] mt-4">Вы заранее знаете, что произойдёт с автомобилем, сколько займёт каждый этап и когда нужно ваше согласование.</p>
            <Link href="/booking" className="btn-primary mt-6">Записаться на сервис →</Link>
          </div>
          <div className="grid gap-3">
            {[
              ["01", "Заявка", "Выбираете услугу и удобное окно онлайн — без звонков и ожидания."],
              ["02", "Диагностика", "Мастер проверяет автомобиль и фиксирует фактическое состояние узлов."],
              ["03", "Согласование", "Получаете фото, смету и приоритеты. Никаких допработ без подтверждения."],
              ["04", "Ремонт", "Выполняем только согласованный объём на проверенных запчастях."],
              ["05", "Контроль", "Проводим финальную проверку, тест-драйв и выдаём заказ-наряд с гарантией."],
            ].map(([number, title, text]) => (
              <div key={number} className="card p-5 grid grid-cols-[56px_1fr] gap-4 items-start">
                <div className="text-[#c51f35] text-xl font-black">{number}</div>
                <div><div className="font-black text-lg">{title}</div><p className="text-sm text-[#aaa19a] mt-1">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14 grid md:grid-cols-3 gap-4">
        <div className="card p-6"><div className="eyebrow">01 · Прозрачность</div><div className="font-black text-xl mt-2">Цена до начала работ</div><p className="text-sm text-[#aaa19a] mt-2">Смета письменно. Работы сверх согласованного — только с вашего подтверждения.</p></div>
        <div className="card p-6"><div className="eyebrow">02 · Ответственность</div><div className="font-black text-xl mt-2">Гарантия до 12 месяцев</div><p className="text-sm text-[#aaa19a] mt-2">Гарантийный талон на работы и установленные запчасти — в заказ-наряде.</p></div>
        <div className="card p-6"><div className="eyebrow">03 · Забота</div><div className="font-black text-xl mt-2">Напоминаем о ТО</div><p className="text-sm text-[#aaa19a] mt-2">Сообщение в Telegram/WhatsApp за 24 и 2 часа до визита.</p></div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14">
        <div className="card p-6 md:p-8 grid md:grid-cols-2 gap-4 items-center">
          <div>
            <div className="eyebrow">Обратная связь</div>
            <h2 className="text-2xl md:text-3xl font-black mt-1">Обслуживались у нас? Расскажите, как всё прошло</h2>
            <p className="text-[#aaa19a] mt-2">Публикуем отзывы с деталями — что делали, сколько заняло и стоило. Первые отзывы появятся здесь после запуска.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/booking" className="btn-primary">Записаться на визит</Link>
            <Link href="/reviews" className="btn-secondary">Страница отзывов</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-20 grid md:grid-cols-[.8fr_1.2fr] gap-10">
        <div><div className="eyebrow">Вопросы перед визитом</div><h2 className="text-3xl md:text-4xl font-black mt-2">Всё важное — заранее</h2><p className="text-[#aaa19a] mt-3">Никаких мелких шрифтов и неожиданных условий.</p></div>
        <div className="grid gap-3">
          {["Можно ли приехать только на диагностику?", "Согласуете ли вы дополнительные работы?", "Какая гарантия на ремонт?", "Сколько времени автомобиль будет в сервисе?"].map((question) => (
            <details key={question} className="card p-5 group"><summary className="cursor-pointer list-none font-bold flex items-center justify-between gap-4">{question}<span className="text-[#c51f35] text-xl group-open:rotate-45 transition-transform">+</span></summary><p className="text-sm text-[#aaa19a] mt-3">Да. Ответ и точная информация будут зафиксированы мастером в заказ-наряде после осмотра автомобиля.</p></details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-14 card p-6 grid md:grid-cols-2 gap-4 items-center">
        <div>
          <div className="eyebrow">Следующий шаг</div>
          <h2 className="text-2xl md:text-3xl font-black mt-2">Не знаете, что сломалось?</h2>
          <p className="text-[#aaa19a] mt-2">Начните с диагностики от 5 000 ₸: подъёмник, сканер и письменный отчёт. При ремонте у нас — диагностика бесплатно.</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link href="/booking?service=diagnostika-hodovoy" className="btn-primary">Записаться на диагностику</Link>
          <Link href="/prices" className="btn-secondary">Узнать точную цену</Link>
        </div>
      </section>
    </>
  );
}
