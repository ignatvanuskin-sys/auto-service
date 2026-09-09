import crypto from "crypto";
import { cookies } from "next/headers";

const ACCOUNT_COOKIE = "gf_account_session";

type AccountPayload = { phone: string; exp: number };

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me-please-32chars";
}

function sign(p: AccountPayload): string {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export async function createAccountSession(phone: string) {
  const token = sign({ phone, exp: Date.now() + 7 * 86400000 });
  const jar = await cookies();
  jar.set(ACCOUNT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getAccountPhone(): Promise<string | null> {
  try {
    const jar = await cookies();
    const token = jar.get(ACCOUNT_COOKIE)?.value;
    if (!token) return null;
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as AccountPayload;
    if (p.exp < Date.now() || !p.phone) return null;
    return p.phone;
  } catch {
    return null;
  }
}

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function hashOtp(code: string): Promise<string> {
  return crypto.createHash("sha256").update(code).digest("hex");
}
