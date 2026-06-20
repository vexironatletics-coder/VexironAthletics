import { connectDBWithRetry } from './config/db';
import { ensureSeedData, syncCatalogProductImages } from './services/ensureSeedData';
import { initSearchIndex } from './services/searchService';

export const startBackendServices = async (): Promise<boolean> => {
  const connected = await connectDBWithRetry();
  if (!connected) return false;

  await ensureSeedData().catch((err) => {
    console.error('[Seed] Auto-seed skipped:', err instanceof Error ? err.message : err);
  });
  await syncCatalogProductImages().catch((err) => {
    console.error('[Seed] Image sync skipped:', err instanceof Error ? err.message : err);
  });
  await initSearchIndex().catch(() =>
    console.log('MeiliSearch not available — using MongoDB search fallback')
  );
  return true;
};
