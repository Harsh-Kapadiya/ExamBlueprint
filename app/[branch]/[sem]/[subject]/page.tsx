import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Crumbs from '@/components/Crumbs';
import Preview from '@/components/Preview';
import { loadContent } from '@/lib/content';
import { anchor, CATEGORIES, EXAMS, fmtSize, type Category, type Item } from '@/lib/rules';

type Params = { params: Promise<{ branch: string; sem: string; subject: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  loadContent().catalog.subjects.map((s) => ({ branch: s.branch, sem: `sem${s.semester}`, subject: s.slug }));

async function find({ params }: Params) {
  const { branch, sem, subject } = await params;
  const { catalog, items } = loadContent();
  const s = catalog.subjects.find((x) => x.branch === branch && `sem${x.semester}` === sem && x.slug === subject);
  if (!s) notFound();
  const b = catalog.branches.find((x) => x.id === branch)!;
  return { s, b, mine: items.filter((i) => i.branch === branch && i.semester === s.semester && i.subject === subject) };
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { s, b } = await find(props);
  return {
    title: `${s.name} papers and notes, semester ${s.semester}`,
    description: `Previous year question papers and notes for ${s.name} (semester ${s.semester}, ${b.name}) at NIT Patna.`,
  };
}

const action = 'inline-flex min-h-11 items-center px-2 underline decoration-rule underline-offset-4 hover:text-margin hover:decoration-margin';

function Row({ item, label }: { item: Item; label: string }) {
  const href = `/${item.path}`; // Content/ is published at /Content/ by the build
  return (
    <li id={anchor(item)} className="lazy-row flex flex-wrap items-center gap-x-1 border-rule py-2 not-last:border-b">
      <span className="mr-auto py-2 pr-4">
        {label}
        <span className="ml-3 text-sm text-ink-soft tabular-nums">{fmtSize(item.bytes)}</span>
      </span>
      <span className="ml-auto flex">
        <a className={action} href={href} target="_blank" rel="noopener">
          View
        </a>
        <a className={action} href={href} download>
          Download
        </a>
      </span>
      <Preview src={href} title={item.title} className={action} />
    </li>
  );
}

export default async function SubjectPage(props: Params) {
  const { s, b, mine } = await find(props);
  const semPath = `/${b.id}/sem${s.semester}`;

  return (
    <>
      <Crumbs trail={[[semPath, `Semester ${s.semester}`], [`${semPath}/${s.slug}`, s.name]]} />
      <h1 className="mt-6 font-serif text-4xl font-semibold text-balance">{s.name}</h1>
      <p className="mt-2 text-ink-soft">{[s.code, `Semester ${s.semester}`, b.name].filter(Boolean).join(', ')}</p>

      {mine.length === 0 && (
        <p className="mt-10 max-w-prose border-l-2 border-margin pl-4">
          Nothing has been uploaded for this subject yet. Have a paper? Send it to your class representative or to us on GitHub.
        </p>
      )}

      {(Object.keys(CATEGORIES) as Category[]).map((c) => {
        const list = mine.filter((i) => i.category === c);
        if (!list.length) return null;
        const years = [...new Set(list.map((i) => i.year))];
        return (
          <section key={c} aria-labelledby={`cat-${c}`} className="mt-12">
            <h2 id={`cat-${c}`} className="font-serif text-2xl font-semibold">
              {CATEGORIES[c]}
            </h2>
            {c === 'pyq' ? (
              <div className="mt-4 border-t border-rule">
                {/* The year sits in the margin, like a question number */}
                {years.map((y) => (
                  <div key={y} className="grid border-b border-rule md:grid-cols-[4.5rem_1fr]">
                    <h3 className="pt-3 font-serif text-lg font-semibold text-margin tabular-nums md:pt-4">{y}</h3>
                    <ul>
                      {list
                        .filter((i) => i.year === y)
                        .map((i) => (
                          <Row key={i.file} item={i} label={`${EXAMS[i.exam!]}${i.n! > 1 ? `, paper ${i.n}` : ''}`} />
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mt-4 border-y border-rule">
                {list.map((i) => (
                  <Row key={i.file} item={i} label={i.title} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
