'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLazySearchSuggestQuery } from '@/store/api/searchApi';
import { formatPrice } from '@/lib/utils';

export function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [fetchSuggest, { data }] = useLazySearchSuggestQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) return;

    debounceRef.current = setTimeout(() => {
      fetchSuggest(query.trim());
      setOpen(true);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
      </form>

      {open && data?.suggestions && data.suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {data.suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/products/${s.id}`}
              className="flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt="" className="h-10 w-8 rounded object-cover" />
              )}
              <div>
                <p className="font-medium line-clamp-1">{s.name}</p>
                <p className="text-xs capitalize text-zinc-500">{s.category}</p>
              </div>
              <span className="ml-auto text-xs font-semibold">
                {formatPrice(s.discountPrice ?? s.price)}
              </span>
            </Link>
          ))}
          <button
            type="button"
            className="w-full border-t border-zinc-100 px-3 py-2 text-left text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            onMouseDown={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
          >
            View all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
