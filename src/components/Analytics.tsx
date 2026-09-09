"use client";

import { useEffect } from "react";

/** ВАЖНО: в аналитику никогда не отправляем PII (телефоны, имена, VIN). Только page/label/step. */
export function Analytics({ page, name = "page_view" }: { page: string; name?: string }) {
  useEffect(() => {
    track(name, { page });
    // GA4 через gtag (если задан NEXT_PUBLIC_GA4_MEASUREMENT_ID; иначе — тихо ничего)
    const gId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    if (gId && typeof window !== "undefined") {
      ((window as unknown as { dataLayer?: unknown[] }).dataLayer ??= []).push({ event: name, page });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  return null;
}

/**
 * Делегированный трекинг кликов: элементы с data-track="phone_click|messenger_click|cta_click".
 * Один слушатель на документ — не требует client-компонентов в шапке/футере.
 */
export function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest?.("[data-track]");
      if (!el) return;
      const name = el.getAttribute("data-track") ?? "cta_click";
      const label = el.getAttribute("data-label") ?? window.location.pathname;
      track(name, { label, page: window.location.pathname });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

export function track(name: string, payload?: Record<string, unknown>) {
  try {
    const sid = document.cookie.match(/gf_sid=([^;]+)/)?.[1] ?? Math.random().toString(36).slice(2);
    document.cookie = `gf_sid=${sid}; path=/; max-age=31536000`;
    fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, sessionId: sid, payload: payload ?? {} }),
    }).catch(() => {});
  } catch {
    // аналитика не должна ронять сайт
  }
}
