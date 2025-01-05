// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import GoogleAuth from '@/components/GoogleAuth';

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = '/dashboard';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to qontxt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create AI-powered resumes tailored to your dream jobs
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center">
            <GoogleAuth />
          </div>
        </div>
      </div>
    </div>
  );
}
