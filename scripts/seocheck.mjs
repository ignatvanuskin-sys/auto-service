const BASE = "http://localhost:3000";
const CRON = process.env.CRON_SECRET ?? "local-dev-cron-secret";

async function j(path, opts = {}) {
  const r = await fetch(BASE + path, opts);
  const body = await r.json().catch(() => ({}));
  return { status: r.status, body };
}

async function main() {
  // cron дважды подряд — уведомлений-дублей быть не должно
  const c1 = await j("/api/cron/reminders", { headers: { authorization: `Bearer ${CRON}` } });
  const c2 = await j("/api/cron/reminders", { headers: { authorization: `Bearer ${CRON}` } });
  console.log("cron1:", JSON.stringify(c1.body), "cron2:", JSON.stringify(c2.body));

  // SEO sweep: статус + h1 + title
  const pages = ["/", "/services", "/services/to-10k", "/prices", "/booking", "/about", "/team", "/cases", "/reviews", "/faq", "/promotions", "/blog", "/blog/kogda-menyat-maslo", "/contacts", "/privacy", "/account", "/admin/login"];
  for (const p of pages) {
    const r = await fetch(BASE + p);
    const html = await r.text();
    const title = (html.match(/<title>(.*?)<\/title>/) ?? [])[1] ?? "NO-TITLE";
    const h1 = (html.match(/<h1[^>]*>(.*?)<\/h1>/) ?? [])[1] ?? "NO-H1";
    const canon = html.includes('rel="canonical"') ? "canonical:yes" : "canonical:NO";
    console.log(`${r.status} ${p} | ${title.slice(0, 70)} | h1:${h1.replace(/<[^>]+>/g, "").slice(0, 50)} | ${canon}`);
  }
}
main();
