import { AdminDashboardShell } from '@/components/layout/AdminDashboardShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
