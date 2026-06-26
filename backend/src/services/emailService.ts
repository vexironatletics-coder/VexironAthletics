import nodemailer from 'nodemailer';
import { formatShippingPhones } from '../utils/shippingAddress';
import { formatPaymentMethodLabel } from '../config/bankTransfer';

// ─── Transporter ─────────────────────────────────────────────────────────────

const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
};

const FROM = process.env.SMTP_FROM ?? `VexironAthletics <contact@vexironathletics.com>`;

// ─── Shared Brand Template ────────────────────────────────────────────────────

function brandEmail(body: string): string {
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
                Premium Clothing — Pakistan
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #e8ecf0;border-right:1px solid #e8ecf0;">
              ${body}
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
                <span style="color:rgba(255,255,255,0.3);">·</span>
                <a href="https://www.instagram.com/vexironathletics/" style="display:inline-block;margin:0 6px;color:#F3E4C9;text-decoration:none;font-size:12px;">Instagram</a>
                <span style="color:rgba(255,255,255,0.3);">·</span>
                <a href="https://www.tiktok.com/@vexironathletics" style="display:inline-block;margin:0 6px;color:#F3E4C9;text-decoration:none;font-size:12px;">TikTok</a>
              </div>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">
                © 2026 VexironAthletics · Lahore, Pakistan · All rights reserved
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

// ─── Password Reset ───────────────────────────────────────────────────────────

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<{ sent: boolean; resetUrl?: string }> => {
  const transporter = getTransporter();

  if (!transporter) {
    console.info(`[Password Reset] No SMTP configured — reset link for ${email}: ${resetUrl}`);
    return { sent: false, resetUrl };
  }

  const body = `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#EFF6FF;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">🔐</div>
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
        ⏱ <strong>This link expires in 1 hour.</strong><br/>
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
    subject: '🔐 Reset your VexironAthletics password',
    html: brandEmail(body),
  });

  return { sent: true };
};

// ─── Order Confirmation ───────────────────────────────────────────────────────

interface OrderEmailItem {
  name: string;
  qty: number;
  size: string;
  color: string;
  price: number;
}

export const sendOrderConfirmationEmail = async (
  email: string,
  customerName: string,
  orderId: string,
  items: OrderEmailItem[],
  total: number,
  shippingAddress: {
    name: string;
    phones?: string[];
    phone?: string;
    landmark?: string;
    street: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  },
  paymentMethod: string
): Promise<{ sent: boolean }> => {
  const transporter = getTransporter();
  const shortId = orderId.slice(-8).toUpperCase();

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">
            ${item.name}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;white-space:nowrap;">
            ${item.size} · ${item.color}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:center;color:#111827;">
            ${item.qty}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:right;color:#111827;font-weight:600;">
            ₨${(item.price * item.qty).toLocaleString()}
          </td>
        </tr>`
    )
    .join('');

  const body = `
    <!-- Greeting -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#F0FDF4;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">✅</div>
    </div>

    <h2 style="margin:0 0 6px;color:#0A2947;font-size:24px;font-weight:700;text-align:center;">
      Order Confirmed!
    </h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;text-align:center;">
      Hi <strong>${customerName}</strong>, thank you for shopping with VexironAthletics! 🎉
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
          <td style="padding:14px 8px;font-size:16px;font-weight:800;color:#0A2947;text-align:right;">₨${total.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Shipping info -->
    <div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0A2947;text-transform:uppercase;letter-spacing:0.5px;">📦 Shipping To</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
        <strong>${shippingAddress.name}</strong><br/>
        ${shippingAddress.landmark ? `Near: ${shippingAddress.landmark}<br/>` : ''}
        ${shippingAddress.street}<br/>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal}<br/>
        ${shippingAddress.country}<br/>
        📞 ${formatShippingPhones(shippingAddress)}
      </p>
      <p style="margin:12px 0 0;color:#374151;font-size:14px;">
        💳 <strong>Payment:</strong> ${formatPaymentMethodLabel(paymentMethod)}
      </p>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
      We'll send you another email when your order ships.<br/>
      Questions? Just reply to this email — we're happy to help!
    </p>
  `;

  if (!transporter) {
    console.info(`[Order Confirmation] Order #${shortId} for ${email} — ₨${total}`);
    return { sent: false };
  }

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `✅ Order confirmed — #${shortId} | VexironAthletics`,
    html: brandEmail(body),
  });

  return { sent: true };
};

// ─── Order Status Update ──────────────────────────────────────────────────────

const statusConfig: Record<string, { emoji: string; label: string; color: string; bg: string; message: string }> = {
  processing: {
    emoji: '⚙️',
    label: 'Processing',
    color: '#92400E',
    bg: '#FFF8F0',
    message: "Great news! We've received your order and are preparing it for shipment. Hang tight!",
  },
  shipped: {
    emoji: '🚚',
    label: 'Shipped',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    message: "Your order is on its way! Expect delivery within the next few days.",
  },
  delivered: {
    emoji: '🎉',
    label: 'Delivered',
    color: '#065F46',
    bg: '#F0FDF4',
    message: "Your order has arrived! We hope you love your new VexironAthletics purchase.",
  },
  cancelled: {
    emoji: '❌',
    label: 'Cancelled',
    color: '#991B1B',
    bg: '#FFF1F2',
    message: "Your order has been cancelled. If you didn't request this, please contact us immediately.",
  },
};

export const sendOrderStatusUpdateEmail = async (
  email: string,
  customerName: string,
  orderId: string,
  status: string
): Promise<{ sent: boolean }> => {
  const transporter = getTransporter();
  const shortId = orderId.slice(-8).toUpperCase();
  const cfg = statusConfig[status] ?? {
    emoji: '📋',
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: '#374151',
    bg: '#f9fafb',
    message: `Your order status has been updated to: ${status}.`,
  };

  const body = `
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
      We're available Mon–Sat, 9 AM – 6 PM PKT.
    </p>
  `;

  if (!transporter) {
    console.info(`[Order Status] #${shortId} → ${status} for ${email}`);
    return { sent: false };
  }

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${cfg.emoji} Order #${shortId} — ${cfg.label} | VexironAthletics`,
    html: brandEmail(body),
  });

  return { sent: true };
};
