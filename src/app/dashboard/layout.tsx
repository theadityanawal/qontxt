import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <nav className="dashboard-nav">
          <h1>qontxt Dashboard</h1>
        </nav>
        {children}
      </div>
    </ProtectedRoute>
  );
}
