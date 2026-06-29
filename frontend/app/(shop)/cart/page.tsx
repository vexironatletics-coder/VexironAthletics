'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/components/cart/CartItem';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ThemedSection } from '@/components/ui/themed-section';
import type { RootState } from '@/store';
import {
  selectCartSubtotal,
  selectShippingFee,
  selectCartTotal,
} from '@/store/slices/cartSlice';
import { cartLineKey } from '@/lib/clothQuality';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectShippingFee);
  const total = useSelector(selectCartTotal);

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?callbackUrl=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <ThemedSection
        variant="soft"
        badge="Your Bag"
        badgeIcon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet — explore our latest deals."
      >
        <div className="text-center">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </ThemedSection>
    );
  }

  return (
    <ErrorBoundary>
      <ThemedSection
        variant="band"
        badge="Checkout Ready"
        badgeIcon={ShoppingCart}
        title="Shopping Cart"
        description={`${items.length} item${items.length === 1 ? '' : 's'} in your bag`}
        childrenClassName="mt-8"
      >
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <CartItem key={cartLineKey(item)} item={item} />
            ))}
          </div>
          <Card className="theme-border-accent h-fit border shadow-sm">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {subtotal < 5000 && (
                <p className="text-xs text-[var(--muted)]">Free shipping on orders above ₨5,000</p>
              )}
              <div className="flex justify-between border-t border-[var(--border)] pt-3 font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </ThemedSection>
    </ErrorBoundary>
  );
}
