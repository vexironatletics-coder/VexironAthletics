'use client';

import { UserSidebar } from '@/components/layout/Sidebar';

export function UserDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row sm:px-6 lg:px-8">
      <UserSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
