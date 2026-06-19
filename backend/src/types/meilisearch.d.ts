declare module 'meilisearch' {
  export interface MeiliSearchHit {
    id: string;
    [key: string]: unknown;
  }

  export interface SearchResponse {
    hits: MeiliSearchHit[];
    estimatedTotalHits?: number;
    facetDistribution?: Record<string, Record<string, number>>;
  }

  export interface MeiliSearchIndex {
    search(query: string, options?: Record<string, unknown>): Promise<SearchResponse>;
    addDocuments(documents: unknown[]): Promise<unknown>;
    deleteDocument(documentId: string): Promise<unknown>;
    updateSettings(settings: Record<string, unknown>): Promise<unknown>;
  }

  export class MeiliSearch {
    constructor(options: { host: string; apiKey?: string });
    createIndex(uid: string, options?: { primaryKey?: string }): Promise<unknown>;
    index(uid: string): MeiliSearchIndex;
  }
}
