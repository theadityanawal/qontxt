'use client';

import { Suspense } from 'react';
import { useAuth } from '@/lib/services/auth/auth.service';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Toaster } from '@/components/ui/sonner';

function LoadingSkeleton() {
  return (
    <div className="h-screen flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r bg-card animate-pulse">
        <div className="p-4 border-b">
          <div className="h-6 w-24 bg-muted rounded" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="h-screen flex">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-background">
        <Suspense fallback={<LoadingSkeleton />}>
          {children}
        </Suspense>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

