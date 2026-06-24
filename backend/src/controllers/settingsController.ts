import { Request, Response } from 'express';
import { isDbConnected } from '../config/db';
import { getOrCreateSiteSettings, IHeroSlide } from '../models/SiteSettings';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { cacheAside, cacheDelete } from '../config/cache';
import { ICategoryImage } from '../models/SiteSettings';

const SETTINGS_CACHE_KEY = 'settings:public';
const HERO_SLIDES_CACHE_KEY = 'settings:hero-slides';
const CATEGORY_IMAGES_CACHE_KEY = 'settings:category-images';
const SETTINGS_TTL = 120; // 2 minutes

const DEFAULT_CATEGORY_IMAGES: ICategoryImage[] = [
  { slug: 'men', label: "Men's", image: '', href: '/category/men' },
  { slug: 'women', label: "Women's", image: '', href: '/category/women' },
  { slug: 'children', label: "Children's", image: '', href: '/category/children' },
];

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
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(DEFAULT_PUBLIC_SETTINGS);
    return;
  }

  try {
    const data = await cacheAside(SETTINGS_CACHE_KEY, SETTINGS_TTL, async () => {
      const settings = await getOrCreateSiteSettings();
      return toPublicSettings(settings);
    });
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(data);
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
  cacheDelete(SETTINGS_CACHE_KEY);
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

// ─── HERO SLIDES ──────────────────────────────────────────────────────────────

/** Default slides used when DB has none */
const DEFAULT_HERO_SLIDES: IHeroSlide[] = [
  {
    id: 'elevate',
    tag: 'Premium Collection',
    title: 'Elevate Your',
    titleAccent: 'Style',
    subtitle: 'Discover premium clothing for men, women, and children. Quality fashion crafted for athletes and everyday champions.',
    image: '/hero/elevate.jpg',
    ctaLabel: 'Shop Men',
    ctaHref: '/category/men',
    secondaryLabel: 'Shop Women',
    secondaryHref: '/category/women',
  },
  {
    id: 'summer',
    tag: 'Season 2026',
    title: 'Summer',
    titleAccent: 'Collection',
    subtitle: 'Light fabrics, bold colors, and effortless fits designed for heat, movement, and confidence.',
    image: '/hero/summer.jpg',
    ctaLabel: 'Explore Collection',
    ctaHref: '/products',
    secondaryLabel: 'View Sale',
    secondaryHref: '/products?sort=price-desc',
  },
  {
    id: 'kids',
    tag: 'Kids & Teens',
    title: 'Playful Styles for',
    titleAccent: 'Kids',
    subtitle: 'Durable, comfortable pieces built for school days, sports, and weekend adventures.',
    image: '/hero/kids.jpg',
    ctaLabel: 'Shop Children',
    ctaHref: '/category/children',
    secondaryLabel: 'All Products',
    secondaryHref: '/products',
  },
];

export const getHeroSlides = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!isDbConnected()) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(DEFAULT_HERO_SLIDES);
      return;
    }
    const slides = await cacheAside(HERO_SLIDES_CACHE_KEY, SETTINGS_TTL, async () => {
      const settings = await getOrCreateSiteSettings();
      return settings.heroSlides.length > 0 ? settings.heroSlides : DEFAULT_HERO_SLIDES;
    });
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(slides);
  } catch {
    res.json(DEFAULT_HERO_SLIDES);
  }
};

export const updateHeroSlides = async (req: Request, res: Response): Promise<void> => {
  cacheDelete(HERO_SLIDES_CACHE_KEY);
  try {
    const settings = await getOrCreateSiteSettings();
    const slides: IHeroSlide[] = req.body.slides;
    if (!Array.isArray(slides) || slides.length === 0) {
      res.status(400).json({ message: 'slides array is required' });
      return;
    }
    settings.heroSlides = slides;
    await settings.save();
    res.json(settings.heroSlides);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update hero slides' });
  }
};

export const uploadHeroSlideImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    if (!isCloudinaryConfigured()) {
      res.status(500).json({ message: 'Image uploads not configured (Cloudinary env vars missing)' });
      return;
    }

    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder: 'ecom/hero',
        transformation: [{ width: 1920, height: 1080, crop: 'fill', quality: 'auto' }],
      }
    );

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('[Hero Upload]', err);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

// ─── CATEGORY IMAGES ─────────────────────────────────────────────────────────

export const getCategoryImages = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!isDbConnected()) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(DEFAULT_CATEGORY_IMAGES);
      return;
    }
    const data = await cacheAside(CATEGORY_IMAGES_CACHE_KEY, SETTINGS_TTL, async () => {
      const settings = await getOrCreateSiteSettings();
      return settings.categoryImages.length > 0 ? settings.categoryImages : DEFAULT_CATEGORY_IMAGES;
    });
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(data);
  } catch {
    res.json(DEFAULT_CATEGORY_IMAGES);
  }
};

export const updateCategoryImages = async (req: Request, res: Response): Promise<void> => {
  cacheDelete(CATEGORY_IMAGES_CACHE_KEY);
  try {
    const settings = await getOrCreateSiteSettings();
    const categories: ICategoryImage[] = req.body.categories;
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({ message: 'categories array is required' });
      return;
    }
    settings.categoryImages = categories;
    await settings.save();
    res.json(settings.categoryImages);
  } catch {
    res.status(500).json({ message: 'Failed to update category images' });
  }
};

export const uploadCategoryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ message: 'No image file provided' }); return; }
    if (!isCloudinaryConfigured()) {
      res.status(500).json({ message: 'Cloudinary env vars missing' }); return;
    }
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      { folder: 'ecom/categories', transformation: [{ width: 800, height: 1000, crop: 'fill', quality: 'auto' }] }
    );
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('[Category Upload]', err);
    res.status(500).json({ message: 'Image upload failed' });
  }
};
