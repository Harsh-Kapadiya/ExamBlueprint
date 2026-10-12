import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1 className="pt-6 font-serif text-4xl font-semibold">No page here</h1>
      <p className="mt-4 max-w-prose text-lg text-ink-soft">
        The link may be old, or the subject may have moved. Press <kbd>/</kbd> to search, or start again from your semester.
      </p>
      <p className="mt-8">
        <Link href="/" className="underline decoration-rule underline-offset-4 hover:text-margin">
          Go to all semesters
        </Link>
      </p>
    </>
  );
}
