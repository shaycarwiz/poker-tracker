'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SignInButtonProps {
  className?: string;
}

export function SignInButton({ className }: SignInButtonProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Button disabled className={className}>
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {session.user?.name}
        </span>
        <Button
          onClick={() => signOut()}
          variant="outline"
          className={className}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn('google')} className={className}>
      Sign in with Google
    </Button>
  );
}
