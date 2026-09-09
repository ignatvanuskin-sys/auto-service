import { addDays, format, setHours, setMinutes, isBefore, startOfDay } from "date-fns";

export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 20;
export const SLOT_MINUTES = 60;

export type WorkingHours = Record<string, { open: number; close: number } | null>;

/** Рабочие часы по умолчанию: Пн–Сб 9:00–20:00, Вс — выходной */
export function defaultWorkingHours(): WorkingHours {
  const open = { open: WORK_START_HOUR, close: WORK_END_HOUR };
  return { "0": null, "1": open, "2": open, "3": open, "4": open, "5": open, "6": open };
}

/** Разбирает Master.workingHours из БД, при мусоре — дефолт. */
export function parseWorkingHours(json: unknown): WorkingHours {
  const fallback = defaultWorkingHours();
  if (!json || typeof json !== "object") return fallback;
  const out: WorkingHours = { ...fallback };
  for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
    if (v === null) {
      out[k] = null;
      continue;
    }
    if (typeof v === "object" && v !== null) {
      const o = v as Record<string, unknown>;
      if (typeof o.open === "number" && typeof o.close === "number") {
        out[k] = { open: o.open, close: o.close };
      }
    }
  }
  return out;
}

export type BusyRange = { start: Date; end: Date };

function overlaps(aStart: Date, aEnd: Date, b: BusyRange): boolean {
  return aStart < b.end && aEnd > b.start;
}

/**
 * Вместимость слота = число параллельных постов.
 * По умолчанию — число мастеров (мин. 1), переопределяется SLOT_CAPACITY.
 */
export function slotCapacity(mastersCount: number): number {
  const override = Number(process.env.SLOT_CAPACITY ?? "");
  if (Number.isFinite(override) && override > 0) return Math.min(50, Math.floor(override));
  return Math.max(1, mastersCount || 1);
}

export function buildDaySlotsCapacity(
  date: Date,
  busy: BusyRange[],
  durationMin = 60,
  capacity = 1,
  wh: WorkingHours = defaultWorkingHours()
): Date[] {
  const day = new Date(date);
  const hours = wh[String(day.getDay())];
  if (!hours) return [];
  const slots: Date[] = [];
  for (let h = hours.open; h + durationMin / 60 <= hours.close + 1e-9; h++) {
    const slot = setMinutes(setHours(startOfDay(day), h), 0);
    if (isBefore(slot, new Date())) continue; // прошедшие слоты скрываем, а не дизейблим
    const slotEnd = new Date(slot.getTime() + durationMin * 60000);
    const overlapping = busy.filter((b) => overlaps(slot, slotEnd, b)).length;
    if (overlapping < capacity) slots.push(slot);
  }
  return slots;
}

/** Совместимость: capacity = 1 (любое пересечение блокирует слот). */
export function buildDaySlots(date: Date, busy: BusyRange[], durationMin = 60): Date[] {
  return buildDaySlotsCapacity(date, busy, durationMin, 1);
}

/** Серверная проверка произвольного времени: рабочий день, границы часов, минутная сетка. */
export function validateSlotTime(
  slotStart: Date,
  durationMin: number,
  wh: WorkingHours = defaultWorkingHours()
): string | null {
  if (isNaN(slotStart.getTime())) return "Некорректные дата/время";
  if (slotStart < new Date()) return "Выберите будущее время — этот слот уже прошёл";
  const hours = wh[String(slotStart.getDay())];
  if (!hours) return "В воскресенье сервис закрыт — выберите другой день";
  if (slotStart.getMinutes() !== 0 || slotStart.getSeconds() !== 0) {
    return "Запись — ровно на начало часа. Выберите время из календаря.";
  }
  const h = slotStart.getHours();
  if (h < hours.open || h + durationMin / 60 > hours.close + 1e-9) {
    return `Принимаем с ${hours.open}:00 до ${hours.close}:00 — выберите время внутри рабочего дня`;
  }
  return null;
}

export function next14Days(): Date[] {
  const out: Date[] = [];
  const today = startOfDay(new Date());
  for (let i = 0; i < 14; i++) out.push(addDays(today, i));
  return out;
}

export function formatSlot(d: Date): string {
  return format(d, "HH:mm");
}

export function formatDay(d: Date): string {
  return format(d, "dd.MM (EEE)");
}
