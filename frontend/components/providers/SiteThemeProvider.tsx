'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSelector } from 'react-redux';
import { useGetPublicSettingsQuery } from '@/store/api/settingsApi';
import type { RootState } from '@/store';
import { applyThemeToDocument, DEFAULT_COLOR_SCHEME_ID, DEFAULT_DESIGN_ID, normalizeThemeSettings, type SiteThemeSettings } from '@/lib/themes';

const defaultSettings: SiteThemeSettings = {
  designId: DEFAULT_DESIGN_ID,
  colorSchemeId: DEFAULT_COLOR_SCHEME_ID,
};

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const preview = useSelector((state: RootState) => state.themePreview.preview);
  const { data: savedSettings } = useGetPublicSettingsQuery();

  const isDark = resolvedTheme === 'dark';
  const activeSettings = normalizeThemeSettings(preview ?? savedSettings ?? defaultSettings);

  useEffect(() => {
    applyThemeToDocument(activeSettings, isDark);
  }, [activeSettings, isDark]);

  return <>{children}</>;
}
