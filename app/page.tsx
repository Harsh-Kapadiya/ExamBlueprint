import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Hero } from '@/components/ui/hero-1';
import { loadContent } from '@/lib/content';
import { plural, SEMESTERS } from '@/lib/rules';
import { cn } from '@/lib/utils';

export default function Home() {
  const { catalog, items } = loadContent();
  return (
    <>
      <Hero
        eyebrow="NIT Patna, Computer Science"
        eyebrowHref="#semesters"
        title="Past papers and notes, sorted by semester"
        subtitle="Previous year question papers and study material for every subject. Free to read and download, no sign-in."
        ctaLabel="Choose your semester"
        ctaHref="#semesters"
      />

      <section id="semesters" aria-labelledby="semesters-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-8 pb-24 md:px-6">
        <h2 id="semesters-title" className="text-gradient pb-1 text-center text-4xl font-semibold tracking-tighter md:text-5xl">
          Choose your semester
        </h2>
        {catalog.branches.map((b) => (
          <div key={b.id} className="mt-10">
            <h3 className="mb-5 text-center tracking-tight text-muted-foreground">{b.name}</h3>
            <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {SEMESTERS.map((n) => {
                const subjects = catalog.subjects.filter((s) => s.branch === b.id && s.semester === n).length;
                const files = items.filter((i) => i.branch === b.id && i.semester === n).length;
                return (
                  <li key={n}>
                    <Link
                      href={`/${b.id}/sem${n}`}
                      className={cn(
                        'group relative isolate flex aspect-[4/5] flex-col md:aspect-[6/5] justify-between overflow-hidden rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30 md:p-5',
                        !subjects && 'opacity-55',
                      )}
                    >
                      {/* The hero's grid, drawn on the card you point at */}
                      <span
                        aria-hidden
                        className="grid-paper absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [mask-image:radial-gradient(ellipse_90%_70%_at_50%_0%,#000_50%,transparent_100%)] group-hover:opacity-100"
                      />
                      <span className="flex items-center justify-between text-sm tracking-tight text-muted-foreground">
                        Semester
                        <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <span className="text-gradient pb-1 text-7xl leading-none font-semibold tracking-tighter tabular-nums md:text-8xl">{n}</span>
                      <span className="text-sm tracking-tight text-muted-foreground">
                        {subjects ? (
                          <>
                            {plural(subjects, 'subject')}
                            <br />
                            {files ? plural(files, 'file') : 'No files yet'}
                          </>
                        ) : (
                          'Coming soon'
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>
    </>
  );
}
