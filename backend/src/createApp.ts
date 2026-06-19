import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { isDbConnected } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
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

type CreateAppOptions = {
  /** When false, skip the API 404 handler so Next.js can serve the storefront. */
  catchAll?: boolean;
};

export const createApp = (options: CreateAppOptions = {}): express.Application => {
  const app = express();

  app.set('trust proxy', true);

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req, res) => {
    const dbConnected = isDbConnected();
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? 'ok' : 'degraded',
      db: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      message: dbConnected
        ? 'API is ready'
        : 'API running but database not connected — check MongoDB Atlas IP whitelist',
    });
  });

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
