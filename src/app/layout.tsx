import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Монстр Трек — автосервис", template: "%s | Монстр Трек" },
  description: "Честная диагностика, ремонт ходовой и кузовной SMART-ремонт в Алматы.",
  openGraph: { title: "Монстр Трек — автосервис", description: "Смета до начала работ. Гарантия на результат.", type: "website", locale: "ru_RU" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = { "@context": "https://schema.org", "@type": "AutoRepair", name: site.name, telephone: site.phone, address: { "@type": "PostalAddress", streetAddress: site.address, addressLocality: "Алматы" } };
  return (
    <html lang="ru">
      <body>
        <div className="hotbar">Экстренный вопрос по автомобилю? <a href={site.phoneHref}>Позвонить мастеру {site.phone}</a></div>
        <header className="site-header"><div className="clean-container header-inner">
          <Link href="/" className="brand"><Image src="/brand/monster-truck-logo.png" alt="Монстр Трек" width={84} height={70} priority /></Link>
          <nav><Link href="/">Главная</Link><a href="/#services">Услуги</a><a href="/#prices">Цены</a><a href="/#contacts">Контакты</a></nav>
          <div className="header-actions"><a href="#request" className="estimate-button">Рассчитать смету</a><a href="#request" className="orange-button small-button">Записаться</a></div>
        </div></header>
        <main>{children}</main>
        <footer className="site-footer"><div className="clean-container footer-inner">
          <Image src="/brand/monster-truck-logo.png" alt="Монстр Трек" width={120} height={100} />
          <p>Городской мультибрендовый автосервис.<br />Диагностика, ремонт и обслуживание.</p>
          <div><b>{site.phone}</b><br />{site.address}<br />{site.hours}</div>
          <small>© 2026 Монстр Трек · <Link href="/privacy">Политика конфиденциальности</Link></small>
        </div></footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
