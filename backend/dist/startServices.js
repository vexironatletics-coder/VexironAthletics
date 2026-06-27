/* VexironAthletics Backend – built with esbuild */
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/startServices.ts
var startServices_exports = {};
__export(startServices_exports, {
  startBackendServices: () => startBackendServices
});
module.exports = __toCommonJS(startServices_exports);

// src/config/db.ts
var import_mongoose = __toESM(require("mongoose"));
var getConnectOptions = (uri) => {
  const useTls = uri.startsWith("mongodb+srv://") || /[?&](ssl=true|tls=true)/i.test(uri);
  return {
    serverSelectionTimeoutMS: 2e4,
    socketTimeoutMS: 45e3,
    ...useTls ? { tls: true } : {}
  };
};
var connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI?.trim();
  const fallbackUri = process.env.MONGODB_URI_SRV?.trim();
  if (!primaryUri && !fallbackUri) {
    throw new Error(
      "MONGODB_URI is not set. Add it in Hostinger hPanel \u2192 Environment variables."
    );
  }
  const uris = [primaryUri, fallbackUri].filter(Boolean);
  let lastError = null;
  for (const uri of uris) {
    try {
      if (import_mongoose.default.connection.readyState !== 0) {
        await import_mongoose.default.disconnect();
      }
      await import_mongoose.default.connect(uri, getConnectOptions(uri));
      console.log("MongoDB connected");
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`MongoDB connection failed for URI ending in ...${uri.slice(-40)}`);
    }
  }
  throw lastError ?? new Error("MongoDB connection failed");
};
var getPublicIpHint = async () => {
  try {
    const res = await fetch("https://api.ipify.org", { signal: AbortSignal.timeout(5e3) });
    const ip = (await res.text()).trim();
    return ip || null;
  } catch {
    return null;
  }
};
var connectDBWithRetry = async () => {
  let attempt = 0;
  let publicIpHint = null;
  const tryConnect = async () => {
    attempt += 1;
    try {
      await connectDB();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`MongoDB attempt ${attempt} failed: ${message}`);
      if (attempt === 1) {
        publicIpHint = await getPublicIpHint();
      }
      if (publicIpHint) {
        console.error(
          `Fix: MongoDB Atlas \u2192 Network Access \u2192 Add IP Address \u2192 ${publicIpHint} (or 0.0.0.0/0 for dev only)`
        );
      } else {
        console.error(
          "Fix: MongoDB Atlas \u2192 Network Access \u2192 Add IP Address (use 0.0.0.0/0 for dev or your current public IP)"
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 5e3));
      return tryConnect();
    }
  };
  return tryConnect();
};

// src/services/ensureSeedData.ts
var import_bcryptjs = __toESM(require("bcryptjs"));

// src/models/User.ts
var import_mongoose2 = __toESM(require("mongoose"));
var addressSchema = new import_mongoose2.Schema(
  {
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);
var userSchema = new import_mongoose2.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    avatar: { type: String },
    banner: { type: String },
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local"
    },
    clerkId: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["user", "editor", "manager", "admin", "superadmin"], default: "user" },
    addresses: [addressSchema],
    isActive: { type: Boolean, default: true },
    loyaltyPoints: { type: Number, default: 0 },
    lifetimePointsEarned: { type: Number, default: 0 },
    tier: { type: String, enum: ["bronze", "silver", "gold"], default: "bronze" },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: import_mongoose2.Schema.Types.ObjectId, ref: "User" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false }
  },
  { timestamps: true }
);
var User = import_mongoose2.default.model("User", userSchema);

// src/models/Product.ts
var import_mongoose3 = __toESM(require("mongoose"));
var productImageSchema = new import_mongoose3.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  { _id: false }
);
var productSchema = new import_mongoose3.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: {
      type: String,
      enum: ["men", "women", "children"],
      required: true
    },
    images: [productImageSchema],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0, min: 0 },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, active: 1 });
var Product = import_mongoose3.default.model("Product", productSchema);

// src/models/Category.ts
var import_mongoose4 = __toESM(require("mongoose"));
var categorySchema = new import_mongoose4.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    parent: {
      type: String,
      enum: ["men", "women", "children"],
      required: true
    },
    image: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);
var Category = import_mongoose4.default.model("Category", categorySchema);

// src/models/Coupon.ts
var import_mongoose5 = __toESM(require("mongoose"));
var couponSchema = new import_mongoose5.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed", "free_shipping"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    maxUses: { type: Number, default: 1e3 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);
var Coupon = import_mongoose5.default.model("Coupon", couponSchema);

// src/models/Promotion.ts
var import_mongoose6 = __toESM(require("mongoose"));
var promotionSchema = new import_mongoose6.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    couponCode: { type: String, uppercase: true, trim: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);
var Promotion = import_mongoose6.default.model("Promotion", promotionSchema);

// src/services/loyaltyService.ts
var generateReferralCode = (name) => {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "VX";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
};

// src/services/searchService.ts
var import_meilisearch = require("meilisearch");

// src/models/SearchLog.ts
var import_mongoose7 = __toESM(require("mongoose"));
var searchLogSchema = new import_mongoose7.Schema(
  {
    query: { type: String, required: true, trim: true },
    resultsCount: { type: Number, default: 0 },
    source: { type: String, enum: ["text", "visual", "autocomplete"], default: "text" },
    user: { type: import_mongoose7.Schema.Types.ObjectId, ref: "User" },
    filters: { type: import_mongoose7.Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ query: 1 });
var SearchLog = import_mongoose7.default.model("SearchLog", searchLogSchema);

// src/services/searchService.ts
var MEILI_HOST = process.env.MEILI_HOST ?? "http://127.0.0.1:7700";
var MEILI_KEY = process.env.MEILI_MASTER_KEY ?? "";
var INDEX_NAME = "products";
var meiliClient = null;
var meiliReady = false;
var getMeili = () => {
  if (meiliClient) return meiliClient;
  try {
    meiliClient = new import_meilisearch.MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY || void 0 });
    return meiliClient;
  } catch {
    return null;
  }
};
var initSearchIndex = async () => {
  const client = getMeili();
  if (!client) return;
  try {
    await client.createIndex(INDEX_NAME, { primaryKey: "id" });
  } catch {
  }
  const index = client.index(INDEX_NAME);
  await index.updateSettings({
    searchableAttributes: ["name", "description", "category", "colors", "sizes"],
    filterableAttributes: ["category", "sizes", "colors", "price", "ratings", "active"],
    sortableAttributes: ["price", "ratings", "createdAt"],
    typoTolerance: { enabled: true }
  });
  meiliReady = true;
};
var toSearchDoc = (product) => ({
  id: product._id.toString(),
  name: product.name,
  description: product.description,
  category: product.category,
  price: product.price,
  discountPrice: product.discountPrice,
  sizes: product.sizes,
  colors: product.colors,
  ratings: product.ratings,
  image: product.images[0]?.url ?? "",
  active: product.active,
  createdAt: product.createdAt?.getTime?.() ?? Date.now()
});
var syncAllProductsToSearch = async () => {
  await initSearchIndex();
  const products = await Product.find({ active: true });
  const client = getMeili();
  if (!client || !meiliReady) return;
  const index = client.index(INDEX_NAME);
  await index.addDocuments(products.map(toSearchDoc));
};

// src/data/shirtImages.ts
var unsplash = (photoId, w, h) => `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
var catalogProductImages = [
  // Men (5)
  unsplash("1602810318383-e386cc2a3ccf", 600, 800),
  // dress shirt on hanger
  unsplash("1521572163474-6864f9cf17ab", 600, 800),
  // white tee
  unsplash("1489987707849-d955c6a53e7e", 600, 800),
  // shirts on rack
  unsplash("1542291026-7eec264c27ff", 600, 800),
  // red casual shirt
  unsplash("1503342564765-7df573e8f429", 600, 800),
  // colorful clothing
  // Women (5)
  unsplash("1515886657613-9f3515b0c78f", 600, 800),
  // women's fashion
  unsplash("1558618666-fcd25c85cd64", 600, 800),
  // women's blouse
  unsplash("1539109136881-3be0616acf4b", 600, 800),
  // women's outfit
  unsplash("1483985988355-763728e1f99c", 600, 800),
  // fashion shopping
  unsplash("1490481651871-ab68de25d43d", 600, 800),
  // women's top
  // Children (5)
  unsplash("1503341504253-dff481548365", 600, 800),
  // kids clothing
  unsplash("1519236081223-abe9f490a59b", 600, 800),
  // kids polo
  unsplash("1503606770372-2ebb58dd75f0", 600, 800),
  // kids tee
  unsplash("1472099645785-5658abf4ff4e", 600, 800),
  // casual kids
  unsplash("1559163499-413811b65002", 600, 800)
  // kids outfit
];

// src/data/catalogSeed.ts
var menProducts = [
  { name: "Classic Oxford Shirt", category: "men", price: 3499, discountPrice: 2799, description: "Crafted from premium long-staple cotton with a refined oxford weave. Features a structured collar, button-down front, and a relaxed yet polished fit ideal for office wear or smart casual outings.", sizes: ["S", "M", "L", "XL"], colors: ["White", "Navy", "Blue"], stock: 45, ratings: 4.5, numReviews: 28 },
  { name: "Slim Fit Chinos", category: "men", price: 2999, discountPrice: 2499, description: "Modern slim-fit chinos with 2% elastane for all-day comfort. Mid-rise waist, tapered leg, and wrinkle-resistant fabric make these a wardrobe essential for work and weekends.", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Beige", "Navy", "Black"], stock: 38, ratings: 4.2, numReviews: 19 },
  { name: "Wool Blend Blazer", category: "men", price: 8999, discountPrice: 7499, description: "Tailored single-breasted blazer in a luxurious wool-poly blend. Notch lapels, two-button closure, and interior pockets deliver timeless sophistication for meetings and events.", sizes: ["M", "L", "XL"], colors: ["Navy", "Gray", "Black"], stock: 22, ratings: 4.8, numReviews: 12 },
  { name: "Graphic Tee", category: "men", price: 1499, description: "Ultra-soft 100% combed cotton tee with a minimal screen-print design. Pre-shrunk fabric, crew neck, and breathable weave perfect for layering or standalone casual looks.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "White", "Gray"], stock: 60, ratings: 4, numReviews: 34 },
  { name: "Denim Jacket", category: "men", price: 5499, discountPrice: 4499, description: "Vintage-wash denim jacket with classic trucker styling. Reinforced stitching, metal buttons, and chest pockets offer durable style that pairs effortlessly with tees and chinos.", sizes: ["S", "M", "L", "XL"], colors: ["Blue", "Black"], stock: 30, ratings: 4.6, numReviews: 21 }
];
var womenProducts = [
  { name: "Linen Summer Dress", category: "women", price: 4299, discountPrice: 3599, description: "A breezy A-line dress in pure linen with adjustable tie straps and side pockets. Lightweight and breathable \u2014 perfect for brunches, vacations, and warm-weather elegance.", sizes: ["XS", "S", "M", "L"], colors: ["Beige", "White", "Green"], stock: 35, ratings: 4.7, numReviews: 26 },
  { name: "High-Waist Jeans", category: "women", price: 3799, discountPrice: 3199, description: "Flattering high-rise jeans in stretch denim with a contoured waistband and slim straight leg. Retains shape all day while offering comfort and a streamlined silhouette.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Blue", "Black", "Gray"], stock: 42, ratings: 4.4, numReviews: 31 },
  { name: "Silk Blouse", category: "women", price: 4999, description: "Luxurious mulberry silk blouse with a relaxed drape and concealed button placket. Elegant enough for the boardroom, versatile enough for evening dinners.", sizes: ["S", "M", "L"], colors: ["White", "Red", "Navy"], stock: 28, ratings: 4.9, numReviews: 15 },
  { name: "Knit Cardigan", category: "women", price: 3299, discountPrice: 2699, description: "Open-front cardigan in a soft cotton-acrylic blend with ribbed cuffs and hem. Layer over dresses or tops for cozy warmth without bulk.", sizes: ["S", "M", "L", "XL"], colors: ["Gray", "Beige", "White"], stock: 40, ratings: 4.3, numReviews: 22 },
  { name: "Floral Maxi Dress", category: "women", price: 4599, discountPrice: 3899, description: "Flowing maxi dress with an all-over botanical print, smocked bodice, and tiered skirt. Effortlessly romantic for weddings, garden parties, and special occasions.", sizes: ["S", "M", "L"], colors: ["Red", "Blue", "Green"], stock: 25, ratings: 4.6, numReviews: 18 }
];
var childrenProducts = [
  { name: "Kids Hoodie", category: "children", price: 1999, discountPrice: 1599, description: "Cozy fleece-lined hoodie with a kangaroo pocket and soft brushed interior. Durable enough for playground adventures and gentle on sensitive skin.", sizes: ["XS", "S", "M", "L"], colors: ["Red", "Blue", "Gray"], stock: 50, ratings: 4.5, numReviews: 20 },
  { name: "Children Joggers", category: "children", price: 1499, description: "Stretch-cotton joggers with an elastic waistband and cuffed ankles. Ideal for school, sports, and lounging \u2014 easy to move in and machine washable.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Navy", "Gray"], stock: 55, ratings: 4.1, numReviews: 16 },
  { name: "Kids Polo Shirt", category: "children", price: 1299, description: "Classic pique polo with a two-button placket and reinforced collar. Breathable cotton blend keeps kids cool and comfortable all day long.", sizes: ["XS", "S", "M", "L"], colors: ["White", "Red", "Blue", "Green"], stock: 48, ratings: 4, numReviews: 14 },
  { name: "Rain Jacket", category: "children", price: 2499, discountPrice: 1999, description: "Waterproof shell jacket with sealed seams, reflective strips, and a packable hood. Keeps little ones dry during monsoon walks and outdoor play.", sizes: ["S", "M", "L"], colors: ["Yellow", "Blue", "Red"], stock: 32, ratings: 4.4, numReviews: 11 },
  { name: "Kids Sneakers Set", category: "children", price: 3499, description: "Lightweight sneakers with cushioned insoles, flexible rubber outsoles, and easy hook-and-loop straps. Built for running, jumping, and all-day active play.", sizes: ["XS", "S", "M", "L"], colors: ["White", "Black", "Blue"], stock: 36, ratings: 4.7, numReviews: 24 }
];
var catalogSeedProducts = [...menProducts, ...womenProducts, ...childrenProducts];
var buildCatalogProductDocs = () => catalogSeedProducts.map((item, index) => ({
  name: item.name,
  description: item.description,
  price: item.price,
  discountPrice: item.discountPrice,
  category: item.category,
  images: [
    {
      url: catalogProductImages[index] ?? catalogProductImages[0],
      public_id: `shirt/${index}`
    }
  ],
  sizes: item.sizes,
  colors: item.colors,
  stock: item.stock,
  sold: Math.floor(item.numReviews * 1.5),
  ratings: item.ratings,
  numReviews: item.numReviews,
  active: true
}));
var catalogCoupons = [
  { code: "WELCOME10", type: "percent", value: 10, minOrder: 1e3, maxUses: 500, active: true },
  { code: "SAVE500", type: "fixed", value: 500, minOrder: 3e3, maxUses: 200, active: true },
  { code: "FREESHIP", type: "free_shipping", value: 0, minOrder: 2e3, maxUses: 1e3, active: true }
];
var catalogPromotions = [
  {
    title: "\u{1F525} AMAZING DEAL",
    message: "Up to 40% off on premium athletic wear \u2014 Limited time only!",
    couponCode: "WELCOME10",
    active: true,
    sortOrder: 0
  },
  {
    title: "\u{1F4B0} SAVE BIG",
    message: "Flat \u20A8500 off on orders above \u20A83,000",
    couponCode: "SAVE500",
    active: true,
    sortOrder: 1
  },
  {
    title: "\u{1F69A} FREE SHIPPING",
    message: "Free delivery on orders above \u20A82,000",
    couponCode: "FREESHIP",
    active: true,
    sortOrder: 2
  }
];
var catalogCategories = [
  { name: "Men", slug: "men", parent: "men", active: true },
  { name: "Women", slug: "women", parent: "women", active: true },
  { name: "Children", slug: "children", parent: "children", active: true }
];
var getAdminCredentials = () => ({
  email: (process.env.ADMIN_EMAIL ?? "admin@vexironathletics.com").toLowerCase().trim(),
  password: process.env.ADMIN_PASSWORD ?? "Admin@123"
});

// src/services/ensureSeedData.ts
var ensureSeedData = async () => {
  const productCount = await Product.countDocuments();
  if (productCount > 0) return;
  console.log("[Seed] Empty catalog detected \u2014 loading sample products...");
  const { email, password } = getAdminCredentials();
  const existingAdmin = await User.findOne({ email });
  if (!existingAdmin) {
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    await User.create({
      name: "Store Admin",
      email,
      password: hashedPassword,
      role: "admin",
      provider: "local",
      referralCode: generateReferralCode("Admin")
    });
    console.log(`[Seed] Admin user created: ${email}`);
  }
  if (await Category.countDocuments() === 0) {
    await Category.insertMany(catalogCategories);
  }
  if (await Coupon.countDocuments() === 0) {
    await Coupon.insertMany(catalogCoupons);
  }
  if (await Promotion.countDocuments() === 0) {
    await Promotion.insertMany(catalogPromotions);
  }
  const docs = buildCatalogProductDocs();
  await Product.insertMany(docs);
  await syncAllProductsToSearch().catch(() => void 0);
  console.log(`[Seed] Loaded ${docs.length} sample products`);
};
var syncCatalogProductImages = async () => {
  const docs = buildCatalogProductDocs();
  let updated = 0;
  for (const doc of docs) {
    const result = await Product.updateOne({ name: doc.name }, { $set: { images: doc.images } });
    if (result.modifiedCount > 0) updated += 1;
  }
  const picsumProducts = await Product.find({
    "images.url": { $regex: "picsum\\.photos", $options: "i" }
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
    await syncAllProductsToSearch().catch(() => void 0);
  }
};

// src/startServices.ts
var startBackendServices = async () => {
  const connected = await connectDBWithRetry();
  if (!connected) return false;
  await ensureSeedData().catch((err) => {
    console.error("[Seed] Auto-seed skipped:", err instanceof Error ? err.message : err);
  });
  await syncCatalogProductImages().catch((err) => {
    console.error("[Seed] Image sync skipped:", err instanceof Error ? err.message : err);
  });
  await initSearchIndex().catch(
    () => console.log("MeiliSearch not available \u2014 using MongoDB search fallback")
  );
  return true;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  startBackendServices
});
//# sourceMappingURL=startServices.js.map
