'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Share2, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSiteUrl } from '@/lib/seo';

interface ShareProductProps {
  productId: string;
  productName: string;
  variant?: 'default' | 'hero';
}

export function ShareProduct({ productId, productName, variant = 'default' }: ShareProductProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${getSiteUrl()}/products/${productId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on VexironAthletics`,
          url: shareUrl,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const heroBtn =
    'gap-2 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white';

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={variant === 'hero' ? heroBtn : 'gap-2'}
        onClick={share}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={variant === 'hero' ? heroBtn : 'gap-2'}
        onClick={copyLink}
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
        Copy link
      </Button>
    </div>
  );
}
