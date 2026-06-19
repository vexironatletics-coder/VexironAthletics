import { MeiliSearch } from 'meilisearch';
import { Product, IProduct } from '../models/Product';
import { SearchLog } from '../models/SearchLog';

const MEILI_HOST = process.env.MEILI_HOST ?? 'http://127.0.0.1:7700';
const MEILI_KEY = process.env.MEILI_MASTER_KEY ?? '';
const INDEX_NAME = 'products';

let meiliClient: MeiliSearch | null = null;
let meiliReady = false;

const getMeili = (): MeiliSearch | null => {
  if (meiliClient) return meiliClient;
  try {
    meiliClient = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY || undefined });
    return meiliClient;
  } catch {
    return null;
  }
};

export const initSearchIndex = async (): Promise<void> => {
  const client = getMeili();
  if (!client) return;

  try {
    await client.createIndex(INDEX_NAME, { primaryKey: 'id' });
  } catch {
    // index may already exist
  }

  const index = client.index(INDEX_NAME);
  await index.updateSettings({
    searchableAttributes: ['name', 'description', 'category', 'colors', 'sizes'],
    filterableAttributes: ['category', 'sizes', 'colors', 'price', 'ratings', 'active'],
    sortableAttributes: ['price', 'ratings', 'createdAt'],
    typoTolerance: { enabled: true },
  });
  meiliReady = true;
};

const toSearchDoc = (product: IProduct) => ({
  id: product._id.toString(),
  name: product.name,
  description: product.description,
  category: product.category,
  price: product.price,
  discountPrice: product.discountPrice,
  sizes: product.sizes,
  colors: product.colors,
  ratings: product.ratings,
  image: product.images[0]?.url ?? '',
  active: product.active,
  createdAt: product.createdAt?.getTime?.() ?? Date.now(),
});

export const syncProductToSearch = async (product: IProduct): Promise<void> => {
  const client = getMeili();
  if (!client || !meiliReady) return;
  try {
    const index = client.index(INDEX_NAME);
    if (product.active) {
      await index.addDocuments([toSearchDoc(product)]);
    } else {
      await index.deleteDocument(product._id.toString());
    }
  } catch {
    // MeiliSearch unavailable
  }
};

export const syncAllProductsToSearch = async (): Promise<void> => {
  await initSearchIndex();
  const products = await Product.find({ active: true });
  const client = getMeili();
  if (!client || !meiliReady) return;
  const index = client.index(INDEX_NAME);
  await index.addDocuments(products.map(toSearchDoc));
};

export interface SearchParams {
  q: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
  userId?: string;
  source?: 'text' | 'visual' | 'autocomplete';
}

const buildMongoFilter = (params: SearchParams): Record<string, unknown> => {
  const filter: Record<string, unknown> = { active: true };
  if (params.category) filter.category = params.category;
  if (params.minPrice || params.maxPrice) {
    filter.price = {};
    if (params.minPrice) (filter.price as Record<string, number>).$gte = params.minPrice;
    if (params.maxPrice) (filter.price as Record<string, number>).$lte = params.maxPrice;
  }
  if (params.size) filter.sizes = { $in: params.size.split(',') };
  if (params.color) filter.colors = { $in: params.color.split(',') };
  if (params.minRating) filter.ratings = { $gte: params.minRating };
  return filter;
};

const fuzzyRegex = (q: string): RegExp => {
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped.split('').join('.*');
  return new RegExp(pattern, 'i');
};

export const searchProducts = async (params: SearchParams) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, params.limit ?? 12);
  const offset = (page - 1) * limit;
  const q = params.q.trim();

  const client = getMeili();
  if (client && meiliReady && q) {
    try {
      const filters: string[] = ['active = true'];
      if (params.category) filters.push(`category = "${params.category}"`);
      if (params.minPrice) filters.push(`price >= ${params.minPrice}`);
      if (params.maxPrice) filters.push(`price <= ${params.maxPrice}`);
      if (params.minRating) filters.push(`ratings >= ${params.minRating}`);
      if (params.size) {
        params.size.split(',').forEach((s) => filters.push(`sizes = "${s.trim()}"`));
      }
      if (params.color) {
        params.color.split(',').forEach((c) => filters.push(`colors = "${c.trim()}"`));
      }

      const sortMap: Record<string, string[]> = {
        'price-asc': ['price:asc'],
        'price-desc': ['price:desc'],
        rating: ['ratings:desc'],
        newest: ['createdAt:desc'],
      };

      const result = await client.index(INDEX_NAME).search(q, {
        filter: filters.length ? filters.join(' AND ') : undefined,
        sort: sortMap[params.sort ?? ''] ?? ['createdAt:desc'],
        limit,
        offset,
        facets: ['category', 'sizes', 'colors'],
      });

      const ids = result.hits.map((h: { id: string }) => h.id);
      const products = ids.length
        ? await Product.find({ _id: { $in: ids }, active: true })
        : [];
      const ordered = ids
        .map((id: string) => products.find((p) => p._id.toString() === id))
        .filter(Boolean);

      await SearchLog.create({
        query: q,
        resultsCount: result.estimatedTotalHits ?? ordered.length,
        source: params.source ?? 'text',
        user: params.userId,
        filters: { category: params.category, minPrice: params.minPrice, maxPrice: params.maxPrice },
      });

      return {
        products: ordered,
        pagination: {
          page,
          limit,
          total: result.estimatedTotalHits ?? ordered.length,
          pages: Math.ceil((result.estimatedTotalHits ?? ordered.length) / limit),
        },
        facets: result.facetDistribution ?? {},
        engine: 'meilisearch' as const,
      };
    } catch {
      // fall through to MongoDB
    }
  }

  const filter = buildMongoFilter(params);
  if (q) {
    filter.$or = [
      { $text: { $search: q } },
      { name: fuzzyRegex(q) },
      { description: fuzzyRegex(q) },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
    rating: { ratings: -1 },
  };
  const sort = sortMap[params.sort ?? ''] ?? sortMap.newest;

  const [products, total, categoryFacets, colorFacets] = await Promise.all([
    Product.find(filter).sort(sort).skip(offset).limit(limit),
    Product.countDocuments(filter),
    Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Product.aggregate([
      { $match: { active: true } },
      { $unwind: '$colors' },
      { $group: { _id: '$colors', count: { $sum: 1 } } },
    ]),
  ]);

  if (q) {
    await SearchLog.create({
      query: q,
      resultsCount: total,
      source: params.source ?? 'text',
      user: params.userId,
    });
  }

  return {
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    facets: {
      category: Object.fromEntries(categoryFacets.map((f) => [f._id, f.count])),
      colors: Object.fromEntries(colorFacets.map((f) => [f._id, f.count])),
    },
    engine: 'mongodb' as const,
  };
};

export const autocompleteSearch = async (q: string, limit = 8) => {
  const query = q.trim();
  if (!query) return [];

  const client = getMeili();
  if (client && meiliReady) {
    try {
      const result = await client.index(INDEX_NAME).search(query, {
        filter: 'active = true',
        limit,
        attributesToRetrieve: ['id', 'name', 'category', 'price', 'discountPrice', 'image'],
      });
      return result.hits;
    } catch {
      // fallback
    }
  }

  const products = await Product.find({
    active: true,
    $or: [{ name: fuzzyRegex(query) }, { $text: { $search: query } }],
  })
    .select('name category price discountPrice images')
    .limit(limit);

  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    category: p.category,
    price: p.price,
    discountPrice: p.discountPrice,
    image: p.images[0]?.url ?? '',
  }));
};

export const visualSearch = async (colors: string[], category?: string) => {
  const filter: Record<string, unknown> = { active: true };
  if (colors.length) filter.colors = { $in: colors.map((c) => new RegExp(c, 'i')) };
  if (category) filter.category = category;

  const products = await Product.find(filter).limit(24);

  await SearchLog.create({
    query: `visual:${colors.join(',')}`,
    resultsCount: products.length,
    source: 'visual',
    filters: { colors, category },
  });

  return products;
};

export const getSearchAnalytics = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [topQueries, totalSearches, bySource] = await Promise.all([
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$query', count: { $sum: 1 }, avgResults: { $avg: '$resultsCount' } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    SearchLog.countDocuments({ createdAt: { $gte: since } }),
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
  ]);

  return { topQueries, totalSearches, bySource, days };
};
