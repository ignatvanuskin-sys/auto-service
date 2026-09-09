import Link from "next/link";
export const metadata = { title: "FAQ — цены, гарантия, запись без звонка | GearFlow", description: "Сколько стоит, сколько займёт, есть ли гарантия, можно ли без звонка, оригинал или аналог.", alternates: { canonical: "/faq" } };
const FAQ = [
  ["Сколько будет стоить?", "На сайте — честные вилки. Точную смету фиксируем письменно после диагностики. Допработы — только с вашего подтверждения."],
  ["Меня не обманут?", "Диагностика фиксированная, смета письменная, старые запчасти отдаём, фотоотчёт этапов — в мессенджер."],
  ["Навяжут ли лишнее?", "Нет: работы сверх согласованных делаем только после вашего «да» в переписке."],
  ["Когда примут машину?", "Живой календарь на шаге 3 записи показывает только свободные слоты. Сегодняшние слоты — в hero-блоке главной."],
  ["Сколько займёт ремонт?", "ТО — около часа, колодки — 1,5 часа, подвеска — от 3 часов, капитальный ремонт — от 5 дней. Срок фиксируем в заказ-наряде."],
  ["Есть ли гарантия?", "На работы — до 12 месяцев (см. карточку услуги), на керамику — до 24 месяцев."],
  ["Оригинал или аналог?", "На ваш выбор: в форме записи есть поле предпочтения. Аналог — только проверенные бренды, с вашим согласием."],
  ["Можно записаться без звонка?", "Да, это основной путь: 4 шага за минуту, подтверждение — в Telegram/WhatsApp/SMS."],
];
export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 grid gap-3">
      <h1 className="text-3xl font-extrabold">Вопросы и ответы</h1>
      {FAQ.map(([q, a]) => (
        <details key={q} className="card p-4"><summary className="font-bold cursor-pointer">{q}</summary><p className="text-sm opacity-80 mt-2">{a}</p></details>
      ))}
      <Link href="/booking" className="btn-primary w-fit mt-2">Записаться онлайн</Link>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }) }} />
    </div>
  );
}
