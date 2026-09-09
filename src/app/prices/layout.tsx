import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Прайс-лист и калькулятор стоимости | GearFlow",
  description: "Честные вилки цен: ТО, диагностика, ходовая, тормоза, шиномонтаж. Точная смета — после диагностики, письменно.",
  alternates: { canonical: "/prices" },
};

export default function PricesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
