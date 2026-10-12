'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Entry = { label: string; where: string; href: string; key: string };

/** Site-wide search (FR-S-06). The index downloads only the first time search is opened. */
export default function Search() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');

  const open = () => {
    dialog.current?.showModal();
    setFailed(false);
    if (!index)
      fetch('/search.json')
        .then((r) => r.json())
        .then(setIndex, () => setFailed(true));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        open();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = index && words.length ? index.filter((e) => words.every((w) => e.key.includes(w))).slice(0, 30) : [];
  const status = failed
    ? 'Search could not load. Check your connection and try again.'
    : !index
      ? 'Loading…'
      : words.length && !results.length
        ? 'Nothing matches. Try a subject name, a code or a year such as 2023.'
        : '';

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex min-h-11 items-center gap-3 border-[1.5px] border-ink bg-sheet px-3 text-sm hover:border-margin"
      >
        Search
        <kbd className="hidden border border-rule px-1.5 font-sans text-xs text-ink-soft sm:inline">/</kbd>
      </button>
      <dialog
        ref={dialog}
        aria-label="Search"
        className="m-auto mt-[10vh] w-[min(36rem,calc(100%-2rem))] border-[1.5px] border-ink bg-sheet p-0 text-ink backdrop:bg-ink/40"
      >
        <div className="flex items-center gap-2 border-b border-rule p-2">
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Subject, code or year"
            aria-label="Search papers and notes"
            className="min-h-11 flex-1 bg-transparent px-2 text-lg outline-none"
          />
          <form method="dialog">
            <button className="min-h-11 px-3 text-sm text-ink-soft hover:text-ink">Close</button>
          </form>
        </div>
        <p role="status" className="px-4 empty:hidden py-3 text-sm text-ink-soft">
          {status}
        </p>
        {results.length > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto">
            {results.map((r) => (
              <li key={r.href} className="border-b border-rule last:border-0">
                <Link href={r.href} onClick={() => dialog.current?.close()} className="block px-4 py-3 hover:bg-paper">
                  <span className="block">{r.label}</span>
                  <span className="block text-sm text-ink-soft">{r.where}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </>
  );
}
