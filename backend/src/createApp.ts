import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { isDbConnected, isMongoConfigured } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import { sanitizeInputs } from './middleware/sanitize';
import { globalApiRateLimit } from './middleware/rateLimit';
import { requireDb } from './middleware/requireDb';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import paymentRoutes from './routes/payments';
import cartRoutes from './routes/cart';
import searchRoutes from './routes/search';
import couponRoutes from './routes/coupons';
import promotionRoutes from './routes/promotions';
import settingsRoutes from './routes/settings';
import loyaltyRoutes from './routes/loyalty';
import analyticsRoutes from './routes/analytics';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const isProd = process.env.NODE_ENV === 'production';

type CreateAppOptions = {
  /** When false, skip the API 404 handler so Next.js can serve the storefront. */
  catchAll?: boolean;
};

export const createApp = (options: CreateAppOptions = {}): express.Application => {
  const app = express();

  app.set('trust proxy', true);

  // ── Security headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://clerk.honeydew-salmon-303748.hostingersite.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          connectSrc: ["'self'", 'https:'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: isProd ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS ───────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin "${origin}" not allowed`));
      },
      credentials: true,
    })
  );

  // ── Request logging ────────────────────────────────────────────────────────
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // ── Body parsing (tight limits; file uploads use multer instead) ───────────
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // ── Input sanitization (NoSQL injection prevention) ────────────────────────
  app.use(sanitizeInputs);

  // ── Static uploads ─────────────────────────────────────────────────────────
  app.use(
    '/api/uploads/payment-proofs',
    express.static(path.join(process.cwd(), 'uploads', 'payment-proofs'))
  );

  // ── Health check (no rate limit, no DB required) ───────────────────────────
  app.get('/api/health', (_req, res) => {
    const dbConnected = isDbConnected();
    const mongoConfigured = isMongoConfigured();
    res.status(200).json({
      status: dbConnected ? 'ok' : 'degraded',
      db: dbConnected ? 'connected' : 'disconnected',
      mongodbConfigured: mongoConfigured,
      timestamp: new Date().toISOString(),
      message: dbConnected
        ? 'API is ready'
        : mongoConfigured
          ? 'Database not connected — check MongoDB Atlas Network Access (allow 0.0.0.0/0)'
          : 'MONGODB_URI is missing — add it in Hostinger Environment variables',
    });
  });

  // ── Global rate limit for all /api routes ──────────────────────────────────
  app.use('/api', globalApiRateLimit);

  // ── Block DB-dependent routes until MongoDB is connected ───────────────────
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    if (req.path === '/settings/public') return next();
    if (req.path === '/promotions/active' && req.method === 'GET') return next();
    if (req.path === '/payments/bank-details' && req.method === 'GET') return next();
    if (req.path === '/analytics/track' && req.method === 'POST') return next();
    return requireDb(req, res, next);
  });

  // ── Route mounting ─────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/promotions', promotionRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/loyalty', loyaltyRoutes);
  app.use('/api/analytics', analyticsRoutes);

  if (options.catchAll !== false) {
    app.use(notFound);
  }
  app.use(errorHandler);

  return app;
};
