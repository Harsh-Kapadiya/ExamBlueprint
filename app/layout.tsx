import "@fontsource-variable/geist";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Search from "@/components/Search";
import { REPO } from "@/lib/rules";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: { default: "PYQ: the paper before the paper", template: "%s | pyq" },
  description: "Question papers your seniors already sat. Free, no sign-in.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
            <Link href="/" className="flex items-baseline gap-2 rounded-md">
              <span className="text-xl font-semibold tracking-tighter">
                Exam Blueprint
              </span>
            </Link>
            <Search />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-2 px-4 py-8 text-sm text-muted-foreground md:px-6">
            {/* Location checked against nitp.ac.in: the campus is on the south bank of the Ganga, behind Gandhi Ghat */}
            <p className="max-w-md">Made by students for the students</p>
            <p>
              Wrong file, or something that should not be here?{" "}
              <a
                className="text-foreground underline decoration-ink underline-offset-4 hover:decoration-2"
                href={`https://github.com/${REPO}/issues`}
              >
                Tell us on GitHub
              </a>
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
