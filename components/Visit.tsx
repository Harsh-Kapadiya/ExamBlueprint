'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// "Where you left off", kept on this device only (no accounts). Every storage call can throw in
// private mode or some in-app browsers, so each one is guarded and the site works without it.
const KEY = 'pyq:last';
type Last = { href: string; name: string; semester: number };
const SAFE = /^\/[A-Za-z]+\/sem[1-8]\/[a-z0-9-]+$/; // only ever a subject page on this site

/** Put on a subject page: remembers it as the last one opened. */
export function RememberVisit(last: Last) {
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(last));
    } catch {}
  }, [last.href]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** On the home page: "Continue with Data Structures". Shows nothing on a first visit. */
export function ContinueLink() {
  const [last, setLast] = useState<Last | null>(null);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (typeof v?.href === 'string' && SAFE.test(v.href) && typeof v.name === 'string') setLast(v);
    } catch {}
  }, []);
  if (!last) return null;
  const forget = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setLast(null);
  };
  return (
    <p className="mt-4 text-sm tracking-tight text-muted-foreground">
      Continue with{' '}
      <Link href={last.href} className="font-medium text-foreground underline decoration-ink underline-offset-4 hover:decoration-2">
        {last.name}
      </Link>
      , semester {last.semester}.{' '}
      <button type="button" onClick={forget} className="underline underline-offset-4 hover:text-foreground">
        Forget
      </button>
    </p>
  );
}
