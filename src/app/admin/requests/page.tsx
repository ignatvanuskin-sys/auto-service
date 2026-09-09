import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const statuses = ["new", "contacted", "scheduled", "in_progress", "done", "cancelled"];

export default async function AdminRequestsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const requests = await db.lead.findMany({ where: { source: "site" }, orderBy: { createdAt: "desc" }, take: 100 }).catch(() => []);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const newToday = requests.filter((r) => r.createdAt >= today && r.status === "new").length;
  const active = requests.filter((r) => ["contacted", "scheduled", "in_progress"].includes(r.status)).length;
  return <div className="motor-container motor-section"><div className="section-heading"><div><span className="motor-kicker">МОТОР+ / Admin</span><h1>Заявки<br />сервиса.</h1></div><div><p>Новые заявки сохраняются здесь и получают статус жизненного цикла.</p><div className="admin-stats"><b>{newToday}<small>Новых сегодня</small></b><b>{active}<small>В работе</small></b><b>{requests.length}<small>Всего загружено</small></b></div></div></div><div className="admin-table">{requests.map((r) => <article key={r.id} className="admin-row"><div><strong>#{r.id.slice(-6).toUpperCase()}</strong><span>{r.name || "Без имени"} · {r.phone || "нет телефона"}</span><small>{r.vehicle || "Автомобиль не указан"} · {r.serviceType || "Услуга не указана"}</small></div><div><span className="admin-status">{r.status}</span><small>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(r.createdAt)}</small></div></article>)}{requests.length === 0 && <p>Заявок пока нет.</p>}</div></div>;
}
