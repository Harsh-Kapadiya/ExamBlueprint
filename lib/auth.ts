import { getServerSession, type NextAuthOptions } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { adminLogins } from './rules.ts';

export const authOptions: NextAuthOptions = {
  // Sign in with the project's GitHub App, whose tokens can only touch this repository (NFR-SEC-02).
  providers: [GitHub({ clientId: process.env.GITHUB_ID ?? '', clientSecret: process.env.GITHUB_SECRET ?? '' })],
  session: { maxAge: 8 * 60 * 60 }, // GitHub App user tokens expire after 8 hours
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) Object.assign(token, { login: (profile as { login?: string }).login, accessToken: account.access_token });
      return token;
    },
    // The GitHub token reaches the browser only for listed admins, because uploads go straight to GitHub (README C3).
    session({ session, token }) {
      const login = String(token.login ?? '').toLowerCase();
      const admin = adminLogins(process.env.ADMIN_GITHUB_PROFILES).includes(login);
      return Object.assign(session, { login, admin, accessToken: admin ? token.accessToken : undefined });
    },
  },
};

export type AdminSession = { login: string; admin: boolean; accessToken?: string };

/** The server-side gate run on every admin request (FR-A-01). Null means not signed in. */
export const getAdmin = async () => (await getServerSession(authOptions)) as AdminSession | null;
