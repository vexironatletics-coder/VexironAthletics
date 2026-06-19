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

dotenv.config();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@vexironathletics.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123';

type SeedProduct = {
  name: string;
  category: 'men' | 'women' | 'children';
  price: number;
  discountPrice?: number;
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  ratings: number;
  numReviews: number;
  imageSeed: string;
};

const menProducts: SeedProduct[] = [
  { name: 'Classic Oxford Shirt', category: 'men', price: 3499, discountPrice: 2799, description: 'Crafted from premium long-staple cotton with a refined oxford weave. Features a structured collar, button-down front, and a relaxed yet polished fit ideal for office wear or smart casual outings.', sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Blue'], stock: 45, ratings: 4.5, numReviews: 28, imageSeed: 'men-oxford' },
  { name: 'Slim Fit Chinos', category: 'men', price: 2999, discountPrice: 2499, description: 'Modern slim-fit chinos with 2% elastane for all-day comfort. Mid-rise waist, tapered leg, and wrinkle-resistant fabric make these a wardrobe essential for work and weekends.', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Beige', 'Navy', 'Black'], stock: 38, ratings: 4.2, numReviews: 19, imageSeed: 'men-chinos' },
  { name: 'Wool Blend Blazer', category: 'men', price: 8999, discountPrice: 7499, description: 'Tailored single-breasted blazer in a luxurious wool-poly blend. Notch lapels, two-button closure, and interior pockets deliver timeless sophistication for meetings and events.', sizes: ['M', 'L', 'XL'], colors: ['Navy', 'Gray', 'Black'], stock: 22, ratings: 4.8, numReviews: 12, imageSeed: 'men-blazer' },
  { name: 'Graphic Tee', category: 'men', price: 1499, description: 'Ultra-soft 100% combed cotton tee with a minimal screen-print design. Pre-shrunk fabric, crew neck, and breathable weave perfect for layering or standalone casual looks.', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Gray'], stock: 60, ratings: 4.0, numReviews: 34, imageSeed: 'men-tee' },
  { name: 'Denim Jacket', category: 'men', price: 5499, discountPrice: 4499, description: 'Vintage-wash denim jacket with classic trucker styling. Reinforced stitching, metal buttons, and chest pockets offer durable style that pairs effortlessly with tees and chinos.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue', 'Black'], stock: 30, ratings: 4.6, numReviews: 21, imageSeed: 'men-denim' },
];

const womenProducts: SeedProduct[] = [
  { name: 'Linen Summer Dress', category: 'women', price: 4299, discountPrice: 3599, description: 'A breezy A-line dress in pure linen with adjustable tie straps and side pockets. Lightweight and breathable — perfect for brunches, vacations, and warm-weather elegance.', sizes: ['XS', 'S', 'M', 'L'], colors: ['Beige', 'White', 'Green'], stock: 35, ratings: 4.7, numReviews: 26, imageSeed: 'women-linen' },
  { name: 'High-Waist Jeans', category: 'women', price: 3799, discountPrice: 3199, description: 'Flattering high-rise jeans in stretch denim with a contoured waistband and slim straight leg. Retains shape all day while offering comfort and a streamlined silhouette.', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Blue', 'Black', 'Gray'], stock: 42, ratings: 4.4, numReviews: 31, imageSeed: 'women-jeans' },
  { name: 'Silk Blouse', category: 'women', price: 4999, description: 'Luxurious mulberry silk blouse with a relaxed drape and concealed button placket. Elegant enough for the boardroom, versatile enough for evening dinners.', sizes: ['S', 'M', 'L'], colors: ['White', 'Red', 'Navy'], stock: 28, ratings: 4.9, numReviews: 15, imageSeed: 'women-blouse' },
  { name: 'Knit Cardigan', category: 'women', price: 3299, discountPrice: 2699, description: 'Open-front cardigan in a soft cotton-acrylic blend with ribbed cuffs and hem. Layer over dresses or tops for cozy warmth without bulk.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Gray', 'Beige', 'White'], stock: 40, ratings: 4.3, numReviews: 22, imageSeed: 'women-cardigan' },
  { name: 'Floral Maxi Dress', category: 'women', price: 4599, discountPrice: 3899, description: 'Flowing maxi dress with an all-over botanical print, smocked bodice, and tiered skirt. Effortlessly romantic for weddings, garden parties, and special occasions.', sizes: ['S', 'M', 'L'], colors: ['Red', 'Blue', 'Green'], stock: 25, ratings: 4.6, numReviews: 18, imageSeed: 'women-maxi' },
];

const childrenProducts: SeedProduct[] = [
  { name: 'Kids Hoodie', category: 'children', price: 1999, discountPrice: 1599, description: 'Cozy fleece-lined hoodie with a kangaroo pocket and soft brushed interior. Durable enough for playground adventures and gentle on sensitive skin.', sizes: ['XS', 'S', 'M', 'L'], colors: ['Red', 'Blue', 'Gray'], stock: 50, ratings: 4.5, numReviews: 20, imageSeed: 'kids-hoodie' },
  { name: 'Children Joggers', category: 'children', price: 1499, description: 'Stretch-cotton joggers with an elastic waistband and cuffed ankles. Ideal for school, sports, and lounging — easy to move in and machine washable.', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Gray'], stock: 55, ratings: 4.1, numReviews: 16, imageSeed: 'kids-joggers' },
  { name: 'Kids Polo Shirt', category: 'children', price: 1299, description: 'Classic pique polo with a two-button placket and reinforced collar. Breathable cotton blend keeps kids cool and comfortable all day long.', sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Red', 'Blue', 'Green'], stock: 48, ratings: 4.0, numReviews: 14, imageSeed: 'kids-polo' },
  { name: 'Rain Jacket', category: 'children', price: 2499, discountPrice: 1999, description: 'Waterproof shell jacket with sealed seams, reflective strips, and a packable hood. Keeps little ones dry during monsoon walks and outdoor play.', sizes: ['S', 'M', 'L'], colors: ['Yellow', 'Blue', 'Red'], stock: 32, ratings: 4.4, numReviews: 11, imageSeed: 'kids-rain' },
  { name: 'Kids Sneakers Set', category: 'children', price: 3499, description: 'Lightweight sneakers with cushioned insoles, flexible rubber outsoles, and easy hook-and-loop straps. Built for running, jumping, and all-day active play.', sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Blue'], stock: 36, ratings: 4.7, numReviews: 24, imageSeed: 'kids-sneakers' },
];

const sampleProducts = [...menProducts, ...womenProducts, ...childrenProducts];

const seed = async (): Promise<void> => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
    Promotion.deleteMany({}),
  ]);

  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: 'Store Admin',
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    provider: 'local',
    referralCode: generateReferralCode('Admin'),
  });

  console.log('Creating coupons...');
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 1000, maxUses: 500, active: true },
    { code: 'SAVE500', type: 'fixed', value: 500, minOrder: 3000, maxUses: 200, active: true },
    { code: 'FREESHIP', type: 'free_shipping', value: 0, minOrder: 2000, maxUses: 1000, active: true },
  ]);

  console.log('Creating homepage promotions...');
  await Promotion.insertMany([
    {
      title: '🔥 AMAZING DEAL',
      message: 'Up to 40% off on premium athletic wear — Limited time only!',
      couponCode: 'WELCOME10',
      active: true,
      sortOrder: 0,
    },
    {
      title: '💰 SAVE BIG',
      message: 'Flat ₨500 off on orders above ₨3,000',
      couponCode: 'SAVE500',
      active: true,
      sortOrder: 1,
    },
    {
      title: '🚚 FREE SHIPPING',
      message: 'Free delivery on orders above ₨2,000',
      couponCode: 'FREESHIP',
      active: true,
      sortOrder: 2,
    },
  ]);

  console.log('Creating categories...');
  await Category.insertMany([
    { name: 'Men', slug: 'men', parent: 'men', active: true },
    { name: 'Women', slug: 'women', parent: 'women', active: true },
    { name: 'Children', slug: 'children', parent: 'children', active: true },
  ]);

  console.log('Creating products...');
  const products = sampleProducts.map((item, index) => ({
    name: item.name,
    description: item.description,
    price: item.price,
    discountPrice: item.discountPrice,
    category: item.category,
    images: [
      {
        url: `https://picsum.photos/seed/${item.imageSeed}/600/800`,
        public_id: `seed/${item.imageSeed}`,
      },
    ],
    sizes: item.sizes,
    colors: item.colors,
    stock: item.stock,
    sold: Math.floor(item.numReviews * 1.5),
    ratings: item.ratings,
    numReviews: item.numReviews,
    active: true,
  }));

  await Product.insertMany(products);

  console.log('Syncing search index...');
  await syncAllProductsToSearch().catch(() => console.log('MeiliSearch sync skipped'));

  console.log('Seed completed successfully!');
  console.log(`Products: ${menProducts.length} men, ${womenProducts.length} women, ${childrenProducts.length} children (${products.length} total)`);
  console.log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
};

seed().catch((error: Error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
