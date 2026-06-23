export const dynamic = 'force-dynamic';

import { UserDashboardShell } from '@/components/layout/UserDashboardShell';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return <UserDashboardShell>{children}</UserDashboardShell>;
}
