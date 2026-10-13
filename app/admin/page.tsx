import type { Metadata } from 'next';
import Admin from '@/components/Admin';
import AuthButton from '@/components/AuthButton';
import PageHeader from '@/components/PageHeader';
import { getAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

const trail: [string, string][] = [['/admin', 'Admin']];

// FR-A-01: checked on the server for every request to this page.
export default async function AdminPage() {
  const session = await getAdmin();
  if (!session)
    return (
      <PageHeader trail={trail} title="Admin sign-in" meta="Only listed admins can upload. Sign in with the GitHub account whose profile URL is on the admin list.">
        <div className="mt-8">
          <AuthButton action="in" />
        </div>
      </PageHeader>
    );
  if (!session.admin || !session.accessToken)
    return (
      <PageHeader
        trail={trail}
        title="Not authorised"
        meta={`You are signed in as ${session.login}, which is not on the admin list. Ask the site owner to add https://github.com/${session.login} to ADMIN_GITHUB_PROFILES.`}
      >
        <div className="mt-8">
          <AuthButton action="out" />
        </div>
      </PageHeader>
    );
  return (
    <>
      <PageHeader trail={trail} title="Admin" meta={`Signed in as ${session.login}`}>
        <div className="mt-6">
          <AuthButton action="out" />
        </div>
      </PageHeader>
      <Admin token={session.accessToken} />
    </>
  );
}
