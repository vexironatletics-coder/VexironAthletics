import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeStyles } from '@/components/providers/ThemeStyles';
import { SiteThemeProvider } from '@/components/providers/SiteThemeProvider';
import { StoreHydrator } from '@/components/providers/StoreHydrator';
import { CartSync } from '@/components/providers/CartSync';
import { ClerkAuthSync } from '@/components/providers/ClerkAuthSync';
import { AudienceTracker } from '@/components/providers/AudienceTracker';
import { ShopNavbar, ShopFooter, ShopWhatsApp } from '@/components/layout/ShopChrome';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { JsonLd } from '@/components/seo/JsonLd';
import { APP_NAME } from '@/lib/constants';
import { getPublicSettings } from '@/lib/getPublicSettings';
import { DEFAULT_COLOR_SCHEME_ID, DEFAULT_DESIGN_ID, getDesignPreset, normalizeThemeSettings } from '@/lib/themes';
import { organizationJsonLd, websiteJsonLd, getSiteUrl } from '@/lib/seo';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const tagline = settings?.siteTagline ?? 'Premium Clothing Store';
  const description =
    settings?.seoDescription ??
    'Shop men, women, and children clothing with free delivery above ₨5000';
  const keywords = settings?.seoKeywords?.split(',').map((k) => k.trim()) ?? [
    'sportswear',
    'athletic wear',
    'fashion',
    'Pakistan',
  ];

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${APP_NAME} — ${tagline}`,
      template: `%s | ${APP_NAME}`,
    },
    description,
    keywords,
    authors: [{ name: APP_NAME }],
    creator: APP_NAME,
    publisher: APP_NAME,
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_PK',
      siteName: APP_NAME,
      title: `${APP_NAME} — ${tagline}`,
      description,
      url: getSiteUrl(),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${APP_NAME} — ${tagline}`,
      description,
    },
    alternates: {
      canonical: getSiteUrl(),
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSettings();
  const normalized = normalizeThemeSettings(settings);
  const design = getDesignPreset(normalized.designId ?? DEFAULT_DESIGN_ID);

  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/register"
      signInFallbackRedirectUrl="/sso-callback"
      signUpFallbackRedirectUrl="/sso-callback"
    >
      <html
        lang="en"
        suppressHydrationWarning
        data-design={normalized.designId}
        data-color-scheme={normalized.colorSchemeId ?? DEFAULT_COLOR_SCHEME_ID}
        data-theme={normalized.colorSchemeId ?? DEFAULT_COLOR_SCHEME_ID}
        data-header={design.layout.header}
        data-footer={design.layout.footer}
        className={`${geistSans.variable} ${geistMono.variable} h-full`}
      >
        <head>
          <ThemeStyles />
        </head>
        <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground transition-colors duration-300">
          <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
          <StoreProvider>
            <ThemeProvider>
              <SiteThemeProvider>
                <StoreHydrator />
                <ClerkAuthSync />
                <CartSync />
                <AudienceTracker />
                <ShopNavbar />
                <main className="flex-1">{children}</main>
                <ShopFooter />
                <ShopWhatsApp />
                <CookieConsent />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3500,
                    style: {
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '14px',
                    },
                    success: {
                      iconTheme: { primary: '#16a34a', secondary: '#fff' },
                    },
                  }}
                />
              </SiteThemeProvider>
            </ThemeProvider>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
