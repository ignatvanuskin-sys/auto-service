export const metadata = { title: "Политика конфиденциальности | GearFlow", description: "Как мы обрабатываем персональные данные клиентов.", alternates: { canonical: "/privacy" } };
export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 grid gap-3 text-[15px]">
      <h1 className="text-3xl font-extrabold">Политика конфиденциальности</h1>
      <p>Мы обрабатываем имя, телефон и данные авто только для организации записи и напоминаний о ТО. Данные не передаём третьим лицам, кроме провайдеров уведомлений (Telegram/WhatsApp/SMS) в объёме текста сообщения.</p>
      <p>По запросу удалим ваши данные: напишите на owner@gearflow.kz с номера, указанного при записи. Срок хранения — 3 года с последнего визита, далее — обезличивание.</p>
    </div>
  );
}
