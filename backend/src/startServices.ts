import { connectDBWithRetry } from './config/db';
import { initSearchIndex } from './services/searchService';

export const startBackendServices = async (): Promise<void> => {
  await connectDBWithRetry();
  await initSearchIndex().catch(() =>
    console.log('MeiliSearch not available — using MongoDB search fallback')
  );
};
