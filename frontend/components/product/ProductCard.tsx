'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import type { RootState } from '@/store';
import { addItem } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { buildCartItemFromProduct, getCheckoutRedirectUrl } from '@/lib/productCart';

const PLACEHOLDER = '/placeholder.svg';

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

export function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const isWishlisted = wishlist.includes(product._id);
  const salePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const [imageUrl, setImageUrl] = useState(product.images[0]?.url ?? PLACEHOLDER);
  const outOfStock = product.stock < 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error('This item is out of stock');
      return;
    }
    dispatch(addItem(buildCartItemFromProduct(product)));
    toast.success('Added to cart');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error('This item is out of stock');
      return;
    }
    dispatch(addItem(buildCartItemFromProduct(product)));
    router.push(getCheckoutRedirectUrl(!!user));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const actionButtons = (
    <div className="flex gap-1.5 sm:gap-2">
      <Button
        size="sm"
        variant="accent"
        className="flex-1 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        disabled={outOfStock}
        onClick={handleBuyNow}
      >
        Buy Now
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        disabled={outOfStock}
        onClick={handleAddToCart}
      >
        + Cart
      </Button>
    </div>
  );

  if (view === 'list') {
    return (
      <div className="group flex gap-4 rounded-lg border border-zinc-200 p-4 transition hover:shadow-md dark:border-zinc-800">
        <Link href={`/products/${product._id}`} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
            onError={() => setImageUrl(PLACEHOLDER)}
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Link href={`/products/${product._id}`}>
              <Badge variant="secondary" className="mb-1 capitalize">{product.category}</Badge>
              <h3 className="font-semibold transition hover:text-[var(--accent)]">{product.name}</h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {product.description}
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm text-[#8B5E3C]">
              <Star className="h-4 w-4 fill-current" />
              {product.ratings.toFixed(1)} ({product.numReviews})
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              {hasDiscount && (
                <span className="text-sm text-zinc-400 line-through">{formatPrice(product.price)}</span>
              )}
              <span className="font-bold">{formatPrice(salePrice)}</span>
            </div>
            {actionButtons}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:shadow-zinc-900/50">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 25vw"
            onError={() => setImageUrl(PLACEHOLDER)}
          />
          {hasDiscount && (
            <Badge className="absolute left-2 top-2" variant="red">
              Sale
            </Badge>
          )}
          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow transition-transform duration-200 hover:scale-110 active:scale-95 dark:bg-zinc-900/90"
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('h-4 w-4', isWishlisted && 'fill-red-500 text-red-500')} />
          </button>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="translate-y-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-transform duration-300 group-hover:translate-y-0">
              Quick View
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3 sm:p-4">
        <Link href={`/products/${product._id}`}>
          <Badge variant="secondary" className="mb-1 text-[10px] sm:text-xs capitalize">{product.category}</Badge>
          <h3 className="text-sm sm:text-base font-semibold line-clamp-1 transition hover:text-[var(--accent)]">{product.name}</h3>
        </Link>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {product.description.length > 100
            ? product.description.slice(0, 100) + '…'
            : product.description}
        </p>
        <div className="mt-1.5 flex items-center gap-0.5 text-xs text-[#8B5E3C]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.round(product.ratings) ? 'fill-current' : 'text-zinc-300'
              )}
            />
          ))}
          <span className="ml-1 text-zinc-500">({product.ratings.toFixed(1)})</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {hasDiscount && (
            <span className="text-xs text-zinc-400 line-through">{formatPrice(product.price)}</span>
          )}
          <span className="text-sm sm:text-base font-bold">{formatPrice(salePrice)}</span>
        </div>
        <div className="mt-2">{actionButtons}</div>
      </div>
    </div>
  );
}
