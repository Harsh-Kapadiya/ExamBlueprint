// Every content rule in one place (README §B3, §B5). Pure TypeScript with no Node or browser
// APIs, so the admin panel, the build and the CI check all enforce exactly the same rules.

export const REPO = 'Harsh-Kapadiya/ExamBlueprint';
export const BRANCH = 'main';
export const MAX_BYTES = 6 * 1024 * 1024; // V-02
export const MAX_FILES = 20; // V-07
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Key order is the display order on the subject page (FR-S-04).
export const CATEGORIES = {
  pyq: 'Question papers',
  notes: 'Notes',
  slides: 'Lecture slides',
  assignments: 'Assignments and tutorials',
  lab: 'Lab manuals',
  syllabus: 'Syllabus',
} as const;
export type Category = keyof typeof CATEGORIES;

// Key order is the sort order within a year.
export const EXAMS = { endsem: 'End-semester', midsem: 'Mid-semester', supplementary: 'Supplementary' } as const;
export type Exam = keyof typeof EXAMS;

export type Branch = { id: string; name: string };
export type Subject = { branch: string; semester: number; slug: string; code: string; name: string };
export type Catalog = { branches: Branch[]; subjects: Subject[] };
export type Item = {
  branch: string;
  semester: number;
  subject: string;
  category: Category;
  file: string;
  path: string;
  title: string;
  bytes: number;
  year?: number;
  exam?: Exam;
  n?: number;
};

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PYQ = /^(\d{4})-(endsem|midsem|supplementary)(?:-([2-9]|[1-9]\d+))?\.pdf$/;
const PROFILE = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/?$/;

export const isSlug = (s: string) => SLUG.test(s);
export const slugify = (s: string) =>
  s.toLowerCase().replace(/\.pdf$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
export const pyqFile = (year: number, exam: Exam, n = 1) => `${year}-${exam}${n > 1 ? `-${n}` : ''}.pdf`;
export const subjectDir = (s: Pick<Subject, 'branch' | 'semester' | 'slug'>) => `Content/${s.branch}/sem${s.semester}/${s.slug}`;
export const isPdf = (head: Uint8Array) => String.fromCharCode(...head.subarray(0, 5)) === '%PDF-';
export const fmtSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
export const anchor = (i: Pick<Item, 'category' | 'file'>) => `${i.category}-${i.file.replace(/\.pdf$/, '')}`;
/** Saved file name, so a Downloads folder gets data-structure-2024-endsem.pdf rather than 2024-endsem (3).pdf */
export const downloadName = (i: Pick<Item, 'subject' | 'file'>) => `${i.subject}-${i.file}`;

/**
 * "Hand one down": a prefilled GitHub issue for sending in a paper.
 * ponytail: GitHub needs an account; swap for a Google Form URL here if non-coders don't use it.
 */
export const handDownUrl = (subject?: string, semester?: number, paper?: string) =>
  `https://github.com/${REPO}/issues/new?${new URLSearchParams({
    title: `Paper: ${[paper, subject && `${subject} (semester ${semester})`].filter(Boolean).join(', ')}`,
    body: `Subject: ${subject ? `${subject}, semester ${semester}` : ''}\nPaper: ${paper ?? ''}\n\nAttach the PDF below (6 MB at most). Only share papers you are allowed to share.`,
  })}`;

/** Columns of a coverage sheet: the last five finished years, plus any other year that has a paper. */
export function sheetYears(papers: Pick<Item, 'year'>[], now = new Date().getFullYear()) {
  const years = new Set([5, 4, 3, 2, 1].map((k) => now - k));
  for (const p of papers) if (p.year) years.add(p.year);
  return [...years].sort((a, b) => a - b);
}

/** "2022 to 2024", "2023", or "" */
export const yearSpan = (papers: Pick<Item, 'year'>[]) => {
  const ys = papers.map((p) => p.year!).filter(Boolean);
  if (!ys.length) return '';
  const lo = Math.min(...ys), hi = Math.max(...ys);
  return lo === hi ? String(lo) : `${lo} to ${hi}`;
};
export const plural =(n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Lowercased GitHub logins from a comma-separated list of profile URLs (FR-A-01). Anything else is ignored, so a typo locks out rather than lets in. */
export const adminLogins = (list = '') =>
  list.split(',').flatMap((u) => PROFILE.exec(u.trim())?.[1]?.toLowerCase() ?? []);

/** Display fields for a file name in a category, or an error message (V-03). */
export function parseFile(category: Category, file: string): string | Pick<Item, 'title' | 'year' | 'exam' | 'n'> {
  if (category === 'pyq') {
    const m = PYQ.exec(file);
    if (!m) return 'Name must look like 2024-endsem.pdf';
    const year = Number(m[1]);
    const now = new Date().getFullYear();
    if (year < 2000 || year > now) return `Year must be between 2000 and ${now}`;
    const exam = m[2] as Exam;
    const n = m[3] ? Number(m[3]) : 1;
    return { title: `${EXAMS[exam]} ${year}${n > 1 ? `, paper ${n}` : ''}`, year, exam, n };
  }
  const stem = file.endsWith('.pdf') ? file.slice(0, -4) : '';
  if (!isSlug(stem) || stem.length < 3 || stem.length > 80) return 'Name must be 3 to 80 lowercase letters, digits and hyphens';
  const words = stem.replace(/-/g, ' ');
  return { title: words[0].toUpperCase() + words.slice(1) };
}

/** Check one file at a repository path (V-01 to V-04, V-06). Returns the item, or the first problem found. */
export function check(path: string, bytes: number, head: Uint8Array, catalog: Catalog): string | Item {
  if (!path.endsWith('.pdf') || !isPdf(head)) return 'Not a PDF file';
  if (bytes > MAX_BYTES) return 'Larger than 6 MB';
  const parts = path.split('/');
  if (parts.length !== 6 || parts[0] !== 'Content') return 'Must be at Content/<branch>/sem<n>/<subject>/<category>/<file>.pdf';
  const [, branch, sem, subject, category, file] = parts;
  const semester = Number(sem.slice(3));
  if (!/^sem[1-8]$/.test(sem) || !catalog.subjects.some((s) => s.branch === branch && s.semester === semester && s.slug === subject))
    return `Unknown subject ${branch}/${sem}/${subject}. Add it to the catalog first`;
  if (!Object.hasOwn(CATEGORIES, category)) return `Unknown category "${category}"`;
  const f = parseFile(category as Category, file);
  if (typeof f === 'string') return f;
  return { branch, semester, subject, category: category as Category, file, path, bytes, ...f };
}

/** Problems in catalog.json; an empty list means it is valid (README §B3.2). */
export function checkCatalog(c: Catalog): string[] {
  if (!Array.isArray(c?.branches) || !Array.isArray(c?.subjects)) return ['catalog.json needs "branches" and "subjects" lists'];
  const errors: string[] = [];
  const branches = new Set<string>();
  for (const b of c.branches) {
    if (!/^[A-Za-z]+$/.test(b.id) || !b.name || branches.has(b.id)) errors.push(`Bad branch ${JSON.stringify(b)}`);
    branches.add(b.id);
  }
  const seen = new Set<string>();
  for (const s of c.subjects) {
    const key = `${s.branch}/${s.semester}/${s.slug}`;
    if (!branches.has(s.branch) || !SEMESTERS.includes(s.semester) || !isSlug(s.slug) || !s.name || typeof s.code !== 'string' || seen.has(key))
      errors.push(`Bad subject ${JSON.stringify(s)}`);
    seen.add(key);
  }
  return errors;
}

const examOrder = Object.keys(EXAMS);
/** Papers newest first, then end-semester before mid-semester; everything else by title (FR-S-04). */
export const byPaper = (a: Item, b: Item) =>
  a.category === 'pyq' && b.category === 'pyq'
    ? b.year! - a.year! || examOrder.indexOf(a.exam!) - examOrder.indexOf(b.exam!) || a.n! - b.n!
    : a.title.localeCompare(b.title);
