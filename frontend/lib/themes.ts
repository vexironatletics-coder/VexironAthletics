export type ColorSchemeId =
  | 'midnight-athletic'
  | 'ocean-breeze'
  | 'rose-elite'
  | 'forest-pro'
  | 'royal-gold'
  | 'vexiron-navy';

/** @deprecated alias for ColorSchemeId */
export type ThemeId = ColorSchemeId;

export type DesignId = 'classic' | 'wave' | 'boutique' | 'nature' | 'premium';

export type HeaderStyle = 'solid' | 'gradient' | 'accent';
export type FooterStyle = 'soft' | 'hero' | 'gradient';

export interface ThemeLayout {
  header: HeaderStyle;
  footer: FooterStyle;
  radius: string;
}

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  secondary: string;
  heroFrom: string;
  heroTo: string;
  gradientStart: string;
  gradientEnd: string;
  background: string;
  foreground: string;
  card: string;
  muted: string;
  border: string;
  ring: string;
  headerBg: string;
  headerFg: string;
  footerBg: string;
  footerFg: string;
  link: string;
  linkHover: string;
  inputBg: string;
  inputBorder: string;
  radius: string;
}

type ColorBase = Omit<
  ThemeColors,
  'headerBg' | 'headerFg' | 'footerBg' | 'footerFg' | 'link' | 'linkHover' | 'inputBg' | 'inputBorder' | 'radius'
>;

export interface SiteThemeSettings {
  designId: DesignId;
  colorSchemeId: ColorSchemeId;
  /** Legacy field — migrated to colorSchemeId */
  themeId?: ColorSchemeId;
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  siteTagline?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface DesignPreset {
  id: DesignId;
  name: string;
  description: string;
  layout: ThemeLayout;
}

export interface ColorSchemePreset {
  id: ColorSchemeId;
  name: string;
  description: string;
  preview: [string, string, string];
  light: ColorBase;
  dark: ColorBase;
}

const enrichColors = (base: ColorBase, layout: ThemeLayout): ThemeColors => {
  const headerBg =
    layout.header === 'accent'
      ? base.primary
      : layout.header === 'gradient'
        ? base.heroFrom
        : base.card;

  const headerFg =
    layout.header === 'accent'
      ? base.primaryForeground
      : layout.header === 'gradient'
        ? '#ffffff'
        : base.foreground;

  const footerBg =
    layout.footer === 'gradient'
      ? base.gradientStart
      : layout.footer === 'hero'
        ? base.heroFrom
        : base.secondary;

  const footerFg = layout.footer === 'soft' ? base.foreground : '#ffffff';

  return {
    ...base,
    headerBg,
    headerFg,
    footerBg,
    footerFg,
    link: base.accent,
    linkHover: base.primary,
    inputBg: base.card,
    inputBorder: base.border,
    radius: layout.radius,
  };
};

const lightBase = (overrides: Partial<ColorBase>): ColorBase => ({
  primary: '#18181b',
  primaryForeground: '#fafafa',
  accent: '#f97316',
  accentForeground: '#ffffff',
  secondary: '#f4f4f5',
  heroFrom: '#18181b',
  heroTo: '#3f3f46',
  gradientStart: '#f97316',
  gradientEnd: '#ef4444',
  background: '#fafafa',
  foreground: '#171717',
  card: '#ffffff',
  muted: '#71717a',
  border: '#e4e4e7',
  ring: '#a1a1aa',
  ...overrides,
});

const darkBase = (overrides: Partial<ColorBase>): ColorBase => ({
  primary: '#fafafa',
  primaryForeground: '#18181b',
  accent: '#fb923c',
  accentForeground: '#18181b',
  secondary: '#27272a',
  heroFrom: '#09090b',
  heroTo: '#18181b',
  gradientStart: '#fb923c',
  gradientEnd: '#f97316',
  background: '#09090b',
  foreground: '#fafafa',
  card: '#0a0a0a',
  muted: '#a1a1aa',
  border: '#27272a',
  ring: '#52525b',
  ...overrides,
});

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean solid header with a soft footer — balanced and professional.',
    layout: { header: 'solid', footer: 'soft', radius: '0.5rem' },
  },
  {
    id: 'wave',
    name: 'Wave',
    description: 'Gradient header and footer with rounded corners — modern and vibrant.',
    layout: { header: 'gradient', footer: 'gradient', radius: '0.75rem' },
  },
  {
    id: 'boutique',
    name: 'Boutique',
    description: 'Accent-colored header with hero footer — luxury fashion feel.',
    layout: { header: 'accent', footer: 'hero', radius: '1rem' },
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Minimal header with bold hero footer — earthy and grounded.',
    layout: { header: 'solid', footer: 'hero', radius: '0.75rem' },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Gradient header with hero footer — bold premium branding.',
    layout: { header: 'gradient', footer: 'hero', radius: '0.5rem' },
  },
];

export const COLOR_SCHEME_PRESETS: ColorSchemePreset[] = [
  {
    id: 'midnight-athletic',
    name: 'Midnight Athletic',
    description: 'Bold dark tones with energetic orange.',
    preview: ['#18181b', '#f97316', '#ef4444'],
    light: lightBase({}),
    dark: darkBase({}),
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Fresh blues and teals — clean and modern.',
    preview: ['#0c4a6e', '#06b6d4', '#38bdf8'],
    light: lightBase({
      primary: '#0c4a6e',
      accent: '#06b6d4',
      secondary: '#ecfeff',
      heroFrom: '#0c4a6e',
      heroTo: '#0369a1',
      gradientStart: '#06b6d4',
      gradientEnd: '#0284c7',
      background: '#f0f9ff',
    }),
    dark: darkBase({
      primary: '#38bdf8',
      primaryForeground: '#0c4a6e',
      accent: '#22d3ee',
      heroFrom: '#082f49',
      heroTo: '#0c4a6e',
      gradientStart: '#22d3ee',
      gradientEnd: '#06b6d4',
    }),
  },
  {
    id: 'rose-elite',
    name: 'Rose Elite',
    description: 'Luxury rose and plum tones.',
    preview: ['#831843', '#ec4899', '#f472b6'],
    light: lightBase({
      primary: '#831843',
      accent: '#ec4899',
      secondary: '#fdf2f8',
      heroFrom: '#831843',
      heroTo: '#9d174d',
      gradientStart: '#ec4899',
      gradientEnd: '#db2777',
      background: '#fff1f2',
    }),
    dark: darkBase({
      primary: '#f9a8d4',
      primaryForeground: '#500724',
      accent: '#f472b6',
      heroFrom: '#500724',
      heroTo: '#831843',
      gradientStart: '#f472b6',
      gradientEnd: '#ec4899',
    }),
  },
  {
    id: 'forest-pro',
    name: 'Forest Pro',
    description: 'Earthy greens — natural and active.',
    preview: ['#14532d', '#22c55e', '#84cc16'],
    light: lightBase({
      primary: '#14532d',
      accent: '#22c55e',
      secondary: '#f0fdf4',
      heroFrom: '#14532d',
      heroTo: '#166534',
      gradientStart: '#22c55e',
      gradientEnd: '#16a34a',
      background: '#f7fee7',
    }),
    dark: darkBase({
      primary: '#86efac',
      primaryForeground: '#14532d',
      accent: '#4ade80',
      heroFrom: '#052e16',
      heroTo: '#14532d',
      gradientStart: '#4ade80',
      gradientEnd: '#22c55e',
    }),
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    description: 'Navy and gold — classic premium.',
    preview: ['#1e3a8a', '#eab308', '#fbbf24'],
    light: lightBase({
      primary: '#1e3a8a',
      accent: '#eab308',
      accentForeground: '#1e3a8a',
      secondary: '#fef9c3',
      heroFrom: '#1e3a8a',
      heroTo: '#1d4ed8',
      gradientStart: '#eab308',
      gradientEnd: '#f59e0b',
      background: '#eff6ff',
    }),
    dark: darkBase({
      primary: '#fbbf24',
      primaryForeground: '#1e3a8a',
      accent: '#fde047',
      accentForeground: '#1e3a8a',
      heroFrom: '#172554',
      heroTo: '#1e3a8a',
      gradientStart: '#fde047',
      gradientEnd: '#eab308',
    }),
  },
  {
    id: 'vexiron-navy',
    name: 'Vexiron Navy',
    description: 'Deep navy background with cream & brown — official brand palette.',
    preview: ['#0A2947', '#F3E4C9', '#8B5E3C'],
    light: {
      primary:            '#F3E4C9',
      primaryForeground:  '#0A2947',
      accent:             '#8B5E3C',
      accentForeground:   '#F3E4C9',
      secondary:          '#112b4a',
      heroFrom:           '#0A2947',
      heroTo:             '#1a3d6b',
      gradientStart:      '#0A2947',
      gradientEnd:        '#8B5E3C',
      background:         '#0A2947',
      foreground:         '#F3E4C9',
      card:               '#0e3259',
      muted:              '#D3D4C0',
      border:             '#1e4a7a',
      ring:               '#2a6099',
    },
    dark: {
      primary:            '#F3E4C9',
      primaryForeground:  '#0A2947',
      accent:             '#a07850',
      accentForeground:   '#ffffff',
      secondary:          '#0A2947',
      heroFrom:           '#040c17',
      heroTo:             '#0A2947',
      gradientStart:      '#0A2947',
      gradientEnd:        '#8B5E3C',
      background:         '#040c17',
      foreground:         '#F3E4C9',
      card:               '#0A2947',
      muted:              '#D3D4C0',
      border:             '#1a3050',
      ring:               '#2a4a70',
    },
  },
];

/** Maps legacy combined themeId to designId */
const LEGACY_THEME_TO_DESIGN: Record<ColorSchemeId, DesignId> = {
  'midnight-athletic': 'classic',
  'ocean-breeze': 'wave',
  'rose-elite': 'boutique',
  'forest-pro': 'nature',
  'royal-gold': 'premium',
  'vexiron-navy': 'boutique',
};

export const DEFAULT_DESIGN_ID: DesignId = 'classic';
export const DEFAULT_COLOR_SCHEME_ID: ColorSchemeId = 'midnight-athletic';
export const DEFAULT_THEME_ID = DEFAULT_COLOR_SCHEME_ID;

export const getDesignPreset = (id: string): DesignPreset =>
  DESIGN_PRESETS.find((d) => d.id === id) ?? DESIGN_PRESETS[0];

export const getColorScheme = (id: string): ColorSchemePreset =>
  COLOR_SCHEME_PRESETS.find((c) => c.id === id) ?? COLOR_SCHEME_PRESETS[0];

/** @deprecated use getColorScheme */
export const getThemePreset = (id: string) => {
  const color = getColorScheme(id);
  const design = getDesignPreset(LEGACY_THEME_TO_DESIGN[color.id as ColorSchemeId] ?? 'classic');
  return {
    id: color.id,
    name: color.name,
    description: color.description,
    preview: color.preview,
    layout: design.layout,
    light: enrichColors(color.light, design.layout),
    dark: enrichColors(color.dark, design.layout),
  };
};

/** @deprecated use COLOR_SCHEME_PRESETS */
export const THEME_PRESETS = COLOR_SCHEME_PRESETS.map((c) => {
  const design = getDesignPreset(LEGACY_THEME_TO_DESIGN[c.id]);
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    preview: c.preview,
    layout: design.layout,
    light: enrichColors(c.light, design.layout),
    dark: enrichColors(c.dark, design.layout),
  };
});

export const normalizeThemeSettings = (
  settings: Partial<SiteThemeSettings> | null | undefined
): SiteThemeSettings => {
  const legacyId = (settings?.colorSchemeId ??
    settings?.themeId ??
    DEFAULT_COLOR_SCHEME_ID) as ColorSchemeId;
  const colorSchemeId = COLOR_SCHEME_PRESETS.some((c) => c.id === legacyId)
    ? legacyId
    : DEFAULT_COLOR_SCHEME_ID;
  const designId =
    settings?.designId && DESIGN_PRESETS.some((d) => d.id === settings.designId)
      ? settings.designId
      : LEGACY_THEME_TO_DESIGN[colorSchemeId] ?? DEFAULT_DESIGN_ID;

  return {
    designId,
    colorSchemeId,
    primaryColor: settings?.primaryColor,
    accentColor: settings?.accentColor,
    secondaryColor: settings?.secondaryColor,
    siteTagline: settings?.siteTagline,
    seoDescription: settings?.seoDescription,
    seoKeywords: settings?.seoKeywords,
  };
};

export const resolveThemeColors = (
  settings: SiteThemeSettings,
  isDark: boolean
): ThemeColors => {
  const normalized = normalizeThemeSettings(settings);
  const colorScheme = getColorScheme(normalized.colorSchemeId);
  const design = getDesignPreset(normalized.designId);
  const base = isDark ? { ...colorScheme.dark } : { ...colorScheme.light };
  const colors = enrichColors(base, design.layout);

  if (normalized.primaryColor) {
    colors.primary = normalized.primaryColor;
    colors.heroFrom = normalized.primaryColor;
    if (design.layout.header === 'accent') {
      colors.headerBg = normalized.primaryColor;
    }
    if (design.layout.footer === 'hero') {
      colors.footerBg = normalized.primaryColor;
    }
    colors.linkHover = normalized.primaryColor;
  }
  if (normalized.accentColor) {
    colors.accent = normalized.accentColor;
    colors.gradientStart = normalized.accentColor;
    colors.link = normalized.accentColor;
    if (design.layout.footer === 'gradient') {
      colors.footerBg = normalized.accentColor;
    }
  }
  if (normalized.secondaryColor) {
    colors.secondary = normalized.secondaryColor;
    if (design.layout.footer === 'soft') {
      colors.footerBg = normalized.secondaryColor;
    }
  }

  return colors;
};

export const themeColorsToCssVars = (colors: ThemeColors): Record<string, string> => ({
  '--primary': colors.primary,
  '--primary-foreground': colors.primaryForeground,
  '--accent': colors.accent,
  '--accent-foreground': colors.accentForeground,
  '--secondary': colors.secondary,
  '--hero-from': colors.heroFrom,
  '--hero-to': colors.heroTo,
  '--gradient-start': colors.gradientStart,
  '--gradient-end': colors.gradientEnd,
  '--background': colors.background,
  '--foreground': colors.foreground,
  '--card': colors.card,
  '--muted': colors.muted,
  '--border': colors.border,
  '--ring': colors.ring,
  '--header-bg': colors.headerBg,
  '--header-fg': colors.headerFg,
  '--footer-bg': colors.footerBg,
  '--footer-fg': colors.footerFg,
  '--link': colors.link,
  '--link-hover': colors.linkHover,
  '--input-bg': colors.inputBg,
  '--input-border': colors.inputBorder,
  '--radius': colors.radius,
});

const varsToCssBlock = (vars: Record<string, string>): string =>
  Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

/** Color palette CSS — layout comes from data-design / data-header / data-footer */
export const generateColorSchemeCss = (): string => {
  const neutralLayout: ThemeLayout = { header: 'solid', footer: 'soft', radius: '0.5rem' };
  return COLOR_SCHEME_PRESETS.map((scheme) => {
    const light = varsToCssBlock(themeColorsToCssVars(enrichColors(scheme.light, neutralLayout)));
    const dark = varsToCssBlock(themeColorsToCssVars(enrichColors(scheme.dark, neutralLayout)));
    return `[data-color-scheme="${scheme.id}"]{${light}}.dark[data-color-scheme="${scheme.id}"],.dark [data-color-scheme="${scheme.id}"]{${dark}}`;
  }).join('');
};

/** @deprecated use generateColorSchemeCss */
export const generateThemePresetsCss = generateColorSchemeCss;

export const applyThemeAttributes = (
  settings: SiteThemeSettings,
  root: HTMLElement = document.documentElement
): void => {
  const normalized = normalizeThemeSettings(settings);
  const design = getDesignPreset(normalized.designId);
  root.setAttribute('data-color-scheme', normalized.colorSchemeId);
  root.setAttribute('data-design', normalized.designId);
  root.setAttribute('data-theme', normalized.colorSchemeId);
  root.setAttribute('data-header', design.layout.header);
  root.setAttribute('data-footer', design.layout.footer);
};

export const applyThemeToDocument = (
  settings: SiteThemeSettings,
  isDark: boolean
): void => {
  if (typeof document === 'undefined') return;
  const colors = resolveThemeColors(settings, isDark);
  const vars = themeColorsToCssVars(colors);
  const root = document.documentElement;
  applyThemeAttributes(settings, root);
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
