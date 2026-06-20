import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

const pruneExpired = (now: number): void => {
  if (store.size < 5000) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
};

const clientKey = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
  }
  return req.ip ?? 'unknown';
};

export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, keyPrefix = 'global', message = 'Too many requests, please try again later' } =
    options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    pruneExpired(now);

    const key = `${keyPrefix}:${clientKey(req)}`;
    const existing = store.get(key);

    if (!existing || existing.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= max) {
      const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({ message });
      return;
    }

    existing.count += 1;
    next();
  };
};

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please wait and try again.',
});

export const orderRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyPrefix: 'orders',
  message: 'Too many order requests. Please wait a moment.',
});

export const analyticsRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  keyPrefix: 'analytics',
});

/** General API rate limit — applied to every /api/* route. */
export const globalApiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  keyPrefix: 'api',
  message: 'Too many requests from this IP. Please slow down.',
});
