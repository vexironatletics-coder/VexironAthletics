import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  searchProducts,
  autocompleteSearch,
  visualSearch,
  getSearchAnalytics,
  syncAllProductsToSearch,
} from '../services/searchService';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';

export const advancedSearch = async (req: Request, res: Response): Promise<void> => {
  const result = await searchProducts({
    q: (req.query.q as string) ?? '',
    category: req.query.category as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    size: req.query.size as string,
    color: req.query.color as string,
    minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
    sort: req.query.sort as string,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 12,
    userId: req.user?.id,
    source: 'text',
  });
  res.json(result);
};

export const searchSuggest = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string) ?? '';
  const suggestions = await autocompleteSearch(q);
  res.json({ suggestions });
};

export const searchVisual = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'Image file required' });
    return;
  }

  let detectedColors: string[] = [];
  let category: string | undefined;

  if (isCloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      { folder: 'ecom/visual-search', colors: true }
    );
    const colorNames = (result.predominant?.google as string[] | undefined) ?? [];
    detectedColors = colorNames.slice(0, 3);
    const tags = result.tags ?? [];
    if (tags.includes('men')) category = 'men';
    else if (tags.includes('women')) category = 'women';
    else if (tags.includes('children')) category = 'children';
  } else {
    detectedColors = ['Black', 'Blue', 'White'];
  }

  const products = await visualSearch(detectedColors, category);
  res.json({ products, detectedColors, category });
};

export const searchAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const days = parseInt(_req.query.days as string, 10) || 30;
  const analytics = await getSearchAnalytics(days);
  res.json(analytics);
};

export const reindexSearch = async (_req: Request, res: Response): Promise<void> => {
  await syncAllProductsToSearch();
  res.json({ message: 'Search index synced' });
};
