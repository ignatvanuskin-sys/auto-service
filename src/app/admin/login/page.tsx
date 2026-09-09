"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  async function submit() {
    setMsg("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error ?? "Ошибка входа");
    router.push("/admin");
  }
  return (
    <div className="mx-auto max-w-sm px-4 pt-16 grid gap-3">
      <h1 className="text-2xl font-extrabold">Вход в админку</h1>
      <input className="input" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn-primary" onClick={submit}>Войти</button>
      {msg && <div className="field-error font-bold">{msg}</div>}
      <p className="text-[13px] opacity-60">RBAC: owner — полный доступ, admin — записи/клиенты/контент, master — только свои записи.</p>
    </div>
  );
}
