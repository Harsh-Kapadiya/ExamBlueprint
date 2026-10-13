import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageHeader
      trail={[['/404', 'Not found']]}
      title="Out of syllabus."
      meta="This page isn't on pyq. The link may be from an old forward, or mistyped. The paper itself could still be here: try Search at the top."
    >
      <Button asChild className="mt-8">
        <Link href="/">Back to semesters</Link>
      </Button>
    </PageHeader>
  );
}
