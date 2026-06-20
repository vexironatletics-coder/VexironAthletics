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

/** Refresh catalog product images — also replaces old picsum placeholder URLs. */
export const syncCatalogProductImages = async (): Promise<void> => {
  const docs = buildCatalogProductDocs();
  let updated = 0;

  for (const doc of docs) {
    const result = await Product.updateOne({ name: doc.name }, { $set: { images: doc.images } });
    if (result.modifiedCount > 0) updated += 1;
  }

  const picsumProducts = await Product.find({
    'images.url': { $regex: 'picsum\\.photos', $options: 'i' },
  });

  for (const product of picsumProducts) {
    const seedDoc = docs.find((d) => d.name === product.name);
    const image = seedDoc?.images[0] ?? docs[0]?.images[0];
    if (!image) continue;
    await Product.updateOne({ _id: product._id }, { $set: { images: [image] } });
    updated += 1;
  }

  if (updated > 0) {
    console.log(`[Seed] Updated shirt images on ${updated} products`);
    await syncAllProductsToSearch().catch(() => undefined);
  }
};
