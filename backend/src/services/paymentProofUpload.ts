import fs from 'fs/promises';
import path from 'path';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';

const PAYMENT_PROOF_DIR = path.join(process.cwd(), 'uploads', 'payment-proofs');

export const uploadPaymentProof = async (
  file: Express.Multer.File
): Promise<{ url: string; public_id: string }> => {
  if (isCloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      { folder: 'ecom/payment-proofs' }
    );
    return { url: result.secure_url, public_id: result.public_id };
  }

  await fs.mkdir(PAYMENT_PROOF_DIR, { recursive: true });
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  await fs.writeFile(path.join(PAYMENT_PROOF_DIR, filename), file.buffer);

  const baseUrl =
    process.env.API_PUBLIC_URL ??
    process.env.CLIENT_URL ??
    `http://localhost:${process.env.PORT ?? 5000}`;

  return {
    url: `${baseUrl.replace(/\/$/, '')}/api/uploads/payment-proofs/${filename}`,
    public_id: filename,
  };
};
