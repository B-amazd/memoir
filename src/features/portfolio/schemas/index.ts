import { z } from 'zod'
import { RESERVED_SLUGS } from '@/utils/slug'

export const createPortfolioSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),
  slug: z
    .string()
    .min(2, 'URL must be at least 2 characters')
    .max(100, 'URL must be less than 100 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'URL can only contain lowercase letters, numbers, and hyphens'
    )
    .refine(
      (val) => !RESERVED_SLUGS.includes(val),
      { message: 'This URL is reserved. Please choose a different one.' }
    ),
})

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>