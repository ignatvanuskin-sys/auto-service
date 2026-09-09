/**
 * Конфигурация бизнеса — ЕДИНСТВЕННОЕ место правды для публичных данных.
 * TODO(owner): перед запуском заменить демо-значения статистики (рейтинг,
 * число авто/отзывов) на реальные данные сервиса.
 */
function digits(phone: string): string {
  return phone.replace(/[^+\d]/g, "");
}

export const site = {
  name: "GearFlow Auto Service",
  shortName: "GearFlow AI",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+7 727 310-20-20",
  get phoneHref(): string {
    return `tel:${digits(this.phone)}`;
  },
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/gearflow_auto",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/77012345678",
  address: "ул. Рыскулова, 62, Алматы",
  addressNote: "ориентир — напротив авторынка, заезд с торца",
  hours: "Пн–Сб 9:00–20:00, Вс — выходной",
  hoursSchema: "Mo-Sa 09:00-20:00",
  // --- демо-статистика: заменить реальными данными перед запуском ---
  rating: "4.9",
  reviewCount: "1 240",
  carsServiced: "12 000+",
  yearsOnMarket: "7+",
  warranty: "Гарантия до 12 месяцев",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
