import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отзывы с деталями — марка, услуга, цена | GearFlow",
  description: "Отзывы клиентов автосервиса: публикуем с деталями — что делали, сколько заняло и стоило.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
