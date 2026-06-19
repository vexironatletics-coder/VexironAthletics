import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { signJWT, sanitizeUser } from '../utils/helpers';
import { syncClerkUser } from '../services/clerkSync';
import { sendPasswordResetEmail } from '../services/emailService';
import { generateReferralCode } from '../services/loyaltyService';
import { JwtPayload } from '../types';

const hashResetToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return;
  }

  const { name, email, password, referralCode } = req.body as {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
  };

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'Email already registered' });
    return;
  }

  let referredBy;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) referredBy = referrer._id;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    provider: 'local',
    referralCode: generateReferralCode(name),
    referredBy,
  });

  const token = signJWT(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { email: rawEmail, password } = req.body as { email: string; password: string };
  const email = rawEmail.toLowerCase().trim();
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  if (!user.password) {
    res.status(401).json({
      message: 'This email uses social login. Sign in with Google or Facebook instead.',
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: 'Account suspended' });
    return;
  }

  const token = signJWT(user);
  res.json({ token, user: sanitizeUser(user) });
};

export const clerkSync = async (req: Request, res: Response): Promise<void> => {
  const { clerkUserId } = req.body as { clerkUserId: string };

  if (!clerkUserId) {
    res.status(400).json({ message: 'clerkUserId is required' });
    return;
  }

  const clerkData = await syncClerkUser(clerkUserId);

  const user = await User.findOneAndUpdate(
    { email: clerkData.email },
    {
      ...clerkData,
      password: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const token = signJWT(user);
  res.json({ token, user: sanitizeUser(user) });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { email } = req.body as { email: string };
  const user = await User.findOne({ email, provider: 'local' }).select(
    '+resetPasswordToken +resetPasswordExpire'
  );

  if (user && user.password) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
    const emailResult = await sendPasswordResetEmail(email, resetUrl);

    const payload: { message: string; resetUrl?: string } = {
      message: 'If an account exists with that email, a reset link has been sent.',
    };

    if (emailResult.resetUrl && process.env.NODE_ENV !== 'production') {
      payload.resetUrl = emailResult.resetUrl;
    }

    res.json(payload);
    return;
  }

  res.json({
    message: 'If an account exists with that email, a reset link has been sent.',
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { token, password } = req.body as { token: string; password: string };
  const hashedToken = hashResetToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
    provider: 'local',
  }).select('+resetPasswordToken +resetPasswordExpire +password');

  if (!user) {
    res.status(400).json({ message: 'Invalid or expired reset token' });
    return;
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.json({ message: 'Password reset successful. You can now sign in.' });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token required' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'JWT secret not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, secret) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const accessToken = signJWT(user);
    res.json({ token: accessToken, user: sanitizeUser(user) });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};
