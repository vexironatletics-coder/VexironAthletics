import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Coupon } from '../models/Coupon';
import { Promotion } from '../models/Promotion';
import { generateReferralCode } from './loyaltyService';
import { syncAllProductsToSearch } from './searchService';
import {
  buildCatalogProductDocs,
  catalogCategories,
  catalogCoupons,
  catalogPromotions,
  getAdminCredentials,
} from '../data/catalogSeed';

/** Seed demo catalog when the database is empty (e.g. first Hostinger deploy). */
export const ensureSeedData = async (): Promise<void> => {
  const productCount = await Product.countDocuments();
  if (productCount > 0) return;

  console.log('[Seed] Empty catalog detected — loading sample products...');

  const { email, password } = getAdminCredentials();
  const existingAdmin = await User.findOne({ email });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: 'Store Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      provider: 'local',
      referralCode: generateReferralCode('Admin'),
    });
    console.log(`[Seed] Admin user created: ${email}`);
  }

  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(catalogCategories);
  }

  if ((await Coupon.countDocuments()) === 0) {
    await Coupon.insertMany(catalogCoupons);
  }

  if ((await Promotion.countDocuments()) === 0) {
    await Promotion.insertMany(catalogPromotions);
  }

  const docs = buildCatalogProductDocs();
  await Product.insertMany(docs);

  await syncAllProductsToSearch().catch(() => undefined);

  console.log(`[Seed] Loaded ${docs.length} sample products`);
};
