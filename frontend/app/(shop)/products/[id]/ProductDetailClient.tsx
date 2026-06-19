'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Minus,
  Plus,
  Star,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ShareProduct } from '@/components/product/ShareProduct';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ThemedSection } from '@/components/ui/themed-section';
import { useGetProductByIdQuery, useGetProductsQuery } from '@/store/api/productApi';
import { addItem } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import type { RootState } from '@/store';
import { cn, formatPrice, COLORS } from '@/lib/utils';
import { APP_NAME, MAX_QTY_PER_LINE } from '@/lib/constants';
import { addRecentlyViewed } from '@/lib/recentlyViewed';
import { buildCartItemFromProduct, getCheckoutRedirectUrl } from '@/lib/productCart';

const trustBadges = [
  { icon: Truck, label: 'Free delivery ₨5k+' },
  { icon: ShieldCheck, label: 'Secure checkout' },
  { icon: RotateCcw, label: '30-day returns' },
];

function splitProductTitle(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return { lead: '', accent: name };
  const accent = parts.pop() ?? '';
  return { lead: parts.join(' '), accent };
}

export function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading } = useGetProductByIdQuery(id);
  const { data: relatedData } = useGetProductsQuery(
    { category: data?.product.category, limit: 4 },
    { skip: !data?.product }
  );
  const dispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (data?.product?._id) {
      addRecentlyViewed(data.product._id);
    }
  }, [data?.product?._id]);

  if (isLoading) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden bg-[var(--hero-from)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-3xl bg-white/10" />
            <Skeleton className="min-h-[520px] rounded-3xl bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium">Product not found</p>
        <Button asChild variant="accent">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  const { product } = data;
  const salePrice = product.discountPrice ?? product.price;
  const isWishlisted = wishlist.includes(product._id);
  const related = relatedData?.products.filter((p) => p._id !== product._id).slice(0, 4) ?? [];
  const heroImage = product.images[selectedImage]?.url ?? product.images[0]?.url ?? '';
  const { lead: titleLead, accent: titleAccent } = splitProductTitle(product.name);
  const discountPct =
    product.discountPrice &&
    Math.round(((product.price - product.discountPrice) / product.price) * 100);
  const maxQty = Math.min(product.stock, MAX_QTY_PER_LINE);

  const resolveSelection = () => {
    const selectedSize = size || product.sizes[0];
    const selectedColor = color || product.colors[0];
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return null;
    }
    if (product.stock < 1) {
      toast.error('This item is out of stock');
      return null;
    }
    return buildCartItemFromProduct(product, {
      size: selectedSize,
      color: selectedColor,
      qty,
    });
  };

  const handleAddToCart = () => {
    const item = resolveSelection();
    if (!item) return;
    dispatch(addItem(item));
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    const item = resolveSelection();
    if (!item) return;
    dispatch(addItem(item));
    router.push(getCheckoutRedirectUrl(!!user));
  };

  return (
    <ErrorBoundary>
      <section className="relative overflow-hidden bg-[var(--hero-from)] text-white">
        <div className="absolute inset-0">
          {heroImage && (
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover opacity-25 blur-2xl scale-110"
              sizes="100vw"
              priority
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--hero-from)]/95 via-[var(--hero-to)]/85 to-[var(--hero-from)]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.14),transparent_50%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/products" className="transition hover:text-white">Products</Link>
            <span>/</span>
            <Link href={`/category/${product.category}`} className="capitalize transition hover:text-white">
              {product.category}
            </Link>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-14">
            {/* Left — image slider + thumbnails */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductImageGallery
                images={product.images}
                productName={product.name}
                discountPct={discountPct || undefined}
                selectedIndex={selectedImage}
                onIndexChange={setSelectedImage}
              />
            </div>

            {/* Right — single section: name, details & cart */}
            <div className="relative rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--accent)]/25 blur-3xl" aria-hidden />

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
                {product.category}
              </div>

              <p className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">{APP_NAME}</p>

              <h1 className="mt-2 text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl xl:text-[2.5rem]">
                {titleLead ? (
                  <>
                    {titleLead}{' '}
                    <span className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-end)] to-[var(--accent)] bg-clip-text text-transparent">
                      {titleAccent}
                    </span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent)] bg-clip-text text-transparent">
                    {titleAccent}
                  </span>
                )}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn('h-4 w-4', i < Math.round(product.ratings) ? 'fill-current' : 'text-white/25')}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/70">
                  {product.ratings.toFixed(1)} · {product.numReviews} reviews
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3 border-b border-white/10 pb-6">
                {product.discountPrice && (
                  <span className="text-lg text-white/45 line-through">{formatPrice(product.price)}</span>
                )}
                <span className="text-4xl font-bold tracking-tight">{formatPrice(salePrice)}</span>
                {product.discountPrice && (
                  <span className="rounded-full bg-[var(--accent)]/25 px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
                    Save {formatPrice(product.price - product.discountPrice)}
                  </span>
                )}
              </div>

              <p className="mt-5 text-base leading-relaxed text-white/75">{product.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/80"
                  >
                    <Icon className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
                <div>
                  <p className="mb-2.5 text-sm font-medium text-white/90">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={product.stock === 0}
                        onClick={() => setSize(s)}
                        className={cn(
                          'min-w-[2.75rem] rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                          (size || product.sizes[0]) === s
                            ? 'theme-gradient border-transparent text-white shadow-md scale-105'
                            : 'border-white/20 bg-white/5 text-white/90 hover:border-white/40 hover:bg-white/10',
                          product.stock === 0 && 'cursor-not-allowed opacity-40 line-through'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2.5 text-sm font-medium text-white/90">Color</p>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => {
                      const colorDef = COLORS.find((col) => col.name === c);
                      const selected = (color || product.colors[0]) === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          title={c}
                          onClick={() => setColor(c)}
                          className={cn(
                            'h-10 w-10 rounded-full border-2 transition-all',
                            selected
                              ? 'border-white scale-110 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-transparent'
                              : 'border-white/30 hover:scale-105'
                          )}
                          style={{ backgroundColor: colorDef?.hex ?? '#ccc' }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-white/90">Quantity</p>
                  <div className="flex items-center overflow-hidden rounded-xl border border-white/20 bg-white/5">
                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 transition hover:bg-white/10">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2.75rem] text-center font-semibold">{qty}</span>
                    <button
                      type="button"
                      disabled={qty >= maxQty}
                      onClick={() => setQty(Math.min(maxQty, qty + 1))}
                      className="px-4 py-2.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <Button
                  size="lg"
                  variant="accent"
                  className="group h-12 w-full text-base shadow-lg shadow-black/25 transition hover:scale-[1.02]"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  Buy Now
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Button>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group h-12 flex-1 border-white/30 bg-white/5 text-base text-white hover:bg-white/15 hover:text-white"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 shrink-0 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                    onClick={() => {
                      dispatch(toggleWishlist(product._id));
                      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
                    }}
                  >
                    <Heart className={cn('h-5 w-5', isWishlisted && 'fill-red-400 text-red-400')} />
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <ShareProduct productId={product._id} productName={product.name} variant="hero" />
                {product.stock <= 10 && (
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      product.stock === 0
                        ? 'bg-red-500/20 text-red-200 ring-1 ring-red-400/30'
                        : 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30'
                    )}
                  >
                    {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} left`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="theme-soft-bg border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <Tabs defaultValue="size-guide">
            <TabsList className="h-11 rounded-xl bg-[var(--card)] p-1 shadow-sm">
              <TabsTrigger value="size-guide" className="rounded-lg px-5">
                Size Guide
              </TabsTrigger>
            </TabsList>
            <TabsContent value="size-guide" className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/60">
                      <th className="px-5 py-4 text-left font-semibold">Size</th>
                      <th className="px-5 py-4 text-left font-semibold">Chest (in)</th>
                      <th className="px-5 py-4 text-left font-semibold">Waist (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['XS', 'S', 'M', 'L', 'XL'].map((s, i) => (
                      <tr key={s} className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--secondary)]/40">
                        <td className="px-5 py-4 font-medium">{s}</td>
                        <td className="px-5 py-4 text-[var(--muted)]">{32 + i * 2}&quot;</td>
                        <td className="px-5 py-4 text-[var(--muted)]">{26 + i * 2}&quot;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProductReviewsSection
        productId={product._id}
        reviews={data.reviews ?? []}
        averageRating={product.ratings}
        totalReviews={product.numReviews}
      />

      {related.length > 0 && (
        <ThemedSection
          variant="band"
          badge="You may also like"
          badgeIcon={Sparkles}
          title="Related Products"
          description="Hand-picked items from the same collection."
        >
          <ProductGrid products={related} />
        </ThemedSection>
      )}
    </ErrorBoundary>
  );
}
