'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CornerDownLeft, FileText, Library, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      : !words.length
        ? 'Type a subject name, a code or a year such as 2023.'
        : !results.length
          ? 'Nothing matches. Try fewer words.'
          : '';

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={open} className="gap-2 rounded-full pr-2 text-muted-foreground">
        <SearchIcon aria-hidden className="size-4" />
        Search
        <kbd className="hidden rounded-md border bg-muted px-1.5 font-sans text-xs sm:inline">/</kbd>
      </Button>
      <dialog
        ref={dialog}
        aria-label="Search"
        className="m-auto mt-[12vh] w-[min(38rem,calc(100%-2rem))] overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Subject, code or year"
            aria-label="Search papers and notes"
            className="h-14 flex-1 bg-transparent text-lg tracking-tight outline-none placeholder:text-muted-foreground"
          />
          <form method="dialog">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Close
            </Button>
          </form>
        </div>
        <p role="status" className="px-4 py-3 text-sm text-muted-foreground empty:hidden">
          {status}
        </p>
        {results.length > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto p-2">
            {results.map((r) => {
              const Icon = r.href.includes('#') ? FileText : Library;
              return (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={() => dialog.current?.close()}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent focus-visible:bg-accent"
                  >
                    <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{r.label}</span>
                      <span className="block truncate text-sm text-muted-foreground">{r.where}</span>
                    </span>
                    <CornerDownLeft aria-hidden className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </dialog>
    </>
  );
}
