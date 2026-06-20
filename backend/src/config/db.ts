import mongoose from 'mongoose';

const connectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  tls: true,
  retryWrites: true,
};

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const connectDB = async (): Promise<void> => {
  const primaryUri = process.env.MONGODB_URI;
  if (!primaryUri) {
    throw new Error('MONGODB_URI is not defined in backend/.env');
  }

  const fallbackUri = process.env.MONGODB_URI_SRV;
  const uris = [primaryUri, fallbackUri].filter(Boolean) as string[];

  let lastError: Error | null = null;

  for (const uri of uris) {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongoose.connect(uri, connectOptions);
      console.log('MongoDB connected');
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`MongoDB connection failed for URI ending in ...${uri.slice(-40)}`);
    }
  }

  throw lastError ?? new Error('MongoDB connection failed');
};

const getPublicIpHint = async (): Promise<string | null> => {
  try {
    const res = await fetch('https://api.ipify.org', { signal: AbortSignal.timeout(5000) });
    const ip = (await res.text()).trim();
    return ip || null;
  } catch {
    return null;
  }
};

export const connectDBWithRetry = async (): Promise<boolean> => {
  let attempt = 0;
  let publicIpHint: string | null = null;

  const tryConnect = async (): Promise<boolean> => {
    attempt += 1;
    try {
      await connectDB();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`MongoDB attempt ${attempt} failed: ${message}`);

      if (attempt === 1) {
        publicIpHint = await getPublicIpHint();
      }

      if (publicIpHint) {
        console.error(
          `Fix: MongoDB Atlas → Network Access → Add IP Address → ${publicIpHint} (or 0.0.0.0/0 for dev only)`
        );
      } else {
        console.error(
          'Fix: MongoDB Atlas → Network Access → Add IP Address (use 0.0.0.0/0 for dev or your current public IP)'
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      return tryConnect();
    }
  };

  return tryConnect();
};
