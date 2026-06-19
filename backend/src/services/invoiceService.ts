import puppeteer from 'puppeteer';
import { IOrder } from '../models/Order';
import { APP_NAME } from '../utils/constants';
import { formatShippingPhones } from '../utils/shippingAddress';

const formatPrice = (n: number) => `₨${n.toLocaleString('en-PK')}`;

const buildInvoiceHtml = (order: IOrder, customerName: string, customerEmail: string): string => {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}<br/><small>${item.size} / ${item.color}</small></td>
        <td>${item.qty}</td>
        <td>${formatPrice(item.price)}</td>
        <td>${formatPrice(item.price * item.qty)}</td>
      </tr>`
    )
    .join('');

  const discountRow = order.couponDiscount
    ? `<tr><td colspan="3">Coupon (${order.couponCode})</td><td>-${formatPrice(order.couponDiscount)}</td></tr>`
    : '';
  const pointsRow = order.loyaltyPointsRedeemed
    ? `<tr><td colspan="3">Loyalty points redeemed</td><td>-${formatPrice(order.loyaltyPointsRedeemed)}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; color: #171717; padding: 40px; }
  h1 { margin: 0 0 4px; font-size: 28px; }
  .meta { color: #71717a; font-size: 13px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th, td { border-bottom: 1px solid #e4e4e7; padding: 10px 8px; text-align: left; font-size: 13px; }
  th { background: #fafafa; }
  .totals { margin-top: 24px; width: 280px; margin-left: auto; }
  .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .total { font-weight: bold; font-size: 16px; border-top: 2px solid #171717; padding-top: 10px; }
  .address { margin-top: 24px; font-size: 13px; line-height: 1.6; }
</style></head><body>
  <h1>${APP_NAME}</h1>
  <div class="meta">Invoice #${order._id.toString().slice(-8).toUpperCase()} · ${new Date(order.createdAt).toLocaleDateString()}</div>
  <p><strong>Bill To:</strong> ${customerName}<br/>${customerEmail}</p>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
    ${discountRow}${pointsRow}
    <div><span>Shipping</span><span>${order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span></div>
    <div class="total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
  </div>
  <div class="address">
    <strong>Ship To:</strong><br/>
    ${order.shippingAddress.name}<br/>
    ${order.shippingAddress.landmark ? `Near: ${order.shippingAddress.landmark}<br/>` : ''}
    ${order.shippingAddress.street}, ${order.shippingAddress.city}<br/>
    ${order.shippingAddress.state} ${order.shippingAddress.postal}, ${order.shippingAddress.country}<br/>
    ${formatShippingPhones(order.shippingAddress)}
  </div>
  <p style="margin-top:40px;font-size:12px;color:#71717a;">Payment: ${order.paymentMethod.toUpperCase()} · Status: ${order.status}</p>
</body></html>`;
};

const renderPdf = async (
  html: string,
  options?: { landscape?: boolean; format?: 'A4' }
): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({
      format: options?.format ?? 'A4',
      landscape: options?.landscape ?? false,
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};

const buildDispatchReceiptHtml = (
  order: IOrder,
  customerName: string,
  customerEmail: string
): string => {
  const orderRef = order._id.toString().slice(-8).toUpperCase();
  const dispatchDate = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const itemRows = order.items
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${item.name}</strong><br/><small>${item.size} · ${item.color}</small></td>
        <td style="text-align:center;font-size:18px;font-weight:bold;">${item.qty}</td>
        <td>${formatPrice(item.price * item.qty)}</td>
      </tr>`
    )
    .join('');
  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #171717; padding: 32px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #18181b; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: bold; }
  .doc-title { font-size: 26px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #f97316; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .box { border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px; background: #fafafa; }
  .box h3 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; }
  .ship-to { font-size: 15px; line-height: 1.7; }
  .ship-to strong { font-size: 18px; display: block; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #e4e4e7; padding: 10px 8px; text-align: left; vertical-align: top; }
  th { background: #f4f4f5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  .summary { margin-top: 20px; display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
  .cod-box { border: 2px dashed #f97316; border-radius: 8px; padding: 16px; background: #fff7ed; text-align: center; }
  .cod-box .amount { font-size: 28px; font-weight: bold; color: #ea580c; margin-top: 8px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #71717a; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #18181b; color: #fff; font-size: 11px; font-weight: bold; text-transform: uppercase; }
</style></head><body>
  <div class="header">
    <div>
      <div class="brand">${APP_NAME}</div>
      <div style="color:#71717a;margin-top:4px;">Dispatch &amp; delivery receipt</div>
    </div>
    <div style="text-align:right;">
      <div class="doc-title">Dispatch Receipt</div>
      <div style="margin-top:8px;font-family:monospace;font-size:16px;">#${orderRef}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="box">
      <h3>Order details</h3>
      <div><strong>Order date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
      <div><strong>Dispatch date:</strong> ${dispatchDate}</div>
      <div><strong>Status:</strong> <span class="badge">${order.status}</span></div>
      <div><strong>Payment:</strong> Cash on Delivery</div>
    </div>
    <div class="box">
      <h3>Customer</h3>
      <div><strong>${customerName}</strong></div>
      <div>${customerEmail}</div>
      <div style="margin-top:6px;"><strong>Phone:</strong> ${formatShippingPhones(order.shippingAddress)}</div>
    </div>
  </div>

  <div class="box" style="background:#fff;border-width:2px;">
    <h3>Ship to — attach to parcel</h3>
    <div class="ship-to">
      <strong>${order.shippingAddress.name}</strong>
      ${order.shippingAddress.landmark ? `Near: ${order.shippingAddress.landmark}<br/>` : ''}
      ${order.shippingAddress.street}<br/>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal}<br/>
      ${order.shippingAddress.country}<br/>
      <strong>Mobile:</strong> ${formatShippingPhones(order.shippingAddress)}
    </div>
  </div>

  <h3 style="margin:24px 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#71717a;">Items to dispatch (${totalQty} units)</h3>
  <table>
    <thead>
      <tr>
        <th style="width:36px">#</th>
        <th>Product</th>
        <th style="width:70px;text-align:center;">Qty</th>
        <th style="width:100px;">Line total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="summary">
    <div>
      ${order.notes ? `<div class="box"><h3>Order notes</h3><p style="margin:0;">${order.notes}</p></div>` : '<div class="box"><h3>Packing checklist</h3><p style="margin:0;">☐ Verify items &amp; quantities &nbsp; ☐ Seal package &nbsp; ☐ Attach this receipt</p></div>'}
    </div>
    <div>
      <div class="cod-box">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9a3412;">Amount to collect (COD)</div>
        <div class="amount">${formatPrice(order.total)}</div>
        ${order.shippingFee === 0 ? '<div style="font-size:11px;color:#71717a;margin-top:4px;">Includes free shipping</div>' : `<div style="font-size:11px;color:#71717a;margin-top:4px;">Shipping: ${formatPrice(order.shippingFee)}</div>`}
      </div>
      <div style="margin-top:12px;font-size:12px;line-height:1.6;">
        <div>Subtotal: ${formatPrice(order.subtotal)}</div>
        ${order.couponDiscount ? `<div>Coupon (${order.couponCode}): -${formatPrice(order.couponDiscount)}</div>` : ''}
        ${order.loyaltyPointsRedeemed ? `<div>Points redeemed: -${formatPrice(order.loyaltyPointsRedeemed)}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="footer">
    Generated for dispatch by ${APP_NAME} admin · Order #${orderRef} · This receipt is for internal dispatch and courier handoff.
  </div>
</body></html>`;
};

export const generateInvoicePdf = async (
  order: IOrder,
  customerName: string,
  customerEmail: string
): Promise<Buffer> => {
  const html = buildInvoiceHtml(order, customerName, customerEmail);
  return renderPdf(html);
};

export const generateDispatchReceiptPdf = async (
  order: IOrder,
  customerName: string,
  customerEmail: string
): Promise<Buffer> => {
  const html = buildDispatchReceiptHtml(order, customerName, customerEmail);
  return renderPdf(html);
};

export const generateOrdersReportPdf = async (
  orders: IOrder[],
  title: string
): Promise<Buffer> => {
  const rows = orders
    .map(
      (o) =>
        `<tr><td>${o._id.toString().slice(-8)}</td><td>${new Date(o.createdAt).toLocaleDateString()}</td><td>${o.status}</td><td>${formatPrice(o.total)}</td></tr>`
    )
    .join('');
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  const html = `<!DOCTYPE html><html><head><style>
    body{font-family:Arial,sans-serif;padding:40px} table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{border-bottom:1px solid #e4e4e7;padding:8px;text-align:left;font-size:13px}
    th{background:#fafafa}
  </style></head><body>
    <h1>${APP_NAME} — ${title}</h1>
    <p>Orders: ${orders.length} · Revenue: ${formatPrice(totalRevenue)}</p>
    <table><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({ format: 'A4', landscape: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};
