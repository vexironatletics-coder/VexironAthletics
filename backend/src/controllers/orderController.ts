import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { Order, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Coupon } from '../models/Coupon';
import { calculateShippingFee } from '../utils/helpers';
import { calculateCouponDiscount } from '../services/couponService';
import {
  calculatePointsDiscount,
  calculatePointsEarned,
  getTierFromLifetimePoints,
  REFERRAL_BONUS_REFEREE,
  REFERRAL_BONUS_REFERRER,
} from '../services/loyaltyService';
import { generateInvoicePdf, generateOrdersReportPdf, generateDispatchReceiptPdf } from '../services/invoiceService';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../services/emailService';
import { normalizeShippingAddress } from '../utils/shippingAddress';
import { MAX_ORDER_LINE_ITEMS, MAX_QTY_PER_LINE } from '../utils/constants';
import { uploadPaymentProof } from '../services/paymentProofUpload';
import { logAdminAction } from '../services/auditService';

interface OrderItemInput {
  productId: string;
  size: string;
  color: string;
  qty: number;
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { items, shippingAddress: rawShippingAddress, notes, couponCode, pointsToRedeem, paymentMethod: rawPaymentMethod } = req.body as {
    items: OrderItemInput[];
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
    };
    notes?: string;
    couponCode?: string;
    pointsToRedeem?: number;
    paymentMethod?: 'cod' | 'bank';
  };

  const paymentMethod = rawPaymentMethod === 'bank' ? 'bank' : 'cod';

  if (paymentMethod === 'bank') {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Payment proof image is required for bank transfer' });
      return;
    }
  }

  let shippingAddress;
  try {
    shippingAddress = normalizeShippingAddress(rawShippingAddress);
  } catch (err) {
    res.status(400).json({
      message: err instanceof Error ? err.message : 'Invalid shipping address',
    });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Order must contain at least one item' });
    return;
  }

  if (items.length > MAX_ORDER_LINE_ITEMS) {
    res.status(400).json({ message: `Order cannot exceed ${MAX_ORDER_LINE_ITEMS} line items` });
    return;
  }

  const session = await mongoose.startSession();
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
        image: product.images[0]?.url ?? '',
        price,
        size: item.size,
        color: item.color,
        qty: item.qty,
      });

      product.stock -= item.qty;
      product.sold += item.qty;
      await product.save({ session });
    }

    let couponDiscount = 0;
    let freeShipping = false;
    let appliedCouponCode: string | undefined;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true }).session(session);
      if (!coupon) throw new Error('Invalid coupon code');
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error('Coupon has expired');
      if (coupon.usedCount >= coupon.maxUses) throw new Error('Coupon usage limit reached');

      const priorUse = await Order.countDocuments({
        user: req.user!.id,
        couponCode: coupon.code,
        status: { $ne: 'cancelled' },
      }).session(session);

      if (priorUse > 0) throw new Error('You have already used this coupon');

      const result = calculateCouponDiscount(coupon, subtotal);
      couponDiscount = result.discount;
      freeShipping = result.freeShipping;
      appliedCouponCode = coupon.code;
      coupon.usedCount += 1;
      await coupon.save({ session });
    }

    const user = await User.findById(req.user!.id).session(session);
    if (!user) throw new Error('User not found');

    const afterCoupon = Math.max(0, subtotal - couponDiscount);
    const pointsDiscount = pointsToRedeem
      ? calculatePointsDiscount(pointsToRedeem, user.loyaltyPoints ?? 0, afterCoupon)
      : 0;

    if (pointsDiscount > 0) {
      user.loyaltyPoints = (user.loyaltyPoints ?? 0) - pointsDiscount;
    }

    let shippingFee = freeShipping ? 0 : calculateShippingFee(afterCoupon - pointsDiscount);
    const total = Math.max(0, afterCoupon - pointsDiscount + shippingFee);
    const pointsEarned = calculatePointsEarned(total);

    let bankPaymentProof: { url: string; public_id: string } | undefined;
    if (paymentMethod === 'bank' && req.file) {
      bankPaymentProof = await uploadPaymentProof(req.file);
    }

    const [order] = await Order.create(
      [
        {
          user: req.user!.id,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          bankPaymentProof,
          status: 'pending',
          subtotal,
          shippingFee,
          couponCode: appliedCouponCode,
          couponDiscount,
          loyaltyPointsRedeemed: pointsDiscount,
          loyaltyPointsEarned: pointsEarned,
          total,
          notes,
        },
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
        price: item.price,
      })),
      total,
      shippingAddress,
      paymentMethod
    ).catch((err) => {
      console.error('[Order Email] Failed to send confirmation:', err);
    });

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    const message = error instanceof Error ? error.message : 'Order creation failed';
    res.status(400).json({ message });
  } finally {
    session.endSession();
  }
};

const awardLoyaltyOnDelivery = async (orderId: string): Promise<void> => {
  const order = await Order.findById(orderId);
  if (!order || order.loyaltyAwarded || order.status !== 'delivered') return;

  const user = await User.findById(order.user);
  if (!user) return;

  let points = order.loyaltyPointsEarned ?? calculatePointsEarned(order.total);
  const tier = user.tier ?? 'bronze';
  if (tier === 'silver') points = Math.round(points * 1.05);
  if (tier === 'gold') points = Math.round(points * 1.1);

  user.loyaltyPoints = (user.loyaltyPoints ?? 0) + points;
  user.lifetimePointsEarned = (user.lifetimePointsEarned ?? 0) + points;
  user.tier = getTierFromLifetimePoints(user.lifetimePointsEarned);

  const orderCount = await Order.countDocuments({ user: user._id, status: 'delivered' });
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

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = { user: req.user!.id };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  const { status, startDate, endDate, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
    if (endDate) (filter.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, parseInt(limit as string, 10));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  const isOwner = order.user._id.toString() === req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }

  res.json(order);
};

export const getOrderInvoice = async (req: Request, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  const userDoc = order.user as unknown as { _id: { toString: () => string }; name: string; email: string };
  const isOwner = userDoc._id.toString() === req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }

  try {
    const pdf = await generateInvoicePdf(order, userDoc.name, userDoc.email);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id.toString().slice(-8)}.pdf`);
    res.send(pdf);
  } catch {
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
};

export const getOrderDispatchReceipt = async (req: Request, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  if (req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }

  if (order.status === 'cancelled') {
    res.status(400).json({ message: 'Cannot generate dispatch receipt for cancelled orders' });
    return;
  }

  const userDoc = order.user as unknown as { name: string; email: string };

  try {
    const pdf = await generateDispatchReceiptPdf(order, userDoc.name, userDoc.email);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dispatch-receipt-${order._id.toString().slice(-8)}.pdf`
    );
    res.send(pdf);
  } catch {
    res.status(500).json({ message: 'Failed to generate dispatch receipt' });
  }
};

export const exportOrdersReport = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  const filter: Record<string, unknown> = { status: { $ne: 'cancelled' } };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
    if (endDate) (filter.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500);

  try {
    const pdf = await generateOrdersReportPdf(orders, 'Orders Report');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=orders-report.pdf');
    res.send(pdf);
  } catch {
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status: OrderStatus };
  const validStatuses: OrderStatus[] = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  const previousStatus = order.status;

  if (status === 'cancelled' && order.status !== 'cancelled') {
    const session = await mongoose.startSession();
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
      res.status(500).json({ message: 'Failed to cancel order' });
      return;
    } finally {
      session.endSession();
    }
  } else {
    order.status = status;
    await order.save();
  }

  if (status === 'delivered') {
    await awardLoyaltyOnDelivery(order._id.toString());
  }

  await logAdminAction({
    adminId: req.user!.id,
    action: 'order.status_update',
    target: 'order',
    targetId: order._id.toString(),
    meta: { from: previousStatus, to: status },
  });

  const userDoc = order.user as unknown as { name?: string; email?: string };
  const notifyStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (
    notifyStatuses.includes(status) &&
    status !== previousStatus &&
    userDoc?.email
  ) {
    sendOrderStatusUpdateEmail(
      userDoc.email,
      userDoc.name ?? 'Customer',
      order._id.toString(),
      status
    ).catch((err) => console.error('[Order Status Email]', err));
  }

  res.json(order);
};

export const cancelMyOrder = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const order = await Order.findById(req.params.id);

  if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
  if (order.user.toString() !== userId) { res.status(403).json({ message: 'Not your order' }); return; }
  if (!['pending', 'processing'].includes(order.status)) {
    res.status(400).json({ message: `Cannot cancel an order that is already "${order.status}"` });
    return;
  }

  const session = await mongoose.startSession();
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
    order.status = 'cancelled';
    await order.save({ session });
    await session.commitTransaction();
  } catch {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to cancel order' });
    return;
  } finally {
    session.endSession();
  }

  res.json({ message: 'Order cancelled successfully', order });
};

export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const LOW_STOCK_THRESHOLD = 10;

  const [revenue, orderCount, productCount, userCount, recentOrders, dailySales, lowStockCount, lowStockProducts] =
    await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments(),
      Product.countDocuments({ active: true }),
      mongoose.model('User').countDocuments(),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.countDocuments({ active: true, stock: { $lte: LOW_STOCK_THRESHOLD } }),
      Product.find({ active: true, stock: { $lte: LOW_STOCK_THRESHOLD } })
        .sort({ stock: 1 })
        .limit(10)
        .select('name stock category price'),
    ]);

  res.json({
    revenue: revenue[0]?.total ?? 0,
    orders: orderCount,
    products: productCount,
    users: userCount,
    recentOrders,
    dailySales,
    lowStockCount,
    lowStockProducts,
  });
};
