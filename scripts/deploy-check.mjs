const BASE = "http://localhost:3100";
let fail = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "  ok  " : "  FAIL"} ${name} ${cond ? "" : extra}`);
  if (!cond) fail++;
}
async function main() {
  const h = await (await fetch(BASE + "/api/health")).json();
  check("health db up", h.db === "up");
  for (const p of ["/", "/services", "/services/to-10k", "/prices", "/booking", "/about", "/team", "/cases", "/reviews", "/faq", "/promotions", "/blog", "/contacts", "/privacy", "/sitemap.xml", "/robots.txt"]) {
    const r = await fetch(BASE + p);
    check(`GET ${p} → 200`, r.status === 200, `status=${r.status}`);
  }
  const login = await fetch(BASE + "/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "owner@gearflow.kz", password: "ChangeMe123!" }),
  });
  const cookie = (login.headers.get("set-cookie") ?? "").match(/gf_admin_session=[^;]+/)?.[0] ?? "";
  check("admin login 200", login.status === 200, `status=${login.status}`);
  const dash = await fetch(BASE + "/admin", { headers: { cookie } });
  const dashHtml = await dash.text();
  check("admin dashboard 200 + роль", dash.status === 200 && dashHtml.includes("Админка"), `status=${dash.status}`);
  const av = await (await fetch(BASE + "/api/availability?date=" + new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10))).json();
  check("availability slots", Array.isArray(av.slots));
  console.log(fail ? "DEPLOY-CHECK FAILED" : "DEPLOY-CHECK ALL OK");
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
