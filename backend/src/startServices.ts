import { connectDBWithRetry } from './config/db';
import { ensureSeedData } from './services/ensureSeedData';
import { initSearchIndex } from './services/searchService';

export const startBackendServices = async (): Promise<void> => {
  await connectDBWithRetry();
  await ensureSeedData().catch((err) => {
    console.error('[Seed] Auto-seed skipped:', err instanceof Error ? err.message : err);
  });
  await initSearchIndex().catch(() =>
    console.log('MeiliSearch not available — using MongoDB search fallback')
  );
};
