'use client';

import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso)
  );

interface ChatMessageListProps {
  messages: ChatMessage[];
  viewerRole: 'customer' | 'admin';
  listRef?: React.RefObject<HTMLDivElement | null>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function ChatMessageList({
  messages,
  viewerRole,
  listRef,
  onLoadMore,
  hasMore,
  loadingMore,
}: ChatMessageListProps) {
  return (
    <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {hasMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mx-auto text-xs text-[var(--muted)] underline hover:text-[var(--foreground)] disabled:opacity-50"
        >
          {loadingMore ? 'Loading…' : 'Load older messages'}
        </button>
      )}
      {messages.map((msg) => {
        const isMine =
          (viewerRole === 'customer' && msg.sender === 'customer') ||
          (viewerRole === 'admin' && msg.sender === 'admin');
        const isRead =
          viewerRole === 'customer' ? msg.readByAdmin : msg.readByCustomer;

        return (
          <div
            key={msg.clientMessageId}
            className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                isMine
                  ? 'rounded-br-md bg-[#0A2947] text-[#F3E4C9]'
                  : 'rounded-bl-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]'
              )}
            >
              <p className="whitespace-pre-wrap break-words">{msg.body}</p>
              <div
                className={cn(
                  'mt-1 flex items-center justify-end gap-1 text-[10px]',
                  isMine ? 'text-[#F3E4C9]/60' : 'text-[var(--muted)]'
                )}
              >
                <span>{formatTime(msg.createdAt)}</span>
                {isMine &&
                  (isRead ? (
                    <CheckCheck className="h-3 w-3 text-emerald-400" aria-label="Read" />
                  ) : (
                    <Check className="h-3 w-3" aria-label="Delivered" />
                  ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Type a message…',
}: ChatComposerProps) {
  return (
    <form
      className="flex gap-2 border-t border-[var(--border)] p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-xl bg-[#0A2947] px-4 py-2 text-sm font-medium text-[#F3E4C9] transition hover:opacity-90 disabled:opacity-40"
      >
        Send
      </button>
    </form>
  );
}

export function OnlineDot({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        online ? 'bg-emerald-500' : 'bg-zinc-400'
      )}
      title={online ? 'Online' : 'Offline'}
    />
  );
}
