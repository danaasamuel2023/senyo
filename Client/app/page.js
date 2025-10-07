'use client'
import DashboardPage from '@/component/UserDashboard';
import AuthGuard from '@/component/AuthGuard';

export default function ProtectedDashboardPage() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}