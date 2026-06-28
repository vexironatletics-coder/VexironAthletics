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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/createApp.ts
var import_express14 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_pino_http = __toESM(require("pino-http"));

// src/config/logger.ts
var import_pino = __toESM(require("pino"));
var isProd = process.env.NODE_ENV === "production";
var usePretty = !isProd && process.stdout.isTTY;
var prettyTransport;
if (usePretty) {
  try {
    require.resolve("pino-pretty");
    prettyTransport = {
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname" }
      }
    };
  } catch {
  }
}
var logger = (0, import_pino.default)({
  level: isProd ? "info" : "debug",
  timestamp: import_pino.default.stdTimeFunctions.isoTime,
  ...prettyTransport
});
var logger_default = logger;

// src/createApp.ts
var import_compression = __toESM(require("compression"));
var import_dotenv = __toESM(require("dotenv"));
var import_path2 = __toESM(require("path"));

// src/config/db.ts
var import_mongoose = __toESM(require("mongoose"));
var isDbConnected = () => import_mongoose.default.connection.readyState === 1;
var isMongoConfigured = () => Boolean(process.env.MONGODB_URI?.trim() || process.env.MONGODB_URI_SRV?.trim());
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

// src/middleware/errorHandler.ts
var import_mongoose2 = __toESM(require("mongoose"));
var isDbUnavailableError = (err) => {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? String(err.name) : "";
  const message = "message" in err ? String(err.message) : "";
  return name === "MongoNotConnectedError" || name === "MongoServerSelectionError" || name === "MongooseError" || message.includes("buffering timed out") || message.includes("before initial connection is complete");
};
var isProd2 = process.env.NODE_ENV === "production";
var errorHandler = (err, _req, res, _next) => {
  if (isDbUnavailableError(err)) {
    console.error("[API] Database unavailable:", err instanceof Error ? err.message : err);
    res.status(503).json({ message: "Database is temporarily unavailable. Please try again in a moment." });
    return;
  }
  const statusCode = err.statusCode ?? 500;
  if (statusCode >= 500) {
    console.error("[API Error]", err);
    res.status(statusCode).json({
      message: isProd2 ? "An unexpected error occurred. Please try again." : err.message || "Internal Server Error"
    });
  } else {
    res.status(statusCode).json({ message: err.message || "Request error" });
  }
};
var notFound = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};
import_mongoose2.default.connection.on("error", (err) => {
  console.error("[MongoDB] Connection error:", err.message);
});

// src/middleware/sanitize.ts
function stripOperators(obj, depth = 0) {
  if (depth > 10) return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      stripOperators(val, depth + 1);
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          stripOperators(item, depth + 1);
        }
      }
    }
  }
}
var sanitizeInputs = (req, _res, next) => {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    stripOperators(req.body);
  }
  next();
};

// src/middleware/rateLimit.ts
var store = /* @__PURE__ */ new Map();
var pruneExpired = (now) => {
  if (store.size < 5e3) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
};
var clientKey = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? req.ip ?? "unknown";
  }
  return req.ip ?? "unknown";
};
var rateLimit = (options) => {
  const { windowMs, max, keyPrefix = "global", message = "Too many requests, please try again later" } = options;
  return (req, res, next) => {
    const now = Date.now();
    pruneExpired(now);
    const key = `${keyPrefix}:${clientKey(req)}`;
    const existing = store.get(key);
    if (!existing || existing.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (existing.count >= max) {
      const retryAfterSec = Math.ceil((existing.resetAt - now) / 1e3);
      res.setHeader("Retry-After", String(retryAfterSec));
      res.status(429).json({ message });
      return;
    }
    existing.count += 1;
    next();
  };
};
var authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 20,
  keyPrefix: "auth",
  message: "Too many authentication attempts. Please wait and try again."
});
var orderRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  max: 10,
  keyPrefix: "orders",
  message: "Too many order requests. Please wait a moment."
});
var analyticsRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  max: 120,
  keyPrefix: "analytics"
});
var globalApiRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  max: 200,
  keyPrefix: "api",
  message: "Too many requests from this IP. Please slow down."
});

// src/middleware/requireDb.ts
var requireDb = (_req, res, next) => {
  if (!isDbConnected()) {
    res.status(503).json({
      message: "Database is not connected. Add your IP to MongoDB Atlas Network Access, then wait a few seconds and try again."
    });
    return;
  }
  next();
};

// src/routes/auth.ts
var import_express = require("express");
var import_express_validator2 = require("express-validator");

// src/controllers/authController.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_crypto = __toESM(require("crypto"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_express_validator = require("express-validator");

// src/models/User.ts
var import_mongoose3 = __toESM(require("mongoose"));
var addressSchema = new import_mongoose3.Schema(
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
var userSchema = new import_mongoose3.Schema(
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
    referredBy: { type: import_mongoose3.Schema.Types.ObjectId, ref: "User" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false }
  },
  { timestamps: true }
);
var User = import_mongoose3.default.model("User", userSchema);

// src/utils/helpers.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var signJWT = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };
  return import_jsonwebtoken.default.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d"
  });
};
var sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  banner: user.banner,
  role: user.role,
  provider: user.provider,
  addresses: user.addresses,
  isActive: user.isActive,
  loyaltyPoints: user.loyaltyPoints ?? 0,
  tier: user.tier ?? "bronze",
  referralCode: user.referralCode
});
var slugify = (name) => name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
var FREE_SHIPPING_THRESHOLD = 5e3;
var SHIPPING_FEE = 250;
var calculateShippingFee = (subtotal) => subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

// src/config/clerk.ts
var import_backend = require("@clerk/backend");
var clerkClient = (0, import_backend.createClerkClient)({
  secretKey: process.env.CLERK_SECRET_KEY
});

// src/services/clerkSync.ts
var syncClerkUser = async (clerkUserId) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const externalProvider = clerkUser.externalAccounts[0]?.provider ?? "local";
  let provider = "local";
  if (externalProvider.includes("google")) {
    provider = "google";
  } else if (externalProvider.includes("facebook")) {
    provider = "facebook";
  }
  const primaryEmail = clerkUser.emailAddresses.find(
    (entry) => entry.id === clerkUser.primaryEmailAddressId
  );
  return {
    name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
    email: primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "",
    avatar: clerkUser.imageUrl,
    clerkId: clerkUserId,
    provider
  };
};

// src/services/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"));

// src/utils/shippingAddress.ts
var cleanPhone = (phone) => phone.replace(/\s+/g, " ").trim();
var normalizeShippingAddress = (input) => {
  const fromArray = (input.phones ?? []).map(cleanPhone).filter(Boolean);
  const phones = fromArray.length > 0 ? fromArray : input.phone ? [cleanPhone(input.phone)] : [];
  if (phones.length === 0) {
    throw new Error("At least one mobile number is required");
  }
  return {
    name: input.name?.trim() ?? "",
    phones,
    phone: phones[0],
    landmark: input.landmark?.trim() ?? "",
    street: input.street?.trim() ?? "",
    city: input.city?.trim() ?? "",
    state: input.state?.trim() ?? "",
    postal: input.postal?.trim() ?? "",
    country: input.country?.trim() ?? ""
  };
};
var formatShippingPhones = (address) => {
  const phones = address.phones && address.phones.length > 0 ? address.phones : address.phone ? [address.phone] : [];
  return phones.join(", ");
};

// src/config/bankTransfer.ts
var getBankTransferDetails = () => ({
  accountName: process.env.BANK_ACCOUNT_NAME ?? "Vexiron Athletics",
  bankName: process.env.BANK_NAME ?? "HBL - Habib Bank Limited",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "12345678901234"
});
var formatPaymentMethodLabel = (method) => {
  if (method === "cod") return "Cash on Delivery";
  if (method === "bank") return "Bank Transfer";
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// src/services/emailService.ts
var getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return import_nodemailer.default.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass }
  });
};
var FROM = process.env.SMTP_FROM ?? `VexironAthletics <contact@vexironathletics.com>`;
function brandEmail(body9) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VexironAthletics</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0A2947;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#F3E4C9;font-size:26px;font-weight:800;letter-spacing:0.5px;">
                VEXIRON<span style="color:#ffffff;">ATHLETICS</span>
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                Premium Clothing \u2014 Pakistan
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #e8ecf0;border-right:1px solid #e8ecf0;">
              ${body9}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0A2947;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:12px;">
                Questions? Email us at
                <a href="mailto:contact@vexironathletics.com" style="color:#F3E4C9;text-decoration:none;">contact@vexironathletics.com</a>
              </p>
              <div style="margin:12px 0;">
                <a href="https://www.facebook.com/vexironathletics" style="display:inline-block;margin:0 6px;color:#F3E4C9;text-decoration:none;font-size:12px;">Facebook</a>
                <span style="color:rgba(255,255,255,0.3);">\xB7</span>
                <a href="https://www.instagram.com/vexironathletics/" style="display:inline-block;margin:0 6px;color:#F3E4C9;text-decoration:none;font-size:12px;">Instagram</a>
                <span style="color:rgba(255,255,255,0.3);">\xB7</span>
                <a href="https://www.tiktok.com/@vexironathletics" style="display:inline-block;margin:0 6px;color:#F3E4C9;text-decoration:none;font-size:12px;">TikTok</a>
              </div>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">
                \xA9 2026 VexironAthletics \xB7 Lahore, Pakistan \xB7 All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
var sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.info(`[Password Reset] No SMTP configured \u2014 reset link for ${email}: ${resetUrl}`);
    return { sent: false, resetUrl };
  }
  const body9 = `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#EFF6FF;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">\u{1F510}</div>
    </div>

    <h2 style="margin:0 0 8px;color:#0A2947;font-size:24px;font-weight:700;text-align:center;">
      Reset Your Password
    </h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;text-align:center;line-height:1.6;">
      We received a request to reset your VexironAthletics password.<br/>
      Click the button below to choose a new one.
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${resetUrl}"
         style="display:inline-block;background:#0A2947;color:#F3E4C9;text-decoration:none;
                padding:15px 40px;border-radius:10px;font-size:15px;font-weight:700;
                letter-spacing:0.3px;box-shadow:0 4px 12px rgba(10,41,71,0.3);">
        Reset My Password
      </a>
    </div>

    <!-- Expiry notice -->
    <div style="background:#FFF8F0;border:1px solid #FBBF24;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#92400E;font-size:13px;text-align:center;">
        \u23F1 <strong>This link expires in 1 hour.</strong><br/>
        After that you'll need to request a new reset link.
      </p>
    </div>

    <!-- Security note -->
    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email.<br/>
      Your password won't change unless you click the button above.
    </p>

    <hr style="margin:28px 0;border:none;border-top:1px solid #f0f0f0;" />

    <!-- Fallback link -->
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Button not working?<br/>
      <a href="${resetUrl}" style="color:#0A2947;word-break:break-all;">${resetUrl}</a>
    </p>
  `;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "\u{1F510} Reset your VexironAthletics password",
    html: brandEmail(body9)
  });
  return { sent: true };
};
var sendOrderConfirmationEmail = async (email, customerName, orderId, items, total, shippingAddress, paymentMethod) => {
  const transporter = getTransporter();
  const shortId = orderId.slice(-8).toUpperCase();
  const itemRows = items.map(
    (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">
            ${item.name}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;white-space:nowrap;">
            ${item.size} \xB7 ${item.color}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:center;color:#111827;">
            ${item.qty}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:right;color:#111827;font-weight:600;">
            \u20A8${(item.price * item.qty).toLocaleString()}
          </td>
        </tr>`
  ).join("");
  const body9 = `
    <!-- Greeting -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#F0FDF4;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">\u2705</div>
    </div>

    <h2 style="margin:0 0 6px;color:#0A2947;font-size:24px;font-weight:700;text-align:center;">
      Order Confirmed!
    </h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;text-align:center;">
      Hi <strong>${customerName}</strong>, thank you for shopping with VexironAthletics! \u{1F389}
    </p>

    <!-- Order ID badge -->
    <div style="background:#0A2947;border-radius:10px;padding:14px 20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
      <p style="margin:4px 0 0;color:#F3E4C9;font-size:22px;font-weight:800;letter-spacing:2px;">#${shortId}</p>
    </div>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-weight:600;">Item</th>
          <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-weight:600;">Variant</th>
          <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-weight:600;">Qty</th>
          <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-weight:600;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr style="background:#f9fafb;">
          <td colspan="3" style="padding:14px 8px;font-size:15px;font-weight:700;color:#0A2947;">Total</td>
          <td style="padding:14px 8px;font-size:16px;font-weight:800;color:#0A2947;text-align:right;">\u20A8${total.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Shipping info -->
    <div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0A2947;text-transform:uppercase;letter-spacing:0.5px;">\u{1F4E6} Shipping To</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
        <strong>${shippingAddress.name}</strong><br/>
        ${shippingAddress.landmark ? `Near: ${shippingAddress.landmark}<br/>` : ""}
        ${shippingAddress.street}<br/>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal}<br/>
        ${shippingAddress.country}<br/>
        \u{1F4DE} ${formatShippingPhones(shippingAddress)}
      </p>
      <p style="margin:12px 0 0;color:#374151;font-size:14px;">
        \u{1F4B3} <strong>Payment:</strong> ${formatPaymentMethodLabel(paymentMethod)}
      </p>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
      We'll send you another email when your order ships.<br/>
      Questions? Just reply to this email \u2014 we're happy to help!
    </p>
  `;
  if (!transporter) {
    console.info(`[Order Confirmation] Order #${shortId} for ${email} \u2014 \u20A8${total}`);
    return { sent: false };
  }
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `\u2705 Order confirmed \u2014 #${shortId} | VexironAthletics`,
    html: brandEmail(body9)
  });
  return { sent: true };
};
var statusConfig = {
  processing: {
    emoji: "\u2699\uFE0F",
    label: "Processing",
    color: "#92400E",
    bg: "#FFF8F0",
    message: "Great news! We've received your order and are preparing it for shipment. Hang tight!"
  },
  shipped: {
    emoji: "\u{1F69A}",
    label: "Shipped",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    message: "Your order is on its way! Expect delivery within the next few days."
  },
  delivered: {
    emoji: "\u{1F389}",
    label: "Delivered",
    color: "#065F46",
    bg: "#F0FDF4",
    message: "Your order has arrived! We hope you love your new VexironAthletics purchase."
  },
  cancelled: {
    emoji: "\u274C",
    label: "Cancelled",
    color: "#991B1B",
    bg: "#FFF1F2",
    message: "Your order has been cancelled. If you didn't request this, please contact us immediately."
  }
};
var sendOrderStatusUpdateEmail = async (email, customerName, orderId, status) => {
  const transporter = getTransporter();
  const shortId = orderId.slice(-8).toUpperCase();
  const cfg = statusConfig[status] ?? {
    emoji: "\u{1F4CB}",
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: "#374151",
    bg: "#f9fafb",
    message: `Your order status has been updated to: ${status}.`
  };
  const body9 = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:${cfg.bg};border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">${cfg.emoji}</div>
    </div>

    <h2 style="margin:0 0 6px;color:#0A2947;font-size:24px;font-weight:700;text-align:center;">
      Order Update
    </h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;text-align:center;">
      Hi <strong>${customerName}</strong>, here's the latest on your order.
    </p>

    <!-- Order ID + Status badge -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#0A2947;border-radius:10px 0 0 10px;padding:16px 20px;text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order</p>
          <p style="margin:4px 0 0;color:#F3E4C9;font-size:18px;font-weight:800;letter-spacing:1px;">#${shortId}</p>
        </td>
        <td style="background:${cfg.bg};border-radius:0 10px 10px 0;padding:16px 20px;text-align:center;border:1px solid ${cfg.color}20;">
          <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Status</p>
          <p style="margin:4px 0 0;color:${cfg.color};font-size:18px;font-weight:800;">${cfg.emoji} ${cfg.label}</p>
        </td>
      </tr>
    </table>

    <!-- Message -->
    <div style="background:${cfg.bg};border-left:4px solid ${cfg.color};border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">${cfg.message}</p>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
      Questions about your order? Just reply to this email.<br/>
      We're available Mon\u2013Sat, 9 AM \u2013 6 PM PKT.
    </p>
  `;
  if (!transporter) {
    console.info(`[Order Status] #${shortId} \u2192 ${status} for ${email}`);
    return { sent: false };
  }
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${cfg.emoji} Order #${shortId} \u2014 ${cfg.label} | VexironAthletics`,
    html: brandEmail(body9)
  });
  return { sent: true };
};

// src/services/loyaltyService.ts
var POINTS_PER_100_PKR = 1;
var POINT_VALUE_PKR = 1;
var REFERRAL_BONUS_REFEREE = 100;
var REFERRAL_BONUS_REFERRER = 200;
var getTierFromLifetimePoints = (lifetimePoints) => {
  if (lifetimePoints >= 2e3) return "gold";
  if (lifetimePoints >= 500) return "silver";
  return "bronze";
};
var calculatePointsEarned = (orderTotalAfterDiscounts) => Math.floor(orderTotalAfterDiscounts / 100) * POINTS_PER_100_PKR;
var calculatePointsDiscount = (pointsToRedeem, availablePoints, maxDiscount) => {
  const points = Math.min(pointsToRedeem, availablePoints);
  const discount = points * POINT_VALUE_PKR;
  return Math.min(discount, maxDiscount);
};
var generateReferralCode = (name) => {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "VX";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
};

// src/controllers/authController.ts
var hashResetToken = (token) => import_crypto.default.createHash("sha256").update(token).digest("hex");
var register = async (req, res) => {
  const errors = (0, import_express_validator.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return;
  }
  const { name, email, password, referralCode } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: "Email already registered" });
    return;
  }
  let referredBy;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) referredBy = referrer._id;
  }
  const hashedPassword = await import_bcryptjs.default.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    provider: "local",
    referralCode: generateReferralCode(name),
    referredBy
  });
  const token = signJWT(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
};
var login = async (req, res) => {
  const errors = (0, import_express_validator.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const { email: rawEmail, password } = req.body;
  const email = rawEmail.toLowerCase().trim();
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  if (!user.password) {
    res.status(401).json({
      message: "This email uses social login. Sign in with Google or Facebook instead."
    });
    return;
  }
  const isMatch = await import_bcryptjs.default.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ message: "Account suspended" });
    return;
  }
  const token = signJWT(user);
  res.json({ token, user: sanitizeUser(user) });
};
var clerkSync = async (req, res) => {
  const { clerkUserId } = req.body;
  if (!clerkUserId) {
    res.status(400).json({ message: "clerkUserId is required" });
    return;
  }
  const clerkData = await syncClerkUser(clerkUserId);
  const user = await User.findOneAndUpdate(
    { email: clerkData.email },
    {
      ...clerkData,
      password: null
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const token = signJWT(user);
  res.json({ token, user: sanitizeUser(user) });
};
var forgotPassword = async (req, res) => {
  const errors = (0, import_express_validator.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const { email } = req.body;
  const user = await User.findOne({ email, provider: "local" }).select(
    "+resetPasswordToken +resetPasswordExpire"
  );
  if (user && user.password) {
    const resetToken = import_crypto.default.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1e3);
    await user.save({ validateBeforeSave: false });
    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
    const emailResult = await sendPasswordResetEmail(email, resetUrl);
    const payload = {
      message: "If an account exists with that email, a reset link has been sent."
    };
    if (emailResult.resetUrl && process.env.NODE_ENV !== "production") {
      payload.resetUrl = emailResult.resetUrl;
    }
    res.json(payload);
    return;
  }
  res.json({
    message: "If an account exists with that email, a reset link has been sent."
  });
};
var resetPassword = async (req, res) => {
  const errors = (0, import_express_validator.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const { token, password } = req.body;
  const hashedToken = hashResetToken(token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: /* @__PURE__ */ new Date() },
    provider: "local"
  }).select("+resetPasswordToken +resetPasswordExpire +password");
  if (!user) {
    res.status(400).json({ message: "Invalid or expired reset token" });
    return;
  }
  user.password = await import_bcryptjs.default.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();
  res.json({ message: "Password reset successful. You can now sign in." });
};
var refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token required" });
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT secret not configured" });
    return;
  }
  try {
    const decoded = import_jsonwebtoken2.default.verify(refreshToken, secret);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }
    const accessToken = signJWT(user);
    res.json({ token: accessToken, user: sanitizeUser(user) });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// src/utils/constants.ts
var APP_NAME = "VexironAthletics";
var MAX_ORDER_LINE_ITEMS = 20;
var MAX_QTY_PER_LINE = 10;
var MIN_PASSWORD_LENGTH = 8;

// src/utils/password.ts
var PASSWORD_REQUIREMENTS_MSG = `Password must be at least ${MIN_PASSWORD_LENGTH} characters and include at least one letter and one number`;

// src/routes/auth.ts
var passwordValidator = (0, import_express_validator2.body)("password").isLength({ min: MIN_PASSWORD_LENGTH }).withMessage(PASSWORD_REQUIREMENTS_MSG).matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage(PASSWORD_REQUIREMENTS_MSG);
var router = (0, import_express.Router)();
router.post(
  "/register",
  authRateLimit,
  requireDb,
  [
    (0, import_express_validator2.body)("name").trim().notEmpty().withMessage("Name is required"),
    (0, import_express_validator2.body)("email").isEmail().withMessage("Valid email is required"),
    passwordValidator
  ],
  register
);
router.post(
  "/login",
  authRateLimit,
  requireDb,
  [
    (0, import_express_validator2.body)("email").isEmail().withMessage("Valid email is required"),
    (0, import_express_validator2.body)("password").notEmpty().withMessage("Password is required")
  ],
  login
);
router.post("/clerk-sync", authRateLimit, requireDb, clerkSync);
router.post("/refresh", authRateLimit, refresh);
router.post(
  "/forgot-password",
  authRateLimit,
  [(0, import_express_validator2.body)("email").isEmail().withMessage("Valid email is required")],
  forgotPassword
);
router.post(
  "/reset-password",
  authRateLimit,
  [
    (0, import_express_validator2.body)("token").notEmpty().withMessage("Reset token is required"),
    passwordValidator
  ],
  resetPassword
);
var auth_default = router;

// src/routes/products.ts
var import_express2 = require("express");
var import_express_validator4 = require("express-validator");

// src/controllers/productController.ts
var import_express_validator3 = require("express-validator");
var import_mongoose7 = __toESM(require("mongoose"));

// src/models/Product.ts
var import_mongoose4 = __toESM(require("mongoose"));
var productImageSchema = new import_mongoose4.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  { _id: false }
);
var productSchema = new import_mongoose4.Schema(
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
var Product = import_mongoose4.default.model("Product", productSchema);

// src/models/Review.ts
var import_mongoose5 = __toESM(require("mongoose"));
var reviewSchema = new import_mongoose5.Schema(
  {
    user: { type: import_mongoose5.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);
reviewSchema.index({ product: 1, createdAt: -1 });
var Review = import_mongoose5.default.model("Review", reviewSchema);

// src/config/cloudinary.ts
var import_cloudinary = require("cloudinary");
var cloudName = process.env.CLOUDINARY_CLOUD_NAME;
var apiKey = process.env.CLOUDINARY_API_KEY;
var apiSecret = process.env.CLOUDINARY_API_SECRET;
if (cloudName && apiKey && apiSecret) {
  import_cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}
var isCloudinaryConfigured = () => Boolean(cloudName && apiKey && apiSecret);

// src/services/searchService.ts
var import_meilisearch = require("meilisearch");

// src/models/SearchLog.ts
var import_mongoose6 = __toESM(require("mongoose"));
var searchLogSchema = new import_mongoose6.Schema(
  {
    query: { type: String, required: true, trim: true },
    resultsCount: { type: Number, default: 0 },
    source: { type: String, enum: ["text", "visual", "autocomplete"], default: "text" },
    user: { type: import_mongoose6.Schema.Types.ObjectId, ref: "User" },
    filters: { type: import_mongoose6.Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ query: 1 });
var SearchLog = import_mongoose6.default.model("SearchLog", searchLogSchema);

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
var syncProductToSearch = async (product) => {
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
  }
};
var syncAllProductsToSearch = async () => {
  await initSearchIndex();
  const products = await Product.find({ active: true });
  const client = getMeili();
  if (!client || !meiliReady) return;
  const index = client.index(INDEX_NAME);
  await index.addDocuments(products.map(toSearchDoc));
};
var buildMongoFilter = (params) => {
  const filter = { active: true };
  if (params.category) filter.category = params.category;
  if (params.minPrice || params.maxPrice) {
    filter.price = {};
    if (params.minPrice) filter.price.$gte = params.minPrice;
    if (params.maxPrice) filter.price.$lte = params.maxPrice;
  }
  if (params.size) filter.sizes = { $in: params.size.split(",") };
  if (params.color) filter.colors = { $in: params.color.split(",") };
  if (params.minRating) filter.ratings = { $gte: params.minRating };
  return filter;
};
var fuzzyRegex = (q) => {
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.split("").join(".*");
  return new RegExp(pattern, "i");
};
var searchProducts = async (params) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, params.limit ?? 12);
  const offset = (page - 1) * limit;
  const q = params.q.trim();
  const client = getMeili();
  if (client && meiliReady && q) {
    try {
      const filters = ["active = true"];
      if (params.category) filters.push(`category = "${params.category}"`);
      if (params.minPrice) filters.push(`price >= ${params.minPrice}`);
      if (params.maxPrice) filters.push(`price <= ${params.maxPrice}`);
      if (params.minRating) filters.push(`ratings >= ${params.minRating}`);
      if (params.size) {
        params.size.split(",").forEach((s) => filters.push(`sizes = "${s.trim()}"`));
      }
      if (params.color) {
        params.color.split(",").forEach((c) => filters.push(`colors = "${c.trim()}"`));
      }
      const sortMap2 = {
        "price-asc": ["price:asc"],
        "price-desc": ["price:desc"],
        rating: ["ratings:desc"],
        newest: ["createdAt:desc"]
      };
      const result = await client.index(INDEX_NAME).search(q, {
        filter: filters.length ? filters.join(" AND ") : void 0,
        sort: sortMap2[params.sort ?? ""] ?? ["createdAt:desc"],
        limit,
        offset,
        facets: ["category", "sizes", "colors"]
      });
      const ids = result.hits.map((h) => h.id);
      const products2 = ids.length ? await Product.find({ _id: { $in: ids }, active: true }) : [];
      const ordered = ids.map((id) => products2.find((p) => p._id.toString() === id)).filter(Boolean);
      await SearchLog.create({
        query: q,
        resultsCount: result.estimatedTotalHits ?? ordered.length,
        source: params.source ?? "text",
        user: params.userId,
        filters: { category: params.category, minPrice: params.minPrice, maxPrice: params.maxPrice }
      });
      return {
        products: ordered,
        pagination: {
          page,
          limit,
          total: result.estimatedTotalHits ?? ordered.length,
          pages: Math.ceil((result.estimatedTotalHits ?? ordered.length) / limit)
        },
        facets: result.facetDistribution ?? {},
        engine: "meilisearch"
      };
    } catch {
    }
  }
  const filter = buildMongoFilter(params);
  if (q) {
    filter.$or = [
      { $text: { $search: q } },
      { name: fuzzyRegex(q) },
      { description: fuzzyRegex(q) }
    ];
  }
  const sortMap = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    newest: { createdAt: -1 },
    rating: { ratings: -1 }
  };
  const sort = sortMap[params.sort ?? ""] ?? sortMap.newest;
  const [products, total, categoryFacets, colorFacets] = await Promise.all([
    Product.find(filter).sort(sort).skip(offset).limit(limit),
    Product.countDocuments(filter),
    Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]),
    Product.aggregate([
      { $match: { active: true } },
      { $unwind: "$colors" },
      { $group: { _id: "$colors", count: { $sum: 1 } } }
    ])
  ]);
  if (q) {
    await SearchLog.create({
      query: q,
      resultsCount: total,
      source: params.source ?? "text",
      user: params.userId
    });
  }
  return {
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    facets: {
      category: Object.fromEntries(categoryFacets.map((f) => [f._id, f.count])),
      colors: Object.fromEntries(colorFacets.map((f) => [f._id, f.count]))
    },
    engine: "mongodb"
  };
};
var autocompleteSearch = async (q, limit = 8) => {
  const query = q.trim();
  if (!query) return [];
  const client = getMeili();
  if (client && meiliReady) {
    try {
      const result = await client.index(INDEX_NAME).search(query, {
        filter: "active = true",
        limit,
        attributesToRetrieve: ["id", "name", "category", "price", "discountPrice", "image"]
      });
      return result.hits;
    } catch {
    }
  }
  const products = await Product.find({
    active: true,
    $or: [{ name: fuzzyRegex(query) }, { $text: { $search: query } }]
  }).select("name category price discountPrice images").limit(limit);
  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    category: p.category,
    price: p.price,
    discountPrice: p.discountPrice,
    image: p.images[0]?.url ?? ""
  }));
};
var visualSearch = async (colors, category) => {
  const filter = { active: true };
  if (colors.length) filter.colors = { $in: colors.map((c) => new RegExp(c, "i")) };
  if (category) filter.category = category;
  const products = await Product.find(filter).limit(24);
  await SearchLog.create({
    query: `visual:${colors.join(",")}`,
    resultsCount: products.length,
    source: "visual",
    filters: { colors, category }
  });
  return products;
};
var getSearchAnalytics = async (days = 30) => {
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - days);
  const [topQueries, totalSearches, bySource] = await Promise.all([
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$query", count: { $sum: 1 }, avgResults: { $avg: "$resultsCount" } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]),
    SearchLog.countDocuments({ createdAt: { $gte: since } }),
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ])
  ]);
  return { topQueries, totalSearches, bySource, days };
};

// src/config/cache.ts
var store2 = /* @__PURE__ */ new Map();
function cacheGet(key) {
  const entry = store2.get(key);
  if (!entry) return void 0;
  if (Date.now() > entry.expiresAt) {
    store2.delete(key);
    return void 0;
  }
  return entry.value;
}
function cacheSet(key, value, ttlSeconds) {
  store2.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1e3 });
}
function cacheDelete(key) {
  store2.delete(key);
}
function cacheInvalidatePrefix(prefix) {
  for (const key of store2.keys()) {
    if (key.startsWith(prefix)) store2.delete(key);
  }
}
async function cacheAside(key, ttlSeconds, factory) {
  const cached = cacheGet(key);
  if (cached !== void 0) return cached;
  const value = await factory();
  cacheSet(key, value, ttlSeconds);
  return value;
}

// src/controllers/productController.ts
var PRODUCTS_TTL = 60;
var SORT_MAP = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
  "category-asc": { category: 1 },
  "category-desc": { category: -1 },
  "stock-asc": { stock: 1 },
  "stock-desc": { stock: -1 },
  newest: { createdAt: -1 },
  rating: { ratings: -1 }
};
var getProducts = async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    size,
    color,
    search,
    sort = "newest",
    page = "1",
    limit = "12",
    minRating,
    maxStock
  } = req.query;
  const filter = { active: true };
  if (category && typeof category === "string") {
    filter.category = category;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (size && typeof size === "string") {
    filter.sizes = { $in: size.split(",") };
  }
  if (color && typeof color === "string") {
    filter.colors = { $in: color.split(",") };
  }
  if (minRating) {
    filter.ratings = { $gte: Number(minRating) };
  }
  if (maxStock) {
    filter.stock = { $lte: Number(maxStock) };
  }
  if (search && typeof search === "string" && search.trim()) {
    filter.$text = { $search: search.trim() };
  }
  const { ids } = req.query;
  if (ids && typeof ids === "string" && ids.trim()) {
    const idList = ids.split(",").map((id) => id.trim()).filter((id) => import_mongoose7.default.Types.ObjectId.isValid(id));
    if (idList.length > 0) {
      filter._id = { $in: idList };
    }
  }
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;
  const sortOption = SORT_MAP[sort] ?? SORT_MAP.newest;
  const isSimpleQuery = !maxStock && !search;
  const cacheKey = isSimpleQuery ? `products:${category ?? "all"}:${sort}:${page}:${limit}:${minPrice ?? ""}:${maxPrice ?? ""}:${minRating ?? ""}` : null;
  const result = await cacheAside(
    cacheKey ?? `products:nocache:${Date.now()}`,
    cacheKey ? PRODUCTS_TTL : 0,
    async () => {
      const [products, total] = await Promise.all([
        Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
        Product.countDocuments(filter)
      ]);
      return {
        products,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
      };
    }
  );
  if (isSimpleQuery) {
    res.setHeader("Cache-Control", "public, max-age=30");
  }
  res.json(result);
};
var getProductById = async (req, res) => {
  const id = String(req.params.id);
  if (!import_mongoose7.default.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid product ID" });
    return;
  }
  const product = await Product.findOne({ _id: id, active: true });
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  const reviews = await Review.find({ product: id }).populate("user", "name avatar").sort({ createdAt: -1 }).limit(50);
  res.json({ product, reviews });
};
var createProduct = async (req, res) => {
  const errors = (0, import_express_validator3.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const files = req.files;
  const images = [];
  if (files && files.length > 0 && isCloudinaryConfigured()) {
    for (const file of files) {
      const result = await import_cloudinary.v2.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "ecom/products" }
      );
      images.push({ url: result.secure_url, public_id: result.public_id });
    }
  } else if (req.body.images) {
    const parsed = JSON.parse(req.body.images);
    images.push(...parsed);
  }
  const product = await Product.create({
    ...req.body,
    price: Number(req.body.price),
    discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : void 0,
    stock: Number(req.body.stock),
    sizes: typeof req.body.sizes === "string" ? JSON.parse(req.body.sizes) : req.body.sizes,
    colors: typeof req.body.colors === "string" ? JSON.parse(req.body.colors) : req.body.colors,
    active: req.body.active !== "false" && req.body.active !== false,
    images
  });
  await syncProductToSearch(product);
  cacheInvalidatePrefix("products:");
  res.status(201).json(product);
};
var updateProduct = async (req, res) => {
  const id = String(req.params.id);
  if (!import_mongoose7.default.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid product ID" });
    return;
  }
  const existing = await Product.findById(id);
  if (!existing) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  const updateData = { ...req.body };
  if (updateData.price !== void 0 && updateData.price !== "") {
    updateData.price = Number(updateData.price);
  }
  if (updateData.discountPrice !== void 0 && updateData.discountPrice !== "") {
    updateData.discountPrice = Number(updateData.discountPrice);
  } else if ("discountPrice" in req.body && req.body.discountPrice === "") {
    updateData.discountPrice = void 0;
  }
  if (updateData.stock !== void 0 && updateData.stock !== "") {
    updateData.stock = Number(updateData.stock);
  }
  if (typeof updateData.sizes === "string") {
    updateData.sizes = JSON.parse(updateData.sizes);
  }
  if (typeof updateData.colors === "string") {
    updateData.colors = JSON.parse(updateData.colors);
  }
  if (updateData.active !== void 0) {
    updateData.active = updateData.active !== "false" && updateData.active !== false;
  }
  const files = req.files;
  let images = existing.images;
  if (typeof req.body.existingImages === "string" && req.body.existingImages.trim()) {
    try {
      images = JSON.parse(req.body.existingImages);
    } catch {
      res.status(400).json({ message: "Invalid existing images payload" });
      return;
    }
  }
  if (files && files.length > 0 && isCloudinaryConfigured()) {
    for (const file of files) {
      const result = await import_cloudinary.v2.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "ecom/products" }
      );
      images.push({ url: result.secure_url, public_id: result.public_id });
    }
  }
  updateData.images = images;
  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  await syncProductToSearch(product);
  cacheInvalidatePrefix("products:");
  res.json(product);
};
var deleteProduct = async (req, res) => {
  const id = String(req.params.id);
  const product = await Product.findByIdAndUpdate(
    id,
    { active: false },
    { new: true }
  );
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  await syncProductToSearch(product);
  cacheInvalidatePrefix("products:");
  res.json({ message: "Product deactivated", product });
};
var createReview = async (req, res) => {
  const errors = (0, import_express_validator3.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const id = String(req.params.id);
  const { rating, title, comment } = req.body;
  const product = await Product.findById(id);
  if (!product || !product.active) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  const review = await Review.create({
    user: req.user.id,
    product: id,
    rating,
    title,
    comment
  });
  const stats = await Review.aggregate([
    { $match: { product: new import_mongoose7.default.Types.ObjectId(id) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);
  if (stats.length > 0) {
    product.ratings = Math.round(stats[0].avgRating * 10) / 10;
    product.numReviews = stats[0].count;
    await product.save();
  }
  res.status(201).json(review);
};

// src/middleware/auth.ts
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"));
var verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token" });
    return;
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "JWT secret not configured" });
      return;
    }
    req.user = import_jsonwebtoken3.default.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
var optionalAuth = (req, _res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    next();
    return;
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      req.user = import_jsonwebtoken3.default.verify(token, secret);
    }
  } catch {
  }
  next();
};

// src/middleware/adminOnly.ts
var adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin only" });
    return;
  }
  next();
};

// src/config/multer.ts
var import_multer = __toESM(require("multer"));
var storage = import_multer.default.memoryStorage();
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// src/routes/products.ts
var router2 = (0, import_express2.Router)();
router2.get("/", getProducts);
router2.get("/:id", getProductById);
router2.post(
  "/",
  verifyToken,
  adminOnly,
  upload.array("images", 5),
  [
    (0, import_express_validator4.body)("name").trim().notEmpty(),
    (0, import_express_validator4.body)("description").trim().notEmpty(),
    (0, import_express_validator4.body)("price").isNumeric(),
    (0, import_express_validator4.body)("category").isIn(["men", "women", "children"]),
    (0, import_express_validator4.body)("stock").isNumeric()
  ],
  createProduct
);
router2.put("/:id", verifyToken, adminOnly, upload.array("images", 5), updateProduct);
router2.delete("/:id", verifyToken, adminOnly, deleteProduct);
router2.post(
  "/:id/review",
  verifyToken,
  [
    (0, import_express_validator4.body)("rating").isInt({ min: 1, max: 5 }),
    (0, import_express_validator4.body)("title").trim().notEmpty(),
    (0, import_express_validator4.body)("comment").trim().notEmpty()
  ],
  createReview
);
var products_default = router2;

// src/routes/orders.ts
var import_express3 = require("express");
var import_express_validator6 = require("express-validator");

// src/controllers/orderController.ts
var import_mongoose11 = __toESM(require("mongoose"));
var import_express_validator5 = require("express-validator");

// src/models/Order.ts
var import_mongoose8 = __toESM(require("mongoose"));
var orderItemSchema = new import_mongoose8.Schema(
  {
    product: { type: import_mongoose8.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);
var shippingAddressSchema = new import_mongoose8.Schema(
  {
    name: { type: String, required: true },
    phones: { type: [String], default: [] },
    phone: { type: String },
    landmark: { type: String, default: "" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal: { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false }
);
var orderSchema = new import_mongoose8.Schema(
  {
    user: { type: import_mongoose8.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["cod", "bank"], default: "cod" },
    bankPaymentProof: {
      url: { type: String },
      public_id: { type: String }
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    loyaltyPointsRedeemed: { type: Number, default: 0 },
    loyaltyPointsEarned: { type: Number, default: 0 },
    loyaltyAwarded: { type: Boolean, default: false },
    total: { type: Number, required: true },
    notes: { type: String }
  },
  { timestamps: true }
);
var Order = import_mongoose8.default.model("Order", orderSchema);

// src/models/Coupon.ts
var import_mongoose9 = __toESM(require("mongoose"));
var couponSchema = new import_mongoose9.Schema(
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
var Coupon = import_mongoose9.default.model("Coupon", couponSchema);

// src/services/couponService.ts
var calculateCouponDiscount = (coupon, subtotal) => {
  if (subtotal < coupon.minOrder) {
    throw new Error(`Minimum order of \u20A8${coupon.minOrder} required for this coupon`);
  }
  if (coupon.type === "free_shipping") {
    return { discount: 0, freeShipping: true, coupon };
  }
  if (coupon.type === "percent") {
    const discount2 = Math.round(subtotal * Math.min(coupon.value, 100) / 100);
    return { discount: discount2, freeShipping: false, coupon };
  }
  const discount = Math.min(coupon.value, subtotal);
  return { discount, freeShipping: false, coupon };
};

// src/services/invoiceService.ts
var import_pdfkit = __toESM(require("pdfkit"));
var formatPrice = (n) => `Rs ${n.toLocaleString("en-PK")}`;
var NAVY = "#0A2947";
var CREAM = "#F3E4C9";
var BROWN = "#8B5E3C";
var GRAY = "#71717a";
var LIGHT = "#f4f4f5";
var BLACK = "#171717";
var RED = "#dc2626";
var streamToBuffer = (doc) => new Promise((resolve, reject) => {
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  doc.on("error", reject);
  doc.end();
});
var hr = (doc, y, color = "#e4e4e7") => {
  doc.save().strokeColor(color).lineWidth(0.5).moveTo(40, y).lineTo(555, y).stroke().restore();
};
var generateInvoicePdf = async (order, customerName, customerEmail) => {
  const doc = new import_pdfkit.default({ margin: 40, size: "A4" });
  doc.rect(0, 0, doc.page.width, 70).fill(NAVY);
  doc.fillColor(CREAM).fontSize(22).font("Helvetica-Bold").text(APP_NAME, 40, 20);
  doc.fillColor(CREAM).fontSize(10).font("Helvetica").text("Invoice", 40, 46);
  const orderRef = order._id.toString().slice(-8).toUpperCase();
  doc.fillColor(BLACK).fontSize(10).font("Helvetica").text(`Invoice #${orderRef}`, 40, 85).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 40, 100).text(`Status: ${order.status}`, 40, 115);
  doc.fillColor(NAVY).fontSize(9).font("Helvetica-Bold").text("BILL TO", 350, 85).fillColor(BLACK).font("Helvetica").text(customerName, 350, 98).text(customerEmail, 350, 111).text(
    `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
    350,
    124
  );
  hr(doc, 142);
  doc.rect(40, 148, 515, 20).fill(LIGHT);
  const cols = [40, 260, 330, 420, 480];
  doc.fillColor(NAVY).fontSize(9).font("Helvetica-Bold").text("ITEM", cols[0], 153).text("SIZE / COLOR", cols[1], 153).text("QTY", cols[2], 153).text("UNIT", cols[3], 153).text("TOTAL", cols[4], 153);
  let y = 175;
  order.items.forEach((item, idx) => {
    if (idx % 2 === 1) doc.rect(40, y - 4, 515, 20).fill("#fafafa");
    doc.fillColor(BLACK).fontSize(9).font("Helvetica-Bold").text(item.name, cols[0], y, { width: 215, ellipsis: true });
    doc.font("Helvetica").text(`${item.size} / ${item.color}`, cols[1], y, { width: 65 }).text(String(item.qty), cols[2], y).text(formatPrice(item.price), cols[3], y).text(formatPrice(item.price * item.qty), cols[4], y);
    y += 22;
  });
  hr(doc, y + 4);
  y += 14;
  const totalsX = 380;
  const valueX = 480;
  const totalsLine = (label, value, bold = false, color = BLACK) => {
    doc.fillColor(color).fontSize(9).font(bold ? "Helvetica-Bold" : "Helvetica").text(label, totalsX, y).text(value, valueX, y);
    y += 16;
  };
  totalsLine("Subtotal", formatPrice(order.subtotal));
  if (order.couponDiscount)
    totalsLine(`Coupon (${order.couponCode})`, `-${formatPrice(order.couponDiscount)}`, false, RED);
  if (order.loyaltyPointsRedeemed)
    totalsLine("Loyalty points", `-${formatPrice(order.loyaltyPointsRedeemed)}`, false, RED);
  totalsLine("Shipping", order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee));
  hr(doc, y + 2, NAVY);
  y += 8;
  totalsLine("TOTAL", formatPrice(order.total), true, NAVY);
  y += 10;
  doc.fillColor(GRAY).fontSize(8).font("Helvetica").text(`Payment method: ${formatPaymentMethodLabel(order.paymentMethod)}`, 40, y);
  const footerY = doc.page.height - 40;
  hr(doc, footerY - 8);
  doc.fillColor(GRAY).fontSize(8).text(`Thank you for shopping at ${APP_NAME}`, 40, footerY, { align: "center", width: 515 });
  return streamToBuffer(doc);
};
var generateDispatchReceiptPdf = async (order, customerName, customerEmail) => {
  const doc = new import_pdfkit.default({ margin: 40, size: "A4" });
  const orderRef = order._id.toString().slice(-8).toUpperCase();
  doc.rect(0, 0, doc.page.width, 70).fill(NAVY);
  doc.fillColor(CREAM).fontSize(22).font("Helvetica-Bold").text(APP_NAME, 40, 18);
  doc.fillColor(CREAM).fontSize(10).font("Helvetica").text("Dispatch Receipt", 40, 44);
  doc.fillColor(BROWN).fontSize(14).font("Helvetica-Bold").text(`#${orderRef}`, 430, 26);
  doc.rect(40, 80, 515, 90).fill("#f0f4f8").stroke(NAVY);
  doc.fillColor(NAVY).fontSize(8).font("Helvetica-Bold").text("SHIP TO \u2014 ATTACH TO PARCEL", 52, 88);
  doc.fillColor(BLACK).fontSize(13).font("Helvetica-Bold").text(order.shippingAddress.name, 52, 102);
  doc.fontSize(10).font("Helvetica").text(
    [
      order.shippingAddress.landmark ? `Near: ${order.shippingAddress.landmark}` : "",
      order.shippingAddress.street,
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal}`,
      order.shippingAddress.country,
      `Mobile: ${formatShippingPhones(order.shippingAddress)}`
    ].filter(Boolean).join("\n"),
    52,
    120,
    { width: 490 }
  );
  let y = 185;
  doc.fillColor(GRAY).fontSize(8).font("Helvetica-Bold").text("ORDER DATE", 40, y);
  doc.fillColor(GRAY).text("DISPATCH DATE", 170, y);
  doc.fillColor(GRAY).text("PAYMENT", 310, y);
  doc.fillColor(GRAY).text("CUSTOMER", 440, y);
  y += 12;
  doc.fillColor(BLACK).fontSize(9).font("Helvetica").text(new Date(order.createdAt).toLocaleDateString(), 40, y).text((/* @__PURE__ */ new Date()).toLocaleDateString(), 170, y).text(
    order.paymentMethod === "bank" ? "Bank Transfer (Prepaid)" : "Cash on Delivery",
    310,
    y,
    { width: 125 }
  ).text(customerName, 440, y, { width: 115, ellipsis: true });
  y += 24;
  hr(doc, y);
  y += 8;
  doc.rect(40, y, 515, 20).fill(NAVY);
  doc.fillColor(CREAM).fontSize(8).font("Helvetica-Bold").text("#", 48, y + 6).text("PRODUCT", 68, y + 6).text("SIZE / COLOR", 290, y + 6).text("QTY", 400, y + 6).text("LINE TOTAL", 455, y + 6);
  y += 24;
  order.items.forEach((item, idx) => {
    if (idx % 2 === 0) doc.rect(40, y - 4, 515, 20).fill(LIGHT);
    doc.fillColor(BLACK).fontSize(9).font("Helvetica-Bold").text(String(idx + 1), 48, y).text(item.name, 68, y, { width: 218, ellipsis: true });
    doc.font("Helvetica").text(`${item.size} \xB7 ${item.color}`, 290, y, { width: 105 }).fillColor(NAVY).font("Helvetica-Bold").text(String(item.qty), 400, y).fillColor(BLACK).font("Helvetica").text(formatPrice(item.price * item.qty), 455, y);
    y += 22;
  });
  hr(doc, y + 4);
  y += 16;
  doc.rect(350, y, 205, 70).fill("#fff7ed").stroke(BROWN);
  doc.fillColor(BROWN).fontSize(8).font("Helvetica-Bold").text(
    order.paymentMethod === "bank" ? "PREPAID \u2014 DO NOT COLLECT" : "AMOUNT TO COLLECT (COD)",
    358,
    y + 8,
    { width: 190, align: "center" }
  );
  doc.fillColor(NAVY).fontSize(22).font("Helvetica-Bold").text(formatPrice(order.total), 358, y + 24, { width: 190, align: "center" });
  doc.fillColor(BLACK).fontSize(9).font("Helvetica-Bold").text("Packing checklist:", 40, y + 8);
  ["Verify items & quantities", "Seal package securely", "Attach this receipt to parcel"].forEach(
    (item, i) => {
      doc.font("Helvetica").fontSize(9).fillColor(BLACK).text(`\u2610  ${item}`, 40, y + 24 + i * 16);
    }
  );
  const footerY = doc.page.height - 40;
  hr(doc, footerY - 8);
  doc.fillColor(GRAY).fontSize(8).text(
    `${APP_NAME} \xB7 Dispatch document for Order #${orderRef} \xB7 Internal use only`,
    40,
    footerY,
    { align: "center", width: 515 }
  );
  return streamToBuffer(doc);
};
var generateOrdersReportPdf = async (orders, title) => {
  const doc = new import_pdfkit.default({ margin: 40, size: "A4", layout: "landscape" });
  doc.rect(0, 0, doc.page.width, 60).fill(NAVY);
  doc.fillColor(CREAM).fontSize(20).font("Helvetica-Bold").text(`${APP_NAME} \u2014 ${title}`, 40, 16);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  doc.fillColor(CREAM).fontSize(9).font("Helvetica").text(`${orders.length} orders \xB7 Revenue: ${formatPrice(totalRevenue)}`, 40, 42);
  let y = 76;
  doc.rect(40, y, doc.page.width - 80, 20).fill(LIGHT);
  const cols = [40, 130, 250, 350, 470, 570];
  doc.fillColor(NAVY).fontSize(8).font("Helvetica-Bold").text("ORDER ID", cols[0], y + 6).text("DATE", cols[1], y + 6).text("CUSTOMER", cols[2], y + 6).text("STATUS", cols[3], y + 6).text("PAYMENT", cols[4], y + 6).text("TOTAL", cols[5], y + 6);
  y += 24;
  orders.forEach((o, idx) => {
    if (idx % 2 === 1) doc.rect(40, y - 4, doc.page.width - 80, 18).fill("#fafafa");
    doc.fillColor(BLACK).fontSize(8).font("Helvetica").text(o._id.toString().slice(-8).toUpperCase(), cols[0], y, { width: 85 }).text(new Date(o.createdAt).toLocaleDateString(), cols[1], y, { width: 115 }).text("\u2014", cols[2], y, { width: 95 }).text(o.status, cols[3], y, { width: 115 }).text(o.paymentMethod === "bank" ? "Bank" : "COD", cols[4], y, { width: 95 }).fillColor(NAVY).font("Helvetica-Bold").text(formatPrice(o.total), cols[5], y, { width: 95 });
    y += 18;
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }
  });
  const footerY = doc.page.height - 30;
  hr(doc, footerY - 8);
  doc.fillColor(GRAY).fontSize(8).text(`Generated by ${APP_NAME} \xB7 ${(/* @__PURE__ */ new Date()).toLocaleString()}`, 40, footerY, {
    align: "center",
    width: doc.page.width - 80
  });
  return streamToBuffer(doc);
};

// src/services/paymentProofUpload.ts
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));
var PAYMENT_PROOF_DIR = import_path.default.join(process.cwd(), "uploads", "payment-proofs");
var uploadPaymentProof = async (file) => {
  if (isCloudinaryConfigured()) {
    const result = await import_cloudinary.v2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "ecom/payment-proofs" }
    );
    return { url: result.secure_url, public_id: result.public_id };
  }
  await import_promises.default.mkdir(PAYMENT_PROOF_DIR, { recursive: true });
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  await import_promises.default.writeFile(import_path.default.join(PAYMENT_PROOF_DIR, filename), file.buffer);
  const baseUrl = process.env.API_PUBLIC_URL ?? process.env.CLIENT_URL ?? `http://localhost:${process.env.PORT ?? 5e3}`;
  return {
    url: `${baseUrl.replace(/\/$/, "")}/api/uploads/payment-proofs/${filename}`,
    public_id: filename
  };
};

// src/models/AuditLog.ts
var import_mongoose10 = __toESM(require("mongoose"));
var auditLogSchema = new import_mongoose10.Schema(
  {
    admin: { type: import_mongoose10.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    targetId: { type: String },
    meta: { type: import_mongoose10.Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ admin: 1, createdAt: -1 });
var AuditLog = import_mongoose10.default.model("AuditLog", auditLogSchema);

// src/services/auditService.ts
var logAdminAction = async (params) => {
  try {
    await AuditLog.create({
      admin: params.adminId,
      action: params.action,
      target: params.target,
      targetId: params.targetId,
      meta: params.meta
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write entry:", err);
  }
};

// src/controllers/orderController.ts
var createOrder = async (req, res) => {
  const errors = (0, import_express_validator5.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const { items, shippingAddress: rawShippingAddress, notes, couponCode, pointsToRedeem, paymentMethod: rawPaymentMethod } = req.body;
  const paymentMethod = rawPaymentMethod === "bank" ? "bank" : "cod";
  if (paymentMethod === "bank") {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "Payment proof image is required for bank transfer" });
      return;
    }
  }
  let shippingAddress;
  try {
    shippingAddress = normalizeShippingAddress(rawShippingAddress);
  } catch (err) {
    res.status(400).json({
      message: err instanceof Error ? err.message : "Invalid shipping address"
    });
    return;
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "Order must contain at least one item" });
    return;
  }
  if (items.length > MAX_ORDER_LINE_ITEMS) {
    res.status(400).json({ message: `Order cannot exceed ${MAX_ORDER_LINE_ITEMS} line items` });
    return;
  }
  const session = await import_mongoose11.default.startSession();
  session.startTransaction();
  try {
    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      if (item.qty < 1 || item.qty > MAX_QTY_PER_LINE) {
        throw new Error(`Quantity must be between 1 and ${MAX_QTY_PER_LINE}`);
      }
      const product = await Product.findById(item.productId).session(session);
      if (!product || !product.active) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      if (!product.sizes.includes(item.size)) {
        throw new Error(`Size ${item.size} not available for ${product.name}`);
      }
      if (!product.colors.includes(item.color)) {
        throw new Error(`Color ${item.color} not available for ${product.name}`);
      }
      const price = product.discountPrice ?? product.price;
      subtotal += price * item.qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url ?? "",
        price,
        size: item.size,
        color: item.color,
        qty: item.qty
      });
      product.stock -= item.qty;
      product.sold += item.qty;
      await product.save({ session });
    }
    let couponDiscount = 0;
    let freeShipping = false;
    let appliedCouponCode;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true }).session(session);
      if (!coupon) throw new Error("Invalid coupon code");
      if (coupon.expiresAt && coupon.expiresAt < /* @__PURE__ */ new Date()) throw new Error("Coupon has expired");
      if (coupon.usedCount >= coupon.maxUses) throw new Error("Coupon usage limit reached");
      const priorUse = await Order.countDocuments({
        user: req.user.id,
        couponCode: coupon.code,
        status: { $ne: "cancelled" }
      }).session(session);
      if (priorUse > 0) throw new Error("You have already used this coupon");
      const result = calculateCouponDiscount(coupon, subtotal);
      couponDiscount = result.discount;
      freeShipping = result.freeShipping;
      appliedCouponCode = coupon.code;
      coupon.usedCount += 1;
      await coupon.save({ session });
    }
    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new Error("User not found");
    const afterCoupon = Math.max(0, subtotal - couponDiscount);
    const pointsDiscount = pointsToRedeem ? calculatePointsDiscount(pointsToRedeem, user.loyaltyPoints ?? 0, afterCoupon) : 0;
    if (pointsDiscount > 0) {
      user.loyaltyPoints = (user.loyaltyPoints ?? 0) - pointsDiscount;
    }
    let shippingFee = freeShipping ? 0 : calculateShippingFee(afterCoupon - pointsDiscount);
    const total = Math.max(0, afterCoupon - pointsDiscount + shippingFee);
    const pointsEarned = calculatePointsEarned(total);
    let bankPaymentProof;
    if (paymentMethod === "bank" && req.file) {
      bankPaymentProof = await uploadPaymentProof(req.file);
    }
    const [order] = await Order.create(
      [
        {
          user: req.user.id,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          bankPaymentProof,
          status: "pending",
          subtotal,
          shippingFee,
          couponCode: appliedCouponCode,
          couponDiscount,
          loyaltyPointsRedeemed: pointsDiscount,
          loyaltyPointsEarned: pointsEarned,
          total,
          notes
        }
      ],
      { session }
    );
    await user.save({ session });
    await session.commitTransaction();
    sendOrderConfirmationEmail(
      user.email,
      shippingAddress.name,
      order._id.toString(),
      orderItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        size: item.size,
        color: item.color,
        price: item.price
      })),
      total,
      shippingAddress,
      paymentMethod
    ).catch((err) => {
      console.error("[Order Email] Failed to send confirmation:", err);
    });
    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    const message = error instanceof Error ? error.message : "Order creation failed";
    res.status(400).json({ message });
  } finally {
    session.endSession();
  }
};
var awardLoyaltyOnDelivery = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order || order.loyaltyAwarded || order.status !== "delivered") return;
  const user = await User.findById(order.user);
  if (!user) return;
  let points = order.loyaltyPointsEarned ?? calculatePointsEarned(order.total);
  const tier = user.tier ?? "bronze";
  if (tier === "silver") points = Math.round(points * 1.05);
  if (tier === "gold") points = Math.round(points * 1.1);
  user.loyaltyPoints = (user.loyaltyPoints ?? 0) + points;
  user.lifetimePointsEarned = (user.lifetimePointsEarned ?? 0) + points;
  user.tier = getTierFromLifetimePoints(user.lifetimePointsEarned);
  const orderCount = await Order.countDocuments({ user: user._id, status: "delivered" });
  if (orderCount === 1 && user.referredBy) {
    user.loyaltyPoints += REFERRAL_BONUS_REFEREE;
    user.lifetimePointsEarned += REFERRAL_BONUS_REFEREE;
    const referrer = await User.findById(user.referredBy);
    if (referrer) {
      referrer.loyaltyPoints = (referrer.loyaltyPoints ?? 0) + REFERRAL_BONUS_REFERRER;
      referrer.lifetimePointsEarned = (referrer.lifetimePointsEarned ?? 0) + REFERRAL_BONUS_REFERRER;
      referrer.tier = getTierFromLifetimePoints(referrer.lifetimePointsEarned);
      await referrer.save();
    }
  }
  order.loyaltyAwarded = true;
  await Promise.all([user.save(), order.save()]);
};
var getMyOrders = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;
  const filter = { user: req.user.id };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter)
  ]);
  res.json({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};
var getAllOrders = async (req, res) => {
  const { status, startDate, endDate, page = "1", limit = "20" } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;
  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments(filter)
  ]);
  res.json({
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
  });
};
var getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  const isOwner = order.user._id.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }
  res.json(order);
};
var getOrderInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  const userDoc = order.user;
  const isOwner = userDoc._id.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }
  try {
    const pdf = await generateInvoicePdf(order, userDoc.name, userDoc.email);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id.toString().slice(-8)}.pdf`);
    res.send(pdf);
  } catch {
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};
var getOrderDispatchReceipt = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Not authorized" });
    return;
  }
  if (order.status === "cancelled") {
    res.status(400).json({ message: "Cannot generate dispatch receipt for cancelled orders" });
    return;
  }
  const userDoc = order.user;
  try {
    const pdf = await generateDispatchReceiptPdf(order, userDoc.name, userDoc.email);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=dispatch-receipt-${order._id.toString().slice(-8)}.pdf`
    );
    res.send(pdf);
  } catch {
    res.status(500).json({ message: "Failed to generate dispatch receipt" });
  }
};
var exportOrdersReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { status: { $ne: "cancelled" } };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500);
  try {
    const pdf = await generateOrdersReportPdf(orders, "Orders Report");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders-report.pdf");
    res.send(pdf);
  } catch {
    res.status(500).json({ message: "Failed to generate report" });
  }
};
var updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  const previousStatus = order.status;
  if (status === "cancelled" && order.status !== "cancelled") {
    const session = await import_mongoose11.default.startSession();
    session.startTransaction();
    try {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.qty, sold: -item.qty } },
          { session }
        );
      }
      if (order.loyaltyPointsRedeemed) {
        await User.findByIdAndUpdate(
          order.user,
          { $inc: { loyaltyPoints: order.loyaltyPointsRedeemed } },
          { session }
        );
      }
      if (order.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: order.couponCode },
          { $inc: { usedCount: -1 } },
          { session }
        );
      }
      order.status = status;
      await order.save({ session });
      await session.commitTransaction();
    } catch {
      await session.abortTransaction();
      res.status(500).json({ message: "Failed to cancel order" });
      return;
    } finally {
      session.endSession();
    }
  } else {
    order.status = status;
    await order.save();
  }
  if (status === "delivered") {
    await awardLoyaltyOnDelivery(order._id.toString());
  }
  await logAdminAction({
    adminId: req.user.id,
    action: "order.status_update",
    target: "order",
    targetId: order._id.toString(),
    meta: { from: previousStatus, to: status }
  });
  const userDoc = order.user;
  const notifyStatuses = ["processing", "shipped", "delivered", "cancelled"];
  if (notifyStatuses.includes(status) && status !== previousStatus && userDoc?.email) {
    sendOrderStatusUpdateEmail(
      userDoc.email,
      userDoc.name ?? "Customer",
      order._id.toString(),
      status
    ).catch((err) => console.error("[Order Status Email]", err));
  }
  res.json(order);
};
var cancelMyOrder = async (req, res) => {
  const userId = req.user.id;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  if (order.user.toString() !== userId) {
    res.status(403).json({ message: "Not your order" });
    return;
  }
  if (!["pending", "processing"].includes(order.status)) {
    res.status(400).json({ message: `Cannot cancel an order that is already "${order.status}"` });
    return;
  }
  const session = await import_mongoose11.default.startSession();
  session.startTransaction();
  try {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, sold: -item.qty } }, { session });
    }
    if (order.loyaltyPointsRedeemed) {
      await User.findByIdAndUpdate(order.user, { $inc: { loyaltyPoints: order.loyaltyPointsRedeemed } }, { session });
    }
    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: -1 } }, { session });
    }
    order.status = "cancelled";
    await order.save({ session });
    await session.commitTransaction();
  } catch {
    await session.abortTransaction();
    res.status(500).json({ message: "Failed to cancel order" });
    return;
  } finally {
    session.endSession();
  }
  res.json({ message: "Order cancelled successfully", order });
};
var getAnalytics = async (_req, res) => {
  const sevenDaysAgo = /* @__PURE__ */ new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const LOW_STOCK_THRESHOLD = 10;
  const [revenue, orderCount, productCount, userCount, recentOrders, dailySales, lowStockCount, lowStockProducts] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]),
    Order.countDocuments(),
    Product.countDocuments({ active: true }),
    import_mongoose11.default.model("User").countDocuments(),
    Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(10),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Product.countDocuments({ active: true, stock: { $lte: LOW_STOCK_THRESHOLD } }),
    Product.find({ active: true, stock: { $lte: LOW_STOCK_THRESHOLD } }).sort({ stock: 1 }).limit(10).select("name stock category price")
  ]);
  res.json({
    revenue: revenue[0]?.total ?? 0,
    orders: orderCount,
    products: productCount,
    users: userCount,
    recentOrders,
    dailySales,
    lowStockCount,
    lowStockProducts
  });
};

// src/middleware/parseOrderBody.ts
var parseOrderBody = (req, res, next) => {
  try {
    if (typeof req.body.items === "string") {
      req.body.items = JSON.parse(req.body.items);
    }
    if (typeof req.body.shippingAddress === "string") {
      req.body.shippingAddress = JSON.parse(req.body.shippingAddress);
    }
    if (req.body.pointsToRedeem !== void 0 && req.body.pointsToRedeem !== "") {
      req.body.pointsToRedeem = Number(req.body.pointsToRedeem);
    }
    next();
  } catch {
    res.status(400).json({ message: "Invalid order payload" });
  }
};

// src/routes/orders.ts
var router3 = (0, import_express3.Router)();
router3.get("/analytics", verifyToken, adminOnly, getAnalytics);
router3.get("/export/pdf", verifyToken, adminOnly, exportOrdersReport);
router3.post(
  "/",
  verifyToken,
  orderRateLimit,
  upload.single("paymentProof"),
  parseOrderBody,
  [
    (0, import_express_validator6.body)("paymentMethod").optional().isIn(["cod", "bank"]).withMessage("Invalid payment method"),
    (0, import_express_validator6.body)("items").isArray({ min: 1, max: MAX_ORDER_LINE_ITEMS }).withMessage(`Order must contain 1\u2013${MAX_ORDER_LINE_ITEMS} items`),
    (0, import_express_validator6.body)("items.*.productId").notEmpty().withMessage("Each item needs a product"),
    (0, import_express_validator6.body)("items.*.qty").isInt({ min: 1, max: MAX_QTY_PER_LINE }).withMessage(`Quantity must be between 1 and ${MAX_QTY_PER_LINE}`),
    (0, import_express_validator6.body)("shippingAddress.name").notEmpty(),
    (0, import_express_validator6.body)("shippingAddress").custom((addr) => {
      const phones = Array.isArray(addr?.phones) ? addr.phones.filter((p) => p?.trim()) : [];
      if (phones.length === 0 && !addr?.phone?.trim()) {
        throw new Error("At least one mobile number is required");
      }
      return true;
    }),
    (0, import_express_validator6.body)("shippingAddress.phones.*").optional().isString().isLength({ min: 10, max: 20 }).withMessage("Each mobile number must be 10\u201320 characters"),
    (0, import_express_validator6.body)("shippingAddress.landmark").notEmpty().withMessage("Famous place / landmark is required"),
    (0, import_express_validator6.body)("shippingAddress.street").notEmpty().withMessage("Your place / house address is required"),
    (0, import_express_validator6.body)("shippingAddress.city").notEmpty(),
    (0, import_express_validator6.body)("shippingAddress.state").notEmpty(),
    (0, import_express_validator6.body)("shippingAddress.postal").notEmpty(),
    (0, import_express_validator6.body)("shippingAddress.country").notEmpty(),
    (0, import_express_validator6.body)("couponCode").optional().isString(),
    (0, import_express_validator6.body)("pointsToRedeem").optional().isInt({ min: 0 })
  ],
  createOrder
);
router3.get("/my", verifyToken, getMyOrders);
router3.put("/:id/cancel", verifyToken, cancelMyOrder);
router3.get("/", verifyToken, adminOnly, getAllOrders);
router3.get("/:id/invoice", verifyToken, getOrderInvoice);
router3.get("/:id/dispatch-receipt", verifyToken, adminOnly, getOrderDispatchReceipt);
router3.get("/:id", verifyToken, getOrderById);
router3.put("/:id/status", verifyToken, adminOnly, updateOrderStatus);
var orders_default = router3;

// src/routes/users.ts
var import_express4 = require("express");
var import_express_validator8 = require("express-validator");

// src/controllers/userController.ts
var import_express_validator7 = require("express-validator");
var getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
};
var updateMe = async (req, res) => {
  const errors = (0, import_express_validator7.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const allowedFields = ["name", "phone", "avatar", "banner", "addresses"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== void 0) {
      updates[field] = req.body[field];
    }
  }
  const files = req.files;
  if (files && isCloudinaryConfigured()) {
    if (files.avatar?.[0]) {
      const f = files.avatar[0];
      const result = await import_cloudinary.v2.uploader.upload(
        `data:${f.mimetype};base64,${f.buffer.toString("base64")}`,
        { folder: "ecom/avatars", transformation: [{ width: 400, height: 400, crop: "fill" }] }
      );
      updates.avatar = result.secure_url;
    }
    if (files.banner?.[0]) {
      const f = files.banner[0];
      const result = await import_cloudinary.v2.uploader.upload(
        `data:${f.mimetype};base64,${f.buffer.toString("base64")}`,
        { folder: "ecom/banners", transformation: [{ width: 1200, height: 300, crop: "fill" }] }
      );
      updates.banner = result.secure_url;
    }
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
};
var getAllUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);
  res.json({
    users: users.map(sanitizeUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};
var getUserStats = async (_req, res) => {
  const [users, totalUsers, newThisWeek, orderStats] = await Promise.all([
    User.find().select("name email role isActive createdAt avatar loyaltyPoints").sort({ createdAt: -1 }).limit(50).lean(),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3) } }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$user", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$total" }, lastOrder: { $max: "$createdAt" } } }
    ])
  ]);
  const statsMap = new Map(orderStats.map((s) => [s._id?.toString(), s]));
  const enriched = users.map((u) => {
    const stats = statsMap.get(u._id?.toString());
    return {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      avatar: u.avatar,
      loyaltyPoints: u.loyaltyPoints ?? 0,
      joinedAt: u.createdAt,
      totalOrders: stats?.totalOrders ?? 0,
      totalSpent: stats?.totalSpent ?? 0,
      lastOrderAt: stats?.lastOrder ?? null
    };
  });
  res.json({ totalUsers, newThisWeek, users: enriched });
};
var updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
};
var updateUserStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
};
var changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!user || !user.password) {
    res.status(400).json({ message: "OAuth users cannot change password here" });
    return;
  }
  const bcrypt3 = await import("bcryptjs");
  const isMatch = await bcrypt3.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Current password is incorrect" });
    return;
  }
  user.password = await bcrypt3.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password updated successfully" });
};

// src/routes/users.ts
var router4 = (0, import_express4.Router)();
router4.get("/me", verifyToken, getMe);
router4.put(
  "/me",
  verifyToken,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]),
  updateMe
);
router4.put(
  "/me/password",
  verifyToken,
  [
    (0, import_express_validator8.body)("currentPassword").notEmpty(),
    (0, import_express_validator8.body)("newPassword").isLength({ min: MIN_PASSWORD_LENGTH }).withMessage(PASSWORD_REQUIREMENTS_MSG).matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage(PASSWORD_REQUIREMENTS_MSG)
  ],
  changePassword
);
router4.get("/stats", verifyToken, adminOnly, getUserStats);
router4.get("/", verifyToken, adminOnly, getAllUsers);
router4.put("/:id/role", verifyToken, adminOnly, updateUserRole);
router4.put("/:id/status", verifyToken, adminOnly, updateUserStatus);
var users_default = router4;

// src/routes/categories.ts
var import_express5 = require("express");
var import_express_validator10 = require("express-validator");

// src/controllers/categoryController.ts
var import_express_validator9 = require("express-validator");

// src/models/Category.ts
var import_mongoose12 = __toESM(require("mongoose"));
var categorySchema = new import_mongoose12.Schema(
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
var Category = import_mongoose12.default.model("Category", categorySchema);

// src/controllers/categoryController.ts
var getCategories = async (_req, res) => {
  const categories = await Category.find({ active: true }).sort({ name: 1 });
  res.json(categories);
};
var createCategory = async (req, res) => {
  const errors = (0, import_express_validator9.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const { name, parent, image, active = true } = req.body;
  const slug = slugify(name);
  const existing = await Category.findOne({ slug });
  if (existing) {
    res.status(400).json({ message: "Category with this name already exists" });
    return;
  }
  const category = await Category.create({ name, slug, parent, image, active });
  res.status(201).json(category);
};
var updateCategory = async (req, res) => {
  const { name, parent, image, active } = req.body;
  const updates = {};
  if (name) {
    updates.name = name;
    updates.slug = slugify(name);
  }
  if (parent) updates.parent = parent;
  if (image !== void 0) updates.image = image;
  if (active !== void 0) updates.active = active;
  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });
  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }
  res.json(category);
};
var deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }
  res.json({ message: "Category deleted" });
};

// src/routes/categories.ts
var router5 = (0, import_express5.Router)();
router5.get("/", getCategories);
router5.post(
  "/",
  verifyToken,
  adminOnly,
  [
    (0, import_express_validator10.body)("name").trim().notEmpty(),
    (0, import_express_validator10.body)("parent").isIn(["men", "women", "children"])
  ],
  createCategory
);
router5.put("/:id", verifyToken, adminOnly, updateCategory);
router5.delete("/:id", verifyToken, adminOnly, deleteCategory);
var categories_default = router5;

// src/routes/payments.ts
var import_express6 = require("express");

// src/controllers/paymentController.ts
var getBankDetails = (_req, res) => {
  res.json(getBankTransferDetails());
};
var confirmCod = (_req, res) => {
  res.json({ message: "Cash on delivery confirmed at order creation" });
};
var payByCode = (_req, res) => {
  res.status(501).json({
    status: "coming_soon",
    message: "This payment method is not yet available"
  });
};
var onlineBanking = (_req, res) => {
  res.status(501).json({
    status: "coming_soon",
    message: "Online banking coming soon"
  });
};

// src/routes/payments.ts
var router6 = (0, import_express6.Router)();
router6.get("/bank-details", getBankDetails);
router6.post("/cod", confirmCod);
router6.post("/code", payByCode);
router6.post("/banking", onlineBanking);
var payments_default = router6;

// src/routes/cart.ts
var import_express7 = require("express");

// src/models/Cart.ts
var import_mongoose13 = __toESM(require("mongoose"));
var cartItemSchema = new import_mongoose13.Schema(
  {
    productId: { type: import_mongoose13.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);
var cartSchema = new import_mongoose13.Schema(
  {
    user: { type: import_mongoose13.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);
var Cart = import_mongoose13.default.model("Cart", cartSchema);

// src/services/cartValidation.ts
var import_mongoose14 = __toESM(require("mongoose"));
var validateAndNormalizeCartItems = async (items) => {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array");
  }
  if (items.length > MAX_ORDER_LINE_ITEMS) {
    throw new Error(`Cart cannot exceed ${MAX_ORDER_LINE_ITEMS} line items`);
  }
  const normalized = [];
  for (const item of items) {
    if (!item?.productId || !import_mongoose14.default.Types.ObjectId.isValid(item.productId)) {
      throw new Error("Invalid product in cart");
    }
    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty < 1) {
      throw new Error("Invalid quantity in cart");
    }
    if (qty > MAX_QTY_PER_LINE) {
      throw new Error(`Maximum ${MAX_QTY_PER_LINE} units per item`);
    }
    const product = await Product.findById(item.productId);
    if (!product || !product.active) {
      throw new Error(`Product unavailable: ${item.name || item.productId}`);
    }
    if (!product.sizes.includes(item.size)) {
      throw new Error(`Size ${item.size} not available for ${product.name}`);
    }
    if (!product.colors.includes(item.color)) {
      throw new Error(`Color ${item.color} not available for ${product.name}`);
    }
    const safeQty = Math.min(qty, product.stock, MAX_QTY_PER_LINE);
    if (safeQty < 1) {
      throw new Error(`${product.name} is out of stock`);
    }
    const price = product.discountPrice ?? product.price;
    const image = product.images[0]?.url ?? "";
    normalized.push({
      productId: product._id,
      name: product.name,
      price,
      image,
      size: item.size,
      color: item.color,
      qty: safeQty
    });
  }
  return normalized;
};

// src/controllers/cartController.ts
var getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }
  res.json({
    items: cart.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.size,
      color: item.color,
      qty: item.qty
    }))
  });
};
var saveCart = async (req, res) => {
  const { items } = req.body;
  try {
    const validatedItems = await validateAndNormalizeCartItems(items);
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      {
        items: validatedItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size,
          color: item.color,
          qty: item.qty
        }))
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({
      items: cart.items.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        qty: item.qty
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid cart data";
    res.status(400).json({ message });
  }
};
var clearCart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [] },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ message: "Cart cleared", items: [] });
};

// src/routes/cart.ts
var router7 = (0, import_express7.Router)();
router7.get("/", verifyToken, getCart);
router7.put("/", verifyToken, saveCart);
router7.delete("/", verifyToken, clearCart);
var cart_default = router7;

// src/routes/search.ts
var import_express8 = require("express");

// src/controllers/searchController.ts
var advancedSearch = async (req, res) => {
  const result = await searchProducts({
    q: req.query.q ?? "",
    category: req.query.category,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : void 0,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : void 0,
    size: req.query.size,
    color: req.query.color,
    minRating: req.query.minRating ? Number(req.query.minRating) : void 0,
    sort: req.query.sort,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 12,
    userId: req.user?.id,
    source: "text"
  });
  res.json(result);
};
var searchSuggest = async (req, res) => {
  const q = req.query.q ?? "";
  const suggestions = await autocompleteSearch(q);
  res.json({ suggestions });
};
var searchVisual = async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "Image file required" });
    return;
  }
  let detectedColors = [];
  let category;
  if (isCloudinaryConfigured()) {
    const result = await import_cloudinary.v2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "ecom/visual-search", colors: true }
    );
    const colorNames = result.predominant?.google ?? [];
    detectedColors = colorNames.slice(0, 3);
    const tags = result.tags ?? [];
    if (tags.includes("men")) category = "men";
    else if (tags.includes("women")) category = "women";
    else if (tags.includes("children")) category = "children";
  } else {
    detectedColors = ["Black", "Blue", "White"];
  }
  const products = await visualSearch(detectedColors, category);
  res.json({ products, detectedColors, category });
};
var searchAnalytics = async (_req, res) => {
  const days = parseInt(_req.query.days, 10) || 30;
  const analytics = await getSearchAnalytics(days);
  res.json(analytics);
};
var reindexSearch = async (_req, res) => {
  await syncAllProductsToSearch();
  res.json({ message: "Search index synced" });
};

// src/routes/search.ts
var router8 = (0, import_express8.Router)();
router8.get("/", advancedSearch);
router8.get("/suggest", searchSuggest);
router8.post("/visual", upload.single("image"), searchVisual);
router8.get("/analytics", verifyToken, adminOnly, searchAnalytics);
router8.post("/reindex", verifyToken, adminOnly, reindexSearch);
var search_default = router8;

// src/routes/coupons.ts
var import_express9 = require("express");
var import_express_validator12 = require("express-validator");

// src/controllers/couponController.ts
var import_express_validator11 = require("express-validator");
var validateCoupon = async (req, res) => {
  const errors = (0, import_express_validator11.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
  if (!coupon) {
    res.status(404).json({ message: "Invalid coupon code" });
    return;
  }
  if (coupon.expiresAt && coupon.expiresAt < /* @__PURE__ */ new Date()) {
    res.status(400).json({ message: "Coupon has expired" });
    return;
  }
  if (coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ message: "Coupon usage limit reached" });
    return;
  }
  try {
    const result = calculateCouponDiscount(coupon, subtotal);
    res.json({
      code: coupon.code,
      type: coupon.type,
      discount: result.discount,
      freeShipping: result.freeShipping
    });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Invalid coupon" });
  }
};
var getCoupons = async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};
var createCoupon = async (req, res) => {
  const errors = (0, import_express_validator11.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const coupon = await Coupon.create({
    ...req.body,
    code: req.body.code.toUpperCase(),
    value: Number(req.body.value),
    minOrder: Number(req.body.minOrder ?? 0),
    maxUses: Number(req.body.maxUses ?? 1e3)
  });
  res.status(201).json(coupon);
};
var updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) {
    res.status(404).json({ message: "Coupon not found" });
    return;
  }
  res.json(coupon);
};
var deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!coupon) {
    res.status(404).json({ message: "Coupon not found" });
    return;
  }
  res.json({ message: "Coupon deactivated" });
};

// src/routes/coupons.ts
var router9 = (0, import_express9.Router)();
router9.post(
  "/validate",
  verifyToken,
  [
    (0, import_express_validator12.body)("code").notEmpty().withMessage("Coupon code is required"),
    (0, import_express_validator12.body)("subtotal").isNumeric().withMessage("Subtotal is required")
  ],
  validateCoupon
);
router9.get("/", verifyToken, adminOnly, getCoupons);
router9.post(
  "/",
  verifyToken,
  adminOnly,
  [
    (0, import_express_validator12.body)("code").notEmpty(),
    (0, import_express_validator12.body)("type").isIn(["percent", "fixed", "free_shipping"]),
    (0, import_express_validator12.body)("value").isNumeric()
  ],
  createCoupon
);
router9.put("/:id", verifyToken, adminOnly, updateCoupon);
router9.delete("/:id", verifyToken, adminOnly, deleteCoupon);
var coupons_default = router9;

// src/routes/promotions.ts
var import_express10 = require("express");
var import_express_validator14 = require("express-validator");

// src/controllers/promotionController.ts
var import_express_validator13 = require("express-validator");

// src/models/Promotion.ts
var import_mongoose15 = __toESM(require("mongoose"));
var promotionSchema = new import_mongoose15.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    couponCode: { type: String, uppercase: true, trim: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);
var Promotion = import_mongoose15.default.model("Promotion", promotionSchema);

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

// src/controllers/promotionController.ts
var getActivePromotions = async (_req, res) => {
  if (!isDbConnected()) {
    res.json(catalogPromotions.filter((p) => p.active));
    return;
  }
  try {
    const promotions = await Promotion.find({ active: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json(promotions);
  } catch {
    res.json(catalogPromotions.filter((p) => p.active));
  }
};
var getPromotions = async (_req, res) => {
  const promotions = await Promotion.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json(promotions);
};
var createPromotion = async (req, res) => {
  const errors = (0, import_express_validator13.validationResult)(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  const promotion = await Promotion.create({
    title: req.body.title,
    message: req.body.message,
    couponCode: req.body.couponCode || void 0,
    active: req.body.active !== false,
    sortOrder: Number(req.body.sortOrder ?? 0)
  });
  res.status(201).json(promotion);
};
var updatePromotion = async (req, res) => {
  const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!promotion) {
    res.status(404).json({ message: "Promotion not found" });
    return;
  }
  res.json(promotion);
};
var deletePromotion = async (req, res) => {
  const promotion = await Promotion.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!promotion) {
    res.status(404).json({ message: "Promotion not found" });
    return;
  }
  res.json({ message: "Promotion deactivated" });
};

// src/routes/promotions.ts
var router10 = (0, import_express10.Router)();
router10.get("/active", getActivePromotions);
router10.get("/", verifyToken, adminOnly, getPromotions);
router10.post(
  "/",
  verifyToken,
  adminOnly,
  [
    (0, import_express_validator14.body)("title").trim().notEmpty().withMessage("Title is required"),
    (0, import_express_validator14.body)("message").trim().notEmpty().withMessage("Message is required")
  ],
  createPromotion
);
router10.put("/:id", verifyToken, adminOnly, updatePromotion);
router10.delete("/:id", verifyToken, adminOnly, deletePromotion);
var promotions_default = router10;

// src/routes/settings.ts
var import_express11 = require("express");

// src/models/SiteSettings.ts
var import_mongoose16 = __toESM(require("mongoose"));
var heroSlideSchema = new import_mongoose16.Schema(
  {
    id: { type: String, required: true },
    tag: { type: String, default: "" },
    title: { type: String, default: "" },
    titleAccent: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    image: { type: String, default: "" },
    imagePublicId: { type: String },
    ctaLabel: { type: String, default: "Shop Now" },
    ctaHref: { type: String, default: "/products" },
    secondaryLabel: { type: String, default: "View All" },
    secondaryHref: { type: String, default: "/products" }
  },
  { _id: false }
);
var categoryImageSchema = new import_mongoose16.Schema(
  {
    slug: { type: String, required: true },
    label: { type: String, required: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String },
    href: { type: String, default: "" }
  },
  { _id: false }
);
var siteSettingsSchema = new import_mongoose16.Schema(
  {
    designId: { type: String, default: "classic" },
    colorSchemeId: { type: String, default: "midnight-athletic" },
    themeId: { type: String },
    primaryColor: { type: String },
    accentColor: { type: String },
    secondaryColor: { type: String },
    siteTagline: { type: String, default: "Premium Clothing Store" },
    seoDescription: {
      type: String,
      default: "Shop men, women, and children athletic wear with free delivery above \u20A85000"
    },
    seoKeywords: {
      type: String,
      default: "clothing, athletic wear, sportswear, fashion, Pakistan"
    },
    heroSlides: { type: [heroSlideSchema], default: [] },
    categoryImages: { type: [categoryImageSchema], default: [] }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);
var SiteSettings = import_mongoose16.default.model("SiteSettings", siteSettingsSchema);
var LEGACY_THEME_TO_DESIGN = {
  "midnight-athletic": "classic",
  "ocean-breeze": "wave",
  "rose-elite": "boutique",
  "forest-pro": "nature",
  "royal-gold": "premium"
};
var migrateSiteSettings = (settings) => {
  if (!settings.colorSchemeId && settings.themeId) {
    settings.colorSchemeId = settings.themeId;
  }
  if (!settings.colorSchemeId) {
    settings.colorSchemeId = "midnight-athletic";
  }
  if (!settings.designId) {
    settings.designId = LEGACY_THEME_TO_DESIGN[settings.colorSchemeId] ?? "classic";
  }
  return settings;
};
var getOrCreateSiteSettings = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  migrateSiteSettings(settings);
  if (settings.isModified()) {
    await settings.save();
  }
  return settings;
};

// src/controllers/settingsController.ts
var SETTINGS_CACHE_KEY = "settings:public";
var HERO_SLIDES_CACHE_KEY = "settings:hero-slides";
var CATEGORY_IMAGES_CACHE_KEY = "settings:category-images";
var SETTINGS_TTL = 120;
var DEFAULT_CATEGORY_IMAGES = [
  { slug: "men", label: "Men's", image: "", href: "/category/men" },
  { slug: "women", label: "Women's", image: "", href: "/category/women" },
  { slug: "children", label: "Children's", image: "", href: "/category/children" }
];
var DEFAULT_PUBLIC_SETTINGS = {
  designId: "classic",
  colorSchemeId: "midnight-athletic",
  primaryColor: void 0,
  accentColor: void 0,
  secondaryColor: void 0,
  siteTagline: "Premium Clothing Store",
  seoDescription: "Shop men, women, and children athletic wear with free delivery above \u20A85000",
  seoKeywords: "clothing, athletic wear, sportswear, fashion, Pakistan"
};
var toPublicSettings = (settings) => ({
  designId: settings.designId,
  colorSchemeId: settings.colorSchemeId,
  primaryColor: settings.primaryColor,
  accentColor: settings.accentColor,
  secondaryColor: settings.secondaryColor,
  siteTagline: settings.siteTagline,
  seoDescription: settings.seoDescription,
  seoKeywords: settings.seoKeywords
});
var getPublicSettings = async (_req, res) => {
  if (!isDbConnected()) {
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(DEFAULT_PUBLIC_SETTINGS);
    return;
  }
  try {
    const data = await cacheAside(SETTINGS_CACHE_KEY, SETTINGS_TTL, async () => {
      const settings = await getOrCreateSiteSettings();
      return toPublicSettings(settings);
    });
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(data);
  } catch (err) {
    console.warn("[Settings] public fallback:", err instanceof Error ? err.message : err);
    res.json(DEFAULT_PUBLIC_SETTINGS);
  }
};
var getSettings = async (_req, res) => {
  const settings = await getOrCreateSiteSettings();
  res.json(settings);
};
var updateSettings = async (req, res) => {
  cacheDelete(SETTINGS_CACHE_KEY);
  const settings = await getOrCreateSiteSettings();
  const allowed = [
    "designId",
    "colorSchemeId",
    "primaryColor",
    "accentColor",
    "secondaryColor",
    "siteTagline",
    "seoDescription",
    "seoKeywords"
  ];
  for (const key of allowed) {
    if (req.body[key] !== void 0) {
      settings[key] = req.body[key];
    }
  }
  await settings.save();
  res.json(settings);
};
var DEFAULT_HERO_SLIDES = [
  {
    id: "elevate",
    tag: "Premium Collection",
    title: "Elevate Your",
    titleAccent: "Style",
    subtitle: "Discover premium clothing for men, women, and children. Quality fashion crafted for athletes and everyday champions.",
    image: "/hero/elevate.jpg",
    ctaLabel: "Shop Men",
    ctaHref: "/category/men",
    secondaryLabel: "Shop Women",
    secondaryHref: "/category/women"
  },
  {
    id: "summer",
    tag: "Season 2026",
    title: "Summer",
    titleAccent: "Collection",
    subtitle: "Light fabrics, bold colors, and effortless fits designed for heat, movement, and confidence.",
    image: "/hero/summer.jpg",
    ctaLabel: "Explore Collection",
    ctaHref: "/products",
    secondaryLabel: "View Sale",
    secondaryHref: "/products?sort=price-desc"
  },
  {
    id: "kids",
    tag: "Kids & Teens",
    title: "Playful Styles for",
    titleAccent: "Kids",
    subtitle: "Durable, comfortable pieces built for school days, sports, and weekend adventures.",
    image: "/hero/kids.jpg",
    ctaLabel: "Shop Children",
    ctaHref: "/category/children",
    secondaryLabel: "All Products",
    secondaryHref: "/products"
  }
];
var getHeroSlides = async (_req, res) => {
  try {
    if (!isDbConnected()) {
      res.setHeader("Cache-Control", "public, max-age=60");
      res.json(DEFAULT_HERO_SLIDES);
      return;
    }
    const slides = await cacheAside(HERO_SLIDES_CACHE_KEY, SETTINGS_TTL, async () => {
      const settings = await getOrCreateSiteSettings();
      return settings.heroSlides.length > 0 ? settings.heroSlides : DEFAULT_HERO_SLIDES;
    });
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(slides);
  } catch {
    res.json(DEFAULT_HERO_SLIDES);
  }
};
var updateHeroSlides = async (req, res) => {
  cacheDelete(HERO_SLIDES_CACHE_KEY);
  try {
    const settings = await getOrCreateSiteSettings();
    const slides = req.body.slides;
    if (!Array.isArray(slides) || slides.length === 0) {
      res.status(400).json({ message: "slides array is required" });
      return;
    }
    settings.heroSlides = slides;
    await settings.save();
    res.json(settings.heroSlides);
  } catch (err) {
    res.status(500).json({ message: "Failed to update hero slides" });
  }
};
var uploadHeroSlideImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }
    if (!isCloudinaryConfigured()) {
      res.status(500).json({ message: "Image uploads not configured (Cloudinary env vars missing)" });
      return;
    }
    const result = await import_cloudinary.v2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: "ecom/hero",
        transformation: [{ width: 1920, height: 1080, crop: "fill", quality: "auto" }]
      }
    );
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("[Hero Upload]", err);
    res.status(500).json({ message: "Image upload failed" });
  }
};
var getCategoryImages = async (_req, res) => {
  try {
    if (!isDbConnected()) {
      res.setHeader("Cache-Control", "public, max-age=60");
      res.json(DEFAULT_CATEGORY_IMAGES);
      return;
    }
    const data = await cacheAside(CATEGORY_IMAGES_CACHE_KEY, SETTINGS_TTL, async () => {
      const settings = await getOrCreateSiteSettings();
      return settings.categoryImages.length > 0 ? settings.categoryImages : DEFAULT_CATEGORY_IMAGES;
    });
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(data);
  } catch {
    res.json(DEFAULT_CATEGORY_IMAGES);
  }
};
var updateCategoryImages = async (req, res) => {
  cacheDelete(CATEGORY_IMAGES_CACHE_KEY);
  try {
    const settings = await getOrCreateSiteSettings();
    const categories = req.body.categories;
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({ message: "categories array is required" });
      return;
    }
    settings.categoryImages = categories;
    await settings.save();
    res.json(settings.categoryImages);
  } catch {
    res.status(500).json({ message: "Failed to update category images" });
  }
};
var uploadCategoryImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }
    if (!isCloudinaryConfigured()) {
      res.status(500).json({ message: "Cloudinary env vars missing" });
      return;
    }
    const result = await import_cloudinary.v2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "ecom/categories", transformation: [{ width: 800, height: 1e3, crop: "fill", quality: "auto" }] }
    );
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("[Category Upload]", err);
    res.status(500).json({ message: "Image upload failed" });
  }
};

// src/routes/settings.ts
var router11 = (0, import_express11.Router)();
router11.get("/public", getPublicSettings);
router11.get("/hero-slides", getHeroSlides);
router11.get("/", verifyToken, adminOnly, getSettings);
router11.put("/", verifyToken, adminOnly, updateSettings);
router11.put("/hero-slides", verifyToken, adminOnly, updateHeroSlides);
router11.post("/hero-slides/upload-image", verifyToken, adminOnly, upload.single("image"), uploadHeroSlideImage);
router11.get("/category-images", getCategoryImages);
router11.put("/category-images", verifyToken, adminOnly, updateCategoryImages);
router11.post("/category-images/upload-image", verifyToken, adminOnly, upload.single("image"), uploadCategoryImage);
var settings_default = router11;

// src/routes/loyalty.ts
var import_express12 = require("express");
var import_express_validator15 = require("express-validator");

// src/controllers/loyaltyController.ts
var getLoyaltyProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "loyaltyPoints lifetimePointsEarned tier referralCode"
  );
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const referrals = await User.countDocuments({ referredBy: user._id });
  res.json({
    points: user.loyaltyPoints ?? 0,
    lifetimePointsEarned: user.lifetimePointsEarned ?? 0,
    tier: user.tier ?? getTierFromLifetimePoints(user.lifetimePointsEarned ?? 0),
    referralCode: user.referralCode,
    referrals,
    tiers: {
      bronze: { min: 0, benefits: "Earn 1 pt per \u20A8100 spent" },
      silver: { min: 500, benefits: "5% bonus points on orders" },
      gold: { min: 2e3, benefits: "10% bonus points + early sale access" }
    }
  });
};
var applyReferral = async (req, res) => {
  const { referralCode } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  if (user.referredBy) {
    res.status(400).json({ message: "Referral already applied" });
    return;
  }
  const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
  if (!referrer || referrer._id.toString() === user._id.toString()) {
    res.status(404).json({ message: "Invalid referral code" });
    return;
  }
  const hasOrder = await Order.exists({ user: user._id });
  if (hasOrder) {
    res.status(400).json({ message: "Referral only valid before first order" });
    return;
  }
  user.referredBy = referrer._id;
  await user.save();
  res.json({ message: "Referral applied! Bonus points on your first order." });
};
var getReferralStats = async (req, res) => {
  const user = await User.findById(req.user.id).select("referralCode loyaltyPoints");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const referredUsers = await User.find({ referredBy: user._id }).select("name email createdAt");
  res.json({ referralCode: user.referralCode, referredUsers, total: referredUsers.length });
};

// src/routes/loyalty.ts
var router12 = (0, import_express12.Router)();
router12.get("/profile", verifyToken, getLoyaltyProfile);
router12.get("/referrals", verifyToken, getReferralStats);
router12.post(
  "/referral",
  verifyToken,
  [(0, import_express_validator15.body)("referralCode").notEmpty().withMessage("Referral code is required")],
  applyReferral
);
var loyalty_default = router12;

// src/routes/analytics.ts
var import_express13 = require("express");

// src/models/AudienceVisit.ts
var import_mongoose17 = __toESM(require("mongoose"));
var audienceVisitSchema = new import_mongoose17.Schema(
  {
    userIp: { type: String, required: true, index: true },
    deviceIp: { type: String, required: true },
    country: { type: String, default: "Unknown", index: true },
    city: { type: String, default: "Unknown", index: true },
    region: { type: String, default: "" },
    timezone: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
    userAgent: { type: String, default: "" },
    deviceType: { type: String, default: "unknown", index: true },
    browser: { type: String, default: "" },
    os: { type: String, default: "" },
    path: { type: String, default: "/", index: true },
    referrer: { type: String, default: "" },
    referrerHost: { type: String, default: "direct", index: true },
    user: { type: import_mongoose17.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String, index: true },
    visitedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);
audienceVisitSchema.index({ visitedAt: -1 });
audienceVisitSchema.index({ country: 1, city: 1 });
var AudienceVisit = import_mongoose17.default.model("AudienceVisit", audienceVisitSchema);

// src/services/geoService.ts
var import_geoip_lite = __toESM(require("geoip-lite"));
var import_ua_parser_js = require("ua-parser-js");
var getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") return realIp;
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
};
var getDeviceIp = (req) => req.socket.remoteAddress?.replace("::ffff:", "") ?? "unknown";
var resolveGeoLocation = (ip) => {
  const cleanIp = ip.replace("::ffff:", "");
  if (cleanIp === "127.0.0.1" || cleanIp === "::1" || cleanIp === "unknown" || cleanIp.startsWith("192.168.") || cleanIp.startsWith("10.")) {
    return {
      country: "Local / Private",
      city: "Development",
      region: "Local",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: 0,
      longitude: 0
    };
  }
  const geo = import_geoip_lite.default.lookup(cleanIp);
  if (!geo) {
    return {
      country: "Unknown",
      city: "Unknown",
      region: "",
      timezone: ""
    };
  }
  return {
    country: geo.country ?? "Unknown",
    city: geo.city ?? "Unknown",
    region: geo.region ?? "",
    timezone: geo.timezone ?? "",
    latitude: geo.ll?.[0],
    longitude: geo.ll?.[1]
  };
};
var parseUserAgent = (userAgent) => {
  const parser = new import_ua_parser_js.UAParser(userAgent);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return {
    deviceType: device.type ?? "desktop",
    browser: [browser.name, browser.version].filter(Boolean).join(" ") || "Unknown",
    os: [os.name, os.version].filter(Boolean).join(" ") || "Unknown"
  };
};
var parseReferrerHost = (referrer) => {
  if (!referrer) return "direct";
  try {
    return new URL(referrer).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
};

// src/controllers/analyticsController.ts
var trackVisit = async (req, res) => {
  const { path: path3 = "/", referrer = "", sessionId } = req.body;
  try {
    if (isDbConnected()) {
      const userIp = getClientIp(req);
      const deviceIp = getDeviceIp(req);
      const userAgent = req.headers["user-agent"] ?? "";
      const geo = resolveGeoLocation(userIp);
      const device = parseUserAgent(userAgent);
      const referrerHost = parseReferrerHost(referrer);
      await AudienceVisit.create({
        userIp,
        deviceIp,
        ...geo,
        userAgent,
        ...device,
        path: path3,
        referrer,
        referrerHost,
        user: req.user?.id,
        sessionId,
        visitedAt: /* @__PURE__ */ new Date()
      });
    }
  } catch (err) {
    console.warn("[Analytics] track skipped:", err instanceof Error ? err.message : err);
  }
  res.status(201).json({ ok: true });
};
var getAudienceAnalytics = async (req, res) => {
  const days = Math.min(90, parseInt(req.query.days, 10) || 30);
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - days);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 25);
  const skip = (page - 1) * limit;
  const matchStage = { visitedAt: { $gte: since } };
  const [
    totalVisits,
    uniqueSessions,
    uniqueIps,
    byCountry,
    byCity,
    byReferrer,
    byDevice,
    byBrowser,
    dailyVisits,
    recentVisits
  ] = await Promise.all([
    AudienceVisit.countDocuments(matchStage),
    AudienceVisit.distinct("sessionId", matchStage),
    AudienceVisit.distinct("userIp", matchStage),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: "$country", count: { $sum: 1 }, cities: { $addToSet: "$city" } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { country: "$country", city: "$city" },
          count: { $sum: 1 },
          lat: { $first: "$latitude" },
          lng: { $first: "$longitude" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: "$referrerHost", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
          visits: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    AudienceVisit.find(matchStage).populate("user", "name email").sort({ visitedAt: -1 }).skip(skip).limit(limit)
  ]);
  res.json({
    summary: {
      totalVisits,
      uniqueSessions: uniqueSessions.filter(Boolean).length,
      uniqueIps: uniqueIps.length,
      days
    },
    byCountry: byCountry.map((c) => ({
      country: c._id,
      count: c.count,
      cityCount: c.cities?.length ?? 0
    })),
    byCity: byCity.map((c) => ({
      country: c._id.country,
      city: c._id.city,
      count: c.count,
      latitude: c.lat,
      longitude: c.lng
    })),
    byReferrer: byReferrer.map((r) => ({ source: r._id, count: r.count })),
    byDevice,
    byBrowser,
    dailyVisits,
    recentVisits,
    pagination: {
      page,
      limit,
      total: totalVisits,
      pages: Math.ceil(totalVisits / limit)
    }
  });
};
var getAllVisits = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, parseInt(req.query.limit, 10) || 50);
  const skip = (page - 1) * limit;
  const country = req.query.country;
  const filter = {};
  if (country) filter.country = country;
  const [visits, total] = await Promise.all([
    AudienceVisit.find(filter).populate("user", "name email").sort({ visitedAt: -1 }).skip(skip).limit(limit),
    AudienceVisit.countDocuments(filter)
  ]);
  res.json({
    visits,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};

// src/routes/analytics.ts
var router13 = (0, import_express13.Router)();
router13.post("/track", analyticsRateLimit, optionalAuth, trackVisit);
router13.get("/audience", verifyToken, adminOnly, getAudienceAnalytics);
router13.get("/visits", verifyToken, adminOnly, getAllVisits);
var analytics_default = router13;

// src/createApp.ts
import_dotenv.default.config();
import_dotenv.default.config({ path: import_path2.default.join(process.cwd(), "backend", ".env") });
var isProd3 = process.env.NODE_ENV === "production";
var createApp = (options = {}) => {
  const app2 = (0, import_express14.default)();
  app2.set("trust proxy", true);
  app2.use(
    (0, import_helmet.default)({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://*.clerk.com",
            "https://*.clerk.accounts.dev",
            process.env.CLIENT_URL ?? "http://localhost:3000"
          ],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          fontSrc: ["'self'", "https:", "data:"],
          connectSrc: ["'self'", "https:"],
          frameSrc: ["'self'", "https://*.clerk.com", "https://*.clerk.accounts.dev"],
          objectSrc: ["'none'"],
          ...isProd3 ? { upgradeInsecureRequests: [] } : {}
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );
  app2.use(
    (0, import_cors.default)({
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      credentials: true
    })
  );
  app2.use((0, import_compression.default)());
  app2.use(
    (0, import_pino_http.default)({
      logger: logger_default,
      // Skip health-check noise
      autoLogging: { ignore: (req) => req.url === "/api/health" },
      customLogLevel: (_req, res) => res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
      serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode })
      }
    })
  );
  app2.use(import_express14.default.json({ limit: "10mb" }));
  app2.use(import_express14.default.urlencoded({ extended: true }));
  app2.use(sanitizeInputs);
  app2.use(
    "/api/uploads/payment-proofs",
    import_express14.default.static(import_path2.default.join(process.cwd(), "uploads", "payment-proofs"))
  );
  app2.get("/api/health", (_req, res) => {
    const dbConnected = isDbConnected();
    const mongoConfigured = isMongoConfigured();
    res.status(200).json({
      status: dbConnected ? "ok" : "degraded",
      db: dbConnected ? "connected" : "disconnected",
      mongodbConfigured: mongoConfigured,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      message: dbConnected ? "API is ready" : mongoConfigured ? "Database not connected \u2014 check MongoDB Atlas Network Access (allow 0.0.0.0/0)" : "MONGODB_URI is missing \u2014 add it in Hostinger Environment variables"
    });
  });
  app2.get("/api/ready", (_req, res) => {
    const fs2 = require("fs");
    const path3 = require("path");
    const nextBuild = path3.join(process.cwd(), "frontend", ".next", "BUILD_ID");
    const hasBuild = fs2.existsSync(nextBuild);
    res.status(hasBuild ? 200 : 503).json({
      ready: hasBuild,
      frontendBuild: hasBuild ? "present" : "missing \u2014 run npm run build on Hostinger",
      cwd: process.cwd()
    });
  });
  app2.use("/api", globalApiRateLimit);
  app2.use("/api", (req, res, next) => {
    if (req.path === "/health") return next();
    if (req.path === "/ready") return next();
    if (req.path === "/settings/public") return next();
    if (req.path === "/settings/hero-slides" && req.method === "GET") return next();
    if (req.path === "/settings/category-images" && req.method === "GET") return next();
    if (req.path === "/promotions/active" && req.method === "GET") return next();
    if (req.path === "/payments/bank-details" && req.method === "GET") return next();
    if (req.path === "/analytics/track" && req.method === "POST") return next();
    return requireDb(req, res, next);
  });
  app2.use("/api/auth", auth_default);
  app2.use("/api/products", products_default);
  app2.use("/api/orders", orders_default);
  app2.use("/api/users", users_default);
  app2.use("/api/categories", categories_default);
  app2.use("/api/payments", payments_default);
  app2.use("/api/cart", cart_default);
  app2.use("/api/search", search_default);
  app2.use("/api/coupons", coupons_default);
  app2.use("/api/promotions", promotions_default);
  app2.use("/api/settings", settings_default);
  app2.use("/api/loyalty", loyalty_default);
  app2.use("/api/analytics", analytics_default);
  if (options.catchAll !== false) {
    app2.use(notFound);
  }
  app2.use(errorHandler);
  return app2;
};

// src/services/ensureSeedData.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var ensureSeedData = async () => {
  const productCount = await Product.countDocuments();
  if (productCount > 0) return;
  console.log("[Seed] Empty catalog detected \u2014 loading sample products...");
  const { email, password } = getAdminCredentials();
  const existingAdmin = await User.findOne({ email });
  if (!existingAdmin) {
    const hashedPassword = await import_bcryptjs2.default.hash(password, 10);
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

// src/index.ts
var app = createApp();
var PORT = process.env.PORT ?? 5e3;
app.listen(PORT, () => {
  logger_default.info({ port: PORT }, `Server running on port ${PORT}`);
  logger_default.debug(`Health check: http://localhost:${PORT}/api/health`);
  startBackendServices().catch((err) => logger_default.error(err, "Background services failed to start"));
});
var index_default = app;
//# sourceMappingURL=index.js.map
