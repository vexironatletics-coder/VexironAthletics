import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { sanitizeUser } from '../utils/helpers';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(sanitizeUser(user));
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const allowedFields = ['name', 'phone', 'avatar', 'addresses'] as const;
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user!.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(sanitizeUser(user));
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 20);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    users: users.map(sanitizeUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { role } = req.body as { role: 'user' | 'admin' };

  if (!['user', 'admin'].includes(role)) {
    res.status(400).json({ message: 'Invalid role' });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(sanitizeUser(user));
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { isActive } = req.body as { isActive: boolean };

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(sanitizeUser(user));
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await User.findById(req.user!.id).select('+password');

  if (!user || !user.password) {
    res.status(400).json({ message: 'OAuth users cannot change password here' });
    return;
  }

  const bcrypt = await import('bcryptjs');
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    res.status(401).json({ message: 'Current password is incorrect' });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password updated successfully' });
};
