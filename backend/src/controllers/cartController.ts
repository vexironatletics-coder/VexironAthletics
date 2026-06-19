import { Request, Response } from 'express';
import { Cart } from '../models/Cart';
import { validateAndNormalizeCartItems, CartItemInput } from '../services/cartValidation';

export const getCart = async (req: Request, res: Response): Promise<void> => {
  let cart = await Cart.findOne({ user: req.user!.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user!.id, items: [] });
  }

  res.json({
    items: cart.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.size,
      color: item.color,
      qty: item.qty,
    })),
  });
};

export const saveCart = async (req: Request, res: Response): Promise<void> => {
  const { items } = req.body as { items: CartItemInput[] };

  try {
    const validatedItems = await validateAndNormalizeCartItems(items);

    const cart = await Cart.findOneAndUpdate(
      { user: req.user!.id },
      {
        items: validatedItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size,
          color: item.color,
          qty: item.qty,
        })),
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
        qty: item.qty,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid cart data';
    res.status(400).json({ message });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { items: [] },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ message: 'Cart cleared', items: [] });
};
