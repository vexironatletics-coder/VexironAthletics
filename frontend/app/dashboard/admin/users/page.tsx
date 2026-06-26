'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ShieldCheck, Users } from 'lucide-react';
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from '@/store/api/userApi';
import type { User } from '@/lib/types';

type ConfirmAction =
  | { type: 'suspend'; id: string; name: string }
  | { type: 'promote'; id: string; name: string }
  | { type: 'demote'; id: string; name: string };

function UserTable({
  users,
  onPromote,
  onDemote,
  onSuspend,
}: {
  users: User[];
  onPromote?: (u: User) => void;
  onDemote?: (u: User) => void;
  onSuspend: (u: User) => void;
}) {
  if (!users.length) return <p className="py-6 text-center text-sm text-[var(--muted)]">No users found.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--secondary)]/30">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3 text-[var(--muted)]">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  (user as User & { isActive?: boolean }).isActive !== false
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {(user as User & { isActive?: boolean }).isActive !== false ? 'Active' : 'Suspended'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {user.role !== 'admin' && onPromote && (
                    <Button size="sm" variant="outline" onClick={() => onPromote(user)}>
                      Make Admin
                    </Button>
                  )}
                  {user.role === 'admin' && onDemote && (
                    <Button size="sm" variant="outline" onClick={() => onDemote(user)}>
                      Remove Admin
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => onSuspend(user)}>
                    Suspend
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsersPage() {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAllUsersQuery({ page });
  const [updateRole] = useUpdateUserRoleMutation();
  const [updateStatus] = useUpdateUserStatusMutation();

  const admins = data?.users.filter((u) => u.role === 'admin') ?? [];
  const users  = data?.users.filter((u) => u.role !== 'admin') ?? [];

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      if (confirmAction.type === 'suspend') {
        await updateStatus({ id: confirmAction.id, isActive: false }).unwrap();
        toast.success(`"${confirmAction.name}" has been suspended`);
      } else if (confirmAction.type === 'promote') {
        await updateRole({ id: confirmAction.id, role: 'admin' }).unwrap();
        toast.success(`"${confirmAction.name}" is now an admin`);
      } else if (confirmAction.type === 'demote') {
        await updateRole({ id: confirmAction.id, role: 'user' }).unwrap();
        toast.success(`"${confirmAction.name}" has been removed from admins`);
      }
      setConfirmAction(null);
    } catch {
      toast.error('Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const dialogCopy =
    confirmAction?.type === 'suspend'
      ? { title: 'Suspend user?', message: `Suspend "${confirmAction.name}"? They won't be able to sign in until reactivated.`, confirmLabel: 'Yes, suspend' }
      : confirmAction?.type === 'promote'
        ? { title: 'Make admin?', message: `Grant admin access to "${confirmAction.name}"? They'll have full store control.`, confirmLabel: 'Yes, make admin' }
        : confirmAction?.type === 'demote'
          ? { title: 'Remove admin?', message: `Remove admin access from "${confirmAction.name}"? They'll become a regular user.`, confirmLabel: 'Yes, remove admin' }
          : { title: '', message: '', confirmLabel: 'Confirm' };

  return (
    <ErrorBoundary>
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex gap-4 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {admins.length} admin{admins.length !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {users.length} user{users.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-4">Loading…</p>
        ) : (
          <>
            {/* ── Admins ── */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Admins</h2>
                <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                  {admins.length}
                </span>
              </div>
              <UserTable
                users={admins}
                onDemote={(u) => setConfirmAction({ type: 'demote', id: u.id, name: u.name })}
                onSuspend={(u) => setConfirmAction({ type: 'suspend', id: u.id, name: u.name })}
              />
            </section>

            {/* ── Regular Users ── */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-lg font-semibold">Customers</h2>
                <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                  {users.length}
                </span>
              </div>
              <UserTable
                users={users}
                onPromote={(u) => setConfirmAction({ type: 'promote', id: u.id, name: u.name })}
                onSuspend={(u) => setConfirmAction({ type: 'suspend', id: u.id, name: u.name })}
              />
            </section>
          </>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <Pagination pagination={data.pagination} onPageChange={setPage} scrollToTop={false} />
        )}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={dialogCopy.title}
        message={dialogCopy.message}
        confirmLabel={dialogCopy.confirmLabel}
        variant={confirmAction?.type === 'promote' ? 'default' : 'destructive'}
        onConfirm={handleConfirm}
        loading={isProcessing}
      />
    </ErrorBoundary>
  );
}
