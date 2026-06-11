import { z } from 'zod';

export const createDealSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(10).max(5000).optional(),
  platform: z.enum(['SHOPEE', 'LAZADA', 'TIKTOK_SHOP', 'OTHER']),
  sourceUrl: z.string().url().or(z.literal('')).default(''),
  imageUrl: z.string().url().or(z.literal('')).default(''),
  originalPrice: z.number().positive(),
  salePrice: z.number().nonnegative(),
  categoryId: z.string().uuid().optional(),
  expiredAt: z.string().datetime().optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;

export const updateDealSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  sourceUrl: z.string().url().or(z.literal('')).default(''),
  imageUrl: z.string().url().or(z.literal('')).default(''),
  originalPrice: z.number().positive().optional(),
  salePrice: z.number().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  expiredAt: z.string().datetime().optional(),
});

export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export const dealFilterSchema = z.object({
  platform: z.enum(['SHOPEE', 'LAZADA', 'TIKTOK_SHOP', 'OTHER']).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  minDiscount: z.coerce.number().min(0).max(100).optional(),
  maxDiscount: z.coerce.number().min(0).max(100).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(['newest', 'discount', 'hot', 'expiring']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type DealFilterInput = z.infer<typeof dealFilterSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
