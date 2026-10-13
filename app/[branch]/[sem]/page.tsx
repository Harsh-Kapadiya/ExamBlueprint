import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import OmrSheet from '@/components/OmrSheet';
import PageHeader from '@/components/PageHeader';
import { loadContent } from '@/lib/content';
import { CATEGORIES, plural, SEMESTERS, yearSpan, type Category } from '@/lib/rules';

type Params = { params: Promise<{ branch: string; sem: string }> };

// Short names for the count pills on each subject
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
  const subjects = catalog.subjects
    .filter((s) => s.branch === b.id && s.semester === n)
    .map((s) => ({ s, mine: items.filter((i) => i.branch === b.id && i.semester === n && i.subject === s.slug) }))
    .sort((x, y) => x.s.name.localeCompare(y.s.name));
  return { b, n, subjects };
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { b, n, subjects } = await find(props);
  const filled = subjects.filter((x) => x.mine.length).length;
  return {
    title: `Semester ${n}, ${b.name}`,
    description: `Semester ${n} ${b.name}, NIT Patna: papers for ${filled} of ${plural(subjects.length, 'subject')} so far. Free, no sign-in.`,
  };
}

export default async function SemesterPage(props: Params) {
  const { b, n, subjects } = await find(props);
  const filled = subjects.filter((x) => x.mine.length);
  const blank = subjects.filter((x) => !x.mine.length);

  return (
    <>
      <PageHeader
        trail={[[`/${b.id}/sem${n}`, `Semester ${n}`]]}
        title={`Semester ${n}`}
        meta={subjects.length ? `${b.name}. Papers for ${filled.length} of ${plural(subjects.length, 'subject')} so far.` : b.name}
      />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:px-6">
        {subjects.length === 0 && (
          <p className="max-w-prose rounded-xl border border-dashed p-6 text-muted-foreground">
            Subjects for semester {n} aren't listed yet.
          </p>
        )}

        {filled.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {filled.map(({ s, mine }) => {
              const papers = mine.filter((i) => i.category === 'pyq');
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
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {papers.length ? `${plural(papers.length, 'paper')}, ${yearSpan(papers)}` : 'No question papers yet'}
                      </span>
                      <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <OmrSheet subject={s} papers={papers} compact />
                        <span className="flex flex-wrap gap-1.5">
                          {counts.map(([c, count]) => (
                            <span key={c} className="rounded-full border px-2.5 py-0.5 text-xs tracking-tight">
                              {SHORT[c]} <span className="tabular-nums text-muted-foreground">{count}</span>
                            </span>
                          ))}
                        </span>
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {blank.length > 0 && (
          <section aria-labelledby="blank-title">
            <h2 id="blank-title" className="text-xl font-semibold tracking-tighter">
              {filled.length ? 'Left blank so far' : 'Every subject is still blank'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Nothing uploaded for these yet. Open one to hand a paper down.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {blank.map(({ s }) => (
                <li key={s.slug}>
                  <Link
                    href={`/${b.id}/sem${n}/${s.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed px-4 text-sm tracking-tight transition-colors hover:border-solid hover:border-foreground/40"
                  >
                    <span aria-hidden className="size-3 rounded-full border-[1.5px] border-foreground/40" />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
