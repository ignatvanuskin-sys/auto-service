import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const SESSION_COOKIE = "gf_admin_session";

type SessionPayload = { adminId: string; role: string; exp: number };

function sign(payload: SessionPayload): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me-please-32chars";
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me-please-32chars";
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    // сравнение за константное время — защита от timing-атак на подпись
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createAdminSession(adminId: string, role: string) {
  const token = sign({ adminId, role, exp: Date.now() + 1000 * 60 * 60 * 12 });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 43200,
    secure: process.env.NODE_ENV === "production", // в prod — только по HTTPS
  });
}

export function warnOnDefaultSecrets() {
  if (process.env.NODE_ENV !== "production") return;
  const bad: string[] = [];
  if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) bad.push("ADMIN_SESSION_SECRET");
  if (!process.env.CRON_SECRET) bad.push("CRON_SECRET");
  if ((process.env.ADMIN_PASSWORD ?? "") === "ChangeMe123!") bad.push("ADMIN_PASSWORD (дефолтный!)");
  if (bad.length) console.error(`[security] ВНИМАНИЕ: не заданы/дефолтные секреты в production: ${bad.join(", ")}`);
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

export async function requireRole(roles: string[]): Promise<SessionPayload> {
  const s = await getAdminSession();
  if (!s || !roles.includes(s.role)) {
    const err = new Error("FORBIDDEN") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  return s;
}

export async function ensureSeedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "owner@gearflow.kz";
  const existing = await db.adminUser.findUnique({ where: { email } }).catch(() => null);
  if (existing) return existing;
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hashPassword(password);
  return db.adminUser.create({ data: { email, passwordHash, role: "owner" } });
}
