import { describe, it, expect } from "vitest";
import {
  buildDaySlotsCapacity,
  parseWorkingHours,
  slotCapacity,
  validateSlotTime,
  defaultWorkingHours,
} from "@/lib/slots";

function mondayNoon(): Date {
  // ближайший понедельник, 12:00 локального времени
  const d = new Date();
  const diff = (8 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(12, 0, 0, 0);
  return d;
}

describe("capacity", () => {
  it("по умолчанию равна числу мастеров (мин. 1)", () => {
    expect(slotCapacity(4)).toBe(4);
    expect(slotCapacity(0)).toBe(1);
  });

  it("SLOT_CAPACITY переопределяет", () => {
    process.env.SLOT_CAPACITY = "2";
    expect(slotCapacity(4)).toBe(2);
    delete process.env.SLOT_CAPACITY;
  });

  it("слот свободен, пока пересечений меньше capacity", () => {
    const day = mondayNoon();
    day.setHours(0, 0, 0, 0);
    const ten = new Date(day);
    ten.setHours(10, 0, 0, 0);
    const busy = [{ start: ten, end: new Date(ten.getTime() + 3600000) }];
    const cap1 = buildDaySlotsCapacity(day, busy, 60, 1);
    expect(cap1.some((s) => s.getHours() === 10)).toBe(false);
    const cap2 = buildDaySlotsCapacity(day, busy, 60, 2);
    expect(cap2.some((s) => s.getHours() === 10)).toBe(true);
  });
});

describe("validateSlotTime", () => {
  it("отклоняет прошлое, воскресенье, вне сетки и вне часов", () => {
    expect(validateSlotTime(new Date(Date.now() - 3600000), 60)).not.toBeNull();
    const sun = new Date();
    const diff = (7 - sun.getDay()) % 7 || 7;
    sun.setDate(sun.getDate() + diff);
    sun.setHours(10, 0, 0, 0);
    expect(validateSlotTime(sun, 60)).toMatch(/воскресенье/i);
    const off = mondayNoon();
    off.setMinutes(30);
    expect(validateSlotTime(off, 60)).toMatch(/начало часа/);
    const night = mondayNoon();
    night.setHours(23, 0, 0, 0);
    expect(validateSlotTime(night, 60)).toMatch(/9:00 до 20:00/);
  });

  it("принимает корректный слот в рабочий день", () => {
    expect(validateSlotTime(mondayNoon(), 60)).toBeNull();
  });
});

describe("parseWorkingHours", () => {
  it("мусор → дефолт, корректный JSON мастера → его часы", () => {
    expect(parseWorkingHours(null)["1"]).toEqual({ open: 9, close: 20 });
    const wh = parseWorkingHours({ "1": { open: 10, close: 18 }, "0": null });
    expect(wh["1"]).toEqual({ open: 10, close: 18 });
    expect(wh["0"]).toBeNull();
    expect(defaultWorkingHours()["0"]).toBeNull();
  });
});
