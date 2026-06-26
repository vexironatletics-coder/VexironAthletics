'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Upload, Trash2, Plus, ImageIcon } from 'lucide-react';
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
import {
  useGetCategoryImagesQuery,
  useUpdateCategoryImagesMutation,
  useUploadCategoryImageMutation,
  type CategoryImage,
} from '@/store/api/settingsApi';

const categorySchema = z.object({
  name: z.string().min(2),
  parent: z.string().min(1),
});

// ─── Category Image Card ────────────────────────────────────────────────────
function CategoryImageCard({ cat, onUpdated }: { cat: CategoryImage; onUpdated: (updated: CategoryImage) => void }) {
  const [uploadCategoryImage, { isLoading: uploading }] = useUploadCategoryImageMutation();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const result = await uploadCategoryImage(fd).unwrap();
      onUpdated({ ...cat, image: result.url, imagePublicId: result.publicId });
      toast.success(`${cat.label} image updated`);
    } catch {
      toast.error('Image upload failed');
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start gap-4">
        <div
          className="group relative h-28 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-[var(--secondary)]/30"
          onClick={() => fileRef.current?.click()}
        >
          {cat.image ? (
            <Image src={cat.image} alt={cat.label} fill className="object-cover" sizes="96px" unoptimized />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--muted)]">
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs">No image</span>
            </div>
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-xs text-white">Uploading…</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
              <Upload className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold">{cat.label}</p>
          <p className="text-xs text-[var(--muted)]">slug: <span className="font-mono">{cat.slug}</span></p>
          <div>
            <Label className="text-xs">Link URL</Label>
            <Input
              defaultValue={cat.href}
              placeholder="/category/men"
              className="mt-1 h-8 text-sm"
              onBlur={(e) => onUpdated({ ...cat, href: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Display Label</Label>
            <Input
              defaultValue={cat.label}
              className="mt-1 h-8 text-sm"
              onBlur={(e) => onUpdated({ ...cat, label: e.target.value })}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-1 w-full gap-1"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Uploading…' : 'Change Image'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const { data: rawCategoryImages } = useGetCategoryImagesQuery();
  const [updateCategoryImages] = useUpdateCategoryImagesMutation();
  const [localCategoryImages, setLocalCategoryImages] = useState<CategoryImage[] | null>(null);
  const categoryImages = localCategoryImages ?? rawCategoryImages ?? [];

  // Track unique parents from existing categories + defaults
  const parentOptions = ['men', 'women', 'children', ...new Set(categories?.map((c) => c.parent) ?? [])].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { parent: 'men' },
  });

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      await createCategory(data as { name: string; parent: 'men' | 'women' | 'children' }).unwrap();
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

  const handleCategoryImageUpdated = (updated: CategoryImage) => {
    setLocalCategoryImages((prev) => {
      const base = prev ?? rawCategoryImages ?? [];
      const idx = base.findIndex((c) => c.slug === updated.slug);
      if (idx === -1) return [...base, updated];
      const next = [...base];
      next[idx] = updated;
      return next;
    });
  };

  const addShopCategory = () => {
    const slug = `category-${Date.now()}`;
    const newCat: CategoryImage = { slug, label: 'New Category', image: '', href: `/category/${slug}` };
    setLocalCategoryImages((prev) => [...(prev ?? rawCategoryImages ?? []), newCat]);
  };

  const removeShopCategory = (slug: string) => {
    setLocalCategoryImages((prev) => (prev ?? rawCategoryImages ?? []).filter((c) => c.slug !== slug));
  };

  const saveShopCategories = async () => {
    setIsSaving(true);
    try {
      await updateCategoryImages({ categories: categoryImages }).unwrap();
      setLocalCategoryImages(null);
      toast.success('Shop categories saved');
    } catch {
      toast.error('Failed to save categories');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-10">

        {/* ── Shop by Category (homepage images) ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Collections</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                These cards appear in the "Shop by Category" section on the homepage. Upload images, set labels and links, add or remove categories.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addShopCategory} className="gap-1">
                <Plus className="h-4 w-4" /> Add Category
              </Button>
              <Button size="sm" onClick={saveShopCategories} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryImages.map((cat) => (
              <div key={cat.slug} className="relative">
                <CategoryImageCard key={cat.slug + cat.image} cat={cat} onUpdated={handleCategoryImageUpdated} />
                <button
                  onClick={() => removeShopCategory(cat.slug)}
                  title="Remove this category"
                  className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1 text-white hover:bg-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sub-categories (for product filtering) ── */}
        <section>
          <h2 className="mb-1 text-xl font-bold">Sub-Categories</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            These are sub-categories linked to products. When you add a product, choose its parent and sub-category.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div>
              <Label>Name</Label>
              <Input {...register('name')} placeholder="e.g. Formal Shirts" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Parent Category</Label>
              <select {...register('parent')} className="mt-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)]">
                {parentOptions.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit">
                <Plus className="mr-1 h-4 w-4" /> Add Sub-Category
              </Button>
            </div>
          </form>

          {isLoading ? (
            <p className="mt-4">Loading…</p>
          ) : (
            <div className="mt-4 space-y-2">
              {categories?.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-2 text-sm text-[var(--muted)]">/{cat.slug}</span>
                    <span className="ml-2 rounded bg-[var(--secondary)]/40 px-2 py-0.5 text-xs text-[var(--muted)]">
                      under: {cat.parent}
                    </span>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ id: cat._id, name: cat.name })}>
                    Delete
                  </Button>
                </div>
              ))}
              {categories?.length === 0 && (
                <p className="text-sm text-[var(--muted)]">No sub-categories yet. Add one above.</p>
              )}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete sub-category?"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? Products linked to this sub-category may be affected.` : ''}
        confirmLabel="Yes, delete"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </ErrorBoundary>
  );
}
