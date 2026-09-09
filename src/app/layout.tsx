import type { Metadata } from "next";
import { Header, Footer, StickyMobileBar } from "@/components/Chrome";
import { AiWidget } from "@/components/AiWidget";
import { ClickTracker } from "@/components/Analytics";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Монстр Трек — премиальный автосервис в Алматы",
    template: "%s | Монстр Трек",
  },
  description:
    "Премиальный автосервис в Алматы: диагностика, ТО, ремонт и онлайн-запись. Прозрачная смета, фотоотчёт и гарантия до 12 месяцев.",
  openGraph: {
    title: "Монстр Трек — запись на сервис",
    description: "Диагностика и ремонт без лишних обещаний: прозрачные цены, гарантия и онлайн-запись.",
    type: "website",
    locale: "ru_RU",
    siteName: "Монстр Трек",
  },
  twitter: {
    card: "summary",
    title: "Монстр Трек — запись на сервис",
    description: "Диагностика и ремонт без лишних обещаний: прозрачные цены, гарантия и онлайн-запись.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <StickyMobileBar />
        <AiWidget />
        <ClickTracker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoRepair",
              name: site.name,
              address: { "@type": "PostalAddress", streetAddress: "ул. Рыскулова, 62", addressLocality: "Алматы" },
              telephone: site.phone,
              openingHours: site.hoursSchema,
              aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating, reviewCount: site.reviewCount.replace(/\s/g, "") },
            }),
          }}
        />
      </body>
    </html>
  );
}
