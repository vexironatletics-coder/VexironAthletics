'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { LayoutTemplate, Palette, Save, Eye, RotateCcw, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ThemedCouponChip } from '@/components/ui/themed-section';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/api/settingsApi';
import { setThemePreview, clearThemePreview } from '@/store/slices/themePreviewSlice';
import {
  COLOR_SCHEME_PRESETS,
  DESIGN_PRESETS,
  normalizeThemeSettings,
  type ColorSchemeId,
  type DesignId,
  type SiteThemeSettings,
} from '@/lib/themes';

function DesignWireframe({ header, footer }: { header: string; footer: string }) {
  const headerClass =
    header === 'gradient'
      ? 'theme-gradient'
      : header === 'accent'
        ? 'bg-[var(--primary)]'
        : 'bg-[var(--card)] border border-[var(--border)]';

  const footerClass =
    footer === 'gradient'
      ? 'theme-gradient'
      : footer === 'hero'
        ? 'theme-hero-bg'
        : 'bg-[var(--secondary)]';

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] shadow-sm">
      <div className={`h-3 ${headerClass}`} />
      <div className="space-y-1 bg-[var(--background)] p-2">
        <div className="h-1.5 w-3/4 rounded bg-[var(--border)]" />
        <div className="h-1.5 w-1/2 rounded bg-[var(--border)]" />
      </div>
      <div className={`h-2 ${footerClass}`} />
    </div>
  );
}

export default function AdminAppearancePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: saved, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();

  const [form, setForm] = useState<SiteThemeSettings | null>(null);

  const settings = normalizeThemeSettings(form ?? saved ?? null);

  const applyPreview = (next: SiteThemeSettings) => {
    setForm(next);
    dispatch(setThemePreview(next));
  };

  const selectDesign = (designId: DesignId) => {
    applyPreview({ ...settings, designId });
  };

  const selectColorScheme = (colorSchemeId: ColorSchemeId) => {
    applyPreview({ ...settings, colorSchemeId });
  };

  const updateField = <K extends keyof SiteThemeSettings>(key: K, value: SiteThemeSettings[K]) => {
    applyPreview({ ...settings, [key]: value });
  };

  const handlePreview = () => {
    dispatch(setThemePreview(settings));
    toast.success('Live preview applied across the site');
  };

  const handleReset = () => {
    setForm(null);
    dispatch(clearThemePreview());
    toast.success('Reverted to saved settings');
  };

  const handleSave = async () => {
    try {
      await updateSettings(settings).unwrap();
      setForm(null);
      dispatch(clearThemePreview());
      toast.success('Appearance saved — entire site updated!');
      router.refresh();
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return <p className="text-[var(--muted)]">Loading appearance settings...</p>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <Palette className="h-7 w-7 text-[var(--accent)]" />
                Appearance
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Choose a <strong>site design</strong> (layout) and a <strong>color theme</strong> independently — mix and match like WordPress.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handlePreview} className="gap-2">
                <Eye className="h-4 w-4" /> Preview
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-[var(--accent)]" />
                Site Design
              </CardTitle>
              <p className="text-sm text-[var(--muted)]">
                Controls header style, footer style, and corner radius — no colors.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DESIGN_PRESETS.map((design) => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => selectDesign(design.id)}
                    className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-lg ${
                      settings.designId === design.id
                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    <DesignWireframe header={design.layout.header} footer={design.layout.footer} />
                    <p className="mt-3 font-semibold">{design.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{design.description}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--accent)]">
                      {design.layout.header} header · {design.layout.footer} footer
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[var(--accent)]" />
                Color Theme
              </CardTitle>
              <p className="text-sm text-[var(--muted)]">
                Controls colors across the entire site — works with any site design above.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {COLOR_SCHEME_PRESETS.map((scheme) => (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => selectColorScheme(scheme.id)}
                    className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-lg ${
                      settings.colorSchemeId === scheme.id
                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="mb-3 flex gap-1.5">
                      {scheme.preview.map((color) => (
                        <span
                          key={color}
                          className="h-8 flex-1 rounded-md shadow-inner"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="font-semibold">{scheme.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{scheme.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Color Overrides</CardTitle>
              <p className="text-sm text-[var(--muted)]">Optional — override the selected color theme</p>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-3">
              {[
                { key: 'primaryColor' as const, label: 'Primary color' },
                { key: 'accentColor' as const, label: 'Accent color' },
                { key: 'secondaryColor' as const, label: 'Secondary color' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="color"
                      value={settings[key] ?? '#18181b'}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-md border border-[var(--border)]"
                    />
                    <Input
                      value={settings[key] ?? ''}
                      onChange={(e) => updateField(key, e.target.value || undefined)}
                      placeholder="Use theme default"
                    />
                  </div>
                </div>
              ))}
              <div className="sm:col-span-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    applyPreview({
                      ...settings,
                      primaryColor: undefined,
                      accentColor: undefined,
                      secondaryColor: undefined,
                    })
                  }
                >
                  Clear color overrides
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site tagline</Label>
                <Input
                  value={settings.siteTagline ?? ''}
                  onChange={(e) => updateField('siteTagline', e.target.value)}
                  placeholder="Premium Clothing Store"
                />
              </div>
              <div>
                <Label>Meta description</Label>
                <textarea
                  value={settings.seoDescription ?? ''}
                  onChange={(e) => updateField('seoDescription', e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm"
                  placeholder="Shop men, women, and children athletic wear..."
                />
              </div>
              <div>
                <Label>SEO keywords (comma-separated)</Label>
                <Input
                  value={settings.seoKeywords ?? ''}
                  onChange={(e) => updateField('seoKeywords', e.target.value)}
                  placeholder="sportswear, fashion, Pakistan"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0">
            <div className="theme-soft-bg relative overflow-hidden rounded-xl p-8">
              <div className="theme-gradient absolute inset-x-0 top-0 h-1.5 shadow-sm" aria-hidden />

              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Combined preview
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {DESIGN_PRESETS.find((d) => d.id === settings.designId)?.name} design +{' '}
                {COLOR_SCHEME_PRESETS.find((c) => c.id === settings.colorSchemeId)?.name} colors
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                <Flame className="h-3.5 w-3.5" />
                Limited Time
              </div>

              <h2 className="mt-3 text-3xl font-bold text-[var(--foreground)]">
                {settings.siteTagline ?? 'Amazing Discounts'}
              </h2>

              <div className="mt-5 flex flex-wrap gap-2">
                <ThemedCouponChip code="SAVE20" />
              </div>

              <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] shadow-lg">
                <div className="site-header px-4 py-3 text-sm font-bold">Site Header</div>
                <div className="bg-[var(--background)] px-4 py-6">
                  <p className="text-sm font-medium">{settings.siteTagline ?? 'Page content'}</p>
                </div>
                <div className="site-footer px-4 py-3 text-center text-xs opacity-80">Site Footer</div>
              </div>
            </div>
          </Card>
      </div>
    </ErrorBoundary>
  );
}
