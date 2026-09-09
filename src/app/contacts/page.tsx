import { site } from "@/lib/site";

export const metadata = { title: "Контакты — адрес, часы, карта | GearFlow", description: "ул. Рыскулова, 62, Алматы. Пн–Сб 9:00–20:00. Телефон, Telegram, WhatsApp.", alternates: { canonical: "/contacts" } };
export default function Contacts() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">Контакты</h1>
      <div className="card p-5 grid gap-1">
        <div><b>Адрес:</b> {site.address} ({site.addressNote})</div>
        <div><b>Часы:</b> {site.hours}</div>
        <div><b>Телефон:</b> <a href={site.phoneHref} data-track="phone_click" data-label="contacts" className="font-bold underline">{site.phone}</a></div>
        <div><b>Мессенджеры:</b> <a href={site.telegramUrl} target="_blank" data-track="messenger_click" data-label="telegram" className="underline font-bold">Telegram</a> · <a href={site.whatsappUrl} target="_blank" data-track="messenger_click" data-label="whatsapp" className="underline font-bold">WhatsApp</a> — отвечаем в рабочее время, ночью — AI-помощник</div>
      </div>
      <div className="card p-5 text-sm opacity-70">Карта: подключите MAPS_API_KEY (Yandex/Google) — блок карты рендерится здесь. Без ключа показан адрес и кнопка «Построить маршрут».</div>
      <a className="btn-primary w-fit" data-track="cta_click" data-label="route" href="https://maps.google.com/?q=Рыскулова+62+Алматы" target="_blank">Построить маршрут →</a>
    </div>
  );
}
