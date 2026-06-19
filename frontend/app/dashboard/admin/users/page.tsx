'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from '@/store/api/userApi';

type ConfirmAction =
  | { type: 'suspend'; id: string; name: string }
  | { type: 'promote'; id: string; name: string };

export default function AdminUsersPage() {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAllUsersQuery({ page });
  const [updateRole] = useUpdateUserRoleMutation();
  const [updateStatus] = useUpdateUserStatusMutation();

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      if (confirmAction.type === 'suspend') {
        await updateStatus({ id: confirmAction.id, isActive: false }).unwrap();
        toast.success(`"${confirmAction.name}" has been suspended`);
      } else {
        await updateRole({ id: confirmAction.id, role: 'admin' }).unwrap();
        toast.success(`"${confirmAction.name}" is now an admin`);
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
      ? {
          title: 'Suspend user?',
          message: `Are you sure you want to suspend "${confirmAction.name}"? They will not be able to sign in until reactivated.`,
          confirmLabel: 'Yes, suspend',
        }
      : confirmAction?.type === 'promote'
        ? {
            title: 'Make admin?',
            message: `Are you sure you want to grant admin access to "${confirmAction.name}"? They will have full control of the store.`,
            confirmLabel: 'Yes, make admin',
          }
        : { title: '', message: '', confirmLabel: 'Confirm' };

  return (
    <ErrorBoundary>
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        {isLoading ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setConfirmAction({ type: 'promote', id: user.id, name: user.name })
                          }
                        >
                          Make Admin
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setConfirmAction({ type: 'suspend', id: user.id, name: user.name })
                        }
                      >
                        Suspend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
