import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отзывы с деталями — марка, услуга, цена | GearFlow",
  description: "Реальные отзывы с деталями: что делали, сколько заняло и стоило. Рейтинг 4.9 из 1 240 отзывов.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
