import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Category } from '../models/Category';
import { slugify } from '../utils/helpers';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ active: true }).sort({ name: 1 });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { name, parent, image, active = true } = req.body as {
    name: string;
    parent: 'men' | 'women' | 'children';
    image?: string;
    active?: boolean;
  };

  const slug = slugify(name);
  const existing = await Category.findOne({ slug });

  if (existing) {
    res.status(400).json({ message: 'Category with this name already exists' });
    return;
  }

  const category = await Category.create({ name, slug, parent, image, active });
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, parent, image, active } = req.body as {
    name?: string;
    parent?: 'men' | 'women' | 'children';
    image?: string;
    active?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (name) {
    updates.name = name;
    updates.slug = slugify(name);
  }
  if (parent) updates.parent = parent;
  if (image !== undefined) updates.image = image;
  if (active !== undefined) updates.active = active;

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  res.json({ message: 'Category deleted' });
};
