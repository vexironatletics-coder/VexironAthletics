import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS } from './constants';

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS)
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, PASSWORD_REQUIREMENTS);

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const mobileNumberSchema = z
  .string()
  .min(10, 'Mobile number must be at least 10 digits')
  .max(20, 'Mobile number is too long')
  .regex(/^[\d\s+\-()]+$/, 'Enter a valid mobile number');

export const shippingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phones: z
    .array(z.object({ number: mobileNumberSchema }))
    .min(1, 'At least one mobile number is required')
    .max(5, 'Maximum 5 mobile numbers allowed'),
  landmark: z.string().min(3, 'Famous place / landmark is required'),
  street: z.string().min(5, 'Your house / street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title is required'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  category: z.enum(['men', 'women', 'children']),
  sizes: z.array(z.string()).min(1),
  colors: z.array(z.string()).min(1),
  stock: z.number().min(0),
  active: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ShippingFormData = z.infer<typeof shippingSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
