'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { removeItem, updateQty } from '@/store/slices/cartSlice';
import type { CartItem as CartItemType } from '@/lib/types';
import { MAX_QTY_PER_LINE } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const dispatch = useDispatch();
  const maxQty = Math.min(item.maxStock ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);

  return (
    <div className="flex gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-zinc-500">
            Size: {item.size} | Color: {item.color}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() =>
                dispatch(
                  updateQty({
                    productId: item.productId,
                    size: item.size,
                    color: item.color,
                    qty: item.qty - 1,
                  })
                )
              }
              className="px-2 py-1"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 text-sm">{item.qty}</span>
            <button
              type="button"
              disabled={item.qty >= maxQty}
              onClick={() =>
                dispatch(
                  updateQty({
                    productId: item.productId,
                    size: item.size,
                    color: item.color,
                    qty: item.qty + 1,
                  })
                )
              }
              className="px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                dispatch(
                  removeItem({
                    productId: item.productId,
                    size: item.size,
                    color: item.color,
                  })
                )
              }
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
