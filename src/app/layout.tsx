import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Монстр Трек — автосервис в Алматы",description:"Ходовая, диагностика, масло, климат и агрегаты. Монстр Трек — сервис, которому доверяют."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
