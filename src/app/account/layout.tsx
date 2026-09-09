import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет — мои авто и записи | GearFlow",
  description: "Мои автомобили, история ТО и активные записи. Вход по одноразовому коду.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
