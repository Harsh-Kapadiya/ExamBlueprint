import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/atkinson-hyperlegible-next';
import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import Search from '@/components/Search';
import { REPO } from '@/lib/rules';

export const metadata: Metadata = {
  title: { default: 'pyq: NIT Patna question papers and notes', template: '%s | pyq' },
  description: 'Previous year question papers and study material for NIT Patna students, sorted by semester and subject.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        {/* The answer sheet's red margin rule */}
        <div aria-hidden className="fixed inset-y-0 left-[max(2rem,calc(50%-22rem))] hidden w-px bg-margin/60 md:block" />
        <div className="mx-auto max-w-3xl px-4 md:pl-12">
          <header className="flex items-center justify-between gap-4 py-6">
            <Link href="/" className="group flex items-baseline gap-2 rounded-sm">
              <span className="font-serif text-2xl font-bold tracking-tight">pyq</span>
              <span className="text-sm text-ink-soft group-hover:text-ink">NIT Patna</span>
            </Link>
            <Search />
          </header>
          <main className="pb-24">{children}</main>
          <footer className="border-t border-rule py-8 text-sm text-ink-soft">
            <p className="max-w-prose">
              Run by students, free for every student. Found a wrong file, or own something that should not be here?{' '}
              <a className="underline decoration-rule underline-offset-4 hover:text-ink" href={`https://github.com/${REPO}/issues`}>
                Tell us on GitHub
              </a>
              .
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
