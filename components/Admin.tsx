'use client';
import { useCallback, useEffect, useState } from 'react';
import AuthButton from './AuthButton';
import { commit, readRepo, type Change } from '@/lib/github';
import {
  CATEGORIES,
  check,
  checkCatalog,
  EXAMS,
  fmtSize,
  MAX_FILES,
  plural,
  pyqFile,
  SEMESTERS,
  slugify,
  subjectDir,
  type Catalog,
  type Category,
  type Exam,
  type Subject,
} from '@/lib/rules';

type Repo = { files: Map<string, number>; catalog: Catalog };
type Run = (message: string, changes: Change[]) => Promise<boolean>;

const field = 'min-h-11 border-[1.5px] border-ink bg-sheet px-2 text-base text-ink';
const label = 'flex flex-col gap-1 text-sm text-ink-soft';
const primary =
  'min-h-11 border-[1.5px] border-ink bg-ink px-5 text-paper hover:border-margin hover:bg-margin disabled:cursor-not-allowed disabled:opacity-40';
const quiet = 'inline-flex min-h-11 cursor-pointer items-center px-2 underline decoration-rule underline-offset-4 hover:text-margin focus-within:outline-2';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12 border-t-[1.5px] border-ink pt-6">
      <h2 id={id} className="mb-4 font-serif text-2xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Admin({ token, login }: { token: string; login: string }) {
  const [repo, setRepo] = useState<Repo | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ text: string; url: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState(1);
  const [slug, setSlug] = useState('');

  const reload = useCallback(
    () =>
      readRepo(token).then(
        (r) => {
          setRepo(r);
          setBranch((b) => b || r.catalog.branches[0]?.id || '');
        },
        (e: Error) => setError(e.message),
      ),
    [token],
  );
  useEffect(() => void reload(), [reload]);

  // Every write in the panel goes through here: one commit, progress shown, then a fresh read.
  const run: Run = async (message, changes) => {
    setError('');
    setNotice(null);
    try {
      const url = await commit(token, message, changes, (done) =>
        setBusy(changes.length > 1 ? `Uploading ${Math.min(done + 1, changes.length)} of ${changes.length}…` : 'Saving…'),
      );
      setNotice({ text: `Done: ${message.replace(/^content: /, '')}. The site updates in a few minutes.`, url });
      await reload();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy('');
    }
  };

  const subjects = (repo?.catalog.subjects ?? [])
    .filter((s) => s.branch === branch && s.semester === semester)
    .sort((a, b) => a.name.localeCompare(b.name));
  const subject = subjects.find((s) => s.slug === slug);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-6">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Admin</h1>
          <p className="mt-2 text-ink-soft">Signed in as {login}</p>
        </div>
        <AuthButton action="out" />
      </div>

      <div className="sticky top-0 z-10 mt-6 bg-paper py-2" aria-live="polite">
        {busy && <p className="border-l-2 border-ink pl-3">{busy}</p>}
        {error && (
          <p role="alert" className="border-l-2 border-margin pl-3 text-margin">
            {error}
          </p>
        )}
        {notice && (
          <p className="border-l-2 border-ink pl-3">
            {notice.text}{' '}
            <a href={notice.url} target="_blank" rel="noopener" className="underline underline-offset-4">
              See the commit
            </a>
          </p>
        )}
      </div>

      {!repo ? (
        !error && <p className="mt-6 text-ink-soft">Reading the repository…</p>
      ) : (
        <>
          <fieldset className="mt-6 flex flex-wrap gap-4">
            <legend className="mb-3 font-serif text-xl font-semibold">Working on</legend>
            {repo.catalog.branches.length > 1 && (
              <label className={label}>
                Branch
                <select className={field} value={branch} onChange={(e) => (setBranch(e.target.value), setSlug(''))}>
                  {repo.catalog.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className={label}>
              Semester
              <select className={field} value={semester} onChange={(e) => (setSemester(Number(e.target.value)), setSlug(''))}>
                {SEMESTERS.map((n) => (
                  <option key={n} value={n}>
                    Semester {n}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${label} min-w-60 flex-1`}>
              Subject
              <select className={field} value={slug} onChange={(e) => setSlug(e.target.value)}>
                <option value="">{subjects.length ? 'Choose a subject' : 'No subjects yet, add one below'}</option>
                {subjects.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <Section id="upload" title="Upload">
            {subject ? <Upload subject={subject} repo={repo} busy={!!busy} run={run} /> : <p className="text-ink-soft">Choose a subject first.</p>}
          </Section>
          <Section id="materials" title="Uploaded files">
            {subject ? <Materials subject={subject} repo={repo} busy={!!busy} run={run} /> : <p className="text-ink-soft">Choose a subject first.</p>}
          </Section>
          <Section id="subjects" title={`Subjects in semester ${semester}`}>
            <Subjects branch={branch} semester={semester} subjects={subjects} repo={repo} busy={!!busy} run={run} />
          </Section>
        </>
      )}
    </>
  );
}

type Row = { file: File; head: Uint8Array; year: number; exam: Exam; n: number; title: string; replace: boolean };
type Props = { subject: Subject; repo: Repo; busy: boolean; run: Run };

function Upload({ subject, repo, busy, run }: Props) {
  const [category, setCategory] = useState<Category>('pyq');
  const [rows, setRows] = useState<Row[]>([]);
  const [inputKey, setInputKey] = useState(0);
  const thisYear = new Date().getFullYear();

  const add = async (list: FileList | null) => {
    const added = await Promise.all(
      [...(list ?? [])].map(async (file): Promise<Row> => {
        const name = file.name.toLowerCase();
        return {
          file,
          head: new Uint8Array(await file.slice(0, 5).arrayBuffer()),
          year: Number(name.match(/20\d\d/)?.[0] ?? thisYear),
          exam: name.includes('mid') ? 'midsem' : name.includes('supp') ? 'supplementary' : 'endsem',
          n: 1,
          title: slugify(file.name),
          replace: false,
        };
      }),
    );
    setRows((r) => [...r, ...added]);
  };
  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  // FR-A-02, FR-A-03: the exact target path and every problem, shown before anything is sent.
  const dir = `${subjectDir(subject)}/${category}`;
  const paths = rows.map((r) => `${dir}/${category === 'pyq' ? pyqFile(r.year, r.exam, r.n) : `${slugify(r.title)}.pdf`}`);
  const problems = rows.map((r, i) => {
    const result = check(paths[i], r.file.size, r.head, repo.catalog);
    if (typeof result === 'string') return result;
    if (paths.indexOf(paths[i]) !== i) return 'Same name as another file in this upload';
    if (repo.files.has(paths[i]) && !r.replace) return 'A file with this name already exists. Tick Replace to overwrite it.';
    return '';
  });
  const ready = rows.length > 0 && rows.length <= MAX_FILES && problems.every((p) => !p) && !busy;

  const upload = async () => {
    const where = `${subject.branch}/sem${subject.semester}/${subject.slug}`;
    if (await run(`content: add ${plural(rows.length, 'file')} to ${where}`, rows.map((r, i) => ({ path: paths[i], data: r.file })))) {
      setRows([]);
      setInputKey((k) => k + 1);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <label className={label}>
          Type
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {Object.entries(CATEGORIES).map(([id, text]) => (
              <option key={id} value={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          PDF files, up to 6 MB each
          <input key={inputKey} type="file" accept="application/pdf,.pdf" multiple className={`${field} py-2`} onChange={(e) => add(e.target.files)} />
        </label>
      </div>

      {rows.length > 0 && (
        <ul className="mt-6 border-t border-rule">
          {rows.map((r, i) => (
            <li key={i} className="border-b border-rule py-4">
              <div className="flex flex-wrap items-end gap-3">
                <p className="mr-auto basis-full sm:basis-auto">
                  {r.file.name} <span className="text-sm text-ink-soft">{fmtSize(r.file.size)}</span>
                </p>
                {category === 'pyq' ? (
                  <>
                    <label className={label}>
                      Year
                      <input type="number" min={2000} max={thisYear} value={r.year} onChange={(e) => update(i, { year: Number(e.target.value) })} className={`${field} w-24`} />
                    </label>
                    <label className={label}>
                      Exam
                      <select className={field} value={r.exam} onChange={(e) => update(i, { exam: e.target.value as Exam })}>
                        {Object.entries(EXAMS).map(([id, text]) => (
                          <option key={id} value={id}>
                            {text}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={label}>
                      Paper no.
                      <input type="number" min={1} max={99} value={r.n} onChange={(e) => update(i, { n: Number(e.target.value) })} className={`${field} w-20`} />
                    </label>
                  </>
                ) : (
                  <label className={`${label} flex-1`}>
                    Title
                    <input value={r.title} onChange={(e) => update(i, { title: e.target.value })} className={field} />
                  </label>
                )}
                {repo.files.has(paths[i]) && (
                  <label className="flex min-h-11 items-center gap-2">
                    <input type="checkbox" checked={r.replace} onChange={(e) => update(i, { replace: e.target.checked })} /> Replace
                  </label>
                )}
                <button type="button" className={quiet} onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                  Remove from list
                </button>
              </div>
              <p className="mt-2 text-sm break-all text-ink-soft">Saves as {paths[i]}</p>
              {problems[i] && <p className="mt-1 text-sm text-margin">{problems[i]}</p>}
            </li>
          ))}
        </ul>
      )}

      {rows.length > MAX_FILES && <p className="mt-4 text-margin">Upload at most {MAX_FILES} files at a time.</p>}
      <button type="button" className={`${primary} mt-6`} disabled={!ready} onClick={upload}>
        Upload {rows.length ? plural(rows.length, 'file') : 'files'}
      </button>
    </>
  );
}

function Materials({ subject, repo, busy, run }: Props) {
  const prefix = `${subjectDir(subject)}/`;
  const list = [...repo.files].filter(([p]) => p.startsWith(prefix)).sort(([a], [b]) => a.localeCompare(b));

  const replace = async (path: string, file?: File) => {
    if (!file) return;
    const result = check(path, file.size, new Uint8Array(await file.slice(0, 5).arrayBuffer()), repo.catalog);
    if (typeof result === 'string') return alert(`${file.name}: ${result}`);
    if (confirm(`Replace ${path}\nwith ${file.name}?`)) await run(`content: replace ${path.slice(8)}`, [{ path, data: file }]);
  };

  // FR-A-08: typed confirmation, one file at a time, and the deletion is a revertible commit.
  const remove = async (path: string) => {
    const name = path.split('/').pop()!;
    const typed = prompt(`This deletes:\n${path}\n\nIt can be restored from Git history. Type the file name (${name}) to confirm.`);
    if (typed === null) return;
    if (typed.trim() !== name) return alert('The name did not match. Nothing was deleted.');
    await run(`content: delete ${path.slice(8)}`, [{ path, data: null }]);
  };

  if (!list.length) return <p className="text-ink-soft">Nothing uploaded for {subject.name} yet.</p>;
  return (
    <ul className="border-t border-rule">
      {list.map(([path, bytes]) => (
        <li key={path} className="flex flex-wrap items-center gap-x-2 border-b border-rule py-2">
          <span className="mr-auto py-2 break-all">
            {path.slice(prefix.length)} <span className="ml-2 text-sm text-ink-soft">{fmtSize(bytes)}</span>
          </span>
          <label className={`${quiet} ${busy ? 'pointer-events-none opacity-40' : ''}`}>
            Replace
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={busy}
              onChange={(e) => (replace(path, e.target.files?.[0]), (e.target.value = ''))}
            />
          </label>
          <button type="button" className={quiet} disabled={busy} onClick={() => remove(path)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

function Subjects({ branch, semester, subjects, repo, busy, run }: { branch: string; semester: number; subjects: Subject[]; repo: Repo; busy: boolean; run: Run }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const save = (subjectsNext: Subject[], message: string) => {
    const next = { ...repo.catalog, subjects: subjectsNext };
    const errors = checkCatalog(next);
    if (errors.length) return alert(errors.join('\n'));
    return run(message, [{ path: 'Content/catalog.json', data: `${JSON.stringify(next, null, 2)}\n` }]);
  };

  const slug = slugify(name);
  const taken = subjects.some((s) => s.slug === slug);
  const add = async () => {
    const s = { branch, semester, slug, code: code.trim(), name: name.trim() };
    if (await save([...repo.catalog.subjects, s], `content: add subject ${s.name} to ${branch}/sem${semester}`)) {
      setName('');
      setCode('');
    }
  };

  return (
    <>
      {subjects.length > 0 && (
        <ul className="mb-8 border-t border-rule">
          {subjects.map((s) => (
            <SubjectRow
              key={s.slug}
              subject={s}
              busy={busy}
              onSave={(n, c) =>
                save(
                  repo.catalog.subjects.map((x) => (x.branch === s.branch && x.semester === s.semester && x.slug === s.slug ? { ...x, name: n, code: c } : x)),
                  `content: update subject ${s.branch}/sem${s.semester}/${s.slug}`,
                )
              }
            />
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <label className={`${label} min-w-56 flex-1`}>
          New subject name
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Data Structures" />
        </label>
        <label className={label}>
          Code (optional)
          <input value={code} onChange={(e) => setCode(e.target.value)} className={`${field} w-32`} />
        </label>
        <button type="button" className={primary} disabled={busy || !slug || taken} onClick={add}>
          Add subject
        </button>
      </div>
      {name && (
        <p className={`mt-2 text-sm ${taken ? 'text-margin' : 'text-ink-soft'}`}>
          {taken ? 'This semester already has a subject with that name.' : `Its address will be /${branch}/sem${semester}/${slug}. This cannot be changed later.`}
        </p>
      )}
    </>
  );
}

function SubjectRow({ subject, busy, onSave }: { subject: Subject; busy: boolean; onSave: (name: string, code: string) => void }) {
  const [name, setName] = useState(subject.name);
  const [code, setCode] = useState(subject.code);
  const changed = name.trim() !== subject.name || code.trim() !== subject.code;
  return (
    <li className="flex flex-wrap items-end gap-3 border-b border-rule py-3">
      <label className={`${label} min-w-56 flex-1`}>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </label>
      <label className={label}>
        Code
        <input value={code} onChange={(e) => setCode(e.target.value)} className={`${field} w-32`} />
      </label>
      <button type="button" className={primary} disabled={busy || !changed || !name.trim()} onClick={() => onSave(name.trim(), code.trim())}>
        Save
      </button>
    </li>
  );
}
