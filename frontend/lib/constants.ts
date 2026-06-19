export const APP_NAME = 'VexironAthletics';

/** E.164 without + — e.g. 923001234567 for Pakistan */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '923001234567';

export const WHATSAPP_DEFAULT_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
  'Hello VexironAthletics! I need help with my order.';

export const WHATSAPP_CHAT_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

export const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? '+92 300 1234567';
export const PHONE_CALL_URL = `tel:+${WHATSAPP_NUMBER}`;

export const CONTACT_PROMO_MESSAGES = [
  {
    id: 'help',
    title: 'Need Help?',
    text: 'Stuck on size, delivery, or your order? Message us — we reply in minutes on WhatsApp.',
    cta: 'Get Help Now',
    accent: 'help',
  },
  {
    id: 'online',
    title: 'We\'re Online Now!',
    text: 'Our team is live and ready to assist you. Tap below to start a chat instantly.',
    cta: 'Chat With Us',
    accent: 'online',
  },
  {
    id: 'discount',
    title: '🔥 Exclusive Discount Today',
    text: 'Get 10% off your first order! Message us on WhatsApp and claim code WELCOME10.',
    cta: 'Claim Offer',
    accent: 'discount',
  },
  {
    id: 'shipping',
    title: '🚚 Free Shipping Alert',
    text: 'Orders above ₨5,000 ship free nationwide. Ask us anything before you checkout.',
    cta: 'Ask on WhatsApp',
    accent: 'discount',
  },
  {
    id: 'vip',
    title: '🏆 VIP Shopping Help',
    text: 'Personal style advice, bulk orders, and fast support — one tap away on WhatsApp.',
    cta: 'Message VIP Support',
    accent: 'online',
  },
] as const;

/** Show WhatsApp promo after user scrolls past hero (~1 viewport) */
export const WHATSAPP_SCROLL_THRESHOLD_PX = 480;

/** Delay before first auto-popup (1 minute) */
export const WHATSAPP_INITIAL_DELAY_MS = 60_000;

/** Re-show popup this long after dismiss */
export const WHATSAPP_REOPEN_DELAY_MS = 60_000;

/** Rotate promo messages in the popup */
export const WHATSAPP_MESSAGE_ROTATE_MS = 8_000;

/** Teaser pill next to floating button (faster cycle) */
export const WHATSAPP_TEASER_ROTATE_MS = 4_000;

export const WHATSAPP_TEASER_LINES = [
  'Need help?',
  'We\'re online!',
  '10% off today',
  'Chat on WhatsApp',
] as const;

export const getWhatsAppUrl = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message ?? WHATSAPP_DEFAULT_MESSAGE)}`;

export const ADMIN_DEMO_CREDENTIALS = {
  email: 'admin@vexironathletics.com',
  password: 'Admin@123',
} as const;

export const getDashboardPath = (role?: 'user' | 'admin'): string =>
  role === 'admin' ? '/dashboard/admin' : '/dashboard/user/profile';

/** Show low-stock warnings in admin when stock is at or below this value */
export const LOW_STOCK_THRESHOLD = 10;

export const isLowStock = (stock: number): boolean =>
  stock <= LOW_STOCK_THRESHOLD;

/** Max units per cart line — must match backend MAX_QTY_PER_LINE */
export const MAX_QTY_PER_LINE = 10;

export const MAX_ORDER_LINE_ITEMS = 20;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS =
  'Password must be at least 8 characters and include at least one letter and one number';

export const RECENTLY_VIEWED_KEY = 'recently_viewed';
export const RECENTLY_VIEWED_MAX = 8;
