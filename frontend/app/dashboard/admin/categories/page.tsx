'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/store/api/userApi';

const categorySchema = z.object({
  name: z.string().min(2),
  parent: z.enum(['men', 'women', 'children']),
});

export default function AdminCategoriesPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { parent: 'men' as const },
  });

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      await createCategory(data).unwrap();
      toast.success('Category created');
      reset();
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.name}" has been deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div>
          <h1 className="text-2xl font-bold">Categories</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-wrap gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div>
              <Label>Name</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Parent</Label>
              <select {...register('parent')} className="mt-1 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950">
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="children">Children</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit">Add Category</Button>
            </div>
          </form>

          {isLoading ? (
            <p className="mt-4">Loading...</p>
          ) : (
            <div className="mt-6 space-y-2">
              {categories?.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-2 text-sm text-zinc-500">/{cat.slug}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget({ id: cat._id, name: cat.name })}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Products linked to this category may be affected.`
            : ''
        }
        confirmLabel="Yes, delete"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </ErrorBoundary>
  );
}
