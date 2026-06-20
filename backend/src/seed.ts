import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Product } from './models/Product';
import { Category } from './models/Category';
import { Coupon } from './models/Coupon';
import { Promotion } from './models/Promotion';
import { generateReferralCode } from './services/loyaltyService';
import { syncAllProductsToSearch } from './services/searchService';
import {
  buildCatalogProductDocs,
  catalogCategories,
  catalogCoupons,
  catalogPromotions,
  getAdminCredentials,
} from './data/catalogSeed';

dotenv.config();

const seed = async (): Promise<void> => {
  await connectDB();
  const { email, password } = getAdminCredentials();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
    Promotion.deleteMany({}),
  ]);

  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: 'Store Admin',
    email,
    password: hashedPassword,
    role: 'admin',
    provider: 'local',
    referralCode: generateReferralCode('Admin'),
  });

  console.log('Creating coupons...');
  await Coupon.insertMany(catalogCoupons);

  console.log('Creating homepage promotions...');
  await Promotion.insertMany(catalogPromotions);

  console.log('Creating categories...');
  await Category.insertMany(catalogCategories);

  console.log('Creating products...');
  const products = buildCatalogProductDocs();
  await Product.insertMany(products);

  console.log('Syncing search index...');
  await syncAllProductsToSearch().catch(() => console.log('MeiliSearch sync skipped'));

  console.log('Seed completed successfully!');
  console.log(`Products: ${products.length} total`);
  console.log(`Admin: ${email} / ${password}`);

  await mongoose.disconnect();
};

seed().catch((error: Error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
