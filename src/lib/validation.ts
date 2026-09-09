import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(6, "Проверьте номер телефона — не хватает цифр")
  .max(20, "Номер слишком длинный — проверьте формат")
  .regex(/^[+\d][\d\s\-()]{5,19}$/, "Введите номер в формате +7 700 123-45-67");

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.length === 11 && digits.startsWith("7")) return "+" + digits;
  // 10 цифр — domestic-формат без кода страны (8/7): добавляем +7
  if (digits.length === 10) return "+7" + digits;
  return raw.startsWith("+") ? raw : "+" + digits;
}

export const bookingStep1Schema = z.object({
  serviceSlug: z.string().optional(),
  problemText: z.string().max(1000).optional(),
});

export const bookingStep2Schema = z.object({
  make: z.string().min(2, "Укажите марку авто"),
  model: z.string().min(1, "Укажите модель авто"),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  vin: z.string().max(17).optional(),
  mileage: z.coerce.number().int().min(0).max(2000000).optional(),
  partsPreference: z.enum(["original", "analog", "any"]).default("any"),
});

export const bookingStep4Schema = z.object({
  name: z.string().min(2, "Представьтесь, пожалуйста — минимум 2 буквы"),
  phone: phoneSchema,
  channel: z.enum(["telegram", "whatsapp", "sms"]).default("telegram"),
  messengerId: z.string().max(100).optional(),
  agree: z.literal(true, { message: "Нужно согласие на обработку данных" }),
});

export const createBookingSchema = z.object({
  serviceSlug: z.string().optional(),
  problemText: z.string().max(1000).optional(),
  make: z.string().min(2),
  model: z.string().min(1),
  year: z.number().int().optional(),
  vin: z.string().max(17).optional(),
  mileage: z.number().int().optional(),
  slotStart: z.string().datetime({ message: "Выберите дату и время" }),
  masterId: z.string().optional(),
  name: z.string().min(2),
  phone: phoneSchema,
  channel: z.enum(["telegram", "whatsapp", "sms"]).default("telegram"),
  source: z.string().default("site"),
  website: z.string().max(200).optional(), // honeypot: человек оставляет пустым
});

export const leadSchema = z.object({
  source: z.string().default("ai_widget"),
  rawMessage: z.string().min(1).max(2000),
  make: z.string().max(60).optional(),
  model: z.string().max(60).optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
});

export const reviewSchema = z.object({
  phone: phoneSchema,
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10, "Расскажите чуть подробнее — минимум 10 символов").max(2000),
  vehicleInfo: z.string().max(120).optional(),
  serviceName: z.string().max(120).optional(),
});
