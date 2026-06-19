'use client';

import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ThemedSection } from '@/components/ui/themed-section';
import { useGetProductsQuery } from '@/store/api/productApi';
import { addItem } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import type { RootState } from '@/store';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistIds = useSelector((state: RootState) => state.wishlist.items);
  const { data } = useGetProductsQuery({ limit: 50 });
  const wishlistProducts = data?.products.filter((p) => wishlistIds.includes(p._id)) ?? [];

  const moveToCart = (product: (typeof wishlistProducts)[0]) => {
    dispatch(
      addItem({
        productId: product._id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        image: product.images[0]?.url ?? '',
        size: product.sizes[0] ?? 'M',
        color: product.colors[0] ?? 'Black',
        qty: 1,
      })
    );
    dispatch(toggleWishlist(product._id));
    toast.success('Moved to cart');
  };

  return (
    <ErrorBoundary>
      
          <ThemedSection
            embedded
            variant="soft"
            badge="Saved Items"
            badgeIcon={Heart}
            title="Wishlist"
            description="Items you've saved for later — move them to cart when you're ready."
            childrenClassName="mt-6"
          >
            {wishlistProducts.length === 0 ? (
              <p className="text-center text-[var(--muted)]">Your wishlist is empty</p>
            ) : (
              <>
                <div className="mb-6 space-y-3">
                  {wishlistProducts.map((product) => (
                    <div key={product._id} className="theme-border-accent flex items-center justify-between rounded-xl border bg-[var(--card)] p-4 shadow-sm">
                      <span className="font-medium">{product.name}</span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => moveToCart(product)}>Move to Cart</Button>
                        <Button size="sm" variant="outline" className="border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10" onClick={() => dispatch(toggleWishlist(product._id))}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <ProductGrid products={wishlistProducts} />
              </>
            )}
          </ThemedSection>
    </ErrorBoundary>
  );
}
