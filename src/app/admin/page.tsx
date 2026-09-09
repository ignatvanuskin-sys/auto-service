import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

const ALL_CARDS: Array<[string, string, string, string[]]> = [
  ["/admin/bookings", "Записи и календарь", "Свои записи и статусы работ", ["owner", "admin", "master"]],
  ["/admin/leads", "Заявки и лиды", "AI-лиды со срочностью, требуют подтверждения", ["owner", "admin"]],
  ["/admin/customers", "Клиенты и авто", "Карточки, история, статусы new/active/dormant", ["owner", "admin"]],
  ["/admin/services", "Услуги и цены", "Цены-вилки и длительность слотов", ["owner", "admin"]],
  ["/admin/reviews", "Отзывы", "Модерация и публикация", ["owner", "admin"]],
  ["/admin/notifications", "Уведомления", "Журнал отправок, retry вручную", ["owner", "admin"]],
];

/** Админ-дашборд: заявки сегодня, записи, воронка. Серверный компонент, RBAC через cookie-сессию. */
export default async function AdminHome() {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  let counts = { bookingsToday: 0, leadsNew: 0, notifQueued: 0, customers: 0 };
  let funnel: { name: string; _count: number }[] = [];
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const [b, l, n, c] = await Promise.all([
      db.booking.count({ where: { createdAt: { gte: start } } }),
      db.lead.count({ where: { status: "new" } }),
      db.notification.count({ where: { status: "queued" } }),
      db.customer.count(),
    ]);
    counts = { bookingsToday: b, leadsNew: l, notifQueued: n, customers: c };
    funnel = await db.analyticsEvent.groupBy({ by: ["name"], _count: true }).catch(() => []);
  } catch {
    // БД недоступна — покажем нули, а не белый экран
  }
  const cards = ALL_CARDS.filter(([, , , roles]) => roles.includes(s.role));
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 grid gap-4 pb-10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-extrabold">Админка — сегодня</h1>
        <div className="flex items-center gap-2">
          <span className="card px-3 py-1 text-sm font-bold">роль: {s.role}</span>
          <LogoutButton />
        </div>
      </div>
      {s.role === "master" ? (
        <p className="text-sm opacity-70">Режим мастера: доступны только ваши записи и статусы работ. Финансы, клиенты и настройки скрыты.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[["Записей сегодня", counts.bookingsToday], ["Новых лидов", counts.leadsNew], ["Уведомлений в очереди", counts.notifQueued], ["Клиентов всего", counts.customers]].map(([l, v]) => (
            <div key={l as string} className="card p-4"><div className="text-2xl font-extrabold">{v as number}</div><div className="text-sm opacity-70">{l as string}</div></div>
          ))}
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        {cards.map(([href, t, d]) => (
          <Link key={href} href={href} className="card p-4 hover:shadow-lg"><div className="font-bold">{t}</div><div className="opacity-70">{d}</div></Link>
        ))}
      </div>
      {s.role !== "master" && funnel.length > 0 && (
        <div className="card p-4 text-sm"><div className="font-bold mb-1">Воронка событий</div>{funnel.map((f) => <div key={f.name}>{f.name}: {f._count}</div>)}</div>
      )}
    </div>
  );
}
