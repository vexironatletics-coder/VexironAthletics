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
import {
  CLOTH_QUALITIES,
  DEFAULT_CLOTH_QUALITY,
  getProductQualityListPrice,
  getProductQualityPrice,
  type ClothQuality,
} from '@/lib/clothQuality';

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
  const [clothQuality, setClothQuality] = useState<ClothQuality>(DEFAULT_CLOTH_QUALITY);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (data?.product?._id) {
      addRecentlyViewed(data.product._id);
    }
  }, [data?.product?._id]);

  if (isLoading) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden bg-[var(--hero-from)]">
        <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-5 sm:gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-[4/5] rounded-2xl bg-white/10 sm:aspect-square sm:rounded-3xl" />
            <Skeleton className="min-h-[420px] rounded-2xl bg-white/10 sm:min-h-[520px] sm:rounded-3xl" />
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
  const salePrice = getProductQualityPrice(product, clothQuality);
  const listPrice = getProductQualityListPrice(product, clothQuality);
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
      clothQuality,
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
      <section className="relative overflow-x-hidden bg-[var(--hero-from)] text-white">
        <div className="absolute inset-0 overflow-hidden">
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

        <div className="relative mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/60 sm:mb-6 sm:gap-2 sm:text-sm">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/products" className="transition hover:text-white">Products</Link>
            <span aria-hidden>/</span>
            <Link href={`/category/${product.category}`} className="capitalize transition hover:text-white">
              {product.category}
            </Link>
          </div>

          <div className="grid min-w-0 items-start gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-14">
            {/* Left — image slider + thumbnails */}
            <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <ProductImageGallery
                images={product.images}
                productName={product.name}
                discountPct={discountPct || undefined}
                selectedIndex={selectedImage}
                onIndexChange={setSelectedImage}
              />
            </div>

            {/* Right — single section: name, details & cart */}
            <div className="relative min-w-0 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6 lg:p-8">
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--accent)]/25 blur-3xl" aria-hidden />

              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-white/90 sm:mb-4 sm:px-3.5 sm:py-1.5 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
                <span className="truncate">{product.category}</span>
              </div>

              <p className="text-[0.65rem] font-medium tracking-[0.2em] text-white/50 uppercase sm:text-xs">{APP_NAME}</p>

              <h1 className="mt-2 break-words text-2xl leading-tight font-bold tracking-tight sm:text-3xl lg:text-4xl xl:text-[2.5rem]">
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

              <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', i < Math.round(product.ratings) ? 'fill-current' : 'text-white/25')}
                    />
                  ))}
                </div>
                <span className="text-xs text-white/70 sm:text-sm">
                  {product.ratings.toFixed(1)} · {product.numReviews} reviews
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-2 border-b border-white/10 pb-4 sm:mt-5 sm:gap-3 sm:pb-6">
                {product.discountPrice && (
                  <span className="text-base text-white/45 line-through sm:text-lg">{formatPrice(listPrice)}</span>
                )}
                <span className="text-3xl font-bold tracking-tight sm:text-4xl">{formatPrice(salePrice)}</span>
                {product.discountPrice && (
                  <span className="rounded-full bg-[var(--accent)]/25 px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--accent)] sm:px-2.5 sm:py-1 sm:text-xs">
                    Save {formatPrice(listPrice - salePrice)}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-base">{product.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
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

              <div className="mt-5 space-y-4 border-t border-white/10 pt-5 sm:mt-6 sm:space-y-5 sm:pt-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-white/90 sm:mb-2.5">Size</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={product.stock === 0}
                        onClick={() => setSize(s)}
                        className={cn(
                          'min-w-[2.5rem] rounded-lg border px-3 py-2 text-sm font-medium transition-all sm:min-w-[2.75rem] sm:px-4 sm:py-2.5',
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
                  <p className="mb-2 text-sm font-medium text-white/90 sm:mb-2.5">Quality of Cloth</p>
                  <select
                    value={clothQuality}
                    onChange={(e) => setClothQuality(e.target.value as ClothQuality)}
                    disabled={product.stock === 0}
                    className="h-11 w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm font-medium text-white backdrop-blur-sm transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                  >
                    {CLOTH_QUALITIES.map((q) => (
                      <option key={q.value} value={q.value} className="bg-zinc-900 text-white">
                        {q.label} — {formatPrice(getProductQualityPrice(product, q.value))}
                      </option>
                    ))}
                  </select>
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-white/90">Quantity</p>
                  <div className="flex w-full items-center justify-between overflow-hidden rounded-xl border border-white/20 bg-white/5 sm:w-auto sm:justify-start">
                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 transition hover:bg-white/10">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2.75rem] flex-1 text-center font-semibold sm:flex-none">{qty}</span>
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

              <div className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3">
                <Button
                  size="lg"
                  variant="accent"
                  className="group h-11 w-full text-sm shadow-lg shadow-black/25 transition hover:scale-[1.01] sm:h-12 sm:text-base sm:hover:scale-[1.02]"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  Buy Now
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Button>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group h-11 min-w-0 flex-1 border-white/30 bg-white/5 text-sm text-white hover:bg-white/15 hover:text-white sm:h-12 sm:text-base"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white sm:h-12 sm:w-12"
                    onClick={() => {
                      dispatch(toggleWishlist(product._id));
                      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
                    }}
                  >
                    <Heart className={cn('h-5 w-5', isWishlisted && 'fill-red-400 text-red-400')} />
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 sm:mt-6 sm:gap-3 sm:pt-5">
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
        <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <Tabs defaultValue="size-guide">
            <TabsList className="h-10 w-full rounded-xl bg-[var(--card)] p-1 shadow-sm sm:h-11 sm:w-auto">
              <TabsTrigger value="size-guide" className="flex-1 rounded-lg px-4 sm:flex-none sm:px-5">
                Size Guide
              </TabsTrigger>
            </TabsList>
            <TabsContent value="size-guide" className="mt-4 sm:mt-6">
              <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <table className="min-w-[320px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/60">
                      <th className="px-3 py-3 text-left font-semibold sm:px-5 sm:py-4">Size</th>
                      <th className="px-3 py-3 text-left font-semibold sm:px-5 sm:py-4">Chest (in)</th>
                      <th className="px-3 py-3 text-left font-semibold sm:px-5 sm:py-4">Waist (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['XS', 'S', 'M', 'L', 'XL'].map((s, i) => (
                      <tr key={s} className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--secondary)]/40">
                        <td className="px-3 py-3 font-medium sm:px-5 sm:py-4">{s}</td>
                        <td className="px-3 py-3 text-[var(--muted)] sm:px-5 sm:py-4">{32 + i * 2}&quot;</td>
                        <td className="px-3 py-3 text-[var(--muted)] sm:px-5 sm:py-4">{26 + i * 2}&quot;</td>
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
