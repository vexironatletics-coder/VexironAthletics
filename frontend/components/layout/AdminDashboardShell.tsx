'use client';

import { AdminSidebar } from '@/components/layout/Sidebar';

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row sm:px-6 lg:px-8">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
