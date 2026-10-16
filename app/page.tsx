import Link from 'next/link';
import { Analytics } from "@vercel/analytics/next"
import { ArrowUpRight } from 'lucide-react';
import { Hero } from '@/components/ui/hero-1';
import { Button } from '@/components/ui/button';
import { ContinueLink } from '@/components/Visit';
import { loadContent } from '@/lib/content';
import { handDownUrl, plural, REPO, SEMESTERS } from '@/lib/rules';
import { cn } from '@/lib/utils';

export default function Home() {
  const { catalog, items } = loadContent();
  // ponytail: the hero's semester boxes use the first branch; add a branch switch when a second one exists
  const b = catalog.branches[0];
  const subjects = catalog.subjects.filter((s) => s.branch === b.id);
  const filesOf = (sem: number, slug?: string) => items.filter((i) => i.branch === b.id && i.semester === sem && (!slug || i.subject === slug));
  const withPapers = subjects.filter((s) => filesOf(s.semester, s.slug).length).length;

  return (
    <>
      <Hero
        eyebrow="Made by NIT Patna students"
        eyebrowHref={`https://github.com/${REPO}`}
        title="The paper before the paper."
        subtitle="Your seniors already sat it. Here are their midsem, endsem and supplementary papers, handed down batch to batch. Free, no sign-in."
      >
        <nav aria-labelledby="pick-sem" className="mx-auto max-w-xl">
          <p id="pick-sem" className="mb-3 text-sm font-medium tracking-tight">
            Which semester are you in?
          </p>
          {/* Roll-number boxes, as on an answer sheet */}
          <ol className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {SEMESTERS.map((n) => {
              const listed = subjects.filter((s) => s.semester === n);
              const covered = listed.filter((s) => filesOf(n, s.slug).length).length;
              return (
                <li key={n}>
                  <Link
                    href={`/${b.id}/sem${n}`}
                    aria-label={`Semester ${n}: ${listed.length ? `papers for ${covered} of ${plural(listed.length, 'subject')}` : 'no subjects listed yet'}`}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-md border-2 bg-background text-3xl font-semibold tabular-nums tracking-tighter transition-colors hover:bg-foreground hover:text-background',
                      listed.length ? 'border-foreground' : 'border-dashed border-foreground/25 text-muted-foreground',
                    )}
                  >
                    {n}
                    {covered > 0 && <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-ink" />}
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-sm tracking-tight text-gray-600 dark:text-gray-400">
            {withPapers
              ? `Papers for ${withPapers} of ${plural(subjects.length, 'subject')} so far. Empty means empty: nothing here is made up.`
              : 'Nothing is up yet, and nothing here is made up. Subjects fill in as seniors hand their papers down.'}
          </p>
          <ContinueLink />
        </nav>
      </Hero>

      <section aria-labelledby="sheet-title" className="mx-auto max-w-6xl px-4 pt-16 pb-24 md:px-6">
        <h2 id="sheet-title" className="text-gradient pb-1 text-4xl font-semibold tracking-tighter text-balance md:text-5xl">
          Every subject, on one sheet.
        </h2>
        <p className="mt-3 max-w-prose text-lg tracking-tight text-muted-foreground">
          A filled bubble has papers. A blank one is still waiting for someone to hand it down.
        </p>

        <ol className="mt-10 divide-y rounded-2xl border bg-card">
          {SEMESTERS.map((n) => {
            const listed = subjects.filter((s) => s.semester === n).sort((x, y) => x.name.localeCompare(y.name));
            return (
              <li key={n} className="grid gap-3 p-4 md:grid-cols-[8rem_1fr] md:items-center md:gap-6 md:p-5">
                <Link href={`/${b.id}/sem${n}`} className="w-fit rounded-md text-lg font-semibold tracking-tighter hover:underline hover:underline-offset-4">
                  Semester {n}
                </Link>
                {listed.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {listed.map((s) => {
                      const count = filesOf(n, s.slug).length;
                      return (
                        <li key={s.slug}>
                          <Link
                            href={`/${b.id}/sem${n}/${s.slug}`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm tracking-tight transition-colors hover:border-foreground/40 md:min-h-9"
                          >
                            <span aria-hidden className={cn('size-3 shrink-0 rounded-full', count ? 'bg-ink' : 'border-[1.5px] border-foreground/40')} />
                            {s.name}
                            <span className={cn('tabular-nums', count ? 'text-muted-foreground' : 'sr-only')}>{count ? count : '(blank)'}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Subjects for this semester aren't listed yet.</p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-dashed p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tighter">Sat an exam? Hand the paper down.</h2>
            <p className="mt-2 max-w-prose text-muted-foreground">
              pyq only posts real NIT Patna papers, so a subject stays blank until someone shares one. Your copy could get a junior through the night before.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2">
            <a href={handDownUrl()} target="_blank" rel="noopener">
              Hand a paper down
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
