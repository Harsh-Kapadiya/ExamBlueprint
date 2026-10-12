import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Crumbs from '@/components/Crumbs';
import { loadContent } from '@/lib/content';
import { CATEGORIES, SEMESTERS, type Category } from '@/lib/rules';

type Params = { params: Promise<{ branch: string; sem: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  loadContent().catalog.branches.flatMap((b) => SEMESTERS.map((n) => ({ branch: b.id, sem: `sem${n}` })));

async function find({ params }: Params) {
  const { branch, sem } = await params;
  const { catalog, items } = loadContent();
  const b = catalog.branches.find((x) => x.id === branch);
  const n = Number(sem.slice(3));
  if (!b || sem !== `sem${n}` || !SEMESTERS.includes(n)) notFound();
  return { b, n, catalog, items };
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { b, n } = await find(props);
  return { title: `Semester ${n}, ${b.name}`, description: `Question papers and notes for semester ${n} ${b.name} at NIT Patna.` };
}

export default async function SemesterPage(props: Params) {
  const { b, n, catalog, items } = await find(props);
  const subjects = catalog.subjects.filter((s) => s.branch === b.id && s.semester === n).sort((x, y) => x.name.localeCompare(y.name));

  return (
    <>
      <Crumbs trail={[[`/${b.id}/sem${n}`, `Semester ${n}`]]} />
      <h1 className="mt-6 font-serif text-4xl font-semibold">Semester {n}</h1>
      <p className="mt-2 text-ink-soft">{b.name}</p>

      {subjects.length === 0 ? (
        <p className="mt-10 max-w-prose border-l-2 border-margin pl-4">
          No subjects have been added for this semester yet. Admins can add them from the admin page.
        </p>
      ) : (
        <ul className="mt-10 border-t border-rule">
          {subjects.map((s) => {
            const mine = items.filter((i) => i.branch === b.id && i.semester === n && i.subject === s.slug);
            const counts = (Object.keys(CATEGORIES) as Category[])
              .map((c) => [CATEGORIES[c], mine.filter((i) => i.category === c).length] as const)
              .filter(([, count]) => count > 0);
            return (
              <li key={s.slug} className="lazy-row border-b border-rule">
                <Link href={`/${b.id}/sem${n}/${s.slug}`} className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                  <span>
                    <span className="font-serif text-xl font-semibold group-hover:text-margin">{s.name}</span>
                    {s.code && <span className="ml-3 text-sm text-ink-soft tabular-nums">{s.code}</span>}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {counts.length ? counts.map(([label, count]) => `${label}: ${count}`).join(', ') : 'No material yet'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
