import { Request, Response } from 'express';
import { isDbConnected } from '../config/db';
import { getOrCreateSiteSettings } from '../models/SiteSettings';

export const DEFAULT_PUBLIC_SETTINGS = {
  designId: 'classic',
  colorSchemeId: 'midnight-athletic',
  primaryColor: undefined as string | undefined,
  accentColor: undefined as string | undefined,
  secondaryColor: undefined as string | undefined,
  siteTagline: 'Premium Clothing Store',
  seoDescription:
    'Shop men, women, and children athletic wear with free delivery above ₨5000',
  seoKeywords: 'clothing, athletic wear, sportswear, fashion, Pakistan',
};

const toPublicSettings = (settings: Awaited<ReturnType<typeof getOrCreateSiteSettings>>) => ({
  designId: settings.designId,
  colorSchemeId: settings.colorSchemeId,
  primaryColor: settings.primaryColor,
  accentColor: settings.accentColor,
  secondaryColor: settings.secondaryColor,
  siteTagline: settings.siteTagline,
  seoDescription: settings.seoDescription,
  seoKeywords: settings.seoKeywords,
});

export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbConnected()) {
    res.json(DEFAULT_PUBLIC_SETTINGS);
    return;
  }

  try {
    const settings = await getOrCreateSiteSettings();
    res.json(toPublicSettings(settings));
  } catch (err) {
    console.warn('[Settings] public fallback:', err instanceof Error ? err.message : err);
    res.json(DEFAULT_PUBLIC_SETTINGS);
  }
};

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await getOrCreateSiteSettings();
  res.json(settings);
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  const settings = await getOrCreateSiteSettings();
  const allowed = [
    'designId',
    'colorSchemeId',
    'primaryColor',
    'accentColor',
    'secondaryColor',
    'siteTagline',
    'seoDescription',
    'seoKeywords',
  ] as const;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      (settings as unknown as Record<string, unknown>)[key] = req.body[key];
    }
  }

  await settings.save();
  res.json(settings);
};
