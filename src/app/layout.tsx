import type { Metadata } from "next";
import { Header, Footer, StickyMobileBar } from "@/components/Chrome";
import { AiWidget } from "@/components/AiWidget";
import { ClickTracker } from "@/components/Analytics";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "МОТОР+ — автосервис полного цикла в Алматы",
    template: "%s | МОТОР+",
  },
  description:
    "Городской автосервис полного цикла: диагностика, ТО, ремонт ходовой, двигателя, АКПП и шиномонтаж.",
  openGraph: {
    title: "МОТОР+ — запись на диагностику",
    description: "Понятная смета, согласование работ и гарантия на результат.",
    type: "website",
    locale: "ru_RU",
    siteName: "МОТОР+",
  },
  twitter: {
    card: "summary",
    title: "МОТОР+ — запись на диагностику",
    description: "Понятная смета, согласование работ и гарантия на результат.",
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
