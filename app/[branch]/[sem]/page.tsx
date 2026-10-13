import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { loadContent } from '@/lib/content';
import { CATEGORIES, plural, SEMESTERS, type Category } from '@/lib/rules';

type Params = { params: Promise<{ branch: string; sem: string }> };

// Short names for the small count pills on each subject
const SHORT: Record<Category, string> = { pyq: 'Papers', notes: 'Notes', slides: 'Slides', assignments: 'Assignments', lab: 'Lab', syllabus: 'Syllabus' };

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
  const files = items.filter((i) => i.branch === b.id && i.semester === n).length;

  return (
    <>
      <PageHeader
        trail={[[`/${b.id}/sem${n}`, `Semester ${n}`]]}
        title={`Semester ${n}`}
        meta={subjects.length ? `${b.name}. ${plural(subjects.length, 'subject')}, ${plural(files, 'file')}.` : b.name}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {subjects.length === 0 ? (
          <p className="max-w-prose rounded-xl border border-dashed p-6 text-muted-foreground">
            No subjects have been added for this semester yet. Admins can add them from the admin page.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {subjects.map((s) => {
              const mine = items.filter((i) => i.branch === b.id && i.semester === n && i.subject === s.slug);
              const counts = (Object.keys(CATEGORIES) as Category[])
                .map((c) => [c, mine.filter((i) => i.category === c).length] as const)
                .filter(([, count]) => count > 0);
              return (
                <li key={s.slug} className="lazy-row">
                  <Link
                    href={`/${b.id}/sem${n}/${s.slug}`}
                    className="group flex h-full items-center justify-between gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30"
                  >
                    <span className="min-w-0">
                      <span className="block text-lg font-semibold tracking-tight">{s.name}</span>
                      {s.code && <span className="block text-sm text-muted-foreground tabular-nums">{s.code}</span>}
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {counts.length ? (
                          counts.map(([c, count]) => (
                            <span key={c} className="rounded-full border px-2.5 py-0.5 text-xs tracking-tight">
                              {SHORT[c]} <span className="tabular-nums text-muted-foreground">{count}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No material yet</span>
                        )}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
