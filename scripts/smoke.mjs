/**
 * GearFlow AI — HTTP smoke/audit suite.
 * Запуск: 1) npm run dev (порт 3000)  2) node scripts/smoke.mjs
 * Проверяет booking, concurrency, security, RBAC, OTP, webhooks, cron, API-валидацию.
 */
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
const CRON = process.env.CRON_SECRET ?? "local-dev-cron-secret";
const TG_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "change-me-telegram-secret";

let pass = 0;
let fail = 0;
const failures = [];

function check(name, cond, extra = "") {
  if (cond) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL ${name} ${extra}`);
  }
}

async function req(method, path, { body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  const setCookie = res.headers.get("set-cookie") ?? "";
  return { status: res.status, json, setCookie, text: "" };
}

async function text(path) {
  const res = await fetch(BASE + path);
  return { status: res.status, body: await res.text() };
}

function nextWeekday(offsetDays) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1); // пропускаем воскресенье
  return d.toISOString().slice(0, 10);
}

function nextSunday() {
  const d = new Date();
  const diff = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const RUN = Date.now().toString().slice(-6); // уникальные телефоны на прогон
  const ph = (prefix, i = 0) => `+${prefix}${RUN}${i}`;
  console.log("== 1. Public pages ==");
  const home = await text("/");
  check("GET / 200 + CTA", home.status === 200 && home.body.includes("Записаться онлайн"));
  const svc = await req("GET", "/api/services");
  check("GET /api/services ≥12", svc.status === 200 && (svc.json?.items?.length ?? 0) >= 12);

  console.log("== 2. Availability ==");
  const day = nextWeekday(2);
  const av = await req("GET", `/api/availability?date=${day}`);
  check("availability 200 + slots", av.status === 200 && Array.isArray(av.json?.slots) && av.json.slots.length > 0, JSON.stringify(av.json)?.slice(0, 120));
  const badAv = await req("GET", "/api/availability?date=not-a-date");
  check("availability bad date → 400", badAv.status === 400);
  const slot = av.json.slots[0];

  console.log("== 3. Booking happy path ==");
  const b1 = await req("POST", "/api/bookings", {
    body: { make: "Toyota", model: "Camry", year: 2019, slotStart: slot, name: "Тест Тестов", phone: ph("77010"), channel: "telegram", source: "site" },
  });
  check("booking 201", b1.status === 201 && !!b1.json?.manageToken, `status=${b1.status} ${JSON.stringify(b1.json)?.slice(0, 160)}`);
  const token = b1.json?.manageToken;

  console.log("== 4. Booking validation ==");
  const mk = (over) => ({ make: "Toyota", model: "Camry", slotStart: slot, name: "Тест", phone: ph("77021"), ...over });
  check("invalid phone → 400", (await req("POST", "/api/bookings", { body: mk({ phone: "123" }) })).status === 400);
  check("past slot → 400", (await req("POST", "/api/bookings", { body: mk({ slotStart: new Date(Date.now() - 86400000).toISOString(), phone: ph("77022") }) })).status === 400);
  check("sunday → 400", (await req("POST", "/api/bookings", { body: mk({ slotStart: `${nextSunday()}T10:00:00.000Z`, phone: ph("77023") }) })).status === 400);
  check("bad service → 400", (await req("POST", "/api/bookings", { body: mk({ serviceSlug: "nope", phone: ph("77024") }) })).status === 400);
  check("bad master → 400", (await req("POST", "/api/bookings", { body: mk({ masterId: "nope", phone: ph("77025") }) })).status === 400);
  check("off-grid :30 → 400", (await req("POST", "/api/bookings", { body: mk({ slotStart: slot.replace(/T\d\d:00/, (m) => m.slice(0, 3) + "30"), phone: ph("77026") }) })).status === 400);

  console.log("== 5. Concurrency (6 parallel → capacity 4) ==");
  const av2 = await req("GET", `/api/availability?date=${nextWeekday(3)}`);
  const raceSlot = (av2.json?.slots ?? [])[0] ?? slot;
  const racers = await Promise.all(
    [1, 2, 3, 4, 5, 6].map((i) =>
      req("POST", "/api/bookings", {
        body: { make: "Kia", model: "Rio", slotStart: raceSlot, name: `Гонка ${i}`, phone: ph("77029", i), channel: "sms" },
      })
    )
  );
  const okCount = racers.filter((r) => r.status === 201).length;
  const conflictCount = racers.filter((r) => r.status === 409).length;
  const badCount = racers.filter((r) => ![201, 409].includes(r.status)).length;
  check("race: successes ≤ capacity(4)", okCount <= 4 && okCount >= 1, `ok=${okCount} 409=${conflictCount} other=${badCount}`);
  check("race: rest 409, no 500", conflictCount >= 1 && badCount === 0, JSON.stringify(racers.map((r) => r.status)));
  // детерминированная проверка вместимости: заполненный слот исчезает из availability
  const avAfter = await req("GET", `/api/availability?date=${nextWeekday(3)}`);
  check("filled slot hidden from availability", !(avAfter.json?.slots ?? []).includes(raceSlot));

  console.log("== 6. Manage by token ==");
  const g = await req("GET", `/api/bookings/${token}`);
  check("manage GET 200 без id в ответе", g.status === 200 && g.json?.id === undefined && !!g.json?.slotStart, `status=${g.status}`);
  check("manage GET bad token → 404", (await req("GET", "/api/bookings/bad-token-123")).status === 404);
  // создаём вторую запись для отмены (перебираем слоты — suite идемпотентен при повторах)
  const av3 = await req("GET", `/api/availability?date=${nextWeekday(4)}`);
  let bB = null;
  for (const s of (av3.json?.slots ?? []).slice(0, 5)) {
    const attempt = await req("POST", "/api/bookings", {
      body: { make: "Lada", model: "Vesta", slotStart: s, name: "Отмена", phone: ph("77031"), channel: "sms" },
    });
    if (attempt.status === 201) {
      bB = attempt;
      break;
    }
  }
  if (!bB) {
    check("manage PATCH cancel (setup booking)", false, "no free slot for setup");
  } else {
    const cancel = await req("PATCH", `/api/bookings/${bB.json.manageToken}`, { body: { status: "cancelled" } });
    check("manage PATCH cancel", cancel.status === 200 && cancel.json?.status === "cancelled", `status=${cancel.status}`);
  }

  console.log("== 7. Leads ==");
  const lead = await req("POST", "/api/leads", { body: { source: "ai_widget", rawMessage: "Машина не заводится, стартер не крутит, Toyota Camry" } });
  check("lead 201 + urgency", lead.status === 201 && !!lead.json?.qualified?.urgency, `status=${lead.status}`);
  check("lead empty → 400", (await req("POST", "/api/leads", { body: { source: "ai_widget", rawMessage: "" } })).status === 400);

  console.log("== 8. Webhooks ==");
  check("telegram unsigned → 401", (await req("POST", "/api/webhooks/telegram", { body: { x: 1 } })).status === 401);
  check("telegram signed → 200", (await req("POST", "/api/webhooks/telegram", { body: { message: { text: "hi" } }, headers: { "x-telegram-bot-api-secret-token": TG_SECRET } })).status === 200);
  check("whatsapp bad verify → 403", (await req("GET", "/api/webhooks/whatsapp?hub.verify_token=wrong&hub.challenge=1")).status === 403);

  console.log("== 9. Cron ==");
  check("cron no secret → 401", (await req("GET", "/api/cron/reminders")).status === 401);
  const cron = await req("GET", "/api/cron/reminders", { headers: { authorization: `Bearer ${CRON}` } });
  check("cron with secret → 200", cron.status === 200 && cron.json?.ok === true, `status=${cron.status}`);

  console.log("== 10. Admin auth + RBAC ==");
  check("admin login wrong → 401", (await req("POST", "/api/admin/login", { body: { email: "owner@gearflow.kz", password: "wrong" } })).status === 401);
  const owner = await req("POST", "/api/admin/login", { body: { email: "owner@gearflow.kz", password: process.env.ADMIN_PASSWORD ?? "ChangeMe123!" } });
  check("owner login 200", owner.status === 200, `status=${owner.status}`);
  const oc = (owner.setCookie.match(/gf_admin_session=[^;]+/) ?? [])[0] ?? "";
  const admNoAuth = await req("GET", "/api/admin/bookings");
  check("admin bookings no cookie → 403", admNoAuth.status === 403);
  const admOk = await req("GET", "/api/admin/bookings", { headers: { cookie: oc } });
  check("owner bookings 200", admOk.status === 200 && Array.isArray(admOk.json?.items), `status=${admOk.status}`);
  const funnel = await req("GET", "/api/admin/analytics/funnel", { headers: { cookie: oc } });
  check("owner funnel 200", funnel.status === 200, `status=${funnel.status}`);
  const master = await req("POST", "/api/admin/login", { body: { email: "master@gearflow.kz", password: "Master123!" } });
  const mc = (master.setCookie.match(/gf_admin_session=[^;]+/) ?? [])[0] ?? "";
  check("master login 200", master.status === 200, `status=${master.status}`);
  check("master bookings 200 (scoped)", (await req("GET", "/api/admin/bookings", { headers: { cookie: mc } })).status === 200);
  check("master leads → 403", (await req("GET", "/api/admin/leads", { headers: { cookie: mc } })).status === 403);
  check("master funnel → 403", (await req("GET", "/api/admin/analytics/funnel", { headers: { cookie: mc } })).status === 403);
  // master меняет чужую запись → 403
  const other = (admOk.json?.items ?? []).find((b) => b.masterId === null || b.masterId === undefined);
  if (other) {
    const mPatch = await req("PATCH", "/api/admin/bookings", { headers: { cookie: mc }, body: { id: other.id, status: "done" } });
    check("master чужой booking → 403", mPatch.status === 403, `status=${mPatch.status}`);
  }
  // owner меняет статус → ok; leads/customers/reviews/notifications доступны
  check("owner leads 200", (await req("GET", "/api/admin/leads", { headers: { cookie: oc } })).status === 200);
  check("owner customers 200", (await req("GET", "/api/admin/customers", { headers: { cookie: oc } })).status === 200);
  check("owner services 200", (await req("GET", "/api/admin/services", { headers: { cookie: oc } })).status === 200);
  check("owner reviews 200", (await req("GET", "/api/admin/reviews", { headers: { cookie: oc } })).status === 200);
  check("owner notifications 200", (await req("GET", "/api/admin/notifications", { headers: { cookie: oc } })).status === 200);
  const logout = await req("POST", "/api/admin/logout", { headers: { cookie: oc } });
  check("logout 200", logout.status === 200);

  console.log("== 11. Account OTP ==");
  check("account no session → 401", (await req("GET", "/api/account")).status === 401);
  check("otp unknown phone → 404", (await req("POST", "/api/account/request-code", { body: { phone: "+77019999999" } })).status === 404);
  const otpReq = await req("POST", "/api/account/request-code", { body: { phone: "+77001000000" } });
  check("otp request 200 + devCode", otpReq.status === 200 && !!otpReq.json?.devCode, `status=${otpReq.status}`);
  check("otp wrong code → 401", (await req("POST", "/api/account/verify-code", { body: { phone: "+77001000000", code: "000000" } })).status === 401);
  const otpOk = await req("POST", "/api/account/verify-code", { body: { phone: "+77001000000", code: otpReq.json?.devCode } });
  const ac = (otpOk.setCookie.match(/gf_account_session=[^;]+/) ?? [])[0] ?? "";
  check("otp correct → 200 + session", otpOk.status === 200 && !!ac, `status=${otpOk.status}`);
  const acc = await req("GET", "/api/account", { headers: { cookie: ac } });
  check("account with session → 200", acc.status === 200 && Array.isArray(acc.json?.vehicles), `status=${acc.status}`);

  console.log("== 12. Reviews / analytics / health ==");
  check("review 201", (await req("POST", "/api/reviews", { body: { phone: "+77017776666", rating: 5, text: "Отличный сервис, всё чётко и в срок!" } })).status === 201);
  check("review short → 400", (await req("POST", "/api/reviews", { body: { phone: "+77017776666", rating: 5, text: "ок" } })).status === 400);
  check("analytics bad → 400", (await req("POST", "/api/analytics", { body: { name: "" } })).status === 400);
  check("analytics oversized → 413", (await req("POST", "/api/analytics", { body: { name: "x", payload: { d: "y".repeat(3000) } } })).status === 413);
  check("health 200 db up", (await req("GET", "/api/health")).status === 200);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) console.log("FAILURES:\n - " + failures.join("\n - "));
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("SMOKE CRASH:", e);
  process.exit(2);
});
