import { Suspense } from "react";
import { BookingFlow } from "@/components/BookingFlow";
import { Analytics } from "@/components/Analytics";

/** Цель /booking: завершить запись за 4 шага. CTA: «Подтвердить запись». */
export const metadata = {
  title: "Онлайн-запись — 4 шага за 60 секунд | GearFlow",
  description: "Выберите услугу, авто, время и контакт. Без звонков и регистрации. Подтверждение в Telegram/WhatsApp.",
  alternates: { canonical: "/booking" },
};

export default function BookingPage() {
  return (
    <>
      <Analytics page="/booking" />
      <div className="mx-auto max-w-3xl px-4 pt-10 pb-10">
        <h1 className="text-3xl font-extrabold mb-2">Онлайн-запись</h1>
        <p className="opacity-75 mb-6">4 шага, около минуты. Без звонков и регистрации — аккаунт создадим автоматически по номеру телефона.</p>
        <Suspense fallback={<div className="card p-6">Загружаем календарь…</div>}>
          <BookingFlow />
        </Suspense>
      </div>
    </>
  );
}
