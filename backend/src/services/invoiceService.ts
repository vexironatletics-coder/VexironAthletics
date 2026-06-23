import PDFDocument from 'pdfkit';
import { IOrder } from '../models/Order';
import { APP_NAME } from '../utils/constants';
import { formatShippingPhones } from '../utils/shippingAddress';
import { formatPaymentMethodLabel } from '../config/bankTransfer';

const formatPrice = (n: number) => `Rs ${n.toLocaleString('en-PK')}`;

const NAVY   = '#0A2947';
const CREAM  = '#F3E4C9';
const BROWN  = '#8B5E3C';
const GRAY   = '#71717a';
const LIGHT  = '#f4f4f5';
const BLACK  = '#171717';
const RED    = '#dc2626';

/** Resolve a PDFKit Buffer from a stream */
const streamToBuffer = (doc: PDFKit.PDFDocument): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });

/** Horizontal rule helper */
const hr = (doc: PDFKit.PDFDocument, y: number, color = '#e4e4e7') => {
  doc.save().strokeColor(color).lineWidth(0.5).moveTo(40, y).lineTo(555, y).stroke().restore();
};

// ─── INVOICE ─────────────────────────────────────────────────────────────────

export const generateInvoicePdf = async (
  order: IOrder,
  customerName: string,
  customerEmail: string
): Promise<Buffer> => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Header band
  doc.rect(0, 0, doc.page.width, 70).fill(NAVY);
  doc.fillColor(CREAM).fontSize(22).font('Helvetica-Bold').text(APP_NAME, 40, 20);
  doc.fillColor(CREAM).fontSize(10).font('Helvetica').text('Invoice', 40, 46);

  // Invoice meta
  const orderRef = order._id.toString().slice(-8).toUpperCase();
  doc
    .fillColor(BLACK)
    .fontSize(10)
    .font('Helvetica')
    .text(`Invoice #${orderRef}`, 40, 85)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 40, 100)
    .text(`Status: ${order.status}`, 40, 115);

  // Bill / ship to
  doc
    .fillColor(NAVY)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('BILL TO', 350, 85)
    .fillColor(BLACK)
    .font('Helvetica')
    .text(customerName, 350, 98)
    .text(customerEmail, 350, 111)
    .text(
      `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
      350, 124
    );

  hr(doc, 142);

  // Table header
  doc
    .rect(40, 148, 515, 20)
    .fill(LIGHT);

  const cols = [40, 260, 330, 420, 480];
  doc
    .fillColor(NAVY)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('ITEM', cols[0], 153)
    .text('SIZE / COLOR', cols[1], 153)
    .text('QTY', cols[2], 153)
    .text('UNIT', cols[3], 153)
    .text('TOTAL', cols[4], 153);

  let y = 175;
  order.items.forEach((item, idx) => {
    if (idx % 2 === 1) doc.rect(40, y - 4, 515, 20).fill('#fafafa');
    doc
      .fillColor(BLACK)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(item.name, cols[0], y, { width: 215, ellipsis: true });
    doc
      .font('Helvetica')
      .text(`${item.size} / ${item.color}`, cols[1], y, { width: 65 })
      .text(String(item.qty), cols[2], y)
      .text(formatPrice(item.price), cols[3], y)
      .text(formatPrice(item.price * item.qty), cols[4], y);
    y += 22;
  });

  hr(doc, y + 4);

  // Totals
  y += 14;
  const totalsX = 380;
  const valueX = 480;

  const totalsLine = (label: string, value: string, bold = false, color = BLACK) => {
    doc
      .fillColor(color)
      .fontSize(9)
      .font(bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(label, totalsX, y)
      .text(value, valueX, y);
    y += 16;
  };

  totalsLine('Subtotal', formatPrice(order.subtotal));
  if (order.couponDiscount)
    totalsLine(`Coupon (${order.couponCode})`, `-${formatPrice(order.couponDiscount)}`, false, RED);
  if (order.loyaltyPointsRedeemed)
    totalsLine('Loyalty points', `-${formatPrice(order.loyaltyPointsRedeemed)}`, false, RED);
  totalsLine('Shipping', order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee));

  hr(doc, y + 2, NAVY);
  y += 8;
  totalsLine('TOTAL', formatPrice(order.total), true, NAVY);

  // Payment info
  y += 10;
  doc
    .fillColor(GRAY)
    .fontSize(8)
    .font('Helvetica')
    .text(`Payment method: ${formatPaymentMethodLabel(order.paymentMethod)}`, 40, y);

  // Footer
  const footerY = doc.page.height - 40;
  hr(doc, footerY - 8);
  doc
    .fillColor(GRAY)
    .fontSize(8)
    .text(`Thank you for shopping at ${APP_NAME}`, 40, footerY, { align: 'center', width: 515 });

  return streamToBuffer(doc);
};

// ─── DISPATCH RECEIPT ─────────────────────────────────────────────────────────

export const generateDispatchReceiptPdf = async (
  order: IOrder,
  customerName: string,
  customerEmail: string
): Promise<Buffer> => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const orderRef = order._id.toString().slice(-8).toUpperCase();

  // Header
  doc.rect(0, 0, doc.page.width, 70).fill(NAVY);
  doc.fillColor(CREAM).fontSize(22).font('Helvetica-Bold').text(APP_NAME, 40, 18);
  doc.fillColor(CREAM).fontSize(10).font('Helvetica').text('Dispatch Receipt', 40, 44);
  doc.fillColor(BROWN).fontSize(14).font('Helvetica-Bold').text(`#${orderRef}`, 430, 26);

  // Ship-to box
  doc.rect(40, 80, 515, 90).fill('#f0f4f8').stroke(NAVY);
  doc
    .fillColor(NAVY)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('SHIP TO — ATTACH TO PARCEL', 52, 88);
  doc
    .fillColor(BLACK)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(order.shippingAddress.name, 52, 102);
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      [
        order.shippingAddress.landmark ? `Near: ${order.shippingAddress.landmark}` : '',
        order.shippingAddress.street,
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal}`,
        order.shippingAddress.country,
        `Mobile: ${formatShippingPhones(order.shippingAddress)}`,
      ]
        .filter(Boolean)
        .join('\n'),
      52,
      120,
      { width: 490 }
    );

  // Order meta row
  let y = 185;
  doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold').text('ORDER DATE', 40, y);
  doc.fillColor(GRAY).text('DISPATCH DATE', 170, y);
  doc.fillColor(GRAY).text('PAYMENT', 310, y);
  doc.fillColor(GRAY).text('CUSTOMER', 440, y);

  y += 12;
  doc
    .fillColor(BLACK)
    .fontSize(9)
    .font('Helvetica')
    .text(new Date(order.createdAt).toLocaleDateString(), 40, y)
    .text(new Date().toLocaleDateString(), 170, y)
    .text(
      order.paymentMethod === 'bank' ? 'Bank Transfer (Prepaid)' : 'Cash on Delivery',
      310, y, { width: 125 }
    )
    .text(customerName, 440, y, { width: 115, ellipsis: true });

  y += 24;
  hr(doc, y);

  // Items table header
  y += 8;
  doc.rect(40, y, 515, 20).fill(NAVY);
  doc
    .fillColor(CREAM)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('#', 48, y + 6)
    .text('PRODUCT', 68, y + 6)
    .text('SIZE / COLOR', 290, y + 6)
    .text('QTY', 400, y + 6)
    .text('LINE TOTAL', 455, y + 6);

  y += 24;
  order.items.forEach((item, idx) => {
    if (idx % 2 === 0) doc.rect(40, y - 4, 515, 20).fill(LIGHT);
    doc
      .fillColor(BLACK)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(String(idx + 1), 48, y)
      .text(item.name, 68, y, { width: 218, ellipsis: true });
    doc
      .font('Helvetica')
      .text(`${item.size} · ${item.color}`, 290, y, { width: 105 })
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .text(String(item.qty), 400, y)
      .fillColor(BLACK)
      .font('Helvetica')
      .text(formatPrice(item.price * item.qty), 455, y);
    y += 22;
  });

  hr(doc, y + 4);

  // COD amount box
  y += 16;
  doc.rect(350, y, 205, 70).fill('#fff7ed').stroke(BROWN);
  doc
    .fillColor(BROWN)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(
      order.paymentMethod === 'bank' ? 'PREPAID — DO NOT COLLECT' : 'AMOUNT TO COLLECT (COD)',
      358, y + 8,
      { width: 190, align: 'center' }
    );
  doc
    .fillColor(NAVY)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(formatPrice(order.total), 358, y + 24, { width: 190, align: 'center' });

  // Checklist
  doc
    .fillColor(BLACK)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Packing checklist:', 40, y + 8);
  ['Verify items & quantities', 'Seal package securely', 'Attach this receipt to parcel'].forEach(
    (item, i) => {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(BLACK)
        .text(`☐  ${item}`, 40, y + 24 + i * 16);
    }
  );

  // Footer
  const footerY = doc.page.height - 40;
  hr(doc, footerY - 8);
  doc
    .fillColor(GRAY)
    .fontSize(8)
    .text(
      `${APP_NAME} · Dispatch document for Order #${orderRef} · Internal use only`,
      40, footerY,
      { align: 'center', width: 515 }
    );

  return streamToBuffer(doc);
};

// ─── ORDERS REPORT ────────────────────────────────────────────────────────────

export const generateOrdersReportPdf = async (
  orders: IOrder[],
  title: string
): Promise<Buffer> => {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

  // Header
  doc.rect(0, 0, doc.page.width, 60).fill(NAVY);
  doc.fillColor(CREAM).fontSize(20).font('Helvetica-Bold').text(`${APP_NAME} — ${title}`, 40, 16);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  doc
    .fillColor(CREAM)
    .fontSize(9)
    .font('Helvetica')
    .text(`${orders.length} orders · Revenue: ${formatPrice(totalRevenue)}`, 40, 42);

  // Table header
  let y = 76;
  doc.rect(40, y, doc.page.width - 80, 20).fill(LIGHT);
  const cols = [40, 130, 250, 350, 470, 570];
  doc
    .fillColor(NAVY)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('ORDER ID', cols[0], y + 6)
    .text('DATE', cols[1], y + 6)
    .text('CUSTOMER', cols[2], y + 6)
    .text('STATUS', cols[3], y + 6)
    .text('PAYMENT', cols[4], y + 6)
    .text('TOTAL', cols[5], y + 6);

  y += 24;
  orders.forEach((o, idx) => {
    if (idx % 2 === 1) doc.rect(40, y - 4, doc.page.width - 80, 18).fill('#fafafa');
    doc
      .fillColor(BLACK)
      .fontSize(8)
      .font('Helvetica')
      .text(o._id.toString().slice(-8).toUpperCase(), cols[0], y, { width: 85 })
      .text(new Date(o.createdAt).toLocaleDateString(), cols[1], y, { width: 115 })
      .text('—', cols[2], y, { width: 95 })
      .text(o.status, cols[3], y, { width: 115 })
      .text(o.paymentMethod === 'bank' ? 'Bank' : 'COD', cols[4], y, { width: 95 })
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .text(formatPrice(o.total), cols[5], y, { width: 95 });
    y += 18;

    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }
  });

  const footerY = doc.page.height - 30;
  hr(doc, footerY - 8);
  doc
    .fillColor(GRAY)
    .fontSize(8)
    .text(`Generated by ${APP_NAME} · ${new Date().toLocaleString()}`, 40, footerY, {
      align: 'center',
      width: doc.page.width - 80,
    });

  return streamToBuffer(doc);
};
