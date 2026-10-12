import Link from 'next/link';

export default function Crumbs({ trail }: { trail: [href: string, label: string][] }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-4 text-sm text-ink-soft">
      <ol className="flex flex-wrap gap-x-2">
        {[['/', 'Home'] as const, ...trail].map(([href, label]) => (
          <li key={href} className="after:ml-2 after:content-['/'] last:after:content-none">
            <Link href={href} className="hover:text-ink hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
