'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Building2, Copy, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useGetBankTransferDetailsQuery } from '@/store/api/orderApi';
import { cn, formatPrice } from '@/lib/utils';

interface BankTransferSectionProps {
  total: number;
  paymentProof: File | null;
  paymentProofPreview: string | null;
  onProofChange: (file: File | null, preview: string | null) => void;
}

export function BankTransferSection({
  total,
  paymentProof,
  paymentProofPreview,
  onProofChange,
}: BankTransferSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: bankDetails, isLoading } = useGetBankTransferDetailsQuery();

  const copyAccountNumber = async () => {
    if (!bankDetails?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(bankDetails.accountNumber);
      toast.success('Account number copied');
    } catch {
      toast.error('Could not copy account number');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onProofChange(null, null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller');
      event.target.value = '';
      return;
    }
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }
    onProofChange(file, URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
        <Building2 className="h-4 w-4" />
        Transfer to our bank account
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading bank details...</p>
      ) : bankDetails ? (
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Account name</dt>
            <dd className="font-medium text-right">{bankDetails.accountName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Bank name</dt>
            <dd className="font-medium text-right">{bankDetails.bankName}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-zinc-500">Account number</dt>
            <dd className="flex items-center gap-2 font-mono font-medium">
              {bankDetails.accountNumber}
              <button
                type="button"
                onClick={copyAccountNumber}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800"
                aria-label="Copy account number"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-red-500">Bank details unavailable. Please try again.</p>
      )}

      <p className="rounded-md bg-white/60 px-3 py-2 text-sm font-semibold dark:bg-zinc-900/60">
        Transfer amount: {formatPrice(total)}
      </p>

      <p className="text-xs text-zinc-500">
        Transfer the order total, then upload a screenshot or photo of your payment receipt below.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition',
          paymentProof
            ? 'border-[var(--accent)]/50 bg-white/50 dark:bg-zinc-900/50'
            : 'border-zinc-300 hover:border-[var(--accent)]/40 dark:border-zinc-700'
        )}
      >
        {paymentProofPreview ? (
          <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-md border bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={paymentProofPreview}
              alt="Payment proof preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <Upload className="h-8 w-8 text-zinc-400" />
        )}
        <div>
          <p className="text-sm font-medium">
            {paymentProof ? paymentProof.name : 'Upload payment proof'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">PNG, JPG up to 5 MB</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {paymentProof ? 'Change image' : 'Choose image'}
        </Button>
      </div>
    </div>
  );
}
