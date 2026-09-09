import { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticPages = ["", "/services", "/prices", "/booking", "/about", "/team", "/cases", "/reviews", "/faq", "/promotions", "/blog", "/contacts", "/privacy"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() })),
    ...SERVICES.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: new Date() })),
  ];
}
