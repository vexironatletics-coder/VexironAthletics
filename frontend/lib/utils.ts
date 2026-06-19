import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);

export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 250;

export const calculateShipping = (subtotal: number): number =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

export const statusConfig = {
  pending: { color: 'amber', label: 'Pending' },
  processing: { color: 'blue', label: 'Processing' },
  shipped: { color: 'purple', label: 'Shipped' },
  delivered: { color: 'green', label: 'Delivered' },
  cancelled: { color: 'red', label: 'Cancelled' },
} as const;

export type OrderStatus = keyof typeof statusConfig;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Beige', hex: '#d4c4a8' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#16a34a' },
] as const;

export const debounce = <T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/\s+/g, '-');
