import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#f2eee5] border-b border-[#c5c5bb]">
      <div className="mx-auto max-w-6xl px-4 h-[76px] flex items-center justify-between gap-3">
        <Link href="/" aria-label="Монстр Трек — на главную" className="flex items-center shrink-0 group">
          <Image src="/brand/monster-truck-logo.png" alt="Монстр Трек — автосервис" width={84} height={70} priority className="h-16 w-auto object-contain" />
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-[15px] font-medium">
          <Link href="/services">Услуги</Link>
          <Link href="/prices">Цены</Link>
          <Link href="/reviews">Отзывы</Link>
          <Link href="/cases">Кейсы</Link>
          <Link href="/about">О нас</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>
        <details className="md:hidden relative ml-auto">
          <summary className="list-none cursor-pointer border border-white/15 rounded-lg px-3 py-2 text-sm font-bold">Меню</summary>
          <div className="absolute right-0 top-12 z-50 w-48 bg-[#f2eee5] border border-[#c5c5bb] p-3 grid gap-1 text-sm">
            <Link href="/services" className="p-2">Услуги</Link><Link href="/prices" className="p-2">Цены</Link><Link href="/cases" className="p-2">Работы</Link><Link href="/reviews" className="p-2">Отзывы</Link><Link href="/contacts" className="p-2">Контакты</Link>
          </div>
        </details>
        <div className="flex items-center gap-2">
          <a href={site.phoneHref} data-track="phone_click" className="hidden sm:inline font-bold text-sm opacity-80 hover:opacity-100">
            {site.phone}
          </a>
          <Link href="/booking" data-track="cta_click" data-label="header" className="btn-primary !py-2.5 !px-4 !min-h-[44px] text-[15px]">
            Записаться
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-[#141210] text-[#e9e2d6]">
      <div className="mx-auto max-w-6xl px-4 py-14 grid gap-10 md:grid-cols-[1.2fr_.8fr_.8fr_1fr]">
        <div>
          <Image src="/brand/monster-truck-logo.png" alt="Монстр Трек — автосервис" width={150} height={132} className="h-24 w-auto object-contain" />
          <p className="text-sm mt-2 opacity-80">
            Независимый мультибрендовый автосервис. {site.yearsOnMarket} лет, {site.carsServiced} обслуженных авто, {site.warranty.toLowerCase()} на работы.
          </p>
          <Link href="/booking" className="btn-primary mt-5">Записаться на сервис →</Link>
        </div>
        <div className="text-sm">
          <div className="font-bold mb-2">Клиентам</div>
          <div className="grid gap-1">
            <Link href="/services">Услуги</Link>
            <Link href="/prices">Цены</Link>
            <Link href="/booking">Онлайн-запись</Link>
            <Link href="/promotions">Акции</Link>
            <Link href="/faq">Вопросы и ответы</Link>
          </div>
        </div>
        <div className="text-sm">
          <div className="font-bold mb-2">Компания</div>
          <div className="grid gap-1">
            <Link href="/about">О нас</Link>
            <Link href="/team">Мастера</Link>
            <Link href="/reviews">Отзывы</Link>
            <Link href="/blog">Блог</Link>
            <Link href="/privacy">Конфиденциальность</Link>
          </div>
        </div>
        <div className="text-sm">
          <div className="font-bold mb-2">Контакты</div>
          <p>{site.address}</p>
          <p>{site.hours}</p>
          <p className="mt-1 font-bold">{site.phone}</p>
          <a href={site.telegramUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 text-[#e87383]">Telegram →</a>
          <Link href="/privacy" className="block mt-4 text-xs opacity-60">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}

export function StickyMobileBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-[#eee5d8] grid grid-cols-3 text-center text-[13px] font-bold">
      <a href={site.phoneHref} data-track="phone_click" className="py-3">
        📞 Позвонить
      </a>
      <a href={site.telegramUrl} target="_blank" data-track="messenger_click" data-label="telegram" className="py-3 border-x border-[#eee5d8]">
        ✈️ Telegram
      </a>
      <Link href="/booking" data-track="cta_click" data-label="sticky" className="py-3" style={{ background: "var(--gf-accent)", color: "#fff" }}>
        Записаться
      </Link>
    </div>
  );
}

export function TrustRow() {
  return (
    <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
      <span className="card px-3 py-1.5">Письменная смета до начала работ</span>
      <span className="card px-3 py-1.5">Гарантия до 12 месяцев</span>
      <span className="card px-3 py-1.5">Согласование до начала работ</span>
      <span className="badge-warranty">Напоминания о визите и ТО</span>
    </div>
  );
}
