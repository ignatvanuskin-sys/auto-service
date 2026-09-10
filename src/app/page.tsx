import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/lib/services-data";
import { site } from "@/lib/site";
import { Analytics } from "@/components/Analytics";
import { RequestForm } from "@/components/RequestForm";

export const metadata = { title: "Монстр Трек — честный автосервис в Алматы", description: "Диагностика, ремонт и обслуживание автомобилей с понятной сметой и гарантией.", alternates: { canonical: "/" } };

const serviceCards = [
  ["01", "Диагностика", "Проверим автомобиль и объясним, что действительно требует внимания.", "diagnostika-hodovoy"],
  ["02", "Ремонт ходовой", "Подвеска, рулевое управление, тормоза и безопасное поведение автомобиля.", "remont-podveski"],
  ["03", "Двигатель и АКПП", "Ищем причину неисправности, а не предлагаем замену узла вслепую.", "remont-dvigatelya"],
  ["04", "ТО и масла", "Регламентное обслуживание, фильтры, жидкости и подготовка к поездке.", "to-10k"],
  ["05", "Шиномонтаж", "Сезонная замена, балансировка, ремонт проколов и проверка давления.", "shinomontazh"],
  ["06", "Кузовной ремонт", "Локальные царапины, вмятины, бамперы и восстановление покрытия.", "kuzovnoy-remont"],
];

export default function Home() {
  return <>
    <Analytics page="/" />
    <section className="clean-hero">
      <div className="clean-container hero-layout">
        <div className="hero-copy">
          <div className="hero-eyebrow"><span className="status-dot" /> Автосервис полного цикла · Алматы</div>
          <h1>Ваш автомобиль<br /><span>в хороших руках.</span></h1>
          <p>Диагностика, обслуживание и ремонт без сложных слов. Сначала показываем проблему, затем согласуем решение.</p>
          <div className="hero-actions"><a href="#request" className="orange-button">Записаться на сервис</a><a href="#services" className="text-button">Посмотреть услуги <span>↓</span></a></div>
          <div className="hero-trust"><span>✓ Смета до начала работ</span><span>✓ Гарантия до 12 месяцев</span></div>
        </div>
        <div className="hero-visual"><Image src="/brand/monster-truck-hero.jpg" alt="Автомобиль в сервисном боксе" fill priority sizes="(max-width: 900px) 100vw, 50vw" /><div className="visual-label"><b>МОНСТР ТРЕК</b><span>Проверяем. Объясняем. Ремонтируем.</span></div></div>
      </div>
    </section>

    <section className="numbers-strip"><div className="clean-container numbers-grid"><div><b>12 мес.</b><span>гарантия на работы</span></div><div><b>7+</b><span>лет в сервисе</span></div><div><b>6</b><span>ключевых направлений</span></div><div><b>0 ₸</b><span>допработ без согласования</span></div></div></section>

    <main>
      <section id="services" className="clean-container clean-section"><div className="section-intro"><div><div className="section-label">Наши услуги</div><h2>Всё необходимое<br />для спокойной дороги.</h2></div><p>Работаем с легковыми автомобилями разных марок. Подберём оригинальные или качественные аналоговые запчасти под вашу задачу и бюджет.</p></div><div className="clean-service-grid">{serviceCards.map(([n,title,text,slug]) => <Link href={`/services/${slug}`} className="clean-service-card" key={n}><span className="card-number">{n}</span><div><h3>{title}</h3><p>{text}</p><strong>Подробнее <span>↗</span></strong></div></Link>)}</div></section>

      <section className="light-band"><div className="clean-container clean-section"><div className="section-intro"><div><div className="section-label">Как это работает</div><h2>Простой путь<br />от вопроса к решению.</h2></div><p>Вы не обязаны разбираться в устройстве автомобиля. Для этого есть мы — и понятный процесс на каждом этапе.</p></div><div className="steps-grid">{[["01","Оставляете заявку","Расскажите, что произошло, или выберите нужную услугу."],["02","Получаете диагностику","Мастер показывает причину и отвечает на вопросы."],["03","Согласуете смету","Фиксируем стоимость и срок до начала ремонта."],["04","Забираете автомобиль","Проверяем результат и выдаём гарантию на работы."]].map(([n,t,d]) => <div className="step-card" key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>

      <section id="prices" className="clean-container clean-section"><div className="section-intro"><div><div className="section-label">Прайс и пакеты</div><h2>Понятные ориентиры<br />до визита.</h2></div><p>Цены указаны «от», потому что итог зависит от модели и состояния автомобиля. Точную смету согласуем после осмотра.</p></div><div className="package-grid"><div className="package-card featured"><span className="package-tag">Популярное</span><h3>Диагностика перед ремонтом</h3><p>Для случаев, когда есть симптом, но непонятна причина.</p><b>от 5 000 ₸</b><a href="#request">Получить консультацию</a></div><div className="package-card"><h3>ТО по регламенту</h3><p>Масло, фильтры и контрольные точки по пробегу.</p><b>от 18 000 ₸</b><a href="#request">Записаться</a></div><div className="package-card"><h3>Подготовка к поездке</h3><p>Комплексная проверка основных систем автомобиля.</p><b>от 12 000 ₸</b><a href="#request">Уточнить состав</a></div></div><div className="price-list clean-price-list">{SERVICES.slice(0,6).map(s => <Link href={`/services/${s.slug}`} key={s.slug}><span>{s.name}</span><small>от {s.priceMin.toLocaleString("ru-RU")} ₸</small><b>↗</b></Link>)}</div></section>

      <section className="review-band"><div className="clean-container clean-section"><div className="section-intro"><div><div className="section-label">Отзывы клиентов</div><h2>Хороший сервис<br />заметен в деталях.</h2></div><p>Мы не обещаем невозможного. Мы объясняем, что сделали, и оставляем документы, фото и гарантию.</p></div><div className="review-grid clean-reviews"><article><div className="stars">★★★★★</div><p>«Показали машину на подъёмнике и объяснили, что можно отложить. Смета не изменилась — это редкость.»</p><b>Алексей · Toyota Camry</b></article><article><div className="stars">★★★★★</div><p>«Приезжала на ТО перед поездкой. Получила фотографии и список по приоритетам, без навязывания лишнего.»</p><b>Мария · Kia Sportage</b></article><article><div className="stars">★★★★☆</div><p>«Нашли настоящую причину ошибки по коробке. Машина ездит уже третий месяц, всё работает.»</p><b>Дмитрий · Volkswagen Tiguan</b></article></div></div></section>

      <section id="request" className="clean-container clean-section request-section"><div className="request-shell"><div className="request-side"><div className="section-label">Запись на сервис</div><h2>Расскажите,<br />что случилось.</h2><p>Ответим в рабочее время и подскажем, какой формат визита подойдёт. Если удобнее, можно сразу позвонить.</p><a href={site.phoneHref} className="phone-link">{site.phone}</a></div><RequestForm /></div></section>
      <section id="contacts" className="contact-band"><div className="clean-container contact-layout"><div><div className="section-label">Где нас найти</div><h2>Заезжайте<br />в Монстр Трек.</h2></div><div className="contact-info"><p><b>Адрес</b>{site.address}<small>{site.addressNote}</small></p><p><b>График</b>{site.hours}</p><div className="contact-actions"><a href={site.phoneHref} className="orange-button">Позвонить</a><a href={site.telegramUrl} target="_blank" rel="noreferrer" className="outline-button">Telegram</a></div></div></div></section>
    </main>
  </>;
}
