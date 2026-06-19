import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  designId: string;
  colorSchemeId: string;
  /** @deprecated migrated to colorSchemeId */
  themeId?: string;
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  siteTagline?: string;
  seoDescription?: string;
  seoKeywords?: string;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    designId: { type: String, default: 'classic' },
    colorSchemeId: { type: String, default: 'midnight-athletic' },
    themeId: { type: String },
    primaryColor: { type: String },
    accentColor: { type: String },
    secondaryColor: { type: String },
    siteTagline: { type: String, default: 'Premium Clothing Store' },
    seoDescription: {
      type: String,
      default: 'Shop men, women, and children athletic wear with free delivery above ₨5000',
    },
    seoKeywords: {
      type: String,
      default: 'clothing, athletic wear, sportswear, fashion, Pakistan',
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);

const LEGACY_THEME_TO_DESIGN: Record<string, string> = {
  'midnight-athletic': 'classic',
  'ocean-breeze': 'wave',
  'rose-elite': 'boutique',
  'forest-pro': 'nature',
  'royal-gold': 'premium',
};

export const migrateSiteSettings = (settings: ISiteSettings): ISiteSettings => {
  if (!settings.colorSchemeId && settings.themeId) {
    settings.colorSchemeId = settings.themeId;
  }
  if (!settings.colorSchemeId) {
    settings.colorSchemeId = 'midnight-athletic';
  }
  if (!settings.designId) {
    settings.designId = LEGACY_THEME_TO_DESIGN[settings.colorSchemeId] ?? 'classic';
  }
  return settings;
};

export const getOrCreateSiteSettings = async (): Promise<ISiteSettings> => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  migrateSiteSettings(settings);
  if (settings.isModified()) {
    await settings.save();
  }
  return settings;
};
