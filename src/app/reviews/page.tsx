import Link from "next/link";

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 grid gap-4 pb-10">
      <h1 className="text-3xl font-extrabold">Отзывы клиентов</h1>
      <div className="card p-6 grid gap-3">
        <p>Пока здесь пусто: мы только запустили онлайн-запись и собираем первые отзывы.</p>
        <p className="text-sm opacity-75">
          После визита пришлём ссылку на форму отзыва. Публикуем отзывы с деталями —
          что делали, сколько заняло и стоило.
        </p>
        <Link href="/booking" className="btn-primary w-fit">Стать первым клиентом →</Link>
      </div>
    </div>
  );
}
