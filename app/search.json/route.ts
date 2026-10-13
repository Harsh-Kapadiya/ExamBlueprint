import { loadContent } from '@/lib/content';
import { anchor, EXAMS } from '@/lib/rules';

// Built once at build time; the search box fetches it only when first opened (FR-S-06).
export const dynamic = 'force-static';

// "Computer Networks" -> "cn", "Design and Analysis of Algorithms" -> "daa": the short names students type
const initials = (name: string) =>
  name
    .toLowerCase()
    .split(/[\s-]+/)
    .filter((w) => w && !['and', 'of', 'the', 'to', 'in'].includes(w))
    .map((w) => w[0])
    .join('');

export function GET() {
  const { catalog, items } = loadContent();
  const branchName = (id: string) => catalog.branches.find((b) => b.id === id)?.name ?? id;
  const subjects = catalog.subjects.map((s) => ({
    label: s.name,
    where: `Semester ${s.semester}, ${branchName(s.branch)}`,
    href: `/${s.branch}/sem${s.semester}/${s.slug}`,
    // The slug holds the short name students type (dbms, daa, coa, os)
    key: `${s.name} ${s.slug} ${initials(s.name)} ${s.code} semester ${s.semester} sem ${s.semester} sem${s.semester}`.toLowerCase(),
  }));
  const files = items.map((i) => {
    const s = catalog.subjects.find((x) => x.branch === i.branch && x.semester === i.semester && x.slug === i.subject)!;
    return {
      label: i.title,
      where: `${s.name}, semester ${i.semester}`,
      href: `/${i.branch}/sem${i.semester}/${i.subject}#${anchor(i)}`,
      // "endsem", "end-sem" and "end semester" all match
      key: `${i.title} ${i.exam ?? ''} ${i.exam ? EXAMS[i.exam] : ''} ${i.category} ${s.name} ${s.slug} ${initials(s.name)} ${s.code} sem ${i.semester}`.toLowerCase(),
    };
  });
  return Response.json([...subjects, ...files]);
}
