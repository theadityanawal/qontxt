// src/app/home/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        Welcome to qontxt{user ? `, ${user.displayName}` : ''}! 👋
      </h1>
    </div>
  );
}
