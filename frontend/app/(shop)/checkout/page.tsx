'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ThemedCouponChip, ThemedSection } from '@/components/ui/themed-section';
import { CreditCard } from 'lucide-react';
import { shippingSchema, type ShippingFormData } from '@/lib/validators';
import { ShippingAddressForm } from '@/components/checkout/ShippingAddressForm';
import { BankTransferSection } from '@/components/checkout/BankTransferSection';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useValidateCouponMutation } from '@/store/api/couponApi';
import { useGetLoyaltyProfileQuery } from '@/store/api/loyaltyApi';
import { clearCart, selectCartSubtotal, selectShippingFee } from '@/store/slices/cartSlice';
import type { RootState } from '@/store';
import { cartLineKey, getClothQualityLabel } from '@/lib/clothQuality';
import { formatPrice } from '@/lib/utils';
import { formatShippingPhones } from '@/lib/shippingAddress';
import { formatPaymentMethod } from '@/components/orders/OrderList';
import Image from 'next/image';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { items, user, token } = useSelector((state: RootState) => ({
    items: state.cart.items,
    user: state.auth.user,
    token: state.auth.token,
  }));
  const subtotal = useSelector(selectCartSubtotal);
  const baseShipping = useSelector(selectShippingFee);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const { data: loyalty } = useGetLoyaltyProfileQuery(undefined, { skip: !user });

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const shipping = freeShipping ? 0 : baseShipping;
  const total = Math.max(0, subtotal - couponDiscount - pointsToRedeem + shipping);

  useEffect(() => {
    if (!clerkLoaded) return;

    const hasToken =
      token || (typeof window !== 'undefined' && !!localStorage.getItem('token'));

    if (hasToken) {
      setAuthReady(true);
      return;
    }

    // Allow ClerkAuthSync a moment when Clerk session exists but JWT is missing
    const delay = isSignedIn ? 1200 : 0;
    const timer = setTimeout(() => {
      const stillNoToken =
        !token && (typeof window === 'undefined' || !localStorage.getItem('token'));
      if (stillNoToken) {
        router.replace('/login?callbackUrl=%2Fcheckout');
        return;
      }
      setAuthReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [clerkLoaded, isSignedIn, token, router]);

  useEffect(() => {
    if (items.length === 0 && !orderId) {
      router.push('/cart');
    }
  }, [items.length, orderId, router]);

  const {
    register,
    handleSubmit,
    getValues,
    control,
    watch,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country: 'Pakistan',
      phones: [{ number: '' }],
      landmark: '',
    },
  });

  if (items.length === 0 && !orderId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-zinc-500">Redirecting to cart...</p>
      </div>
    );
  }

  const onApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await validateCoupon({ code: couponCode.trim(), subtotal }).unwrap();
      setCouponDiscount(result.discount);
      setFreeShipping(result.freeShipping);
      toast.success(`Coupon applied: ${result.code}`);
    } catch {
      toast.error('Invalid coupon code');
      setCouponDiscount(0);
      setFreeShipping(false);
    }
  };

  const onPaymentMethodChange = (method: 'cod' | 'bank') => {
    setPaymentMethod(method);
    if (method === 'cod') {
      if (paymentProofPreview) URL.revokeObjectURL(paymentProofPreview);
      setPaymentProof(null);
      setPaymentProofPreview(null);
    }
  };

  const continueToReview = () => {
    if (paymentMethod === 'bank' && !paymentProof) {
      toast.error('Please upload your bank payment proof before continuing');
      return;
    }
    setStep(3);
  };

  const onPlaceOrder = async () => {
    if (paymentMethod === 'bank' && !paymentProof) {
      toast.error('Please upload your bank payment proof');
      setStep(2);
      return;
    }

    if (!token && typeof window !== 'undefined' && !localStorage.getItem('token')) {
      toast.error('Please sign in to place your order');
      router.push('/login?callbackUrl=%2Fcheckout');
      return;
    }

    const values = getValues();
    const shippingAddress = {
      ...values,
      phones: values.phones.map((p) => p.number.trim()).filter(Boolean),
    };
    try {
      const order = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          clothQuality: item.clothQuality ?? 'normal',
          qty: item.qty,
        })),
        shippingAddress,
        couponCode: couponCode.trim() || undefined,
        pointsToRedeem: pointsToRedeem || undefined,
        paymentMethod,
        paymentProof: paymentMethod === 'bank' ? paymentProof ?? undefined : undefined,
      }).unwrap();
      dispatch(clearCart());
      setOrderId(order._id);
      setStep(4);
      toast.success('Order placed successfully!');
    } catch (err: unknown) {
      const apiErr = err as { status?: number | string; data?: { message?: string } };
      if (apiErr.status === 401) {
        toast.error('Session expired. Please sign in again.');
        router.push('/login?callbackUrl=%2Fcheckout');
        return;
      }
      if (apiErr.status === 'FETCH_ERROR') {
        toast.error('Cannot reach the server. Make sure the backend is running.');
        return;
      }
      toast.error(apiErr.data?.message ?? 'Failed to place order. Please try again.');
    }
  };

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-zinc-500">Preparing checkout...</p>
        {!token && (
          <p className="text-sm text-zinc-400">
            Sign in required.{' '}
            <Link href="/login?callbackUrl=%2Fcheckout" className="underline">
              Go to login
            </Link>
          </p>
        )}
      </div>
    );
  }

  if (orderId) {
    return (
      <ThemedSection
        variant="gradient"
        badge="Success"
        title="Order Placed!"
        description={`Your order ID: ${orderId}`}
      >
        <div className="text-center">
          <div className="mx-auto inline-flex rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <span className="text-4xl">✓</span>
          </div>
          <Button className="mt-6 bg-white text-[var(--primary)] hover:bg-white/90" onClick={() => router.push('/orders')}>
            View Orders
          </Button>
        </div>
      </ThemedSection>
    );
  }

  return (
    <ErrorBoundary>
      <ThemedSection
        variant="band"
        badge="Secure Checkout"
        badgeIcon={CreditCard}
        title="Checkout"
        description="Complete your order in three easy steps."
        childrenClassName="mt-8 mx-auto max-w-3xl w-full"
      >
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'theme-gradient' : 'bg-[var(--border)]'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card className="theme-border-accent mt-8 border shadow-sm">
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(() => setStep(2))} className="space-y-4">
                <ShippingAddressForm
                  register={register}
                  control={control}
                  errors={errors}
                  watch={watch}
                />
                <Button type="submit" className="w-full">Continue to Payment</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="theme-border-accent mt-8 border shadow-sm">
            <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="theme-border-accent flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => onPaymentMethodChange('cod')}
                />
                <span className="font-medium">Cash on Delivery</span>
              </label>
              <label className="theme-border-accent flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'bank'}
                  onChange={() => onPaymentMethodChange('bank')}
                />
                <span className="font-medium">Bank Transfer</span>
              </label>

              {paymentMethod === 'bank' && (
                <BankTransferSection
                  total={total}
                  paymentProof={paymentProof}
                  paymentProofPreview={paymentProofPreview}
                  onProofChange={(file, preview) => {
                    setPaymentProof(file);
                    setPaymentProofPreview(preview);
                  }}
                />
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={continueToReview}>Review Order</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="theme-border-accent mt-8 border shadow-sm">
            <CardHeader><CardTitle>Review & Place Order</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="theme-border-accent rounded-lg border bg-[var(--secondary)]/30 p-4 text-sm">
                <p className="font-medium">Payment</p>
                <p className="mt-1 text-[var(--muted)]">{formatPaymentMethod(paymentMethod)}</p>
                {paymentMethod === 'bank' && paymentProofPreview && (
                  <div className="relative mt-3 h-32 w-full max-w-[200px] overflow-hidden rounded-md border bg-white dark:bg-zinc-900">
                    <Image
                      src={paymentProofPreview}
                      alt="Payment proof"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <div className="theme-border-accent rounded-lg border bg-[var(--secondary)]/30 p-4 text-sm">
                <p className="font-medium">Shipping to</p>
                <p className="mt-1 text-[var(--muted)]">
                  {getValues('name')}
                  <br />
                  Near: {getValues('landmark')}
                  <br />
                  {getValues('street')}
                  <br />
                  {getValues('city')}, {getValues('state')} {getValues('postal')}
                  <br />
                  {getValues('country')}
                  <br />
                  Mobile: {formatShippingPhones({
                    phones: getValues('phones').map((p) => p.number).filter(Boolean),
                  })}
                </p>
              </div>
              {items.map((item) => (
                <div key={cartLineKey(item)} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.qty} ({item.size}, {item.color},{' '}
                    {getClothQualityLabel(item.clothQuality ?? 'normal')})
                  </span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="theme-border-accent space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">Promo code</p>
                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="max-w-xs flex-1"
                  />
                  <Button type="button" variant="outline" className="border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10" onClick={onApplyCoupon}>
                    Apply
                  </Button>
                </div>
                {couponCode.trim() && couponDiscount > 0 && (
                  <ThemedCouponChip code={couponCode.trim()} />
                )}
                {loyalty && (
                  <div>
                    <p className="text-sm font-medium">
                      Loyalty points ({loyalty.tier}) — {loyalty.points} available
                    </p>
                    <Input
                      type="number"
                      min={0}
                      max={loyalty.points}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      placeholder="Points to redeem"
                    />
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[var(--accent)]">
                    <span>Coupon discount</span><span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {pointsToRedeem > 0 && (
                  <div className="flex justify-between text-sm text-[var(--accent)]">
                    <span>Points redeemed</span><span>-{formatPrice(pointsToRedeem)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={onPlaceOrder} disabled={isLoading}>
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </ThemedSection>
    </ErrorBoundary>
  );
}
