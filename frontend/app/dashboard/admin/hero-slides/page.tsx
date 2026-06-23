'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { GripVertical, ImageIcon, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  useGetHeroSlidesQuery,
  useUpdateHeroSlidesMutation,
  useUploadHeroSlideImageMutation,
  type HeroSlide,
} from '@/store/api/settingsApi';

const EMPTY_SLIDE = (): HeroSlide => ({
  id: `slide-${Date.now()}`,
  tag: 'New Collection',
  title: 'Headline',
  titleAccent: 'Text',
  subtitle: 'A short description for this hero slide.',
  image: '',
  ctaLabel: 'Shop Now',
  ctaHref: '/products',
  secondaryLabel: 'View All',
  secondaryHref: '/products',
});

function SlideEditor({
  slide,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  slide: HeroSlide;
  index: number;
  total: number;
  onChange: (slide: HeroSlide) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadHeroImage, { isLoading: uploading }] = useUploadHeroSlideImageMutation();
  const [preview, setPreview] = useState<string>(slide.image);

  const set = (key: keyof HeroSlide, value: string) =>
    onChange({ ...slide, [key]: value });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be under 8 MB');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const result = await uploadHeroImage(fd).unwrap();
      onChange({ ...slide, image: result.url, imagePublicId: result.publicId });
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed — check Cloudinary env vars on Hostinger');
      setPreview(slide.image);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-[var(--muted)] cursor-grab" />
          <span className="font-semibold text-sm">Slide {index + 1}</span>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={onMoveUp} disabled={index === 0} className="h-7 px-2">↑</Button>
          <Button size="sm" variant="outline" onClick={onMoveDown} disabled={index === total - 1} className="h-7 px-2">↓</Button>
          <Button size="sm" variant="destructive" onClick={onDelete} className="h-7 px-2">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Image upload */}
        <div className="sm:row-span-2">
          <Label>Slide Image</Label>
          <div
            className="relative mt-2 aspect-video w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--secondary)]/20 transition hover:border-[var(--primary)]"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="slide preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                  <span className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900">Change Image</span>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--muted)]">
                <ImageIcon className="h-8 w-8 opacity-50" />
                <span className="text-xs">{uploading ? 'Uploading…' : 'Click to upload image'}</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-sm font-semibold text-white">Uploading…</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <p className="mt-1 text-xs text-[var(--muted)]">Recommended: 1920×1080px, max 8 MB</p>
          {/* Manual URL fallback */}
          <div className="mt-2">
            <Label className="text-xs">Or paste image URL</Label>
            <Input
              value={slide.image}
              onChange={(e) => { set('image', e.target.value); setPreview(e.target.value); }}
              placeholder="https://..."
              className="mt-1 text-xs"
            />
          </div>
        </div>

        {/* Text fields */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Badge tag (small text above title)</Label>
            <Input value={slide.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Premium Collection" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={slide.title} onChange={(e) => set('title', e.target.value)} placeholder="Elevate Your" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Accent word (gradient color)</Label>
            <Input value={slide.titleAccent} onChange={(e) => set('titleAccent', e.target.value)} placeholder="Style" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Subtitle / description</Label>
            <textarea
              value={slide.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
              placeholder="A short description..."
            />
          </div>
        </div>

        {/* CTA fields */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Primary Button</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={slide.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} placeholder="Shop Now" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Link (href)</Label>
              <Input value={slide.ctaHref} onChange={(e) => set('ctaHref', e.target.value)} placeholder="/products" className="mt-1" />
            </div>
          </div>
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Secondary Button</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={slide.secondaryLabel} onChange={(e) => set('secondaryLabel', e.target.value)} placeholder="View All" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Link (href)</Label>
              <Input value={slide.secondaryHref} onChange={(e) => set('secondaryHref', e.target.value)} placeholder="/products" className="mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminHeroSlidesPage() {
  const { data: savedSlides, isLoading } = useGetHeroSlidesQuery();
  const [updateSlides, { isLoading: saving }] = useUpdateHeroSlidesMutation();
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    if (savedSlides && savedSlides.length > 0) {
      setSlides(savedSlides);
    }
  }, [savedSlides]);

  const handleChange = (index: number, updated: HeroSlide) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? updated : s)));
  };

  const handleDelete = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setSlides((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleAdd = () => {
    setSlides((prev) => [...prev, EMPTY_SLIDE()]);
  };

  const handleSave = async () => {
    if (slides.length === 0) {
      toast.error('Add at least one slide before saving');
      return;
    }
    try {
      await updateSlides({ slides }).unwrap();
      toast.success('Hero slides saved — live on the site!');
    } catch {
      toast.error('Failed to save slides');
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hero Slider</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Manage the full-screen slider on the homepage. Changes are live immediately after saving.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Slide
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Slides'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-[var(--muted)]">Loading slides…</p>
        ) : slides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-[var(--muted)] opacity-40" />
            <p className="mt-3 text-[var(--muted)]">No slides yet. Click "Add Slide" to get started.</p>
            <Button className="mt-4" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add First Slide
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, i) => (
              <SlideEditor
                key={slide.id}
                slide={slide}
                index={i}
                total={slides.length}
                onChange={(updated) => handleChange(i, updated)}
                onDelete={() => handleDelete(i)}
                onMoveUp={() => handleMoveUp(i)}
                onMoveDown={() => handleMoveDown(i)}
              />
            ))}
          </div>
        )}

        {slides.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save All Slides'}
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
