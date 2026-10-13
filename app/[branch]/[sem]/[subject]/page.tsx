import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Download, Eye, FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Preview from '@/components/Preview';
import { buttonVariants } from '@/components/ui/button';
import { loadContent } from '@/lib/content';
import { anchor, CATEGORIES, EXAMS, fmtSize, type Category, type Item } from '@/lib/rules';
import { cn } from '@/lib/utils';

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

// Row actions: 44px tall on phones (NFR-UX-01), compact on desktop
const action = cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-11 gap-1.5 md:h-9 [&_svg]:size-4');

function Row({ item, label }: { item: Item; label: string }) {
  const href = `/${item.path}`; // Content/ is published at /Content/ by the build
  return (
    <li id={anchor(item)} className="lazy-row flex flex-wrap items-center gap-x-1 px-3 py-2 md:px-4">
      <span className="mr-auto flex items-center gap-3 py-2 pr-2">
        <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <span>
          {label}
          <span className="ml-2 text-sm text-muted-foreground tabular-nums">{fmtSize(item.bytes)}</span>
        </span>
      </span>
      <span className="flex">
        <a className={action} href={href} target="_blank" rel="noopener">
          <Eye aria-hidden />
          View
        </a>
        <a className={action} href={href} download>
          <Download aria-hidden />
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
  const present = (Object.keys(CATEGORIES) as Category[]).filter((c) => mine.some((i) => i.category === c));

  return (
    <>
      <PageHeader
        trail={[[semPath, `Semester ${s.semester}`], [`${semPath}/${s.slug}`, s.name]]}
        title={s.name}
        meta={[s.code, `Semester ${s.semester}`, b.name].filter(Boolean).join(', ')}
      >
        {present.length > 1 && (
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
            {present.map((c) => (
              <a key={c} href={`#cat-${c}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-full')}>
                {CATEGORIES[c]}
              </a>
            ))}
          </nav>
        )}
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 md:px-6">
        {mine.length === 0 && (
          <p className="max-w-prose rounded-xl border border-dashed p-6 text-muted-foreground">
            Nothing has been uploaded for this subject yet. Have a paper? Send it to your class representative, or tell us on GitHub.
          </p>
        )}

        {present.map((c) => {
          const list = mine.filter((i) => i.category === c);
          const years = [...new Set(list.map((i) => i.year))];
          return (
            <section key={c} id={`cat-${c}`} aria-labelledby={`cat-${c}-title`} className="scroll-mt-20">
              <h2 id={`cat-${c}-title`} className="text-2xl font-semibold tracking-tighter md:text-3xl">
                {CATEGORIES[c]} <span className="font-normal text-muted-foreground tabular-nums">{list.length}</span>
              </h2>
              {c === 'pyq' ? (
                <div className="mt-6 space-y-6">
                  {years.map((y) => (
                    <div key={y} className="grid gap-3 md:grid-cols-[8rem_1fr] md:gap-6">
                      {/* The year in the hero's gradient type */}
                      <h3 className="text-gradient pb-1 text-4xl leading-none font-semibold tracking-tighter tabular-nums md:pt-3 md:text-5xl">{y}</h3>
                      <ul className="divide-y rounded-xl border bg-card">
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
                <ul className="mt-6 divide-y rounded-xl border bg-card">
                  {list.map((i) => (
                    <Row key={i.file} item={i} label={i.title} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
