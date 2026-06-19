import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';

dotenv.config();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@vexironathletics.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123';

const ensureAdmin = async (): Promise<void> => {
  await connectDB();

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: 'Store Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      provider: 'local',
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Admin account ready:');
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role:     ${admin.role}`);

  await mongoose.disconnect();
};

ensureAdmin().catch((error: Error) => {
  console.error('ensure-admin failed:', error.message);
  process.exit(1);
});
