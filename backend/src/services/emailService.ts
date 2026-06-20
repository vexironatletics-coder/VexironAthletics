import nodemailer from 'nodemailer';
import { formatShippingPhones } from '../utils/shippingAddress';
import { formatPaymentMethodLabel } from '../config/bankTransfer';

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<{ sent: boolean; resetUrl?: string }> => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? 'noreply@vexironathletics.com';

  if (!transporter) {
    console.info(`[Password Reset] Reset link for ${email}: ${resetUrl}`);
    return { sent: false, resetUrl };
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Reset your VexironAthletics password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the button below to choose a new password.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#71717a;font-size:14px;">
          This link expires in 1 hour. If you did not request this, you can ignore this email.
        </p>
      </div>
    `,
  });

  return { sent: true };
};

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
  const from = process.env.SMTP_FROM ?? 'noreply@vexironathletics.com';
  const shortId = orderId.slice(-8).toUpperCase();

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">${item.size} / ${item.color}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:center;">${item.qty}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">₨${(item.price * item.qty).toLocaleString()}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#171717;">
      <h2 style="margin:0 0 8px;">Order Confirmed!</h2>
      <p style="color:#71717a;margin:0 0 24px;">Hi ${customerName}, thank you for shopping with VexironAthletics.</p>
      <p style="background:#f4f4f5;padding:12px 16px;border-radius:8px;font-weight:600;">
        Order #${shortId}
      </p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
        <thead>
          <tr style="text-align:left;color:#71717a;font-size:12px;text-transform:uppercase;">
            <th style="padding-bottom:8px;">Item</th>
            <th style="padding-bottom:8px;">Variant</th>
            <th style="padding-bottom:8px;text-align:center;">Qty</th>
            <th style="padding-bottom:8px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="font-size:18px;font-weight:700;text-align:right;">Total: ₨${total.toLocaleString()}</p>
      <div style="margin-top:24px;padding:16px;background:#fafafa;border-radius:8px;font-size:14px;">
        <p style="margin:0 0 8px;font-weight:600;">Shipping to</p>
        <p style="margin:0;color:#71717a;line-height:1.6;">
          ${shippingAddress.name}<br/>
          ${shippingAddress.landmark ? `Near: ${shippingAddress.landmark}<br/>` : ''}
          ${shippingAddress.street}<br/>
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal}<br/>
          ${shippingAddress.country}<br/>
          Mobile: ${formatShippingPhones(shippingAddress)}
        </p>
        <p style="margin:16px 0 0;font-weight:600;">Payment: ${formatPaymentMethodLabel(paymentMethod)}</p>
      </div>
      <p style="margin-top:24px;color:#71717a;font-size:13px;">
        We'll notify you when your order ships. Questions? Reply to this email or contact support.
      </p>
    </div>
  `;

  if (!transporter) {
    console.info(`[Order Confirmation] Order #${shortId} for ${email} — total ₨${total}`);
    return { sent: false };
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: `Order confirmed — #${shortId} | VexironAthletics`,
    html,
  });

  return { sent: true };
};

const statusLabels: Record<string, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const sendOrderStatusUpdateEmail = async (
  email: string,
  customerName: string,
  orderId: string,
  status: string
): Promise<{ sent: boolean }> => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? 'noreply@vexironathletics.com';
  const shortId = orderId.slice(-8).toUpperCase();
  const label = statusLabels[status] ?? status;

  const statusMessages: Record<string, string> = {
    processing: 'We are preparing your order for shipment.',
    shipped: 'Your order is on its way! Track your delivery and expect it soon.',
    delivered: 'Your order has been delivered. We hope you love your purchase!',
    cancelled: 'Your order has been cancelled. If you did not request this, please contact support.',
  };

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#171717;">
      <h2 style="margin:0 0 8px;">Order Update</h2>
      <p style="color:#71717a;margin:0 0 24px;">Hi ${customerName},</p>
      <p style="background:#f4f4f5;padding:12px 16px;border-radius:8px;font-weight:600;">
        Order #${shortId} — ${label}
      </p>
      <p style="margin:24px 0;color:#52525b;line-height:1.6;">
        ${statusMessages[status] ?? `Your order status is now: ${label}.`}
      </p>
      <p style="color:#71717a;font-size:13px;">
        Questions? Reply to this email or contact our support team.
      </p>
    </div>
  `;

  if (!transporter) {
    console.info(`[Order Status] Order #${shortId} → ${status} for ${email}`);
    return { sent: false };
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: `Order #${shortId} — ${label} | VexironAthletics`,
    html,
  });

  return { sent: true };
};
