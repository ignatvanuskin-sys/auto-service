import { describe, it, expect } from "vitest";
import { buildDaySlots } from "@/lib/slots";
import { normalizePhone } from "@/lib/validation";

describe("slots", () => {
  it("строит только свободные слоты, занятые выкидывает", () => {
    const day = new Date();
    day.setDate(day.getDate() + 1);
    day.setHours(0, 0, 0, 0);
    const ten = new Date(day); ten.setHours(10, 0, 0, 0);
    const busy = [{ start: ten, end: new Date(ten.getTime() + 3600000) }];
    const slots = buildDaySlots(day, busy, 60);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((s) => s.getHours() === 10)).toBe(false);
  });

  it("воскресенье — выходной, слотов нет", () => {
    // ближайшее воскресенье
    const d = new Date();
    const diff = (7 - d.getDay()) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    expect(buildDaySlots(d, [], 60)).toEqual([]);
  });
});

describe("phone", () => {
  it("нормализует 8xxx и 10-значные номера", () => {
    expect(normalizePhone("87001234567")).toBe("+77001234567");
    expect(normalizePhone("9011234567")).toBe("+79011234567");
    expect(normalizePhone("+7 700 123-45-67")).toBe("+77001234567");
    // полный KZ-мобильный (11 цифр) не ломается
    expect(normalizePhone("+77001000000")).toBe("+77001000000");
    expect(normalizePhone("77001000000")).toBe("+77001000000");
  });
});
