import Link from "next/link";
export const metadata = { title: "Блог — когда менять масло, признаки поломок | GearFlow", description: "Полезные материалы: регламент ТО, признаки неисправности подвески, подготовка к дальней поездке.", alternates: { canonical: "/blog" } };
const POSTS = [
  { slug: "kogda-menyat-maslo", t: "Когда менять масло: 7 000 или 10 000 км?", d: "Городские пробки старят масло быстрее трассы. Разбираем моточасы, допуски и почему дилерский интервал — не догма." },
  { slug: "priznaki-polomki-hodovoy", t: "5 признаков, что подвеске нужен ремонт", d: "Стук на кочках, увод в сторону, неравномерный износ шин — что проверить до визита." },
  { slug: "podgotovka-k-dalney-poezdke", t: "Чек-лист перед дальней поездкой: 30 пунктов", d: "Тормоза, охлаждение, АКБ, запаска — что смотрим на диагностике перед трассой." },
];
export default function Blog() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 grid gap-4">
      <h1 className="text-3xl font-extrabold">Блог — полезно, без воды</h1>
      {POSTS.map((p) => (
        <Link key={p.slug} href={`/blog/${p.slug}`} className="card p-5 hover:shadow-lg"><div className="font-extrabold">{p.t}</div><p className="text-sm opacity-70">{p.d}</p></Link>
      ))}
    </div>
  );
}
