'use client';
import { signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthButton({ action }: { action: 'in' | 'out' }) {
  return action === 'in' ? (
    <Button type="button" size="lg" className="gap-2" onClick={() => signIn('github', { callbackUrl: '/admin' })}>
      <LogIn aria-hidden className="size-4" />
      Sign in with GitHub
    </Button>
  ) : (
    <Button type="button" variant="outline" className="gap-2" onClick={() => signOut({ callbackUrl: '/' })}>
      <LogOut aria-hidden className="size-4" />
      Sign out
    </Button>
  );
}
