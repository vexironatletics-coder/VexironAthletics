import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Product, ProductCategory } from '../models/Product';
import { Review } from '../models/Review';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { syncProductToSearch } from '../services/searchService';
import { cacheAside, cacheInvalidatePrefix } from '../config/cache';

const PRODUCTS_TTL = 60; // 1 minute for product listings

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
  'category-asc': { category: 1 },
  'category-desc': { category: -1 },
  'stock-asc': { stock: 1 },
  'stock-desc': { stock: -1 },
  newest: { createdAt: -1 },
  rating: { ratings: -1 },
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    category,
    minPrice,
    maxPrice,
    size,
    color,
    search,
    sort = 'newest',
    page = '1',
    limit = '12',
    minRating,
    maxStock,
  } = req.query;

  const filter: Record<string, unknown> = { active: true };

  if (category && typeof category === 'string') {
    filter.category = category as ProductCategory;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
  }

  if (size && typeof size === 'string') {
    filter.sizes = { $in: size.split(',') };
  }

  if (color && typeof color === 'string') {
    filter.colors = { $in: color.split(',') };
  }

  if (minRating) {
    filter.ratings = { $gte: Number(minRating) };
  }

  if (maxStock) {
    filter.stock = { $lte: Number(maxStock) };
  }

  if (search && typeof search === 'string' && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  const { ids } = req.query;
  if (ids && typeof ids === 'string' && ids.trim()) {
    const idList = ids
      .split(',')
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (idList.length > 0) {
      filter._id = { $in: idList };
    }
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
  const skip = (pageNum - 1) * limitNum;
  const sortOption = SORT_MAP[sort as string] ?? SORT_MAP.newest;

  // Only cache simple public listing requests (no admin filters like maxStock)
  const isSimpleQuery = !maxStock && !search;
  const cacheKey = isSimpleQuery
    ? `products:${category ?? 'all'}:${sort}:${page}:${limit}:${minPrice ?? ''}:${maxPrice ?? ''}:${minRating ?? ''}`
    : null;

  const result = await cacheAside(
    cacheKey ?? `products:nocache:${Date.now()}`,
    cacheKey ? PRODUCTS_TTL : 0,
    async () => {
      const [products, total] = await Promise.all([
        Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
        Product.countDocuments(filter),
      ]);
      return {
        products,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      };
    }
  );

  if (isSimpleQuery) {
    res.setHeader('Cache-Control', 'public, max-age=30');
  }
  res.json(result);
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  const product = await Product.findOne({ _id: id, active: true });
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  const reviews = await Review.find({ product: id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ product, reviews });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const files = req.files as Express.Multer.File[] | undefined;
  const images: { url: string; public_id: string }[] = [];

  if (files && files.length > 0 && isCloudinaryConfigured()) {
    for (const file of files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'ecom/products' }
      );
      images.push({ url: result.secure_url, public_id: result.public_id });
    }
  } else if (req.body.images) {
    const parsed = JSON.parse(req.body.images as string) as { url: string; public_id: string }[];
    images.push(...parsed);
  }

  const product = await Product.create({
    ...req.body,
    price: Number(req.body.price),
    discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : undefined,
    stock: Number(req.body.stock),
    sizes: typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes,
    colors: typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors,
    active: req.body.active !== 'false' && req.body.active !== false,
    images,
  });

  await syncProductToSearch(product);
  cacheInvalidatePrefix('products:');

  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  const existing = await Product.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  const updateData: Record<string, unknown> = { ...req.body };

  if (updateData.price !== undefined && updateData.price !== '') {
    updateData.price = Number(updateData.price);
  }
  if (updateData.discountPrice !== undefined && updateData.discountPrice !== '') {
    updateData.discountPrice = Number(updateData.discountPrice);
  } else if ('discountPrice' in req.body && req.body.discountPrice === '') {
    updateData.discountPrice = undefined;
  }
  if (updateData.stock !== undefined && updateData.stock !== '') {
    updateData.stock = Number(updateData.stock);
  }
  if (typeof updateData.sizes === 'string') {
    updateData.sizes = JSON.parse(updateData.sizes);
  }
  if (typeof updateData.colors === 'string') {
    updateData.colors = JSON.parse(updateData.colors);
  }
  if (updateData.active !== undefined) {
    updateData.active = updateData.active !== 'false' && updateData.active !== false;
  }

  const files = req.files as Express.Multer.File[] | undefined;
  let images = existing.images;

  if (typeof req.body.existingImages === 'string' && req.body.existingImages.trim()) {
    try {
      images = JSON.parse(req.body.existingImages) as { url: string; public_id: string }[];
    } catch {
      res.status(400).json({ message: 'Invalid existing images payload' });
      return;
    }
  }

  if (files && files.length > 0 && isCloudinaryConfigured()) {
    for (const file of files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'ecom/products' }
      );
      images.push({ url: result.secure_url, public_id: result.public_id });
    }
  }

  updateData.images = images;

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  await syncProductToSearch(product);
  cacheInvalidatePrefix('products:');

  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const product = await Product.findByIdAndUpdate(
    id,
    { active: false },
    { new: true }
  );

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  await syncProductToSearch(product);
  cacheInvalidatePrefix('products:');

  res.json({ message: 'Product deactivated', product });
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const id = String(req.params.id);
  const { rating, title, comment } = req.body as {
    rating: number;
    title: string;
    comment: string;
  };

  const product = await Product.findById(id);
  if (!product || !product.active) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  const review = await Review.create({
    user: req.user!.id,
    product: id,
    rating,
    title,
    comment,
  });

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    product.ratings = Math.round(stats[0].avgRating * 10) / 10;
    product.numReviews = stats[0].count;
    await product.save();
  }

  res.status(201).json(review);
};
