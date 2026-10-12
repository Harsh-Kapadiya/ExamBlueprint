'use client';
import { signIn, signOut } from 'next-auth/react';

export default function AuthButton({ action }: { action: 'in' | 'out' }) {
  return (
    <button
      type="button"
      onClick={() => (action === 'in' ? signIn('github', { callbackUrl: '/admin' }) : signOut({ callbackUrl: '/' }))}
      className="min-h-11 border-[1.5px] border-ink px-4 hover:border-margin hover:text-margin"
    >
      {action === 'in' ? 'Sign in with GitHub' : 'Sign out'}
    </button>
  );
}
