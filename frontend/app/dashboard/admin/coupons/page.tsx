'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
} from '@/store/api/couponApi';
import {
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useDeletePromotionMutation,
} from '@/store/api/promotionApi';

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useGetCouponsQuery();
  const { data: promotions = [], isLoading: loadingPromotions } = useGetPromotionsQuery();
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [createPromotion, { isLoading: creatingPromotion }] = useCreatePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [deletePromoTarget, setDeletePromoTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingPromo, setIsDeletingPromo] = useState(false);

  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed' | 'free_shipping',
    value: 10,
    minOrder: 1000,
    maxUses: 100,
  });

  const [promoForm, setPromoForm] = useState({
    title: '',
    message: '',
    couponCode: '',
    sortOrder: 0,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon(form).unwrap();
      toast.success('Coupon created');
      setForm({ code: '', type: 'percent', value: 10, minOrder: 1000, maxUses: 100 });
    } catch {
      toast.error('Failed to create coupon');
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromotion({
        title: promoForm.title,
        message: promoForm.message,
        couponCode: promoForm.couponCode || undefined,
        sortOrder: promoForm.sortOrder,
      }).unwrap();
      toast.success('Homepage banner added');
      setPromoForm({ title: '', message: '', couponCode: '', sortOrder: 0 });
    } catch {
      toast.error('Failed to create banner');
    }
  };

  const handleDeactivate = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCoupon(deleteTarget.id).unwrap();
      toast.success(`Coupon "${deleteTarget.code}" has been deactivated`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to deactivate coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivatePromotion = async () => {
    if (!deletePromoTarget) return;
    setIsDeletingPromo(true);
    try {
      await deletePromotion(deletePromoTarget.id).unwrap();
      toast.success(`Banner "${deletePromoTarget.title}" removed from homepage`);
      setDeletePromoTarget(null);
    } catch {
      toast.error('Failed to remove banner');
    } finally {
      setIsDeletingPromo(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8">
          <h1 className="text-2xl font-bold">Coupons & Promotions</h1>

          <Card className="border-orange-200 dark:border-orange-900/50">
            <CardHeader>
              <CardTitle>Homepage Discount Banner</CardTitle>
              <p className="text-sm text-zinc-500">
                These messages scroll right-to-left on the landing page after Shop by Category.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePromotion} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Highlight title</Label>
                  <Input
                    value={promoForm.title}
                    onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                    placeholder="🔥 AMAZING DEAL"
                    required
                  />
                </div>
                <div>
                  <Label>Coupon code (optional)</Label>
                  <Input
                    value={promoForm.couponCode}
                    onChange={(e) => setPromoForm({ ...promoForm, couponCode: e.target.value.toUpperCase() })}
                    placeholder="WELCOME10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Scrolling message</Label>
                  <Input
                    value={promoForm.message}
                    onChange={(e) => setPromoForm({ ...promoForm, message: e.target.value })}
                    placeholder="Up to 40% off on selected styles — Shop now!"
                    required
                  />
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={promoForm.sortOrder}
                    onChange={(e) => setPromoForm({ ...promoForm, sortOrder: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={creatingPromotion}>
                    {creatingPromotion ? 'Adding...' : 'Add Banner Message'}
                  </Button>
                </div>
              </form>

              {loadingPromotions ? (
                <p className="mt-4 text-zinc-500">Loading banners...</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {promotions.map((p) => (
                    <div
                      key={p._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-200/60 bg-orange-50/50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20"
                    >
                      <div>
                        <p className="font-bold text-orange-700 dark:text-orange-300">{p.title}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{p.message}</p>
                        {p.couponCode && (
                          <p className="mt-1 font-mono text-xs text-orange-600">Code: {p.couponCode}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.active ? 'default' : 'secondary'}>
                          {p.active ? 'Live' : 'Hidden'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletePromoTarget({ id: p._id, title: p.title })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Create Coupon</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Code</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" required />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)]"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  >
                    <option value="percent">Percent off</option>
                    <option value="fixed">Fixed amount</option>
                    <option value="free_shipping">Free shipping</option>
                  </select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Min order (₨)</Label>
                  <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
                </div>
                <Button type="submit" disabled={creating} className="sm:col-span-2">
                  {creating ? 'Creating...' : 'Create Coupon'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Coupons</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-zinc-500">Loading...</p>
              ) : (
                <div className="space-y-3">
                  {coupons.map((c) => (
                    <div key={c._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                      <div>
                        <p className="font-mono font-bold">{c.code}</p>
                        <p className="text-sm text-zinc-500">
                          {c.type === 'free_shipping' ? 'Free shipping' : c.type === 'percent' ? `${c.value}% off` : `₨${c.value} off`}
                          {' · '}Min ₨{c.minOrder} · Used {c.usedCount}/{c.maxUses}
                        </p>

                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget({ id: c._id, code: c.code })}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Deactivate coupon?"
        message={
          deleteTarget
            ? `Are you sure you want to deactivate coupon "${deleteTarget.code}"? Customers will no longer be able to use it.`
            : ''
        }
        confirmLabel="Yes, deactivate"
        onConfirm={handleDeactivate}
        loading={isDeleting}
      />

      <ConfirmDialog
        open={!!deletePromoTarget}
        onOpenChange={(open) => !open && setDeletePromoTarget(null)}
        title="Remove banner?"
        message={
          deletePromoTarget
            ? `Remove "${deletePromoTarget.title}" from the homepage scrolling banner?`
            : ''
        }
        confirmLabel="Yes, remove"
        onConfirm={handleDeactivatePromotion}
        loading={isDeletingPromo}
      />
    </ErrorBoundary>
  );
}
