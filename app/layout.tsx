import '@fontsource-variable/geist';
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
      <body className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
            <Link href="/" className="flex items-baseline gap-2 rounded-md">
              <span className="text-xl font-semibold tracking-tighter">pyq</span>
              <span className="text-sm tracking-tight text-muted-foreground">NIT Patna</span>
            </Link>
            <Search />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-2 px-4 py-8 text-sm text-muted-foreground md:px-6">
            <p>Run by students, free for every student.</p>
            <p>
              Wrong file, or something that should not be here?{' '}
              <a className="text-foreground underline underline-offset-4 hover:no-underline" href={`https://github.com/${REPO}/issues`}>
                Tell us on GitHub
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
