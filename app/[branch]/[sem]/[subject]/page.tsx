import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Download, Eye, FileText } from 'lucide-react';
import OmrSheet from '@/components/OmrSheet';
import PageHeader from '@/components/PageHeader';
import Preview from '@/components/Preview';
import ShareButton from '@/components/ShareButton';
import { RememberVisit } from '@/components/Visit';
import { Button, buttonVariants } from '@/components/ui/button';
import { loadContent } from '@/lib/content';
import { anchor, CATEGORIES, downloadName, EXAMS, fmtSize, handDownUrl, plural, yearSpan, type Category, type Item } from '@/lib/rules';
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

/** "5 papers, 2022 to 2024, 2 notes" */
function summary(mine: Item[]) {
  const papers = mine.filter((i) => i.category === 'pyq');
  const rest = mine.length - papers.length;
  return [papers.length && `${plural(papers.length, 'paper')}, ${yearSpan(papers)}`, rest && `${rest} more file${rest === 1 ? '' : 's'}`].filter(Boolean).join(', plus ');
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { s, mine } = await find(props);
  // Honest link previews in the class group: what is actually inside
  const description = mine.length ? `${summary(mine)}. Free, no sign-in.` : `No papers for ${s.name} yet. Sat this exam? Hand yours down.`;
  return { title: `${s.name}, semester ${s.semester}`, description, openGraph: { title: `${s.name}: NIT Patna papers`, description } };
}

// Row actions: 44px tall on phones (NFR-UX-01), compact on desktop
const action = cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-11 gap-1.5 px-2.5 md:h-9 md:px-3 [&_svg]:size-4');

function Row({ item, label, subject }: { item: Item; label: string; subject: string }) {
  const href = `/${item.path}`; // Content/ is published at /Content/ by the build
  return (
    <li id={anchor(item)} className="lazy-row flex scroll-mt-24 flex-wrap items-center gap-x-1 px-3 py-2 md:px-4">
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
        <a className={action} href={href} download={downloadName(item)}>
          <Download aria-hidden />
          Download
        </a>
        <ShareButton className={action} path={`${subjectPath(item)}#${anchor(item)}`} title={`${subject}, ${item.title}`} />
      </span>
      <Preview src={href} title={item.title} className={action} />
    </li>
  );
}
const subjectPath = (i: Item) => `/${i.branch}/sem${i.semester}/${i.subject}`;

export default async function SubjectPage(props: Params) {
  const { s, b, mine } = await find(props);
  const semPath = `/${b.id}/sem${s.semester}`;
  const path = `${semPath}/${s.slug}`;
  const papers = mine.filter((i) => i.category === 'pyq');
  const present = (Object.keys(CATEGORIES) as Category[]).filter((c) => mine.some((i) => i.category === c));

  return (
    <>
      <RememberVisit href={path} name={s.name} semester={s.semester} />
      <PageHeader
        trail={[[semPath, `Semester ${s.semester}`], [path, s.name]]}
        title={s.name}
        meta={`${[s.code, `Semester ${s.semester}`].filter(Boolean).join(', ')}. ${mine.length ? `${summary(mine)}.` : 'Left blank so far.'}`}
      >
        <OmrSheet subject={s} papers={papers} />
        <div className="mt-6 flex flex-wrap gap-2">
          {present.length > 1 &&
            present.map((c) => (
              <a key={c} href={`#cat-${c}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-11 rounded-full md:h-9')}>
                {CATEGORIES[c]}
              </a>
            ))}
          {mine.length > 0 && (
            <ShareButton className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-11 gap-1.5 rounded-full md:h-9 [&_svg]:size-4')} path={path} title={`${s.name} papers`} label="Share this subject" />
          )}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 md:px-6">
        {mine.length === 0 && (
          <div className="max-w-2xl rounded-2xl border border-dashed p-6 md:p-8">
            <h2 className="text-gradient pb-1 text-3xl font-semibold tracking-tighter">Left blank.</h2>
            <p className="mt-2 text-muted-foreground">
              Nothing for {s.name} yet, and we never fill pages with fake papers. If you sat this exam, your copy could get a junior through the night before.
            </p>
            <Button asChild className="mt-6 gap-2">
              <a href={handDownUrl(s.name, s.semester)} target="_blank" rel="noopener">
                Hand one down
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </Button>
          </div>
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
                            <Row key={i.file} item={i} subject={s.name} label={`${EXAMS[i.exam!]}${i.n! > 1 ? `, paper ${i.n}` : ''}`} />
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="mt-6 divide-y rounded-xl border bg-card">
                  {list.map((i) => (
                    <Row key={i.file} item={i} subject={s.name} label={i.title} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {mine.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Have a paper that's missing here?{' '}
            <a href={handDownUrl(s.name, s.semester)} target="_blank" rel="noopener" className="font-medium text-foreground underline decoration-ink underline-offset-4">
              Hand it down
            </a>
            .
          </p>
        )}
      </div>
    </>
  );
}
