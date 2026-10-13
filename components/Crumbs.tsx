import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/** Breadcrumbs in the hero's pill style. */
export default function Crumbs({ trail }: { trail: [href: string, label: string][] }) {
  const all = [['/', 'Home'] as const, ...trail];
  return (
    <nav aria-label="Breadcrumb">
      <ol className="inline-flex flex-wrap items-center gap-x-1 gap-y-1 rounded-3xl border-2 border-gray-300/20 bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent px-4 py-1.5 text-sm tracking-tight text-muted-foreground dark:border-white/5">
        {all.map(([href, label], i) => (
          <li key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
            {i === all.length - 1 ? (
              <span aria-current="page" className="text-foreground">
                {label}
              </span>
            ) : (
              <Link href={href} className="rounded-sm hover:text-foreground">
                {label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
