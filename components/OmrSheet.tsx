import { anchor, EXAMS, handDownUrl, sheetYears, type Exam, type Item, type Subject } from '@/lib/rules';
import { cn } from '@/lib/utils';

const ROWS: [Exam, string][] = [
  ['midsem', 'Mid'],
  ['endsem', 'End'],
  ['supplementary', 'Supp'],
];

/**
 * The coverage sheet: years across, exams down, one OMR bubble per paper. Built only from files
 * that exist. A filled bubble opens the paper; a blank one asks for it ("hand it down").
 * `compact` is the small, non-interactive version for subject cards.
 */
export default function OmrSheet({ subject, papers, compact }: { subject: Subject; papers: Item[]; compact?: boolean }) {
  const years = sheetYears(papers);
  // ponytail: Supp row only once a supplementary paper exists; most subjects never have one
  const rows = ROWS.filter(([e]) => e !== 'supplementary' || papers.some((p) => p.exam === e));
  const at = (y: number, e: Exam) => papers.find((p) => p.year === y && p.exam === e);
  const filled = rows.reduce((n, [e]) => n + years.filter((y) => at(y, e)).length, 0);

  if (compact)
    return (
      <span role="img" aria-label={`${filled} of ${years.length * rows.length} papers since ${years[0]}`} className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${years.length}, 0.5rem)` }}>
        {rows.flatMap(([e]) =>
          years.map((y) => <span key={`${e}${y}`} className={cn('size-2 rounded-full', at(y, e) ? 'bg-ink' : 'border border-foreground/30')} />),
        )}
      </span>
    );

  return (
    <figure className="mt-8">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <table className="border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Question papers for {subject.name} by year. Filled bubbles are uploaded.</caption>
          <thead>
            <tr>
              <td />
              {years.map((y) => (
                <th key={y} scope="col" className="px-1 pb-1 text-center text-xs font-medium tabular-nums text-muted-foreground">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([e, short]) => (
              <tr key={e}>
                <th scope="row" className="pr-3 text-left text-xs font-medium tracking-tight text-muted-foreground">
                  {short}
                </th>
                {years.map((y) => {
                  const p = at(y, e);
                  const name = `${EXAMS[e]} ${y}`;
                  return (
                    <td key={y} className="text-center">
                      <a
                        href={p ? `#${anchor(p)}` : handDownUrl(subject.name, subject.semester, name)}
                        {...(p ? {} : { target: '_blank', rel: 'noopener' })}
                        aria-label={p ? `${name}: open` : `${name}: not uploaded yet. Hand it down`}
                        title={p ? `${name}` : `${name}: not uploaded yet`}
                        className="group inline-flex size-11 items-center justify-center rounded-full"
                      >
                        <span
                          className={cn(
                            'size-7 rounded-full transition-colors',
                            p ? 'bg-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.25)] group-hover:opacity-85' : 'border-2 border-foreground/25 group-hover:border-ink',
                          )}
                        />
                      </a>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-full bg-ink" /> Uploaded, tap to open
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-full border-[1.5px] border-foreground/40" /> Not uploaded yet, tap to hand it down
        </span>
      </figcaption>
    </figure>
  );
}
