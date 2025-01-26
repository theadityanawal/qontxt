import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

// Server Component (no client-side code)
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
