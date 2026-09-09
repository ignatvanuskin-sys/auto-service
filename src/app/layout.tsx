import type { Metadata } from "next";
import { Header, Footer, StickyMobileBar } from "@/components/Chrome";
import { AiWidget } from "@/components/AiWidget";
import { ClickTracker } from "@/components/Analytics";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "GearFlow Auto Service — диагностика и ремонт, запись на сегодня без звонков",
    template: "%s | GearFlow Auto Service",
  },
  description:
    "Независимый автосервис: ТО, диагностика, ходовая, тормоза, шиномонтаж. Прозрачные цены-вилки, гарантия до 12 месяцев, онлайн-запись за 60 секунд.",
  openGraph: {
    title: "GearFlow Auto Service — запись на сегодня",
    description: "ТО и ремонт без звонков: онлайн-запись, прозрачные цены, гарантия.",
    type: "website",
    locale: "ru_RU",
    siteName: "GearFlow Auto Service",
  },
  twitter: {
    card: "summary",
    title: "GearFlow Auto Service — запись на сегодня",
    description: "ТО и ремонт без звонков: онлайн-запись, прозрачные цены, гарантия.",
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
