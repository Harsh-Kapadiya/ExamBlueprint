// Self-check of the content rules, then validation of everything in Content/ (FR-B-03).
// Run with: npm run check   (Node 22.18+ runs TypeScript directly, no install needed)
import assert from 'node:assert/strict';
import { loadContent } from '../lib/content.ts';
import { commit } from '../lib/github.ts';
import { adminLogins, check, downloadName, handDownUrl, pyqFile, sheetYears, slugify, yearSpan, type Catalog } from '../lib/rules.ts';

const catalog: Catalog = {
  branches: [{ id: 'CSE', name: 'Computer Science and Engineering' }],
  subjects: [{ branch: 'CSE', semester: 3, slug: 'data-structure', code: '', name: 'Data Structures' }],
};
const pdf = new TextEncoder().encode('%PDF-');
const dir = 'Content/CSE/sem3/data-structure';
const ok = (path: string, bytes = 1000, head = pdf) => typeof check(path, bytes, head, catalog) !== 'string';

assert(ok(`${dir}/pyq/2024-endsem.pdf`));
assert(ok(`${dir}/pyq/2024-endsem-2.pdf`));
assert(ok(`${dir}/notes/unit-1-arrays.pdf`));
assert(!ok(`${dir}/pyq/2024-endsem-1.pdf`), 'paper numbers start at 2');
assert(!ok(`${dir}/pyq/2024-final.pdf`), 'unknown exam');
assert(!ok(`${dir}/pyq/1999-endsem.pdf`), 'year too old');
assert(!ok(`${dir}/notes/DS paper final.pdf`), 'AC-07: spaces and capitals');
assert(!ok('Content/CSE/sem4/data-structure/notes/unit-1.pdf'), 'subject not in that semester');
assert(!ok(`${dir}/toString/unit-1.pdf`), 'not a category');
assert(!ok(`${dir}/notes/../../x.pdf`), 'path escape');
assert(!ok(`${dir}/notes/unit-1.pdf`, 6 * 1024 * 1024 + 1), 'AC-10: over 6 MB');
assert(!ok(`${dir}/notes/unit-1.pdf`, 1000, new Uint8Array([0x50, 0x4b, 3, 4, 20])), 'AC-04: Word file renamed to .pdf');
assert.equal(pyqFile(2024, 'midsem', 3), '2024-midsem-3.pdf');
assert.deepEqual(sheetYears([{ year: 2019 }, { year: 2024 }], 2026), [2019, 2021, 2022, 2023, 2024, 2025], 'last five finished years plus older ones that have papers');
assert.equal(yearSpan([{ year: 2024 }, { year: 2022 }]), '2022 to 2024');
assert.equal(downloadName({ subject: 'dbms', file: '2024-endsem.pdf' }), 'dbms-2024-endsem.pdf');
assert(new URL(handDownUrl('DBMS', 3, 'End-semester 2023')).searchParams.get('title')!.includes('End-semester 2023'));
assert.equal(slugify('Unit 1: Arrays & Lists.pdf'), 'unit-1-arrays-lists');
assert.deepEqual(
  adminLogins(' https://github.com/Harsh-Kapadiya/, github.com/foo ,https://gitlab.com/x, https://github.com/a/b'),
  ['harsh-kapadiya', 'foo'],
);

// FR-A-04: one commit per upload, and main moves only after every file uploaded.
const calls: string[] = [];
const fakeGitHub = (failOn?: string) => async (url: string | URL | Request, init?: RequestInit) => {
  const call = `${init?.method ?? 'GET'} ${String(url).replace(/^.*\/repos\/[^/]+\/[^/]+/, '')}`;
  calls.push(call);
  if (failOn && call.includes(failOn)) return new Response('{"message":"boom"}', { status: 500 });
  return Response.json({ object: { sha: 'head' }, tree: { sha: 'base' }, sha: 'new', html_url: 'https://github.com/c/new' });
};
globalThis.fetch = fakeGitHub() as typeof fetch;
await commit('t', 'msg', [{ path: 'Content/a.json', data: '{}' }, { path: 'Content/b.json', data: '{}' }, { path: 'Content/c.pdf', data: null }]);
assert.deepEqual(calls, ['GET /git/ref/heads/main', 'GET /git/commits/head', 'POST /git/blobs', 'POST /git/blobs', 'POST /git/trees', 'POST /git/commits', 'PATCH /git/refs/heads/main']);
calls.length = 0;
globalThis.fetch = fakeGitHub('/git/trees') as typeof fetch;
await assert.rejects(commit('t', 'msg', [{ path: 'Content/a.json', data: '{}' }]), /boom/);
assert(!calls.some((c) => c.startsWith('PATCH')), 'a failed upload must not move main');

const { items, problems } = loadContent();
if (problems.length) process.exit(1); // loadContent already printed them
console.log(`Rules OK. ${items.length} materials in Content/ are valid.`);
