import Link from 'next/link';
import { loadContent } from '@/lib/content';
import { plural, SEMESTERS } from '@/lib/rules';

export default function Home() {
  const { catalog, items } = loadContent();
  return (
    <>
      <h1 className="max-w-xl pt-6 font-serif text-4xl leading-tight font-semibold text-balance sm:text-5xl">
        Question papers and notes, sorted by semester.
      </h1>
      <p className="mt-4 max-w-prose text-lg text-ink-soft">Pick your semester. Everything opens in your browser, no sign-in needed.</p>

      {catalog.branches.map((b) => (
        <section key={b.id} aria-labelledby={`branch-${b.id}`} className="mt-12">
          <h2 id={`branch-${b.id}`} className="mb-4 text-ink-soft">
            {b.name}
          </h2>
          {/* Semesters as the roll-number boxes of an answer sheet */}
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SEMESTERS.map((n) => {
              const subjects = catalog.subjects.filter((s) => s.branch === b.id && s.semester === n).length;
              const files = items.filter((i) => i.branch === b.id && i.semester === n).length;
              return (
                <li key={n}>
                  <Link
                    href={`/${b.id}/sem${n}`}
                    className={`flex aspect-[4/5] flex-col justify-between border-[1.5px] p-3 transition-colors hover:border-margin hover:text-margin ${
                      files ? 'border-ink bg-sheet' : 'border-rule text-ink-soft'
                    }`}
                  >
                    <span className="text-sm">Semester</span>
                    <span className="font-serif text-7xl leading-none font-semibold tabular-nums">{n}</span>
                    <span className="text-sm text-ink-soft">
                      {plural(files, 'file')}
                      <br />
                      {plural(subjects, 'subject')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}
