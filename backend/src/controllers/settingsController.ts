import { Request, Response } from 'express';
import { getOrCreateSiteSettings } from '../models/SiteSettings';

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
  const settings = await getOrCreateSiteSettings();
  res.json(toPublicSettings(settings));
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
