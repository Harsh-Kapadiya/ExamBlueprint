import type { Metadata } from 'next';
import Admin from '@/components/Admin';
import AuthButton from '@/components/AuthButton';
import { getAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

function Gate({ title, text, action }: { title: string; text: string; action: 'in' | 'out' }) {
  return (
    <>
      <h1 className="pt-6 font-serif text-4xl font-semibold">{title}</h1>
      <p className="mt-4 mb-8 max-w-prose text-lg text-ink-soft">{text}</p>
      <AuthButton action={action} />
    </>
  );
}

// FR-A-01: checked on the server for every request to this page.
export default async function AdminPage() {
  const session = await getAdmin();
  if (!session)
    return <Gate title="Admin sign-in" text="Only listed admins can upload. Sign in with the GitHub account whose profile URL is on the admin list." action="in" />;
  if (!session.admin || !session.accessToken)
    return (
      <Gate
        title="Not authorised"
        text={`You are signed in as ${session.login}, which is not on the admin list. Ask the site owner to add https://github.com/${session.login} to ADMIN_GITHUB_PROFILES.`}
        action="out"
      />
    );
  return <Admin token={session.accessToken} login={session.login} />;
}
