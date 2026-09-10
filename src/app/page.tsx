import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/lib/services-data";
import { site } from "@/lib/site";
import { Analytics } from "@/components/Analytics";
import { RequestForm } from "@/components/RequestForm";

export const metadata = { title: "Монстр Трек — автосервис полного цикла", description: "Диагностика, ремонт, шиномонтаж и ТО с понятной сметой до начала работ.", alternates: { canonical: "/" } };

const serviceGroups = [
  ["01", "Диагностика", "Находим причину неисправности, а не меняем детали наугад.", "От 5 000 ₸"],
  ["02", "Ходовая часть", "Рычаги, амортизаторы, рулевое и тормозная система.", "От 12 000 ₸"],
  ["03", "Двигатель и АКПП", "От регламентных работ до сложной дефектовки и ремонта.", "От 25 000 ₸"],
  ["04", "Шиномонтаж", "Сезонная замена, балансировка и проверка дисков.", "От 8 000 ₸"],
  ["05", "Кузовной ремонт", "Локальная рихтовка, покраска элемента и полировка.", "От 30 000 ₸"],
  ["06", "ТО по регламенту", "Масло, фильтры и контрольные точки по пробегу.", "От 18 000 ₸"],
];

export default function Home() {
  return <>
    <Analytics page="/" />
    <section className="motor-hero">
      <Image src="/brand/monster-truck-hero.jpg" alt="Автомобиль в сервисном боксе" fill priority className="motor-hero-image" sizes="100vw" />
      <div className="motor-hero-shade" />
      <div className="motor-container motor-hero-content">
        <div className="hero-ticket"><span>ЗАКАЗ-НАРЯД</span><strong>МОНСТР ТРЕК / 2026</strong><em>DIAGNOSTIC / SERVICE</em></div>
        <div className="motor-kicker">Городской автосервис полного цикла · Алматы</div>
        <h1>Ремонт, который<br /><mark>можно понять.</mark></h1>
        <p>Диагностика по фактам. Смета до начала работ. Фотоотчёт и гарантия — в одном заказ-наряде.</p>
        <div className="motor-actions"><a href="#request" className="motor-button">Записаться на диагностику</a><a href="#prices" className="motor-link">Смотреть прайс ↓</a></div>
      </div>
      <div className="hero-spec"><strong>12</strong><span>месяцев<br />гарантии</span></div>
    </section>

    <main>
      <section id="services" className="motor-container motor-section">
        <div className="section-heading"><div><span className="motor-kicker">01 / Услуги</span><h2>Чиним то, что<br />важно в дороге.</h2></div><p>Мультибрендовый сервис для ежедневных задач и сложных случаев. Сначала осмотр — потом решение.</p></div>
        <div className="service-rail">{serviceGroups.map(([number, title, text, price]) => <article className="service-slab" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><b>{price}</b></article>)}</div>
      </section>

      <section id="process" className="motor-container motor-section process-section"><div className="section-heading"><div><span className="motor-kicker">02 / Как работаем</span><h2>Без загадок<br />и внезапных доплат.</h2></div><p>Последовательность, в которой каждая цифра и каждое решение имеют смысл.</p></div><div className="process-line">{[["01","Заявка","Опишите симптом или выберите услугу."],["02","Диагностика","Проверяем автомобиль и фиксируем причину."],["03","Смета","Согласуем детали, сроки и запчасти."],["04","Ремонт","Выполняем только подтверждённый объём."],["05","Выдача","Фотоотчёт, проверка и гарантия." ]].map(([n,t,d]) => <div className="process-step" key={n}><strong>{n}</strong><h3>{t}</h3><p>{d}</p></div>)}</div></section>

      <section id="prices" className="motor-container motor-section"><div className="section-heading"><div><span className="motor-kicker">03 / Ориентиры</span><h2>Прайс без<br />мелкого шрифта.</h2></div><p>Стоимость зависит от марки, модели и состояния автомобиля. Финальную смету подтверждаем до начала ремонта.</p></div><div className="price-list">{SERVICES.slice(0, 7).map((s) => <Link href={`/services/${s.slug}`} key={s.slug}><span>{s.name}</span><small>{s.durationMin} мин</small><b>от {s.priceMin.toLocaleString("ru-RU")} ₸</b></Link>)}</div></section>

      <section className="motor-container motor-section proof-section"><div className="proof-copy"><span className="motor-kicker">04 / Почему мы</span><h2>Сервис — это не обещание.<br /><mark>Это запись в системе.</mark></h2><p>Каждая заявка сохраняется, получает номер и передаётся мастеру. Работы, согласования и гарантия остаются в истории автомобиля.</p></div><div className="proof-notes"><div><b>12 мес.</b><span>гарантия на отдельные работы</span></div><div><b>0 ₸</b><span>допработ без вашего согласования</span></div><div><b>Фото</b><span>отчёт по запросу клиента</span></div></div></section>

      <section className="motor-container motor-section"><div className="section-heading"><div><span className="motor-kicker">05 / Отзывы</span><h2>Люди возвращаются<br />с теми же машинами.</h2></div><p>Не обещаем идеальность — показываем, как работаем: объясняем проблему, фиксируем объём и остаёмся на связи.</p></div><div className="review-grid"><article><p>«Приехал на диагностику ходовой. Показали всё на подъёмнике, объяснили, что можно сделать сейчас, а что подождёт. Смета не изменилась.»</p><b>Алексей · Toyota Camry</b><small>Диагностика и замена втулок</small></article><article><p>«Делал ТО перед дальней поездкой. Получил список по приоритетам и фотографии. Наконец-то сервис без ощущения, что тебе продают лишнее.»</p><b>Мария · Kia Sportage</b><small>ТО по регламенту</small></article><article><p>«На холодную появилась ошибка по коробке. Нашли причину, а не предложили сразу менять агрегат. Машина ездит уже третий месяц.»</p><b>Дмитрий · Volkswagen Tiguan</b><small>Диагностика АКПП</small></article></div></section>

      <section id="request" className="motor-container motor-section request-section"><div className="section-heading"><div><span className="motor-kicker">06 / Заявка</span><h2>Расскажите,<br />что случилось.</h2></div><p>Оставьте контакты — владелец или мастер свяжется с вами в выбранное время. Поля без лишнего.</p></div><RequestForm /></section>

      <section id="contacts" className="motor-container motor-section contacts-section"><div><span className="motor-kicker">07 / Контакты</span><h2>Заезжайте<br />в Монстр Трек.</h2></div><div className="contact-data"><p><strong>Адрес</strong>{site.address}<br /><small>{site.addressNote}</small></p><p><strong>Режим работы</strong>{site.hours}</p><p><strong>Телефон</strong><a href={site.phoneHref}>{site.phone}</a></p><a className="motor-button" href={site.telegramUrl} target="_blank" rel="noreferrer">Написать в Telegram</a></div></section>
    </main>
  </>;
}
