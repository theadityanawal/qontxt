// src/components/GoogleAuth.tsx
'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { createSessionCookie } = useAuth();

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize Google Auth Provider
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Sign in with popup
      const result = await signInWithPopup(auth, provider);

      // Create session cookie
      const response = await createSessionCookie();

      if (response.status === 'success') {
        // Refresh the page to update auth state
        router.refresh();
        // Navigate to home
        router.push('/home');
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <button
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        aria-label="Sign in with Google"
      >
        {!isLoading ? (
          <>
            <svg
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Sign in with Google</span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
              role="status"
              aria-label="Loading"
            />
            <span>Signing in...</span>
          </div>
        )}
      </button>
    </div>
  );
}
