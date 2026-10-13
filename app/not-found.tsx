import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageHeader
      trail={[['/404', 'Not found']]}
      title="No page here"
      meta={
        <>
          The link may be old, or the subject may have moved. Press <kbd className="rounded-md border bg-muted px-1.5 text-sm">/</kbd> to search, or
          start again from your semester.
        </>
      }
    >
      <Button asChild className="mt-8">
        <Link href="/#semesters">Go to all semesters</Link>
      </Button>
    </PageHeader>
  );
}
