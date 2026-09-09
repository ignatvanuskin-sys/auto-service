import Link from "next/link";
import { notFound } from "next/navigation";
const POSTS: Record<string, { t: string; d: string; body: string[] }> = {
  "kogda-menyat-maslo": {
    t: "Когда менять масло: 7 000 или 10 000 км?",
    d: "Городской цикл, моточасы и допуски масла.",
    body: ["Если ездите в основном по городу с пробками — ориентируйтесь на 7 000–8 000 км или 250 моточасов. Трасса без пробок — до 10 000 км.", "Смотрите допуск производителя, а не бренд. «Универсальное» масло без допуска — риск для фазовращателей и турбины.", "На ТО мы фиксируем пробег и выставляем дату следующего визита — напомним сами в мессенджер."],
  },
  "priznaki-polomki-hodovoy": {
    t: "5 признаков, что подвеске нужен ремонт",
    d: "Стук, увод, износ шин — что проверить.",
    body: ["Стук на мелких кочках — стойки стабилизатора или втулки. Гул с ростом скорости — ступичный подшипник.", "Увод в сторону и неравномерный износ шин — развал-схождение после проверки рычагов.", "Не тяните: разбитая шаровая на скорости — это уже безопасность, а не комфорт. Диагностика ходовой — 5 000 ₸, при ремонте — бесплатно."],
  },
  "podgotovka-k-dalney-poezdke": {
    t: "Чек-лист перед дальней поездкой: 30 пунктов",
    d: "Что проверяем перед трассой.",
    body: ["Тормоза (колодки, диски, жидкость), охлаждение (антифриз, патрубки, вентилятор), масло и его уровень.", "АКБ и генератор, свет, кондиционер, шины + запаска, давление.", "Диагностика перед поездкой — 7 000–12 000 ₸, 60 минут, письменный чек-лист на руки."],
  },
};
export function generateStaticParams() { return Object.keys(POSTS).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POSTS[slug];
  if (!p) return {};
  return {
    title: `${p.t} | GearFlow`,
    description: p.d,
    alternates: { canonical: `/blog/${slug}` },
  };
}
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POSTS[slug];
  if (!p) return notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 grid gap-3">
      <h1 className="text-3xl font-extrabold">{p.t}</h1>
      <p className="opacity-70">{p.d}</p>
      {p.body.map((b, i) => <p key={i}>{b}</p>)}
      <Link href="/booking?service=diagnostika-pered-poezdkoy" className="btn-primary w-fit mt-2">Записаться на диагностику</Link>
    </div>
  );
}
