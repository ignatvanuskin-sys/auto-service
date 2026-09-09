import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SERVICES } from "../src/lib/services-data";

const db = new PrismaClient();

const FIRST = ["Айдар", "Марат", "Ольга", "Дмитрий", "Ерлан", "Наталья", "Тимур", "Асель", "Игорь", "Виктор"];
const MAKES: Array<[string, string[]]> = [
  ["Toyota", ["Camry", "Corolla", "RAV4", "Land Cruiser"]],
  ["Hyundai", ["Tucson", "Sonata", "Creta"]],
  ["Kia", ["Rio", "Sportage", "Ceed"]],
  ["Nissan", ["Qashqai", "X-Trail"]],
  ["Skoda", ["Octavia", "Kodiaq"]],
  ["BMW", ["X3", "320i"]],
];

async function main() {
  console.log("Seeding GearFlow Auto Service demo data…");

  for (const s of SERVICES) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: { priceMin: s.priceMin, priceMax: s.priceMax, durationMin: s.durationMin },
      create: {
        slug: s.slug, category: s.category, name: s.name, shortDesc: s.shortDesc,
        description: s.description, priceMin: s.priceMin, priceMax: s.priceMax,
        currency: s.currency, durationMin: s.durationMin, warrantyText: s.warrantyText,
      },
    });
  }

  const masters = [
    { name: "Асхат К.", specialties: ["двигатель", "ГРМ"], workingHours: { "1": { open: 9, close: 20 } } },
    { name: "Дмитрий С.", specialties: ["ходовая", "тормоза"], workingHours: { "1": { open: 9, close: 20 } } },
    { name: "Ерлан М.", specialties: ["электрика"], workingHours: { "1": { open: 9, close: 20 } } },
    { name: "Игорь В.", specialties: ["кузовной", "покраска"], workingHours: { "1": { open: 9, close: 20 } } },
  ];
  for (const m of masters) {
    const exists = await db.master.findFirst({ where: { name: m.name } });
    if (!exists) await db.master.create({ data: { name: m.name, specialties: m.specialties, workingHours: m.workingHours } });
  }

  const email = process.env.ADMIN_EMAIL ?? "owner@gearflow.kz";
  const pw = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await bcrypt.hash(pw, 10), role: "owner" },
  });

  // Демо-аккаунт мастера для проверки RBAC (только dev/staging — в production смените/удалите).
  const firstMaster = await db.master.findFirst();
  if (firstMaster) {
    await db.adminUser.upsert({
      where: { email: "master@gearflow.kz" },
      update: { masterId: firstMaster.id },
      create: {
        email: "master@gearflow.kz",
        passwordHash: await bcrypt.hash("Master123!", 10),
        role: "master",
        masterId: firstMaster.id,
      },
    });
  }

  const services = await db.service.findMany();
  const allMasters = await db.master.findMany();
  for (let i = 0; i < 40; i++) {
    const [make, models] = MAKES[i % MAKES.length];
    const model = models[i % models.length];
    // Валидный KZ-мобильный: 11 цифр (+7 700 XXX-XX-XX)
    const phone = `+7700${String(1000000 + i)}`;
    const customer = await db.customer.upsert({
      where: { phone },
      update: {},
      create: {
        phone, name: `${FIRST[i % FIRST.length]} (демо)`,
        preferredChannel: ["telegram", "whatsapp", "sms"][i % 3],
        status: i % 7 === 0 ? "dormant" : "active",
      },
    });
    const vehicle = await db.vehicle.create({
      data: {
        customerId: customer.id, make, model, year: 2014 + (i % 10),
        mileage: 40000 + i * 5000,
        lastServiceAt: new Date(Date.now() - (i % 200) * 86400000),
        nextServiceDueAt: new Date(Date.now() + ((i * 7) % 120) * 86400000),
      },
    });
    const svc = services[i % services.length];
    const slotStart = new Date(Date.now() + ((i % 14) - 5) * 86400000 + (9 + (i % 9)) * 3600000);
    await db.booking.create({
      data: {
        customerId: customer.id, vehicleId: vehicle.id, serviceId: svc.id,
        masterId: allMasters[i % allMasters.length]?.id,
        slotStart, slotEnd: new Date(slotStart.getTime() + svc.durationMin * 60000),
        status: ["pending", "confirmed", "done", "done", "confirmed"][i % 5],
        source: ["site", "ai_widget", "telegram"][i % 3],
        problemText: i % 3 === 0 ? "Стук спереди на кочках" : undefined,
      },
    }).catch(() => {});
    if (i % 4 === 0) {
      await db.review.create({
        data: {
          customerId: customer.id, rating: 4 + (i % 2),
          text: `Делали ${svc.name} на ${make} ${model}. Смету назвали заранее и уложились в неё. По времени заняло как и говорили.`,
          vehicleInfo: `${make} ${model}`, serviceName: svc.name, published: i % 8 === 0,
        },
      });
    }
  }
  console.log("Seed done.");
}

main().finally(() => db.$disconnect());
